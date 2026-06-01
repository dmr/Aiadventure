import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarCanvas } from './AvatarCanvas';
import { Joystick } from './Joystick';
import {
  ROOMS, ROOM_W, ROOM_H,
  type RoomId, type RoomDef, type ExitSpec,
  canEnterTile, findExitAt, nearestInteraction, findPath, adjacentWalkable,
  type NpcDef,
} from '@/lib/world';
import { LESSONS, type Lesson, type QuizStep, type RevealStep, type CodeStep, type QuoteStep, type SourcesStep } from '@/lib/lessons';
import { SCENARIOS } from '@/lib/scenarios';
import { SandboxRunner } from './SandboxRunner';
import { hasSeenTutorial, markTutorialSeen, type Gender } from '@/lib/storage';
import { getSession, patchProgress, recordVisit, addPlaytime } from '@/lib/sessions';
import { Tutorial } from './Tutorial';
import { JourneyMap } from './JourneyMap';
import { Certificate } from './Certificate';
import { journeyProgress, STAGES } from '@/lib/journey';
import { buildFromGender } from '@/lib/avatar';
import type { AvatarConfig, Build } from '@/lib/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronRight, MapPin, X, Check, AlertTriangle, CircleX, Quote, ExternalLink, BookOpen, HelpCircle, Map, Trophy } from 'lucide-react';

type Props = {
  sessionId: string;
  avatar: AvatarConfig;
  name: string;
  gender?: Gender;
  onExit: () => void;
};

type Tile = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

// Discriminated dialog state — simple text dialog OR multi-step lesson
type DialogState =
  | null
  | DialogSimple
  | DialogLesson;

type DialogSimple = {
  kind: 'simple';
  title: string;
  avatar?: AvatarConfig;
  lines: string[];
  step: number;
  onClose?: () => void;
};

type DialogLesson = {
  kind: 'lesson';
  lesson: Lesson;
  mentorAvatar: AvatarConfig;
  stepIdx: number;
  /** Sub-line index inside a multi-line text step */
  lineIdx: number;
  /** Selections from the most recent quiz step */
  selections: string[];
  onClose?: () => void;
};

const TILE_PCT_W = 100 / ROOM_W;
const TILE_PCT_H = 100 / ROOM_H;
const SPRITE_TILES = 1.4;
// Per-tile glide duration. Higher = calmer/slower walking (was 180, felt rushed).
const MOVE_MS = 240;

const DIR_DELTAS: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const KEY_TO_DIR: Record<string, Dir> = {
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
};

// Direction from one tile to an orthogonally-adjacent neighbour (for path steps).
function dirToward(from: Tile, to: Tile): Dir | null {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'down';
  if (to.y < from.y) return 'up';
  return null;
}

