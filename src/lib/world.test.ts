import { describe, it, expect } from 'vitest';
import {
  ROOMS,
  ROOM_ORDER,
  ROOM_W,
  ROOM_H,
  canEnterTile,
  findExitAt,
  nearestInteraction,
  findPath,
  adjacentWalkable,
  type RoomId,
} from './world';
import { LESSONS } from './lessons';
import { SCENARIOS } from './scenarios';

describe('canEnterTile', () => {
  const eingang = ROOMS.eingang;

  it('blocks walls (border corner)', () => {
    expect(canEnterTile(eingang, 0, 0)).toBe(false);
  });

  it('allows open interior floor', () => {
    expect(canEnterTile(eingang, 6, 8)).toBe(true);
  });

  it('allows door tiles (exits are walkable)', () => {
    const exit = eingang.exits[0];
    expect(canEnterTile(eingang, exit.x, exit.y)).toBe(true);
  });

  it('blocks the tile an NPC stands on', () => {
    const npc = eingang.npcs[0];
    expect(canEnterTile(eingang, npc.x, npc.y)).toBe(false);
  });

  it('blocks furniture tiles', () => {
    const lib = ROOMS.cafebar;
    let found = false;
    lib.rows.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === 'F') {
          expect(canEnterTile(lib, x, y)).toBe(false);
          found = true;
        }
      }),
    );
    expect(found).toBe(true);
  });

  it('blocks decorations flagged block:true', () => {
    const blocker = ROOMS.garten.decorations.find((d) => d.block)!;
    expect(canEnterTile(ROOMS.garten, blocker.x, blocker.y)).toBe(false);
  });

  it('rejects out-of-bounds coordinates', () => {
    expect(canEnterTile(eingang, -1, 4)).toBe(false);
    expect(canEnterTile(eingang, ROOM_W, 4)).toBe(false);
    expect(canEnterTile(eingang, 4, ROOM_H)).toBe(false);
  });
});

describe('findExitAt', () => {
  it('finds the exit at its coordinates', () => {
    const exit = ROOMS.eingang.exits[0];
    expect(findExitAt(ROOMS.eingang, exit.x, exit.y)?.to).toBe(exit.to);
  });

  it('returns undefined where there is no exit', () => {
    expect(findExitAt(ROOMS.eingang, 6, 8)).toBeUndefined();
  });
});

describe('nearestInteraction', () => {
  it('returns the NPC at its own centre', () => {
    const npc = ROOMS.eingang.npcs[0];
    const hit = nearestInteraction(ROOMS.eingang, npc.x + 0.5, npc.y + 0.5);
    expect(hit?.kind).toBe('npc');
    expect(hit && hit.kind === 'npc' && hit.npc.id).toBe(npc.id);
  });

  it('returns a nearby interactable object', () => {
    const obj = ROOMS.garten.interactables[0];
    const hit = nearestInteraction(ROOMS.garten, obj.x + 0.5, obj.y + 0.5);
    expect(hit?.kind).toBe('obj');
  });

  it('returns null when nothing is in range', () => {
    expect(nearestInteraction(ROOMS.eingang, 0.9, 0.9)).toBeNull();
  });
});

describe('findPath (tap-to-move)', () => {
  const room = ROOMS.eingang;
  const start = { x: 6, y: 8 };

  it('returns a contiguous walkable path of adjacent tiles ending at the goal', () => {
    const goal = { x: 2, y: 2 };
    const path = findPath(room, start, goal);
    expect(path).not.toBeNull();
    const steps = path!;
    expect(steps[steps.length - 1]).toEqual(goal);
    let prev = start;
    for (const step of steps) {
      expect(canEnterTile(room, step.x, step.y)).toBe(true);
      expect(Math.abs(step.x - prev.x) + Math.abs(step.y - prev.y)).toBe(1);
      prev = step;
    }
  });

  it('returns an empty path when already at the goal', () => {
    expect(findPath(room, start, start)).toEqual([]);
  });

  it('returns null for an unwalkable goal (wall)', () => {
    expect(findPath(room, start, { x: 0, y: 0 })).toBeNull();
  });
});

describe('adjacentWalkable', () => {
  it('finds a walkable neighbour of an NPC tile', () => {
    const npc = ROOMS.eingang.npcs[0];
    const adj = adjacentWalkable(ROOMS.eingang, npc.x, npc.y, { x: npc.x, y: npc.y + 3 });
    expect(adj).not.toBeNull();
    expect(canEnterTile(ROOMS.eingang, adj!.x, adj!.y)).toBe(true);
    expect(Math.abs(adj!.x - npc.x) + Math.abs(adj!.y - npc.y)).toBe(1);
  });
});

describe('world integrity', () => {
  const allRooms = Object.values(ROOMS);

  it('ROOM_ORDER matches the defined rooms', () => {
    expect([...ROOM_ORDER].sort()).toEqual(
      (Object.keys(ROOMS) as RoomId[]).sort(),
    );
  });

  it('every room grid is ROOM_H × ROOM_W', () => {
    for (const room of allRooms) {
      expect(room.rows).toHaveLength(ROOM_H);
      for (const row of room.rows) {
        expect(row).toHaveLength(ROOM_W);
      }
    }
  });

  it('every exit targets a real room and spawns on a walkable tile', () => {
    for (const room of allRooms) {
      for (const exit of room.exits) {
        const target = ROOMS[exit.to];
        expect(target, `${room.id} → ${exit.to}`).toBeDefined();
        expect(
          canEnterTile(target, exit.spawn.x, exit.spawn.y),
          `spawn into ${exit.to} at ${exit.spawn.x},${exit.spawn.y}`,
        ).toBe(true);
      }
    }
  });

  it('every referenced lessonId resolves to a real lesson', () => {
    for (const room of allRooms) {
      for (const npc of room.npcs) {
        if (npc.lessonId) expect(LESSONS[npc.lessonId], npc.lessonId).toBeDefined();
      }
      for (const obj of room.interactables) {
        if (obj.lessonId) expect(LESSONS[obj.lessonId], obj.lessonId).toBeDefined();
      }
    }
  });

  it('every referenced sandboxId resolves to a real scenario', () => {
    for (const room of allRooms) {
      for (const obj of room.interactables) {
        if (obj.sandboxId) expect(SCENARIOS[obj.sandboxId], obj.sandboxId).toBeDefined();
      }
    }
  });

  it('every NPC and station is reachable from the room entrance (no traps)', () => {
    for (const room of allRooms) {
      // Start from the first exit door (always walkable).
      const start = { x: room.exits[0].x, y: room.exits[0].y };
      const targets = [...room.npcs, ...room.interactables];
      for (const t of targets) {
        const adj = adjacentWalkable(room, t.x, t.y, start);
        expect(adj, `${room.id}: no free tile next to ${('id' in t && t.id) || t.x + ',' + t.y}`).not.toBeNull();
        expect(
          findPath(room, start, adj!),
          `${room.id}: cannot reach ${('id' in t && t.id) || t.x + ',' + t.y}`,
        ).not.toBeNull();
      }
    }
  });
});
