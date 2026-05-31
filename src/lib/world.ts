// World data: rooms, tiles, NPCs, interactables, exits.
// Tile-based grid (13 wide × 9 high). The player moves one tile at a time.

import type { AvatarConfig } from './avatar';

export type RoomId = 'eingang' | 'cafebar' | 'lounge' | 'garten' | 'cockpit';
export type Dir = 'up' | 'down' | 'left' | 'right';

export const TILE_SIZE = 36;
export const ROOM_W = 13;
export const ROOM_H = 9;

// Tile codes:
//  . floor    # wall    D door
//  F furniture (blocks)    , grass    ~ water
export type TileChar = '.' | '#' | 'D' | 'F' | ',' | '~';

export type RoomDef = {
  id: RoomId;
  name: string;
  subtitle: string;
  floor: 'wood' | 'tile' | 'grass' | 'stone';
  tint?: string;
  rows: TileChar[][];
  decorations: Decoration[];
  npcs: NpcDef[];
  interactables: Interactable[];
  exits: ExitSpec[];
};

export type Decoration = {
  x: number;
  y: number;
  emoji: string;
  scale?: number;
  block?: boolean;
  label?: string;
};

export type NpcDef = {
  id: string;
  name: string;
  x: number;
  y: number;
  facing: Dir;
  avatar: AvatarConfig;
  bubble?: string;
  /** If set, talking to this NPC triggers this lesson */
  lessonId?: string;
  dialog: { lines: string[]; reward?: string };
};

export type Interactable = {
  x: number;
  y: number;
  radius?: number;
  id: string;
  label: string;
  emoji?: string;
  /** If set, triggers the named lesson */
  lessonId?: string;
  /** If set, opens the Trainings-Simulator with this scenario id */
  sandboxId?: string;
  lines: string[];
  reward?: string;
};

export type ExitSpec = {
  x: number;
  y: number;
  to: RoomId;
  spawn: { x: number; y: number; facing: Dir };
  label?: string;
};

