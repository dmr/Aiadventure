import { describe, it, expect } from 'vitest';
import {
  ROOMS,
  ROOM_ORDER,
  ROOM_W,
  ROOM_H,
  canEnterTile,
  findExitAt,
  nearestInteraction,
  type RoomId,
} from './world';
import { LESSONS } from './lessons';
import { SCENARIOS } from './scenarios';

describe('canEnterTile', () => {
  const eingang = ROOMS.eingang;

  it('blocks walls', () => {
    expect(canEnterTile(eingang, 0, 0)).toBe(false);
  });

  it('allows open floor', () => {
    expect(canEnterTile(eingang, 5, 4)).toBe(true);
  });

  it('allows door tiles (exits)', () => {
    expect(canEnterTile(eingang, 12, 4)).toBe(true);
  });

  it('blocks the tile an NPC stands on', () => {
    // Roya stands at (6,4) in the Lobby.
    expect(canEnterTile(eingang, 6, 4)).toBe(false);
  });

  it('blocks furniture tiles', () => {
    // Bibliothek (cafebar) top row is all furniture.
    expect(canEnterTile(ROOMS.cafebar, 5, 1)).toBe(false);
  });

  it('blocks decorations flagged block:true (Werkstatt stations)', () => {
    expect(canEnterTile(ROOMS.garten, 2, 2)).toBe(false);
  });

  it('rejects out-of-bounds coordinates', () => {
    expect(canEnterTile(eingang, -1, 4)).toBe(false);
    expect(canEnterTile(eingang, ROOM_W, 4)).toBe(false);
    expect(canEnterTile(eingang, 4, ROOM_H)).toBe(false);
  });
});

describe('findExitAt', () => {
  it('finds the exit at its coordinates', () => {
    const exit = findExitAt(ROOMS.eingang, 12, 4);
    expect(exit?.to).toBe('cafebar');
  });

  it('returns undefined where there is no exit', () => {
    expect(findExitAt(ROOMS.eingang, 5, 5)).toBeUndefined();
  });
});

describe('nearestInteraction', () => {
  it('returns the nearby NPC', () => {
    // Player centred one tile below Roya (6,4 -> centre 6.5,4.5).
    const hit = nearestInteraction(ROOMS.eingang, 6.5, 5.5);
    expect(hit?.kind).toBe('npc');
    expect(hit && hit.kind === 'npc' && hit.npc.id).toBe('roya');
  });

  it('returns a nearby interactable object', () => {
    // Werkstatt CLAUDE.md station sits at (2,2).
    const hit = nearestInteraction(ROOMS.garten, 2.5, 3.5);
    expect(hit?.kind).toBe('obj');
  });

  it('returns null when nothing is in range', () => {
    expect(nearestInteraction(ROOMS.eingang, 1.5, 1.5)).toBeNull();
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
});
