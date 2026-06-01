import { AvatarCanvas } from './AvatarCanvas';
import { STAGES } from '@/lib/journey';
import { ROOMS, ROOM_ORDER, ROOM_W, type RoomDef } from '@/lib/world';
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
  const cast = ROOM_ORDER.flatMap((r) => ROOMS[r].npcs);

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
                <span>Stufe {s.n}: {s.title}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>Trainings-Simulator bestanden</span>
            </li>
          </ul>

          {/* Rooms explored */}
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-6 mb-2">
            Erkundete Räume
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {ROOM_ORDER.map((r) => (
              <div key={r} className="flex flex-col items-center gap-1">
                <RoomMini room={ROOMS[r]} />
                <span className="text-[9px] text-muted-foreground leading-none">{ROOMS[r].name}</span>
              </div>
            ))}
          </div>

          {/* Cast */}
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-6 mb-2">
            Begegnungen
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            {cast.map((npc) => (
              <div key={npc.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2 py-1.5">
                <div className="shrink-0 rounded bg-secondary/60 p-0.5">
                  <AvatarCanvas config={npc.avatar} size={32} facing="down" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">{npc.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{npc.title ?? ''}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
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

// Tiny map preview of a room (tile colours from its grid).
function RoomMini({ room }: { room: RoomDef }) {
  const color = (ch: string): string => {
    switch (ch) {
      case '#': return '#5a3a22';
      case 'F': return '#6b4423';
      case 'D': return '#caa46a';
      case '~': return '#3e5b6b';
      default: return room.tint ?? '#e8c98a';
    }
  };
  const cell = 3;
  return (
    <div
      className="rounded border border-border overflow-hidden"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${ROOM_W}, ${cell}px)`, lineHeight: 0 }}
    >
      {room.rows.flatMap((rowArr, y) =>
        rowArr.map((ch, x) => (
          <div key={`${x}-${y}`} style={{ width: cell, height: cell, backgroundColor: color(ch) }} />
        )),
      )}
    </div>
  );
}
