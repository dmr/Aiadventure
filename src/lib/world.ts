// World data: rooms, tiles, NPCs, interactables, exits.
// Tile-based grid (13 wide × 13 high, square). The player moves one tile at a time.

import type { AvatarConfig } from './avatar';

export type RoomId = 'eingang' | 'cafebar' | 'lounge' | 'garten' | 'cockpit';
export type Dir = 'up' | 'down' | 'left' | 'right';

export const TILE_SIZE = 36;
export const ROOM_W = 13;
export const ROOM_H = 13;

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

// Shared 13×13 wall borders. Doors sit at y=6 (mid-height).
const OPEN = '#...........#';
const TOP = '#############';
const DOOR_R = '#...........D'; // right door only
const DOOR_L = 'D...........#'; // left door only
const DOOR_LR = 'D...........D'; // both doors
const SHELF = '#FFFFFFFFFFF#'; // furniture row (bookshelves / consoles)

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
    R(TOP), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN),
    R(DOOR_R),
    R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(TOP),
  ],
  decorations: [
    { x: 2, y: 1, emoji: '🪴' },
    { x: 10, y: 1, emoji: '🪴' },
    { x: 6, y: 1, emoji: '📋', label: 'Aushang' },
    { x: 1, y: 11, emoji: '🛋️' },
    { x: 11, y: 11, emoji: '🛋️' },
    { x: 10, y: 11, emoji: '☕' },
  ],
  exits: [
    { x: 12, y: 6, to: 'cafebar', spawn: { x: 1, y: 6, facing: 'right' }, label: 'Stufe 2 →' },
  ],
  npcs: [
    {
      id: 'roya', name: 'Roya', x: 6, y: 5, facing: 'down',
      avatar: { skin: 2, hairStyle: 0, hairColor: 1, shirt: 2, pants: 9, accessory: 1, body: 0, height: 1 },
      bubble: '👋', lessonId: 'usecases',
      dialog: { lines: ['Roya: "Komm her, ich zeig dir was."'] },
    },
    {
      id: 'theo', name: 'Theo', x: 3, y: 9, facing: 'right',
      avatar: { skin: 3, hairStyle: 0, hairColor: 2, shirt: 9, pants: 6, accessory: 1, body: 2, height: 2 },
      bubble: '🙄',
      dialog: {
        lines: [
          'Theo nippt am Kaffee: "KI fürs Coden? Hab ich probiert — hat nur Mist gebaut."',
          'Du: "Kommt drauf an, wofür man sie einsetzt. Frag mal Roya."',
        ],
      },
    },
    {
      id: 'mara', name: 'Mara', x: 9, y: 4, facing: 'down',
      avatar: { skin: 1, hairStyle: 2, hairColor: 4, shirt: 5, pants: 2, accessory: 0, body: 0, height: 0 },
      bubble: '💡',
      dialog: {
        lines: ['Mara: "Tipp: Lass die KI das Langweilige machen — Boilerplate, Migrationen. Das Knifflige machst du."'],
        reward: 'tip-mara',
      },
    },
  ],
  interactables: [
    {
      x: 6, y: 1, id: 'aushang', label: '📋 Aushang lesen', lines: [
        '📋 Aushang: "Heute 16:00 — Pair-Programming mit KI. Bring deine skeptischsten Fragen mit."',
      ],
    },
  ],
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
    R(TOP), R(SHELF), R(OPEN), R(OPEN), R(OPEN), R(OPEN),
    R(DOOR_LR),
    R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(TOP),
  ],
  decorations: [
    { x: 1, y: 1, emoji: '📚' }, { x: 3, y: 1, emoji: '📖' }, { x: 5, y: 1, emoji: '📚' },
    { x: 8, y: 1, emoji: '📚' }, { x: 10, y: 1, emoji: '📖' },
    { x: 1, y: 11, emoji: '🪑' }, { x: 11, y: 11, emoji: '🪑' }, { x: 6, y: 11, emoji: '🕯️' },
  ],
  exits: [
    { x: 0, y: 6, to: 'eingang', spawn: { x: 11, y: 6, facing: 'left' }, label: '← Stufe 1' },
    { x: 12, y: 6, to: 'lounge', spawn: { x: 1, y: 6, facing: 'right' }, label: 'Stufe 3 →' },
  ],
  npcs: [
    {
      id: 'pavel', name: 'Pavel', x: 6, y: 3, facing: 'down',
      avatar: { skin: 1, hairStyle: 1, hairColor: 6, shirt: 7, pants: 6, accessory: 1, body: 1, height: 1 },
      bubble: '📚', lessonId: 'context',
      dialog: { lines: ['Pavel: "Komm her, ich erklär dir was zu Context Windows."'] },
    },
    {
      id: 'bina', name: 'Bina', x: 4, y: 9, facing: 'down',
      avatar: { skin: 4, hairStyle: 1, hairColor: 0, shirt: 1, pants: 6, accessory: 1, body: 0, height: 1 },
      bubble: '🤫',
      dialog: {
        lines: ['Bina flüstert: "Lange Sessions? /clear zwischen unverwandten Themen — dann bleibt der Context scharf."'],
        reward: 'tip-bina',
      },
    },
  ],
  interactables: [
    {
      x: 8, y: 1, id: 'regal', label: '📚 Regal durchsehen', lines: [
        '📚 Ein Buch heißt „Lost in the Middle". Du blätterst: Je voller der Context, desto eher übersieht das Modell die Mitte.',
      ],
    },
  ],
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
    R(TOP), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN),
    R(DOOR_LR),
    R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(TOP),
  ],
  decorations: [
    { x: 2, y: 1, emoji: '🎨' }, { x: 10, y: 1, emoji: '✒️' }, { x: 6, y: 1, emoji: '📜', label: 'Prompt-Wand' },
    { x: 2, y: 11, emoji: '📓' }, { x: 6, y: 11, emoji: '🖋️' }, { x: 10, y: 11, emoji: '📓' },
  ],
  exits: [
    { x: 0, y: 6, to: 'cafebar', spawn: { x: 11, y: 6, facing: 'left' }, label: '← Stufe 2' },
    { x: 12, y: 6, to: 'garten', spawn: { x: 1, y: 6, facing: 'right' }, label: 'Stufe 4 →' },
  ],
  npcs: [
    {
      id: 'lia', name: 'Lia', x: 6, y: 4, facing: 'down',
      avatar: { skin: 2, hairStyle: 1, hairColor: 1, shirt: 7, pants: 6, accessory: 1, body: 0, height: 1 },
      bubble: '✏️', lessonId: 'promptcraft',
      dialog: { lines: ['Lia: "Komm her, lass uns über Promptcraft reden."'] },
    },
    {
      id: 'olu', name: 'Olu', x: 9, y: 9, facing: 'down',
      avatar: { skin: 5, hairStyle: 5, hairColor: 0, shirt: 3, pants: 9, accessory: 3, body: 3, height: 2 },
      bubble: '🎧',
      dialog: {
        lines: ['Olu: "Vage Prompts → vage Ergebnisse. Sag, was du WIRKLICH willst — mit Constraints."'],
        reward: 'tip-olu',
      },
    },
  ],
  interactables: [
    {
      x: 6, y: 1, id: 'promptwand', label: '📜 Prompt-Wand ansehen', lines: [
        '📜 Zwei Prompts hängen nebeneinander:',
        '❌ „mach das schöner"   →   ✅ „extrahiere die Validierung in validateOrder(), mit Vitest-Test"',
      ],
    },
  ],
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
    R(TOP), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN),
    R(DOOR_LR),
    R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(TOP),
  ],
  decorations: [
    { x: 2, y: 2, emoji: '📄', label: 'CLAUDE.md', scale: 1.4, block: true },
    { x: 10, y: 2, emoji: '🗺️', label: 'Plan Mode', scale: 1.4, block: true },
    { x: 2, y: 10, emoji: '🤖', label: 'Subagents', scale: 1.4, block: true },
    { x: 10, y: 10, emoji: '🔌', label: 'MCP & Hooks', scale: 1.4, block: true },
    { x: 6, y: 1, emoji: '⚙️' }, { x: 1, y: 1, emoji: '📦' }, { x: 11, y: 1, emoji: '🧰' },
  ],
  exits: [
    { x: 0, y: 6, to: 'lounge', spawn: { x: 11, y: 6, facing: 'left' }, label: '← Stufe 3' },
    { x: 12, y: 6, to: 'cockpit', spawn: { x: 1, y: 6, facing: 'right' }, label: 'Stufe 5 →' },
  ],
  npcs: [
    {
      id: 'sven', name: 'Sven', x: 6, y: 6, facing: 'down',
      avatar: { skin: 3, hairStyle: 5, hairColor: 3, shirt: 1, pants: 5, accessory: 2, body: 2, height: 1 },
      bubble: '🛠️', lessonId: 'cc-intro',
      dialog: { lines: ['Sven: "Komm her — Übersicht zuerst, dann die vier Stationen."'] },
    },
    {
      id: 'cat', name: 'Mochi', x: 11, y: 11, facing: 'down',
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
    { x: 2, y: 10, id: 'station-subagents', label: '🤖 Subagents', lessonId: 'subagents', lines: [] },
    { x: 10, y: 10, id: 'station-mcp', label: '🔌 MCP & Hooks', lessonId: 'mcp-hooks', lines: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COCKPIT (Stufe 5 — Agent Mode + Trainings-Simulatoren)
// ─────────────────────────────────────────────────────────────────────────────
const cockpit: RoomDef = {
  id: 'cockpit',
  name: 'Cockpit',
  subtitle: 'Stufe 5 · Agent Mode — sprich mit Iris, dann probier die Simulator-Terminals',
  floor: 'stone',
  tint: '#d8c8b0',
  rows: [
    R(TOP), R(SHELF), R(OPEN), R(OPEN), R(OPEN), R(OPEN),
    R(DOOR_L),
    R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(OPEN), R(TOP),
  ],
  decorations: [
    { x: 1, y: 1, emoji: '🖥️' }, { x: 3, y: 1, emoji: '📡' }, { x: 5, y: 1, emoji: '🎛️' },
    { x: 7, y: 1, emoji: '📊' }, { x: 9, y: 1, emoji: '🔭' }, { x: 11, y: 1, emoji: '🛰️' },
    { x: 2, y: 3, emoji: '🎮', label: 'Friday Hotfix', scale: 1.3, block: true },
    { x: 10, y: 3, emoji: '🟢', label: 'Greenfield', scale: 1.3, block: true },
    { x: 2, y: 10, emoji: '🌙', label: 'Agent über Nacht', scale: 1.3, block: true },
    { x: 10, y: 10, emoji: '💼', label: 'Team-Rollout', scale: 1.3, block: true },
  ],
  exits: [
    { x: 0, y: 6, to: 'garten', spawn: { x: 11, y: 6, facing: 'left' }, label: '← Stufe 4' },
  ],
  npcs: [
    {
      id: 'iris', name: 'Iris', x: 6, y: 6, facing: 'down',
      avatar: { skin: 1, hairStyle: 4, hairColor: 0, shirt: 6, pants: 9, accessory: 1, body: 3, height: 2 },
      bubble: '🚀', lessonId: 'agent-mode',
      dialog: { lines: ['Iris: "Du hast es bis hier geschafft. Komm rüber."'] },
    },
  ],
  interactables: [
    { x: 2, y: 3, id: 'sim-friday', label: '🎮 Simulator: Friday Hotfix', sandboxId: 'friday-hotfix', lines: [] },
    { x: 10, y: 3, id: 'sim-greenfield', label: '🟢 Simulator: Greenfield-Service', sandboxId: 'greenfield-spec', lines: [] },
    { x: 2, y: 10, id: 'sim-runaway', label: '🌙 Simulator: Agent über Nacht', sandboxId: 'runaway-agent', lines: [] },
    { x: 10, y: 10, id: 'sim-manager', label: '💼 Simulator: Team-Rollout (Lead-Sicht)', sandboxId: 'manager-rollout', lines: [] },
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

export type Point = { x: number; y: number };

/**
 * Breadth-first shortest path over walkable tiles (reuses `canEnterTile`, so
 * collision rules never diverge). Returns the list of steps from `start`
 * (exclusive) to `goal` (inclusive), [] if already there, or null if the goal
 * is unreachable / not walkable. Used for tap-to-move.
 */
export function findPath(
  room: RoomDef,
  start: Point,
  goal: Point,
): Point[] | null {
  if (!canEnterTile(room, goal.x, goal.y)) return null;
  if (start.x === goal.x && start.y === goal.y) return [];

  const key = (x: number, y: number) => y * ROOM_W + x;
  const visited = new Set<number>([key(start.x, start.y)]);
  const prev = new Map<number, Point>();
  const queue: Point[] = [start];
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  ];

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) {
      const path: Point[] = [];
      let c: Point | undefined = cur;
      while (c && !(c.x === start.x && c.y === start.y)) {
        path.push(c);
        c = prev.get(key(c.x, c.y));
      }
      return path.reverse();
    }
    for (const { dx, dy } of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const k = key(nx, ny);
      if (visited.has(k) || !canEnterTile(room, nx, ny)) continue;
      visited.add(k);
      prev.set(k, cur);
      queue.push({ x: nx, y: ny });
    }
  }
  return null;
}

/** Walkable tile adjacent to (x,y) nearest to `from` — for walking up to an NPC/station. */
export function adjacentWalkable(
  room: RoomDef,
  x: number, y: number,
  from: Point,
): Point | null {
  const candidates = [
    { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 },
  ].filter(p => canEnterTile(room, p.x, p.y));
  if (!candidates.length) return null;
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y),
  );
  return candidates[0];
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
