import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarCanvas } from './AvatarCanvas';
import { SandboxRunner } from './SandboxRunner';
import { PROCUREMENT_TASKS } from '@/lib/procurement';
import { getSession, recordVisit, addPlaytime, addReward } from '@/lib/sessions';
import { hasSeenAvatarHint, markAvatarHintSeen } from '@/lib/storage';
import type { AvatarConfig } from '@/lib/avatar';
import { X, ShieldCheck, Check, Play, RotateCw, Lock, Pencil } from 'lucide-react';

type Props = {
  sessionId: string;
  name: string;
  avatar: AvatarConfig;
  onExit: () => void;
  onEditAvatar: () => void;
};

const tok = (id: string) => `task:${id}`;

// "KI im Einkauf" hub: clear procurement tasks with a strong data-privacy focus.
// Each task runs in the shared Trainings-Simulator engine.
export function ProcurementHub({ sessionId, name, avatar, onExit, onEditAvatar }: Props) {
  const [done, setDone] = useState<Set<string>>(() => new Set(getSession(sessionId)?.misc ?? []));
  const [active, setActive] = useState<string | null>(null);
  const [blinkAvatar, setBlinkAvatar] = useState(() => !hasSeenAvatarHint());
  useEffect(() => {
    if (!blinkAvatar) return;
    markAvatarHintSeen();
    const t = window.setTimeout(() => setBlinkAvatar(false), 5200);
    return () => window.clearTimeout(t);
  }, [blinkAvatar]);

  // Session metadata: visit + playtime (same as the game screen).
  useEffect(() => {
    recordVisit(sessionId);
    let last = Date.now();
    const flush = () => { const now = Date.now(); addPlaytime(sessionId, now - last); last = now; };
    const iv = window.setInterval(flush, 15_000);
    document.addEventListener('visibilitychange', flush);
    return () => { window.clearInterval(iv); document.removeEventListener('visibilitychange', flush); flush(); };
  }, [sessionId]);

  const completed = PROCUREMENT_TASKS.filter((t) => done.has(tok(t.id))).length;
  const total = PROCUREMENT_TASKS.length;
  const activeTask = PROCUREMENT_TASKS.find((t) => t.id === active);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-stretch bg-background no-select overflow-hidden">
      <div className="relative px-4 py-3 flex items-center justify-between gap-3 border-b border-border/60 bg-card/60 backdrop-blur-sm shrink-0">
        <button
          onClick={onEditAvatar}
          className={`flex items-center gap-2 min-w-0 rounded-xl pr-2 -ml-1 pl-1 py-0.5 transition-colors hover:bg-secondary/60 ${blinkAvatar ? 'animate-pulse ring-2 ring-primary' : ''}`}
          aria-label="Avatar anpassen"
        >
          <div className="shrink-0 relative">
            <AvatarCanvas config={avatar} size={36} facing="down" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Pencil className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs text-muted-foreground leading-tight truncate">{name}</p>
            <p className="display-font font-semibold text-base leading-tight truncate">KI im Einkauf</p>
          </div>
        </button>
        {blinkAvatar && (
          <div className="absolute left-2 top-full mt-1 z-30 rounded-lg bg-foreground text-background text-xs px-2.5 py-1 shadow-lg float-in">
            Tipp: hier deinen Avatar anpassen ✏️
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Verlassen"><X className="w-5 h-5" /></Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 mx-auto w-full max-w-md">
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm">
            Im Einkauf fließen sensible Daten — Preise, Verträge, Lieferanten-PII. KI kann enorm helfen,
            aber <span className="font-medium">Datenschutz zuerst</span>. Löse die Aufgaben, ohne etwas zu verraten.
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-3 mb-2">{completed}/{total} Aufgaben gelöst</p>

        <ul className="space-y-2.5">
          {PROCUREMENT_TASKS.map((t) => {
            const isDone = done.has(tok(t.id));
            return (
              <li key={t.id} className="rounded-xl border-2 border-border bg-card px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDone ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <Lock className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{t.scenario.title}</p>
                    <p className="text-sm text-muted-foreground leading-snug mt-0.5">{t.task}</p>
                  </div>
                </div>
                <Button
                  className="mt-3 w-full h-10 display-font font-semibold"
                  variant={isDone ? 'outline' : 'default'}
                  onClick={() => setActive(t.id)}
                >
                  {isDone ? <><RotateCw className="w-4 h-4 mr-2" />Nochmal</> : <><Play className="w-4 h-4 mr-2" />Aufgabe starten</>}
                </Button>
              </li>
            );
          })}
        </ul>

        {completed === total && (
          <div className="mt-4 rounded-xl border-2 border-primary/40 bg-primary/10 px-4 py-3 text-center">
            <div className="text-3xl">🛡️</div>
            <p className="display-font font-semibold mt-1">Datenschutz-Profi im Einkauf</p>
            <p className="text-xs text-muted-foreground">Alle Aufgaben sicher gelöst — KI genutzt, nichts verraten.</p>
          </div>
        )}
      </div>

      {activeTask && (
        <SandboxRunner
          scenario={activeTask.scenario}
          onClose={(success) => {
            if (success) {
              addReward(sessionId, tok(activeTask.id));
              setDone((d) => new Set(d).add(tok(activeTask.id)));
            }
            setActive(null);
          }}
        />
      )}
    </div>
  );
}
