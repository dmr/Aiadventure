import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Footprints, MessageCircle, Trophy, X } from 'lucide-react';

type Props = {
  /** Called when the player dismisses the tutorial ("Los geht's" or ✕). */
  onClose: () => void;
};

/**
 * First-time onboarding overlay. Explains the goal and the controls in a few
 * seconds so new players know what to do. Shown once (persisted), and
 * reopenable via the "?" button in the game header.
 */
export function Tutorial({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="So spielst du"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-border bg-card text-card-foreground shadow-2xl float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-6 pb-2 text-center">
          <div className="text-4xl mb-1">☕🔥</div>
          <h2 className="display-font text-2xl font-bold">So spielst du</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ein kleines Café mit 5 Räumen — jeder Raum ist eine Lernstufe zu Claude Code.
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <Step
            icon={<Footprints className="h-5 w-5" />}
            title="Bewegen"
            body={
              <>
                <span className="font-medium">Tipp einfach aufs Spielfeld</span> — deine Figur läuft
                dorthin. Oder steuere mit <Kbd>W</Kbd> <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> /
                Pfeiltasten bzw. dem Joystick unten links.
              </>
            }
          />
          <Step
            icon={<MessageCircle className="h-5 w-5" />}
            title="Reden & Erkunden"
            body={
              <>
                <span className="font-medium">Tipp direkt auf eine Figur oder Station</span> — du
                läufst hin und sprichst sie an. Oder geh hin und drück <Kbd>E</Kbd> / <Kbd>Enter</Kbd> /{' '}
                <Kbd>Leer</Kbd> bzw. den großen <span className="font-medium">⊙</span>-Knopf.
              </>
            }
          />
          <Step
            icon={<Trophy className="h-5 w-5" />}
            title="Ziel"
            body={
              <>
                Arbeite dich durch alle 5 Stufen bis ins <span className="font-medium">Cockpit</span> und
                probier dort die <span className="font-medium">Trainings-Simulatoren</span>. Dein
                Fortschritt wird automatisch gespeichert.
              </>
            }
          />
        </div>

        <div className="px-6 pb-6 pt-1">
          <Button onClick={onClose} size="lg" className="w-full display-font font-semibold">
            Los geht's
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground leading-snug mt-0.5">{body}</p>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[11px] font-medium">
      {children}
    </kbd>
  );
}