// Helper to parse a row string into TileChar[]
function R(s: string): TileChar[] {
  return s.split('') as TileChar[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EINGANG (Stufe 1 — Roya, Use-Cases)
// ─────────────────────────────────────────────────────────────────────────────
const eingang: RoomDef = {
  id: 'eingang',
  name: 'Lobby',
  subtitle: 'Stufe 1 · Use-Cases — sprich mit Roya',
  floor: 'wood',
  tint: '#e0c896',
  rows: [
    R('#############'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('#...........D'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('#############'),
  ],
  decorations: [
    { x: 2, y: 1, emoji: '🪴' },
    { x: 10, y: 1, emoji: '🪴' },
    { x: 6, y: 2, emoji: '📋', label: 'Lobby' },
    { x: 1, y: 7, emoji: '🛋️' },
    { x: 11, y: 7, emoji: '🛋️' },
  ],
  exits: [
    {
      x: 12, y: 4, to: 'cafebar',
      spawn: { x: 1, y: 4, facing: 'right' },
      label: 'Stufe 2 →',
    },
  ],
  npcs: [
    {
      id: 'roya',
      name: 'Roya',
      x: 6, y: 4,
      facing: 'down',
      avatar: { skin: 2, hairStyle: 0, hairColor: 1, shirt: 2, pants: 9, accessory: 1 },
      bubble: '👋',
      lessonId: 'usecases',
      dialog: { lines: ['Roya: "Komm her, ich zeig dir was."'] },
    },
  ],
  interactables: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// CAFEBAR (Stufe 2 — Pavel, Context Window)
// ─────────────────────────────────────────────────────────────────────────────
const cafebar: RoomDef = {
  id: 'cafebar',
  name: 'Bibliothek',
  subtitle: 'Stufe 2 · Context Window — sprich mit Pavel',
  floor: 'tile',
  tint: '#d6c4a8',
  rows: [
    R('#############'),
    R('#FFFFFFFFFFF#'),
    R('#...........#'),
    R('#...........#'),
    R('D...........D'),
    R('#...........#'),
    R('#...........#'),
    R('#FF.......FF#'),
    R('#############'),
  ],
  decorations: [
    { x: 1, y: 1, emoji: '📚' },
    { x: 3, y: 1, emoji: '📖' },
    { x: 5, y: 1, emoji: '📚' },
    { x: 7, y: 1, emoji: '📖' },
    { x: 9, y: 1, emoji: '📚' },
    { x: 11, y: 1, emoji: '📖' },
    { x: 1, y: 7, emoji: '🪑' },
    { x: 2, y: 7, emoji: '📔' },
    { x: 10, y: 7, emoji: '📔' },
    { x: 11, y: 7, emoji: '🪑' },
  ],
  exits: [
    {
      x: 0, y: 4, to: 'eingang',
      spawn: { x: 11, y: 4, facing: 'left' },
      label: '← Stufe 1',
    },
    {
      x: 12, y: 4, to: 'lounge',
      spawn: { x: 1, y: 4, facing: 'right' },
      label: 'Stufe 3 →',
    },
  ],
  npcs: [
    {
      id: 'pavel',
      name: 'Pavel',
      x: 5, y: 2,
      facing: 'down',
      avatar: { skin: 1, hairStyle: 1, hairColor: 6, shirt: 7, pants: 6, accessory: 1 },
      bubble: '📚',
      lessonId: 'context',
      dialog: { lines: ['Pavel: "Komm her, ich erklär dir was zu Context Windows."'] },
    },
  ],
  interactables: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// LOUNGE (Stufe 3 — Lia, Promptcraft)
// ─────────────────────────────────────────────────────────────────────────────
const lounge: RoomDef = {
  id: 'lounge',
  name: 'Atelier',
  subtitle: 'Stufe 3 · Promptcraft — sprich mit Lia',
  floor: 'wood',
  tint: '#e8c885',
  rows: [
    R('#############'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('D...........D'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('#############'),
  ],
  decorations: [
    { x: 2, y: 1, emoji: '🎨' },
    { x: 10, y: 1, emoji: '✒️' },
    { x: 2, y: 7, emoji: '📓' },
    { x: 5, y: 7, emoji: '🖋️' },
    { x: 7, y: 7, emoji: '📜' },
    { x: 10, y: 7, emoji: '📓' },
  ],
  exits: [
    {
      x: 0, y: 4, to: 'cafebar',
      spawn: { x: 11, y: 4, facing: 'left' },
      label: '← Stufe 2',
    },
    {
      x: 12, y: 4, to: 'garten',
      spawn: { x: 1, y: 4, facing: 'right' },
      label: 'Stufe 4 →',
    },
  ],
  npcs: [
    {
      id: 'lia',
      name: 'Lia',
      x: 9, y: 2,
      facing: 'down',
      avatar: { skin: 2, hairStyle: 1, hairColor: 1, shirt: 7, pants: 6, accessory: 1 },
      bubble: '✏️',
      lessonId: 'promptcraft',
      dialog: { lines: ['Lia: "Komm her, lass uns über Promptcraft reden."'] },
    },
  ],
  interactables: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// WERKSTATT (Stufe 4 — Claude Code, mehrere Stationen)
// ─────────────────────────────────────────────────────────────────────────────
const garten: RoomDef = {
  id: 'garten',
  name: 'Werkstatt',
  subtitle: 'Stufe 4 · Claude Code — sprich mit Sven, dann arbeite die Stationen ab',
  floor: 'wood',
  tint: '#e8c98a',
  rows: [
    R('#############'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('D...........D'),
    R('#...........#'),
    R('#...........#'),
    R('#...........#'),
    R('#############'),
  ],
  decorations: [
    { x: 2, y: 2, emoji: '📄', label: 'CLAUDE.md', scale: 1.4, block: true },
    { x: 10, y: 2, emoji: '🗺️', label: 'Plan Mode', scale: 1.4, block: true },
    { x: 2, y: 6, emoji: '🤖', label: 'Subagents', scale: 1.4, block: true },
    { x: 10, y: 6, emoji: '🔌', label: 'MCP & Hooks', scale: 1.4, block: true },
    { x: 6, y: 1, emoji: '⚙️' },
    { x: 1, y: 1, emoji: '📦' },
    { x: 11, y: 1, emoji: '🧰' },
    { x: 1, y: 7, emoji: '💡' },
  ],
  exits: [
    {
      x: 0, y: 4, to: 'lounge',
      spawn: { x: 11, y: 4, facing: 'left' },
      label: '← Stufe 3',
    },
    {
      x: 12, y: 4, to: 'cockpit',
      spawn: { x: 1, y: 4, facing: 'right' },
      label: 'Stufe 5 →',
    },
  ],
  npcs: [
    {
      id: 'sven',
      name: 'Sven',
      x: 6, y: 4,
      facing: 'down',
      avatar: { skin: 3, hairStyle: 5, hairColor: 3, shirt: 1, pants: 5, accessory: 2 },
      bubble: '🛠️',
      lessonId: 'cc-intro',
      dialog: { lines: ['Sven: "Komm her — Übersicht zuerst."'] },
    },
    {
      id: 'cat',
      name: 'Mochi',
      x: 11, y: 7,
      facing: 'down',
      avatar: { skin: 0, hairStyle: 0, hairColor: 1, shirt: 9, pants: 9, accessory: 0 },
      bubble: 'mrr',
      dialog: {
        lines: [
          '🐈 Eine kleine schwarze Katze schaut dich an. "Mrr."',
          'Du streichelst sie kurz. Sie schnurrt und legt sich auf deinen Fuß.',
        ],
        reward: 'cat-friend',
      },
    },
  ],
  interactables: [
    { x: 2, y: 2, id: 'station-claude-md', label: '📄 CLAUDE.md', lessonId: 'claude-md', lines: [] },
    { x: 10, y: 2, id: 'station-plan', label: '🗺️ Plan Mode + Slash-Commands', lessonId: 'plan-mode', lines: [] },
    { x: 2, y: 6, id: 'station-subagents', label: '🤖 Subagents', lessonId: 'subagents', lines: [] },
    { x: 10, y: 6, id: 'station-mcp', label: '🔌 MCP & Hooks', lessonId: 'mcp-hooks', lines: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COCKPIT (Stufe 5 — Agent Mode + Trainings-Simulator)
// ─────────────────────────────────────────────────────────────────────────────
const cockpit: RoomDef = {
  id: 'cockpit',
  name: 'Cockpit',
  subtitle: 'Stufe 5 · Agent Mode — sprich mit Iris, dann probier die Simulator-Terminals',
  floor: 'stone',
  tint: '#d8c8b0',
  rows: [
    R('#############'),
    R('#FFFFFFFFFFF#'),
    R('#...........#'),
    R('#FF.......FF#'),
    R('D...........#'),
    R('#FF.......FF#'),
    R('#...........#'),
    R('#FFFFFFFFFFF#'),
    R('#############'),
  ],
  decorations: [
    { x: 1, y: 1, emoji: '🖥️' },
    { x: 3, y: 1, emoji: '🟢', label: 'Sim: Greenfield', scale: 1.2 },
    { x: 5, y: 1, emoji: '🎛️' },
    { x: 7, y: 1, emoji: '📊' },
    { x: 9, y: 1, emoji: '🌙', label: 'Sim: Agent über Nacht', scale: 1.2 },
    { x: 11, y: 1, emoji: '🛰️' },
    { x: 1, y: 3, emoji: '💺' },
    { x: 2, y: 3, emoji: '⌨️' },
    { x: 10, y: 3, emoji: '⌨️' },
    { x: 11, y: 3, emoji: '💺' },
    { x: 1, y: 5, emoji: '💺' },
    { x: 2, y: 5, emoji: '⌨️' },
    { x: 10, y: 5, emoji: '⌨️' },
    { x: 11, y: 5, emoji: '💺' },
    { x: 1, y: 7, emoji: '🎯' },
    { x: 3, y: 7, emoji: '📈' },
    { x: 5, y: 7, emoji: '🔋' },
    { x: 7, y: 7, emoji: '🎮', label: 'Trainings-Simulator', scale: 1.4, block: true },
    { x: 9, y: 7, emoji: '🚦' },
    { x: 11, y: 7, emoji: '🌐' },
  ],
  exits: [
    {
      x: 0, y: 4, to: 'garten',
      spawn: { x: 11, y: 4, facing: 'left' },
      label: '← Stufe 4',
    },
  ],
  npcs: [
    {
      id: 'iris',
      name: 'Iris',
      x: 6, y: 4,
      facing: 'down',
      avatar: { skin: 1, hairStyle: 4, hairColor: 0, shirt: 6, pants: 9, accessory: 1 },
      bubble: '🚀',
      lessonId: 'agent-mode',
      dialog: { lines: ['Iris: "Du hast es bis hier geschafft. Komm rüber."'] },
    },
  ],
  interactables: [
    {
      x: 7, y: 7,
      id: 'simulator',
      label: '🎮 Simulator: Friday Hotfix',
      sandboxId: 'friday-hotfix',
      lines: [],
    },
    {
      x: 3, y: 1,
      id: 'sim-greenfield',
      label: '🟢 Simulator: Greenfield-Service',
      sandboxId: 'greenfield-spec',
      lines: [],
    },
    {
      x: 9, y: 1,
      id: 'sim-runaway',
      label: '🌙 Simulator: Agent über Nacht',
      sandboxId: 'runaway-agent',
      lines: [],
    },
  ],
};

export const ROOMS: Record<RoomId, RoomDef> = {
  eingang, cafebar, lounge, garten, cockpit,
};

export const ROOM_ORDER: RoomId[] = ['eingang', 'cafebar', 'lounge', 'garten', 'cockpit'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function canEnterTile(room: RoomDef, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= ROOM_W || y >= ROOM_H) return false;
  const tile = room.rows[y]?.[x];
  if (tile === undefined) return false;
  if (tile === '#' || tile === 'F' || tile === '~') return false;
  // Decorations with block:true
  for (const d of room.decorations) {
    if (d.x === x && d.y === y && d.block) return false;
  }
  // NPCs always block
  for (const n of room.npcs) {
    if (n.x === x && n.y === y) return false;
  }
  return true;
}

export function findExitAt(room: RoomDef, x: number, y: number): ExitSpec | undefined {
  return room.exits.find(e => e.x === x && e.y === y);
}

export function nearestInteraction(
  room: RoomDef,
  cx: number, cy: number,
  maxDist = 1.5,
): { kind: 'npc'; npc: NpcDef } | { kind: 'obj'; obj: Interactable } | null {
  let best: { dist: number; kind: 'npc' | 'obj'; npc?: NpcDef; obj?: Interactable } | null = null;
  for (const n of room.npcs) {
    const d = Math.hypot(n.x + 0.5 - cx, n.y + 0.5 - cy);
    if (d <= maxDist && (!best || d < best.dist)) {
      best = { dist: d, kind: 'npc', npc: n };
    }
  }
  for (const o of room.interactables) {
    const r = o.radius ?? maxDist;
    const d = Math.hypot(o.x + 0.5 - cx, o.y + 0.5 - cy);
    if (d <= r && (!best || d < best.dist)) {
      best = { dist: d, kind: 'obj', obj: o };
    }
  }
  if (!best) return null;
  if (best.kind === 'npc') return { kind: 'npc', npc: best.npc! };
  return { kind: 'obj', obj: best.obj! };
}
