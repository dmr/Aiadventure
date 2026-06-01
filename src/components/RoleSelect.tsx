import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, Users, Sparkles, Map, Gamepad2 } from 'lucide-react';
import type { Role, Entry } from '@/lib/journey';

type Props = {
  onDone: (role: Role, entry: Entry) => void;
};

const ROLES: { id: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'dev', label: 'Entwickler:in', desc: 'Hands-on Code, Hotfixes, Greenfield', icon: <Code2 className="w-5 h-5" /> },
  { id: 'lead', label: 'Lead / EM', desc: 'Team, Rollout, Kosten, Vertrauen', icon: <Users className="w-5 h-5" /> },
  { id: 'curious', label: 'Neugierig', desc: 'Einfach mal alles ansehen', icon: <Sparkles className="w-5 h-5" /> },
];

const ENTRIES: { id: Entry; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'tour', label: 'Voller Rundgang', desc: 'Alle 5 Stufen der Reihe nach', icon: <Map className="w-5 h-5" /> },
  { id: 'sim', label: 'Direkt zum Simulator', desc: 'Rein ins Cockpit, sofort entscheiden', icon: <Gamepad2 className="w-5 h-5" /> },
];

// Start selection: who are you + what do you want to experience. The role
// personalises which simulators get recommended; the entry picks where you start.
export function RoleSelect({ onDone }: Props) {
  const [role, setRole] = useState<Role | null>(null);
  const [entry, setEntry] = useState<Entry>('tour');

  return (
    <div className="h-[100dvh] w-full flex flex-col items-stretch px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] mx-auto max-w-md overflow-hidden no-select float-in">
      <div className="text-center shrink-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Worauf hast du Lust?</p>
        <h1 className="display-font text-2xl font-semibold leading-tight">In welcher Rolle?</h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-5">
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              aria-pressed={role === r.id}
              className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                role === r.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${role === r.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {r.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Einstieg</p>
          <div className="grid grid-cols-2 gap-2">
            {ENTRIES.map((e) => (
              <button
                key={e.id}
                onClick={() => setEntry(e.id)}
                aria-pressed={entry === e.id}
                className={`rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                  entry === e.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold text-sm leading-tight">{e.icon}{e.label}</span>
                <span className="block text-xs text-muted-foreground mt-1">{e.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        className="mt-4 h-12 display-font text-base font-semibold shadow-md shrink-0"
        disabled={!role}
        onClick={() => role && onDone(role, entry)}
      >
        Weiter zum Avatar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
