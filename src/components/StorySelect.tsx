import { Coffee, ShoppingCart } from 'lucide-react';
import type { Track } from '@/lib/journey';

type Props = {
  onChoose: (track: Track) => void;
};

const TRACKS: {
  id: Track;
  title: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'cafe',
    title: 'Café — Claude Code',
    tagline: 'Das Lernspiel',
    desc: 'Erkunde 5 Räume, triff Mentor:innen und meistere KI-Coding mit Claude Code. Mit Trainings-Simulatoren.',
    icon: <Coffee className="w-6 h-6" />,
  },
  {
    id: 'einkauf',
    title: 'KI im Einkauf',
    tagline: 'Klare Tasks · Datenschutz-Fokus',
    desc: 'Konkrete Einkaufs-Aufgaben (Angebote, Lieferantendaten, Verträge) — KI nutzen, ohne Datenschutz zu verletzen.',
    icon: <ShoppingCart className="w-6 h-6" />,
  },
];

// Upstream story selection: which experience do you want?
export function StorySelect({ onChoose }: Props) {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-stretch px-4 pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] mx-auto max-w-md overflow-hidden no-select float-in justify-center">
      <div className="text-center shrink-0 mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Vibe Check</p>
        <h1 className="display-font text-2xl font-semibold leading-tight">Welche Geschichte?</h1>
        <p className="text-sm text-muted-foreground mt-1">Zwei Wege, dieselbe Frage: KI nutzen — aber richtig.</p>
      </div>

      <div className="space-y-3">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChoose(t.id)}
            className="w-full flex items-start gap-3 rounded-2xl border-2 border-border bg-card hover:border-primary/50 px-4 py-4 text-left transition-colors"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {t.icon}
            </span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="font-semibold leading-tight">{t.title}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.tagline}</span>
              </span>
              <span className="block text-sm text-muted-foreground leading-snug mt-0.5">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
