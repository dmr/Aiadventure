import { STAGES, type JourneyProgress } from '@/lib/journey';
import type { RoomId } from '@/lib/world';
import { Check, Lock, MapPin, Trophy, X, Gamepad2 } from 'lucide-react';

type Props = {
  progress: JourneyProgress;
  currentRoom: RoomId;
  completed: Set<string>;
  onClose: () => void;
  onShowCertificate: () => void;
};

// The journey overview: always answers "where am I, how far to the goal?".
export function JourneyMap({ progress, currentRoom, completed, onClose, onShowCertificate }: Props) {
  const pct = Math.round(progress.ratio * 100);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Dein Fortschritt"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm max-h-[88dvh] overflow-y-auto rounded-2xl border-2 border-border bg-card text-card-foreground shadow-2xl float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Schließen">
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-6 pb-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Dein Ziel</p>
          <h2 className="display-font text-2xl font-bold leading-tight">Vibe-Check-Zertifikat</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Meistere alle 5 Stufen und bestehe einen Trainings-Simulator.
          </p>
          {/* progress bar */}
          <div className="mt-3 h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.stagesDone}/{progress.totalStages} Stufen · Simulator {progress.simDone ? '✓' : '—'} · {pct}%
          </p>
        </div>

        <ol className="px-4 pb-2 space-y-1.5">
          {STAGES.map((s) => {
            const done = completed.has(s.lessonId);
            const current = !done && s.room === currentRoom;
            return (
              <li
                key={s.n}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border-2 ${
                  current ? 'border-primary bg-primary/5' : 'border-transparent'
                }`}
              >
                <span className="text-xl shrink-0">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold leading-tight ${done ? '' : current ? 'text-primary' : ''}`}>
                    Stufe {s.n} · {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">mit {s.mentor}</p>
                </div>
                {done ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : current ? (
                  <span className="flex items-center gap-1 text-xs text-primary font-medium shrink-0">
                    <MapPin className="h-4 w-4" /> hier
                  </span>
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                )}
              </li>
            );
          })}

          {/* Simulator goal */}
          <li className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <Gamepad2 className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">Trainings-Simulator</p>
              <p className="text-xs text-muted-foreground">im Cockpit · mind. einmal bestehen</p>
            </div>
            {progress.simDone ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
          </li>
        </ol>

        <div className="px-6 pb-6 pt-2">
          {progress.certificateEarned ? (
            <button
              onClick={onShowCertificate}
              className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground display-font font-semibold flex items-center justify-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              Zertifikat ansehen
            </button>
          ) : (
            <div className="w-full rounded-xl bg-secondary px-4 py-3 text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Zertifikat noch gesperrt
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
