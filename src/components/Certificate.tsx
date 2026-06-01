import { AvatarCanvas } from './AvatarCanvas';
import { STAGES } from '@/lib/journey';
import type { AvatarConfig } from '@/lib/avatar';
import { Check, X } from 'lucide-react';

type Props = {
  name: string;
  avatar: AvatarConfig;
  onClose: () => void;
};

// The payoff: a celebratory certificate the player earns by finishing the journey.
export function Certificate({ name, avatar, onClose }: Props) {
  const date = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Zertifikat"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl border-4 border-primary/70 bg-card text-card-foreground shadow-2xl float-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Schließen">
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-7 pb-6">
          <div className="text-5xl mb-1">🏆</div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Zertifikat</p>
          <h2 className="display-font text-3xl font-bold leading-tight mt-1">Vibe Check bestanden</h2>

          <div className="my-4 flex flex-col items-center">
            <div className="rounded-xl bg-secondary/60 border-2 border-border p-1.5">
              <AvatarCanvas config={avatar} size={88} facing="down" />
            </div>
            <p className="display-font text-xl font-semibold mt-2">{name}</p>
            <p className="text-xs text-muted-foreground">hat die Reise gemeistert · {date}</p>
          </div>

          <ul className="text-left text-sm space-y-1.5 mx-auto max-w-[16rem]">
            {STAGES.map((s) => (
              <li key={s.n} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>
                  Stufe {s.n}: {s.title}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>Trainings-Simulator bestanden</span>
            </li>
          </ul>

          <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
            Du weißt jetzt, wann Claude Code brilliert, wann es dich reinlegt — und wie du den
            Unterschied steuerst. Genau darum ging's.
          </p>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground display-font font-semibold"
          >
            Weiterspielen
          </button>
        </div>
      </div>
    </div>
  );
}
