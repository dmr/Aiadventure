import { describe, it, expect, afterEach } from 'vitest';
import {
  loadSessions,
  createSession,
  getSession,
  activeSession,
  patchProgress,
  recordVisit,
  addPlaytime,
  deleteSession,
} from './sessions';
import { DEFAULT_AVATAR } from './avatar';

afterEach(() => localStorage.clear());

describe('sessions', () => {
  it('starts empty', () => {
    expect(loadSessions()).toEqual({ sessions: [], activeId: null });
  });

  it('creates a session with metadata and makes it active', () => {
    const s = createSession({ name: 'Sir Refactor', avatar: DEFAULT_AVATAR, avatarChanges: 3 });
    expect(s.id).toBeTruthy();
    expect(s.createdAt).toBeGreaterThan(0);
    expect(s.visits).toBe(1);
    expect(s.avatarChanges).toBe(3);
    expect(activeSession()?.id).toBe(s.id);
  });

  it('keeps multiple sessions side by side', () => {
    const a = createSession({ name: 'A', avatar: DEFAULT_AVATAR });
    const b = createSession({ name: 'B', avatar: DEFAULT_AVATAR });
    expect(loadSessions().sessions.map((s) => s.id).sort()).toEqual([a.id, b.id].sort());
    expect(activeSession()?.id).toBe(b.id);
  });

  it('persists progress per session', () => {
    const s = createSession({ name: 'A', avatar: DEFAULT_AVATAR });
    patchProgress(s.id, { completedLessons: ['usecases'], misc: ['sim-survived'], room: 'lounge', tile: { x: 2, y: 3 }, facing: 'left' });
    const loaded = getSession(s.id)!;
    expect(loaded.completedLessons).toEqual(['usecases']);
    expect(loaded.room).toBe('lounge');
    expect(loaded.tile).toEqual({ x: 2, y: 3 });
  });

  it('tracks visits and playtime', () => {
    const s = createSession({ name: 'A', avatar: DEFAULT_AVATAR });
    recordVisit(s.id);
    addPlaytime(s.id, 5000);
    addPlaytime(s.id, 3000);
    const loaded = getSession(s.id)!;
    expect(loaded.visits).toBe(2);
    expect(loaded.playtimeMs).toBe(8000);
  });

  it('deletes a session', () => {
    const s = createSession({ name: 'A', avatar: DEFAULT_AVATAR });
    deleteSession(s.id);
    expect(getSession(s.id)).toBeNull();
  });

  it('migrates a legacy single-save into a session', () => {
    localStorage.setItem('cafe-campfire-prefs-v1', JSON.stringify({ name: 'Legacy', avatar: DEFAULT_AVATAR }));
    localStorage.setItem('cafe-campfire-progress-v1', JSON.stringify({ completedLessons: ['usecases'], misc: [], room: 'cafebar' }));
    const { sessions, activeId } = loadSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe('Legacy');
    expect(sessions[0].completedLessons).toEqual(['usecases']);
    expect(activeId).toBe(sessions[0].id);
  });
});
