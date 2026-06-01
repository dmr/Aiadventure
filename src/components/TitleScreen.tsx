import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarCanvas } from './AvatarCanvas';
import { InfoOverlay } from './InfoOverlay';
import { ArrowRight, Plus, Trophy, Info } from 'lucide-react';
import { journeyProgress } from '@/lib/journey';
import type { Session } from '@/lib/sessions';

type Props = {
  sessions: Session[];
  /** Resume an existing session. */
  onContinue: (id: string) => void;
  /** Start a fresh session (→ avatar editor). */
  onNewSession: () => void;
};

function relTime(ms: number): string {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  return `vor ${d} ${d === 1 ? 'Tag' : 'Tagen'}`;
}

function fmtPlaytime(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 1) return '<1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
}

export function TitleScreen({ sessions, onContinue, onNewSession }: Props) {
  const returning = sessions.length > 0;
  const ordered = [...sessions].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Info / guide — top of the page */}
      <button
        onClick={() => setShowInfo(true)}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border-2 border-border bg-card/80 px-3 h-9 text-sm font-medium text-muted-foreground hover:text-foreground"
        aria-label="So funktioniert Vibe Check"
      >
        <Info className="w-4 h-4" /> Info
      </button>
      {showInfo && <InfoOverlay onClose={() => setShowInfo(false)} />}
      {/* Floating decorative elements */}
      <div className="absolute top-12 left-8 text-5xl opacity-30 animate-pulse" style={{ animationDuration: '3s' }}>💻</div>
      <div className="absolute top-24 right-12 text-4xl opacity-25" style={{ transform: 'rotate(15deg)' }}>🤖</div>
      <div className="absolute bottom-20 left-12 text-5xl opacity-25" style={{ transform: 'rotate(-10deg)' }}>⌨️</div>
      <div className="absolute bottom-32 right-8 text-4xl opacity-30">✨</div>

      <div className="text-center w-full max-w-md float-in relative z-10 flex flex-col min-h-0">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Lernspiel · Claude Code
        </p>
        <h1 className="display-font text-5xl sm:text-6xl font-bold leading-none mb-2">
          Vibe <span style={{ color: 'hsl(var(--terracotta))' }}>Check</span>
        </h1>
        <div className="flex items-center justify-center gap-3 my-3">
          <div className="h-px bg-foreground/30 flex-1 max-w-[60px]" />
          <span className="text-xl">✓</span>
          <div className="h-px bg-foreground/30 flex-1 max-w-[60px]" />
        </div>

        {returning ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">Willkommen zurück — wähle einen Speicherstand.</p>
            <ul className="flex-1 min-h-0 overflow-y-auto space-y-2 text-left -mx-1 px-1">
              {ordered.map((s) => {
                const p = journeyProgress(s.completedLessons, s.misc);
                const isEinkauf = s.track === 'einkauf';
                const tasks = s.misc.filter((m) => m.startsWith('task:')).length;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => onContinue(s.id)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-border bg-card hover:border-primary/50 px-3 py-2.5 transition-colors"
                    >
                      <div className="shrink-0 rounded-lg bg-secondary/60 p-1">
                        <AvatarCanvas config={s.avatar} size={40} facing="down" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate flex items-center gap-1">
                          {s.name}
                          {!isEinkauf && p.certificateEarned && <Trophy className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {isEinkauf ? `🛒 Einkauf · ${tasks}/3` : `☕ Stufe ${p.stagesDone}/${p.totalStages}`}
                          {' · '}{fmtPlaytime(s.playtimeMs)} · {relTime(s.lastPlayedAt)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button
              onClick={onNewSession}
              variant="outline"
              className="mt-3 h-12 border-2 display-font font-semibold shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neue Session · anderer Avatar
            </Button>
          </>
        ) : (
          <>
            <p className="text-base sm:text-lg leading-relaxed mb-8">
              <span className="text-foreground font-medium">
                Vibe-Coden fühlt sich großartig an — bis der Build bricht.
              </span>
              <br />
              <span className="text-muted-foreground">
                In 20 Minuten lernst du, wann Claude Code brilliert, wann es dich reinlegt
                und wie du den Unterschied erkennst.
              </span>
            </p>
            <Button
              onClick={onNewSession}
              size="lg"
              className="h-14 px-8 display-font text-lg font-semibold shadow-lg group self-center"
            >
              Reinkommen
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
              Steuerung: aufs Spielfeld tippen — oder <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">WASD</kbd> / Joystick.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
