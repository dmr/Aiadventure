import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarCanvas } from './AvatarCanvas';
import {
  type AvatarConfig,
  SKIN_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  CLOTH_COLORS,
  ACCESSORIES,
  randomAvatar,
  buildFromGender,
} from '@/lib/avatar';
import type { Gender } from '@/lib/storage';
import { randomName } from '@/lib/names';
import { Shuffle, Check, Dices } from 'lucide-react';

type Props = {
  config: AvatarConfig;
  name: string;
  gender: Gender | undefined;
  onChange: (cfg: AvatarConfig) => void;
  onName: (n: string) => void;
  onGender: (g: Gender | undefined) => void;
  onDone: () => void;
};

type Tab = 'skin' | 'hair' | 'outfit' | 'accessory';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'skin', label: 'Haut', emoji: '✋' },
  { id: 'hair', label: 'Haare', emoji: '💇' },
  { id: 'outfit', label: 'Outfit', emoji: '👕' },
  { id: 'accessory', label: 'Extras', emoji: '🕶️' },
];

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'w', label: 'w' },
  { id: 'm', label: 'm' },
  { id: 'd', label: 'divers' },
];

export function AvatarEditor({ config, name, gender, onChange, onName, onGender, onDone }: Props) {
  const [tab, setTab] = useState<Tab>('skin');

  const set = (patch: Partial<AvatarConfig>) => onChange({ ...config, ...patch });
  const build = buildFromGender(gender);

  return (
    // Full dynamic-viewport height + overflow-hidden → the page never scrolls on
    // mobile; only the palette area below flexes/scrolls if a device is tiny.
    <div className="h-[100dvh] w-full flex flex-col items-stretch px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] mx-auto max-w-md overflow-hidden no-select float-in">
      <div className="text-center shrink-0">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Schritt 1 von 2</p>
        <h1 className="display-font text-2xl font-semibold leading-tight">Mach dich hübsch</h1>
      </div>

      {/* Preview + name + Anrede in one compact row */}
      <div className="shrink-0 mt-3 flex items-center gap-3">
        <div className="shrink-0 rounded-xl bg-card border-2 border-border p-1.5">
          <AvatarCanvas config={config} size={92} facing="down" build={build} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={e => onName(e.target.value.slice(0, 24))}
              placeholder="Dein Name"
              className="text-center text-base display-font h-11 flex-1 min-w-0"
              maxLength={24}
              aria-label="Name"
            />
            <button
              onClick={() => onName(randomName(name))}
              className="h-11 w-11 shrink-0 rounded-md border-2 border-border bg-card hover:bg-secondary transition-all flex items-center justify-center group"
              title="Anderer Vorschlag"
              aria-label="Anderer Namensvorschlag"
            >
              <Dices className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Anrede — optional, beeinflusst die Statur. Erneutes Tippen hebt auf. */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground">Anrede:</span>
            {GENDERS.map(g => (
              <button
                key={g.id}
                onClick={() => onGender(gender === g.id ? undefined : g.id)}
                aria-pressed={gender === g.id}
                className={`px-3 h-7 rounded-full text-xs font-medium transition-all
                  ${gender === g.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card border-2 border-border hover:border-primary/40'
                  }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">optional · wirkt auf die Statur</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mt-3 shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-2 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5
              ${tab === t.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card hover:bg-secondary border-2 border-transparent'
              }`}
          >
            <span className="text-lg leading-none">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Palette — takes the remaining height; scrolls internally only if needed */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-2 rounded-xl bg-card/80 border-2 border-border p-3">
        {tab === 'skin' && (
          <Section title="Hautton">
            <ColorRow colors={SKIN_COLORS} value={config.skin} onSelect={i => set({ skin: i })} />
          </Section>
        )}
        {tab === 'hair' && (
          <>
            <Section title="Frisur">
              <OptionRow options={HAIR_STYLES} value={config.hairStyle} onSelect={i => set({ hairStyle: i })} />
            </Section>
            <Section title="Haarfarbe" className="mt-4">
              <ColorRow colors={HAIR_COLORS} value={config.hairColor} onSelect={i => set({ hairColor: i })} />
            </Section>
          </>
        )}
        {tab === 'outfit' && (
          <>
            <Section title="Oberteil">
              <ColorRow colors={CLOTH_COLORS} value={config.shirt} onSelect={i => set({ shirt: i })} />
            </Section>
            <Section title="Hose" className="mt-4">
              <ColorRow colors={CLOTH_COLORS} value={config.pants} onSelect={i => set({ pants: i })} />
            </Section>
          </>
        )}
        {tab === 'accessory' && (
          <Section title="Zubehör">
            <OptionRow options={ACCESSORIES} value={config.accessory} onSelect={i => set({ accessory: i })} />
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2 mt-3 shrink-0">
        <Button
          variant="outline"
          className="flex-1 h-12 border-2"
          onClick={() => onChange(randomAvatar(Date.now() & 0xffff))}
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Zufall
        </Button>
        <Button
          className="flex-[2] h-12 display-font text-base font-semibold shadow-md"
          onClick={onDone}
          disabled={!name.trim()}
        >
          <Check className="w-4 h-4 mr-2" />
          Los geht's
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
        {title}
      </p>
      {children}
    </div>
  );
}

function ColorRow({
  colors,
  value,
  onSelect,
}: {
  colors: string[];
  value: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`relative w-10 h-10 rounded-lg transition-all
            ${value === i ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'}`}
          style={{ backgroundColor: c, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)' }}
          aria-label={`Farbe ${i + 1}`}
        >
          {value === i && (
            <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-md" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  );
}

function OptionRow({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((label, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`px-4 h-10 rounded-lg text-sm font-medium transition-all
            ${value === i
              ? 'bg-primary text-primary-foreground shadow-md scale-[1.03]'
              : 'bg-secondary hover:bg-secondary/70 text-foreground'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