export function GameScreen({ sessionId, avatar, name, gender, onExit }: Props) {
  const build = buildFromGender(gender);
  // Restore this session's progress + last position so the player resumes
  // exactly where they were.
  const [savedProgress] = useState(() => {
    const s = getSession(sessionId);
    return {
      completedLessons: s?.completedLessons ?? [],
      misc: s?.misc ?? [],
      room: s?.room,
      tile: s?.tile,
      facing: s?.facing,
    };
  });
  const resumeRoom: RoomId =
    savedProgress.room && savedProgress.room in ROOMS
      ? (savedProgress.room as RoomId)
      : 'eingang';

  const [roomId, setRoomId] = useState<RoomId>(resumeRoom);
  const [tile, setTile] = useState<Tile>(() =>
    savedProgress.room === resumeRoom && savedProgress.tile
      ? savedProgress.tile
      : { x: 6, y: 7 },
  );
  const [facing, setFacing] = useState<Dir>(
    (savedProgress.facing as Dir) ?? 'up',
  );
  const [moving, setMoving] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [sandbox, setSandbox] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    () => new Set(savedProgress.completedLessons),
  );
  const [misc, setMisc] = useState<Set<string>>(() => new Set(savedProgress.misc));
  const [transition, setTransition] = useState(false);
  // Show the onboarding overlay once for first-time players.
  const [showTutorial, setShowTutorial] = useState(() => !hasSeenTutorial());
  const [showMap, setShowMap] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const dismissTutorial = useCallback(() => {
    markTutorialSeen();
    setShowTutorial(false);
  }, []);

  // Gamification: progress toward the certificate (single source: journey.ts).
  const progress = journeyProgress(completedLessons, misc);
  const earnedRef = useRef(progress.certificateEarned);

  // Persist progress + current position into the active session whenever any of
  // it changes, so a reload or revisit drops the player back exactly here.
  useEffect(() => {
    patchProgress(sessionId, {
      completedLessons: Array.from(completedLessons),
      misc: Array.from(misc),
      room: roomId,
      tile,
      facing,
    });
  }, [sessionId, completedLessons, misc, roomId, tile, facing]);

  // Session metadata: count this visit and accumulate active play time.
  useEffect(() => {
    recordVisit(sessionId);
    let last = Date.now();
    const flush = () => {
      const now = Date.now();
      addPlaytime(sessionId, now - last);
      last = now;
    };
    const iv = window.setInterval(flush, 15_000);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('visibilitychange', flush);
      flush();
    };
  }, [sessionId]);

  // Celebrate the moment the certificate is first earned.
  useEffect(() => {
    if (progress.certificateEarned && !earnedRef.current) {
      setShowCertificate(true);
    }
    earnedRef.current = progress.certificateEarned;
  }, [progress.certificateEarned]);

  const room = ROOMS[roomId];

  // Tap-to-move: a queue of tiles the player auto-walks; optional interact on arrival.
  const [destination, setDestination] = useState<Tile | null>(null);
  const pathRef = useRef<Tile[]>([]);
  const interactOnArriveRef = useRef(false);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const tileRef = useRef(tile);
  const movingRef = useRef(moving);
  const dialogRef = useRef<DialogState>(dialog);
  const sandboxRef = useRef<string | null>(null);
  const facingRef = useRef(facing);
  const roomRef = useRef(room);
  const tutorialRef = useRef(showTutorial);
  useEffect(() => { tileRef.current = tile; }, [tile]);
  useEffect(() => { movingRef.current = moving; }, [moving]);
  useEffect(() => { dialogRef.current = dialog; }, [dialog]);
  useEffect(() => { sandboxRef.current = sandbox; }, [sandbox]);
  useEffect(() => { facingRef.current = facing; }, [facing]);
  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { tutorialRef.current = showTutorial; }, [showTutorial]);

  const keysHeld = useRef<Record<Dir, boolean>>({ up: false, down: false, left: false, right: false });
  const lastKey = useRef<Dir | null>(null);
  const stickVec = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ── Direction resolution ─────────────────────────────────────────────────
  function getStickDir(): Dir | null {
    const v = stickVec.current;
    const mag = Math.hypot(v.x, v.y);
    if (mag < 0.35) return null;
    if (Math.abs(v.x) > Math.abs(v.y)) return v.x > 0 ? 'right' : 'left';
    return v.y > 0 ? 'down' : 'up';
  }
  function getKeyDir(): Dir | null {
    if (lastKey.current && keysHeld.current[lastKey.current]) return lastKey.current;
    if (keysHeld.current.right) return 'right';
    if (keysHeld.current.left) return 'left';
    if (keysHeld.current.down) return 'down';
    if (keysHeld.current.up) return 'up';
    return null;
  }
  function currentDir(): Dir | null {
    return getStickDir() ?? getKeyDir();
  }

  // ── Keyboard listeners ───────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Swallow input while the onboarding overlay is open.
      if (tutorialRef.current) return;
      const k = e.key.toLowerCase();
      const dir = KEY_TO_DIR[k];
      if (dir) {
        e.preventDefault();
        keysHeld.current[dir] = true;
        lastKey.current = dir;
      } else if (k === ' ' || k === 'enter' || k === 'e') {
        e.preventDefault();
        if (sandboxRef.current) return;
        const d = dialogRef.current;
        if (d) {
          // Only auto-advance text-style dialog. Quiz waits for explicit submit.
          if (d.kind === 'simple') advanceDialog();
          else if (d.kind === 'lesson') {
            const step = d.lesson.steps[d.stepIdx];
            if (step?.kind !== 'quiz') advanceDialog();
          }
        } else triggerInteract();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const dir = KEY_TO_DIR[k];
      if (dir) {
        keysHeld.current[dir] = false;
        if (lastKey.current === dir) {
          const order: Dir[] = ['right', 'left', 'down', 'up'];
          lastKey.current = order.find(d => keysHeld.current[d]) ?? null;
        }
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Movement loop ────────────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    const clearPath = () => {
      pathRef.current = [];
      interactOnArriveRef.current = false;
      setDestination(null);
    };
    const tryStep = () => {
      if (!movingRef.current && !dialogRef.current && !sandboxRef.current && !transition && !tutorialRef.current) {
        // Manual input (keys/joystick) takes priority and cancels any tap path.
        let dir = currentDir();
        if (dir) {
          if (pathRef.current.length) clearPath();
        } else if (pathRef.current.length) {
          dir = dirToward(tileRef.current, pathRef.current[0]);
        }
        if (dir) {
          if (facingRef.current !== dir) {
            setFacing(dir);
            facingRef.current = dir;
          }
          const delta = DIR_DELTAS[dir];
          const target: Tile = {
            x: tileRef.current.x + delta.dx,
            y: tileRef.current.y + delta.dy,
          };
          if (canEnterTile(roomRef.current, target.x, target.y)) {
            setMoving(true);
            movingRef.current = true;
            setTile(target);
            tileRef.current = target;
            setWalkFrame(f => (f + 1) % 4);

            // Consume this step if it was following the tap-to-move path.
            const following =
              pathRef.current.length > 0 &&
              pathRef.current[0].x === target.x &&
              pathRef.current[0].y === target.y;
            if (following) pathRef.current = pathRef.current.slice(1);

            window.setTimeout(() => {
              setMoving(false);
              movingRef.current = false;
              const exit = findExitAt(roomRef.current, target.x, target.y);
              if (exit) {
                clearPath();
                triggerRoomChange(exit);
                return;
              }
              if (following && pathRef.current.length === 0) {
                const interact = interactOnArriveRef.current;
                clearPath();
                if (interact) triggerInteract();
              }
            }, MOVE_MS);
          } else if (pathRef.current.length) {
            // Path blocked unexpectedly (e.g. world changed) — abandon it.
            clearPath();
          }
        }
      }
      raf = requestAnimationFrame(tryStep);
    };
    raf = requestAnimationFrame(tryStep);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  // ── Room transitions ─────────────────────────────────────────────────────
  function triggerRoomChange(exit: ExitSpec) {
    setTransition(true);
    setMoving(true);
    movingRef.current = true;
    setTimeout(() => {
      setRoomId(exit.to);
      setTile({ x: exit.spawn.x, y: exit.spawn.y });
      tileRef.current = { x: exit.spawn.x, y: exit.spawn.y };
      setFacing(exit.spawn.facing);
      facingRef.current = exit.spawn.facing;
      setTimeout(() => {
        setTransition(false);
        setMoving(false);
        movingRef.current = false;
      }, 80);
    }, 220);
  }

  // ── Interactions ─────────────────────────────────────────────────────────
  const triggerInteract = useCallback(() => {
    if (movingRef.current || dialogRef.current || sandboxRef.current) return;
    const t = tileRef.current;
    const f = facingRef.current;
    const ahead = DIR_DELTAS[f];
    const aheadX = t.x + ahead.dx + 0.5;
    const aheadY = t.y + ahead.dy + 0.5;
    const playerCx = t.x + 0.5;
    const playerCy = t.y + 0.5;

    const found =
      nearestInteraction(roomRef.current, aheadX, aheadY, 0.7) ??
      nearestInteraction(roomRef.current, playerCx, playerCy, 1.4);

    if (!found) return;

    if (found.kind === 'npc') {
      const npc = found.npc;
      // Lesson NPC?
      if (npc.lessonId && LESSONS[npc.lessonId]) {
        const lesson = LESSONS[npc.lessonId];
        setDialog({
          kind: 'lesson',
          lesson,
          mentorAvatar: npc.avatar,
          stepIdx: 0,
          lineIdx: 0,
          selections: [],
          onClose: () => {
            setCompletedLessons(s => new Set(s).add(lesson.id));
          },
        });
      } else {
        setDialog({
          kind: 'simple',
          title: npc.name,
          avatar: npc.avatar,
          lines: npc.dialog.lines,
          step: 0,
          onClose: () => {
            if (npc.dialog.reward) setMisc(s => new Set(s).add(npc.dialog.reward!));
          },
        });
      }
    } else {
      const obj = found.obj;

      // Sandbox trigger
      if (obj.sandboxId && SCENARIOS[obj.sandboxId]) {
        setSandbox(obj.sandboxId);
        return;
      }

      // Lesson opened from a station-style interactable (Werkstatt)
      if (obj.lessonId && LESSONS[obj.lessonId]) {
        const lesson = LESSONS[obj.lessonId];
        // Use a same-room NPC's avatar as mentor portrait (Sven for Werkstatt)
        const mentor =
          roomRef.current.npcs.find(n => n.lessonId)?.avatar ??
          roomRef.current.npcs[0]?.avatar;
        setDialog({
          kind: 'lesson',
          lesson,
          mentorAvatar: mentor ?? { skin: 1, hairStyle: 2, hairColor: 2, shirt: 4, pants: 5, accessory: 0 },
          stepIdx: 0,
          lineIdx: 0,
          selections: [],
          onClose: () => {
            setCompletedLessons(s => new Set(s).add(lesson.id));
          },
        });
      } else {
        setDialog({
          kind: 'simple',
          title: obj.label,
          lines: obj.lines,
          step: 0,
          onClose: () => {
            if (obj.reward) setMisc(s => new Set(s).add(obj.reward!));
          },
        });
      }
    }
  }, []);

  // Tap-to-move: walk to a tapped tile; tapping a person/station walks adjacent
  // and then interacts. Manual key/joystick input cancels the path (see loop).
  const goTo = useCallback((tx: number, ty: number) => {
    const r = roomRef.current;
    const me = tileRef.current;
    if (canEnterTile(r, tx, ty)) {
      const path = findPath(r, me, { x: tx, y: ty });
      if (path && path.length) {
        pathRef.current = path;
        interactOnArriveRef.current = false;
        setDestination({ x: tx, y: ty });
      }
      return;
    }
    // Tapped a blocked tile — if it holds an NPC/interactable, approach + interact.
    const isTarget =
      r.npcs.some(n => n.x === tx && n.y === ty) ||
      r.interactables.some(o => o.x === tx && o.y === ty);
    if (!isTarget) return;
    const adj = adjacentWalkable(r, tx, ty, me);
    if (!adj) return;
    const path = findPath(r, me, adj);
    if (!path) return;
    setDestination({ x: tx, y: ty });
    if (path.length === 0) {
      triggerInteract(); // already standing next to it
    } else {
      pathRef.current = path;
      interactOnArriveRef.current = true;
    }
  }, [triggerInteract]);

  const onFieldClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current || sandboxRef.current || transition || tutorialRef.current) return;
    const el = fieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tx = Math.floor(((e.clientX - rect.left) / rect.width) * ROOM_W);
    const ty = Math.floor(((e.clientY - rect.top) / rect.height) * ROOM_H);
    if (tx < 0 || ty < 0 || tx >= ROOM_W || ty >= ROOM_H) return;
    goTo(tx, ty);
  }, [goTo, transition]);

  function advanceDialog() {
    setDialog(d => {
      if (!d) return d;
      if (d.kind === 'simple') {
        if (d.step + 1 >= d.lines.length) {
          d.onClose?.();
          return null;
        }
        return { ...d, step: d.step + 1 };
      }
      // Lesson
      const step = d.lesson.steps[d.stepIdx];
      if (step.kind === 'text') {
        if (d.lineIdx + 1 < step.lines.length) {
          return { ...d, lineIdx: d.lineIdx + 1 };
        }
      }
      // Move to next step
      if (d.stepIdx + 1 >= d.lesson.steps.length) {
        d.onClose?.();
        return null;
      }
      return { ...d, stepIdx: d.stepIdx + 1, lineIdx: 0 };
    });
  }

  function submitQuiz(selections: string[]) {
    setDialog(d => {
      if (!d || d.kind !== 'lesson') return d;
      const next = d.stepIdx + 1;
      if (next >= d.lesson.steps.length) {
        d.onClose?.();
        return null;
      }
      return { ...d, stepIdx: next, lineIdx: 0, selections };
    });
  }

  const near = nearestInteraction(room, tile.x + 0.5, tile.y + 0.5, 1.4);

  // What button to show
  const dialogActiveQuiz = (() => {
    if (!dialog || dialog.kind !== 'lesson') return false;
    return dialog.lesson.steps[dialog.stepIdx]?.kind === 'quiz';
  })();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] w-full flex flex-col items-stretch bg-background no-select overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border/60 bg-card/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <AvatarCanvas config={avatar} size={36} facing="down" build={build} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground leading-tight">{name}</p>
            <p className="display-font font-semibold text-base leading-tight truncate flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 inline" /> {room.name}
            </p>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMap(true)}
            aria-label="Fortschritt & Ziel"
          >
            <Map className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTutorial(true)}
            aria-label="So spielst du"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onExit} aria-label="Spiel verlassen">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Glanceable progress strip — always visible, opens the journey map. */}
      <button
        onClick={() => setShowMap(true)}
        className="px-4 py-2 bg-secondary/40 border-b text-xs flex items-center gap-2 w-full text-left"
        aria-label="Fortschritt & Ziel öffnen"
      >
        <Trophy className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground shrink-0">Ziel:</span>
        <div className="flex items-center gap-1 shrink-0">
          {STAGES.map((s) => {
            const done = completedLessons.has(s.lessonId);
            const current = !done && s.room === roomId;
            return (
              <span
                key={s.n}
                className={`w-3 h-3 rounded-full border-2 ${
                  done
                    ? 'bg-primary border-primary'
                    : current
                      ? 'border-primary'
                      : 'border-muted-foreground/40'
                }`}
              />
            );
          })}
          <span
            className={`ml-1 w-3 h-3 rounded-sm border-2 ${
              progress.simDone ? 'bg-primary border-primary' : 'border-muted-foreground/40'
            }`}
          />
        </div>
        <span className="text-muted-foreground ml-auto shrink-0 font-medium">
          {progress.certificateEarned ? '🏆 Zertifikat' : `${progress.stagesDone}/${progress.totalStages} · Karte ▸`}
        </span>
      </button>

      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-2 sm:p-4 relative">
        <div
          ref={fieldRef}
          onClick={onFieldClick}
          className={`relative shadow-2xl rounded-lg overflow-hidden cursor-pointer transition-opacity duration-200 ${
            transition ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            width: '100%',
            maxWidth: '600px',
            // Clamp to available height too, so the field never forces the page
            // to scroll on mobile; aspect-ratio keeps tiles square.
            maxHeight: '100%',
            aspectRatio: `${ROOM_W} / ${ROOM_H}`,
            backgroundColor: room.tint,
            containerType: 'inline-size',
            isolation: 'isolate',
          }}
        >
          <RoomRenderer
            room={room}
            tile={tile}
            facing={facing}
            walking={moving}
            walkFrame={walkFrame}
            avatar={avatar}
            build={build}
          />
          {destination && (
            <DestinationMarker x={destination.x} y={destination.y} />
          )}
          <div
            key={roomId}
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card/85 backdrop-blur-sm border text-xs font-medium pointer-events-none whitespace-nowrap"
            style={{ animation: 'float-in 0.5s ease both' }}
          >
            {room.subtitle}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-5 pt-2 flex items-end justify-between gap-4">
        <Joystick onChange={(v) => (stickVec.current = v)} size={110} />

        <div className="relative flex flex-col items-end gap-2 min-w-0 max-w-[55%]">
          {near && !dialog && (
            <div
              className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-full bg-foreground/90 text-background text-xs font-medium float-in shadow-md whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
              style={{ animationDuration: '0.2s' }}
            >
              {near.kind === 'npc' ? `${near.npc.name} ansprechen` : near.obj.label}
            </div>
          )}
          <Button
            size="lg"
            variant={near || (dialog && !dialogActiveQuiz) ? 'default' : 'secondary'}
            disabled={dialogActiveQuiz}
            className={`h-[110px] w-[110px] rounded-full text-base display-font font-semibold shadow-lg transition-transform active:scale-95 ${
              near || dialog ? '' : 'opacity-60'
            } ${dialogActiveQuiz ? 'opacity-40' : ''}`}
            onClick={() => (dialog ? advanceDialog() : triggerInteract())}
          >
            {dialog ? <ChevronRight className="w-7 h-7" /> : '⊙'}
          </Button>
        </div>
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o && dialog?.kind === 'simple') advanceDialog(); }}>
        <DialogContent
          className="max-w-md p-0 gap-0 border-2 overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100dvh - 4rem)' }}
        >
          {dialog?.kind === 'simple' && <SimpleDialogView dialog={dialog} onAdvance={advanceDialog} />}
          {dialog?.kind === 'lesson' && (
            <LessonDialogView
              dialog={dialog}
              onAdvance={advanceDialog}
              onSubmitQuiz={submitQuiz}
            />
          )}
        </DialogContent>
      </Dialog>

      {sandbox && SCENARIOS[sandbox] && (
        <SandboxRunner
          scenario={SCENARIOS[sandbox]}
          onClose={(completed) => {
            if (completed) setMisc(s => new Set(s).add('sim-survived'));
            setSandbox(null);
          }}
        />
      )}

      {showTutorial && <Tutorial onClose={dismissTutorial} />}

      {showMap && (
        <JourneyMap
          progress={progress}
          currentRoom={roomId}
          completed={completedLessons}
          onClose={() => setShowMap(false)}
          onShowCertificate={() => {
            setShowMap(false);
            setShowCertificate(true);
          }}
        />
      )}

      {showCertificate && (
        <Certificate
          name={name}
          avatar={avatar}
          build={build}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

// ─── Dialog views ──────────────────────────────────────────────────────────
function SimpleDialogView({ dialog, onAdvance }: { dialog: DialogSimple; onAdvance: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-5 py-4 bg-secondary/60 border-b shrink-0">
        {dialog.avatar && <AvatarCanvas config={dialog.avatar} size={48} />}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {dialog.avatar ? 'Spricht mit dir' : 'Du betrachtest'}
          </p>
          <p className="display-font text-xl font-semibold leading-tight">{dialog.title}</p>
        </div>
      </div>
      <div className="px-5 py-5 overflow-y-auto flex-1">
        <p className="text-base leading-relaxed">{dialog.lines[dialog.step]}</p>
      </div>
      <div className="px-5 py-3 border-t bg-card flex items-center justify-between shrink-0">
        <div className="text-xs text-muted-foreground">
          {dialog.step + 1} / {dialog.lines.length}
        </div>
        <Button onClick={onAdvance} className="display-font">
          {dialog.step + 1 >= dialog.lines.length ? 'Schließen' : 'Weiter'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </>
  );
}

function LessonDialogView({
  dialog,
  onAdvance,
  onSubmitQuiz,
}: {
  dialog: DialogLesson;
  onAdvance: () => void;
  onSubmitQuiz: (selections: string[]) => void;
}) {
  const step = dialog.lesson.steps[dialog.stepIdx];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-secondary/60 border-b shrink-0">
        <AvatarCanvas config={dialog.mentorAvatar} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Lektion {dialog.lesson.number} · {dialog.lesson.mentor}
          </p>
          <p className="display-font text-lg font-semibold leading-tight truncate">
            {dialog.lesson.title}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {step.kind === 'text' && (
          <div className="px-5 py-5">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{step.lines[dialog.lineIdx]}</p>
          </div>
        )}
        {step.kind === 'code' && <CodeStepView step={step} />}
        {step.kind === 'quote' && <QuoteStepView step={step} />}
        {step.kind === 'sources' && <SourcesStepView step={step} />}
        {step.kind === 'quiz' && (
          <QuizStepView step={step} onSubmit={onSubmitQuiz} />
        )}
        {step.kind === 'reveal' && (
          <RevealStepView
            step={step}
            quiz={findPreviousQuiz(dialog.lesson, dialog.stepIdx)}
            selections={dialog.selections}
          />
        )}
      </div>

      {/* Footer */}
      {step.kind !== 'quiz' && (
        <div className="px-5 py-3 border-t bg-card flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            Schritt {dialog.stepIdx + 1} / {dialog.lesson.steps.length}
          </div>
          <Button onClick={onAdvance} className="display-font">
            {dialog.stepIdx + 1 >= dialog.lesson.steps.length ? 'Fertig' : 'Weiter'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
}

function QuizStepView({ step, onSubmit }: { step: QuizStep; onSubmit: (selections: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (step.type === 'single') {
      setSelected([id]);
    } else {
      setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    }
  };

  return (
    <div className="px-5 py-5">
      <p className="text-sm font-medium leading-relaxed mb-4">{step.prompt}</p>
      <div className="space-y-2">
        {step.options.map(opt => {
          const isSel = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all flex items-start gap-2.5 ${
                isSel
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-secondary/50'
              }`}
            >
              <div
                className={`mt-0.5 shrink-0 w-5 h-5 rounded ${
                  step.type === 'single' ? 'rounded-full' : ''
                } border-2 flex items-center justify-center ${
                  isSel ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                }`}
              >
                {isSel && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
              </div>
              <span className="text-sm leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {step.type === 'multi' ? 'Mehrere möglich · keine "falsche" Antwort' : 'Eine wählen'}
        </p>
        <Button
          onClick={() => onSubmit(selected)}
          className="display-font"
        >
          {selected.length === 0 ? 'Überspringen' : 'Bestätigen'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function RevealStepView({
  step,
  quiz,
  selections,
}: {
  step: RevealStep;
  quiz: QuizStep | null;
  selections: string[];
}) {
  if (!quiz) {
    return (
      <div className="px-5 py-5">
        <p className="text-base">{step.intro}</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <p className="text-sm font-medium leading-relaxed mb-4">{step.intro}</p>
      <div className="space-y-2.5">
        {quiz.options.map(opt => {
          const userPicked = selections.includes(opt.id);
          const consensus = opt.good;
          const status = statusFor(userPicked, consensus);
          return (
            <div
              key={opt.id}
              className={`px-3 py-2.5 rounded-lg border ${status.cardClass}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">{status.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium leading-snug">{opt.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold shrink-0 ${status.tagClass}`}>
                      {status.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug mt-1">{opt.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {step.outro && (
        <p className="mt-4 text-sm leading-relaxed border-l-2 border-primary/40 pl-3 italic text-foreground/80">
          {step.outro}
        </p>
      )}
    </div>
  );
}

function statusFor(userPicked: boolean, consensus: boolean) {
  if (userPicked && consensus) {
    return {
      icon: <Check className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />,
      cardClass: 'border-emerald-700/30 bg-emerald-700/5',
      tag: 'Stimmt',
      tagClass: 'bg-emerald-700/20 text-emerald-800',
    };
  }
  if (!userPicked && !consensus) {
    return {
      icon: <Check className="w-5 h-5 text-emerald-700/60" strokeWidth={2.5} />,
      cardClass: 'border-border bg-card',
      tag: 'Richtig vermieden',
      tagClass: 'bg-secondary text-muted-foreground',
    };
  }
  if (userPicked && !consensus) {
    return {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={2.5} />,
      cardClass: 'border-amber-600/40 bg-amber-600/5',
      tag: 'Vorsicht',
      tagClass: 'bg-amber-600/20 text-amber-800',
    };
  }
  return {
    icon: <CircleX className="w-5 h-5 text-rose-600" strokeWidth={2.5} />,
    cardClass: 'border-rose-600/30 bg-rose-600/5',
    tag: 'Verpasst',
    tagClass: 'bg-rose-600/20 text-rose-800',
  };
}

function findPreviousQuiz(lesson: Lesson, currentIdx: number): QuizStep | null {
  for (let i = currentIdx - 1; i >= 0; i--) {
    const s = lesson.steps[i];
    if (s.kind === 'quiz') return s;
  }
  return null;
}

// ─── Code / Quote / Sources step views ─────────────────────────────────────
function CodeStepView({ step }: { step: CodeStep }) {
  return (
    <div className="px-5 py-5 space-y-3">
      {step.caption && (
        <p className="text-sm font-medium leading-relaxed">{step.caption}</p>
      )}
      <pre className="bg-foreground/95 text-background rounded-lg p-3.5 text-xs leading-relaxed overflow-x-auto font-mono whitespace-pre">
        <code>{step.code}</code>
      </pre>
      {step.note && (
        <p className="text-xs italic text-muted-foreground border-l-2 border-primary pl-3 py-1 leading-relaxed">
          {step.note}
        </p>
      )}
    </div>
  );
}

function QuoteStepView({ step }: { step: QuoteStep }) {
  return (
    <div className="px-5 py-5">
      <div className="relative bg-secondary/40 border-l-4 border-primary rounded-r-lg px-4 pt-5 pb-4">
        <Quote
          className="absolute top-2 right-2 w-5 h-5 text-primary/30"
          strokeWidth={2}
        />
        <p className="text-base italic leading-relaxed text-foreground/90 mb-3">
          „{step.text}"
        </p>
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80 not-italic">{step.author}</p>
          {step.role && <p className="not-italic">{step.role}</p>}
          {step.url && (
            <a
              href={step.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-primary hover:underline not-italic"
            >
              <span className="truncate max-w-[220px]">{step.source ?? 'Quelle'}</span>
              {step.date && <span className="text-muted-foreground/80 shrink-0">· {step.date}</span>}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SourcesStepView({ step }: { step: SourcesStep }) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">{step.intro ?? 'Weiterlesen'}</p>
      </div>
      <div className="space-y-2">
        {step.refs.map((ref, i) => (
          <a
            key={i}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg border-2 border-border hover:border-primary hover:bg-secondary/40 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug group-hover:text-primary">
                  {ref.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {ref.author && <span>{ref.author}</span>}
                  {ref.author && ref.date && <span> · </span>}
                  {ref.date && <span>{ref.date}</span>}
                </p>
                {ref.note && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic leading-snug">
                    {ref.note}
                  </p>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Room renderer ──────────────────────────────────────────────────────────
function RoomRenderer({
  room, tile, facing, walking, walkFrame, avatar, build,
}: {
  room: RoomDef;
  tile: Tile;
  facing: Dir;
  walking: boolean;
  walkFrame: number;
  avatar: AvatarConfig;
  build: Build;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${ROOM_W}, 1fr)`,
        gridTemplateRows: `repeat(${ROOM_H}, 1fr)`,
      }}
    >
      {room.rows.map((row, y) =>
        row.map((ch, x) => (
          <Tile key={`${y}-${x}`} ch={ch} floorClass={`tile-floor-${room.floor}`} />
        ))
      )}
      <div className="absolute inset-0 pointer-events-none">
        {room.decorations.map((d, i) => (
          <DecorationSprite key={i} d={d} />
        ))}
        {room.exits.map((ex, i) => (
          <ExitMarker key={`ex-${i}`} ex={ex} />
        ))}
        {room.npcs.map((npc) => (
          <NpcSprite key={npc.id} npc={npc} />
        ))}
        <PlayerSprite tile={tile} facing={facing} walking={walking} walkFrame={walkFrame} avatar={avatar} build={build} />
      </div>
    </div>
  );
}

function Tile({ ch, floorClass }: { ch: string; floorClass: string }) {
  if (ch === '#') return <div className="tile-wall" />;
  if (ch === 'F') return <div className={floorClass} style={{ filter: 'brightness(0.92)' }} />;
  if (ch === '~') return <div className="tile-water" />;
  if (ch === ',') return <div className="tile-floor-grass" />;
  if (ch === 'D') return (
    <div className={`${floorClass} relative overflow-hidden`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, hsl(22 50% 30% / 0.7) 0%, hsl(22 50% 30% / 0.4) 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '12%', top: '8%', right: '12%', bottom: '0',
          background: 'linear-gradient(180deg, hsl(22 35% 18%) 0%, hsl(22 40% 22%) 100%)',
          borderRadius: '50% 50% 0 0 / 30% 30% 0 0',
          boxShadow: 'inset 0 0 8px hsl(22 50% 8% / 0.7), 0 0 0 2px hsl(var(--terracotta) / 0.5)',
        }}
      />
    </div>
  );
  return <div className={floorClass} />;
}

function DecorationSprite({ d }: { d: { x: number; y: number; emoji: string; scale?: number } }) {
  const scale = d.scale ?? 1;
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: `${d.x * TILE_PCT_W}%`,
        top: `${d.y * TILE_PCT_H}%`,
        width: `${TILE_PCT_W}%`,
        height: `${TILE_PCT_H}%`,
        fontSize: `${5.5 * scale}cqi`,
        lineHeight: 1,
        filter: 'drop-shadow(0 1px 1px rgba(40,24,16,0.25))',
        zIndex: 1 + d.y,
      }}
    >
      {d.emoji}
    </div>
  );
}

function ExitMarker({ ex }: { ex: ExitSpec }) {
  let arrow = '→';
  let labelPos: React.CSSProperties = { top: '105%', left: '50%', transform: 'translateX(-50%)' };
  if (ex.x === 0) {
    arrow = '←';
    labelPos = { top: '50%', left: '105%', transform: 'translateY(-50%)' };
  } else if (ex.x === ROOM_W - 1) {
    arrow = '→';
    labelPos = { top: '50%', right: '105%', transform: 'translateY(-50%)' };
  } else if (ex.y === 0) {
    arrow = '↑';
    labelPos = { top: '105%', left: '50%', transform: 'translateX(-50%)' };
  } else if (ex.y === ROOM_H - 1) {
    arrow = '↓';
    labelPos = { bottom: '105%', left: '50%', transform: 'translateX(-50%)' };
  }
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${ex.x * TILE_PCT_W}%`,
        top: `${ex.y * TILE_PCT_H}%`,
        width: `${TILE_PCT_W}%`,
        height: `${TILE_PCT_H}%`,
        zIndex: 3,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, hsl(var(--terracotta) / 0.45), transparent 70%)',
          animation: 'door-pulse 2.5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{
          fontSize: '7cqi',
          color: 'hsl(var(--cream))',
          textShadow: '0 1px 4px hsl(22 50% 12% / 0.9), 0 0 8px hsl(var(--terracotta))',
          animation: 'door-arrow-bob 1.4s ease-in-out infinite',
        }}
      >
        {arrow}
      </div>
      <div
        className="absolute font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
        style={{
          ...labelPos,
          fontSize: '2.4cqi',
          background: 'hsl(var(--foreground))',
          color: 'hsl(var(--background))',
          boxShadow: '0 2px 6px hsl(22 35% 13% / 0.4)',
        }}
      >
        {ex.label}
      </div>
    </div>
  );
}

function NpcSprite({ npc }: { npc: NpcDef }) {
  const w = TILE_PCT_W * SPRITE_TILES;
  const h = TILE_PCT_H * SPRITE_TILES;
  return (
    <div
      className="absolute"
      style={{
        left: `${(npc.x + 0.5) * TILE_PCT_W - w / 2}%`,
        top: `${(npc.y + 1) * TILE_PCT_H - h}%`,
        width: `${w}%`,
        height: `${h}%`,
        zIndex: 5 + npc.y,
        animation: 'sprite-bob 2s ease-in-out infinite',
      }}
    >
      {npc.bubble && (
        <div
          className="absolute px-1.5 py-0.5 rounded-full bg-card border shadow-sm whitespace-nowrap left-1/2 -translate-x-1/2"
          style={{ fontSize: '2.4cqi', top: '-2.5cqi' }}
        >
          {npc.bubble}
        </div>
      )}
      <AvatarCanvas config={npc.avatar} size="100%" facing={npc.facing} />
    </div>
  );
}

// Pulsing ring shown on the tile the player tapped to walk to.
function DestinationMarker({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center"
      style={{
        left: `${x * TILE_PCT_W}%`,
        top: `${y * TILE_PCT_H}%`,
        width: `${TILE_PCT_W}%`,
        height: `${TILE_PCT_H}%`,
        zIndex: 90,
      }}
    >
      <span
        className="block rounded-full border-2 border-primary animate-ping"
        style={{ width: '45%', height: '45%' }}
      />
      <span
        className="absolute block rounded-full bg-primary/70"
        style={{ width: '14%', height: '14%' }}
      />
    </div>
  );
}

function PlayerSprite({
  tile, facing, walking, walkFrame, avatar, build,
}: {
  tile: Tile; facing: Dir; walking: boolean; walkFrame: number; avatar: AvatarConfig; build: Build;
}) {
  const w = TILE_PCT_W * SPRITE_TILES;
  const h = TILE_PCT_H * SPRITE_TILES;
  return (
    <div
      className="absolute"
      style={{
        left: `${(tile.x + 0.5) * TILE_PCT_W - w / 2}%`,
        top: `${(tile.y + 1) * TILE_PCT_H - h}%`,
        width: `${w}%`,
        height: `${h}%`,
        zIndex: 100 + tile.y,
        filter: 'drop-shadow(0 2px 2px rgba(40,24,16,0.3))',
        // Smooth, non-bouncy ease-in-out so tile steps glide instead of snapping.
        transition: `left ${MOVE_MS}ms cubic-bezier(0.45,0.05,0.55,0.95), top ${MOVE_MS}ms cubic-bezier(0.45,0.05,0.55,0.95)`,
      }}
    >
      <AvatarCanvas
        config={avatar}
        size="100%"
        facing={facing}
        build={build}
        walking={walking}
        frame={walkFrame}
      />
    </div>
  );
}

