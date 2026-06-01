import { AvatarCanvas } from './AvatarCanvas';
import { DEFAULT_AVATAR } from '@/lib/avatar';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = { onClose: () => void };

// In-app guide: explains every screen/content with a small illustrative preview.
// (Stylised mockups, not runtime screenshots — they work offline and stay in sync.)
export function InfoOverlay({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-foreground/45 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="So funktioniert Vibe Check"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border-2 border-border bg-card text-card-foreground shadow-2xl float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card/95 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Anleitung</p>
            <h2 className="display-font text-xl font-bold leading-tight">So funktioniert Vibe Check</h2>
          </div>
          <button className="text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Schließen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Item
            title="1 · Start & Speicherstände"
            thumb={<SlotsThumb />}
            body="Auf der Startseite legst du los oder wählst einen bestehenden Speicherstand. Jede Session merkt sich Avatar, Fortschritt und Spielzeit — du kannst mehrere parallel führen."
          />
          <Item
            title="2 · Rolle & Einstieg"
            thumb={<div className="text-3xl">🧑‍💻 / 🧑‍💼</div>}
            body="Wähle deine Rolle (Entwickler:in, Lead oder Neugierig) und den Einstieg (voller Rundgang oder direkt zum Simulator). Deine Rolle hebt passende Szenarien hervor."
          />
          <Item
            title="3 · Avatar"
            thumb={<div className="rounded-lg bg-secondary/60 p-1"><AvatarCanvas config={DEFAULT_AVATAR} size={56} facing="down" /></div>}
            body="Bau deine Figur: Statur & Größe, Hautton, Frisur, Outfit und Extras (Brille, Hut, Goldkette, Selfie-Stick …). Die Anrede schlägt eine passende Statur vor."
          />
          <Item
            title="4 · Räume & Steuerung"
            thumb={<RoomThumb />}
            body="Ein kleines Café mit 5 Räumen. Tipp aufs Spielfeld, um hinzulaufen — oder nutze WASD/Pfeile/Joystick. Tippe eine Figur oder Station an, um zu reden bzw. eine Lektion zu starten."
          />
          <Item
            title="5 · Ziel & Fortschritt"
            thumb={<ProgressThumb />}
            body="Oben siehst du dein Ziel und den Fortschritt (Kapitel X/5). Über 🏆 öffnest du die Karte. Alle 5 Kapitel + ein bestandener Simulator = dein Vibe-Check-Zertifikat."
          />
          <Item
            title="6 · Trainings-Simulatoren"
            thumb={<TerminalThumb />}
            body="Im Cockpit triffst du in realistischen Szenarien Entscheidungen (Hotfix, Greenfield, Agent über Nacht, Team-Rollout). Jede Wahl zählt — am Ende ein Ergebnis mit Lesson Learned."
          />
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full rounded-xl bg-primary px-4 py-3 text-primary-foreground display-font font-semibold">
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}

function Item({ title, thumb, body }: { title: string; thumb: ReactNode; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-20 h-20 rounded-xl border-2 border-border bg-background flex items-center justify-center overflow-hidden">
        {thumb}
      </div>
      <div className="min-w-0">
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground leading-snug mt-0.5">{body}</p>
      </div>
    </div>
  );
}

/* ── tiny illustrative thumbnails ─────────────────────────────────────────── */
function SlotsThumb() {
  return (
    <div className="w-full px-2 space-y-1">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-1 rounded bg-card border border-border px-1 py-0.5">
          <span className="w-3 h-3 rounded-full bg-primary/40" />
          <span className="flex-1 h-1.5 rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

function RoomThumb() {
  // 4×4 café floor; player top-left, a mentor lower-right.
  const icons: Record<number, string> = { 0: '🧍', 10: '🧑‍🏫' };
  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-px bg-border w-16 h-16 rounded overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="bg-[#e8c98a] flex items-center justify-center text-[9px] leading-none">
          {icons[i] ?? ''}
        </div>
      ))}
    </div>
  );
}

function ProgressThumb() {
  return (
    <div className="w-full px-2">
      <div className="flex gap-1 justify-center mb-1">
        {[1, 1, 1, 0, 0].map((d, i) => (
          <span key={i} className={`w-2.5 h-2.5 rounded-full border-2 ${d ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`} />
        ))}
      </div>
      <div className="text-2xl text-center">🏆</div>
    </div>
  );
}

function TerminalThumb() {
  return (
    <div className="w-full h-full bg-[#3d2414] rounded p-1.5 flex flex-col gap-1 justify-center">
      <span className="h-1 w-3/4 rounded bg-[#d9a441]" />
      <span className="h-1 w-1/2 rounded bg-[#6b9e5a]" />
      <span className="h-2 w-2/3 rounded bg-[#fbf6ea]/80 mt-0.5" />
    </div>
  );
}
