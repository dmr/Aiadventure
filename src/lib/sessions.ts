// Multi-session save system. Each session is an independent playthrough with
// its own avatar/identity, progress, and rich metadata for later analytics.
// Supersedes the old single prefs+progress model (migrated on first load).

import type { AvatarConfig } from './avatar';
import type { Gender } from './storage';
import type { Role, Entry, Track } from './journey';
import { loadPrefs, loadProgress } from './storage';

const SESSIONS_KEY = 'cafe-campfire-sessions-v1';

export type Session = {
  id: string;
  name: string;
  avatar: AvatarConfig;
  gender?: Gender;
  /** story track chosen up front */
  track?: Track;
  /** chosen role + entry from the start selection (personalisation/analytics) */
  role?: Role;
  entry?: Entry;

  // progress
  completedLessons: string[];
  misc: string[];
  room?: string;
  tile?: { x: number; y: number };
  facing?: string;

  // metadata (for analytics)
  createdAt: number;
  lastPlayedAt: number;
  /** accumulated active play time in ms */
  playtimeMs: number;
  /** how many times this session was opened/resumed */
  visits: number;
  /** how often the avatar was tweaked (in the editor) */
  avatarChanges: number;
};

type SessionsState = {
  sessions: Session[];
  activeId: string | null;
};

function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function empty(): SessionsState {
  return { sessions: [], activeId: null };
}

function read(): SessionsState {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sessions)) {
        return { sessions: parsed.sessions as Session[], activeId: parsed.activeId ?? null };
      }
    }
  } catch {
    /* ignore */
  }
  return empty();
}

function write(state: SessionsState): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(state));
  } catch {
    /* ignore — private mode / quota */
  }
}

/**
 * Load sessions, migrating a legacy single-save (old prefs+progress keys) into
 * a first session so existing players don't lose their game. Runs once.
 */
export function loadSessions(): SessionsState {
  const state = read();
  if (state.sessions.length > 0) return state;

  // One-time migration from the old single-save model.
  const prefs = loadPrefs();
  const progress = loadProgress();
  const hasLegacy =
    !!prefs.name || !!prefs.avatar || progress.completedLessons.length > 0 || !!progress.room;
  if (!hasLegacy) return state;

  const now = Date.now();
  const migrated: Session = {
    id: uid(),
    name: prefs.name ?? 'Gast',
    avatar: prefs.avatar ?? { skin: 1, hairStyle: 0, hairColor: 2, shirt: 0, pants: 6, accessory: 0 },
    gender: prefs.gender,
    completedLessons: progress.completedLessons,
    misc: progress.misc,
    room: progress.room,
    tile: progress.tile,
    facing: progress.facing,
    createdAt: now,
    lastPlayedAt: now,
    playtimeMs: 0,
    visits: 1,
    avatarChanges: 0,
  };
  const next: SessionsState = { sessions: [migrated], activeId: migrated.id };
  write(next);
  return next;
}

export function getSession(id: string | null): Session | null {
  if (!id) return null;
  return read().sessions.find((s) => s.id === id) ?? null;
}

export function activeSession(): Session | null {
  const state = read();
  return getSession(state.activeId);
}

export function setActive(id: string | null): void {
  const state = read();
  write({ ...state, activeId: id });
}

/** Create and persist a new session, make it active, return it. */
export function createSession(seed: {
  name: string;
  avatar: AvatarConfig;
  gender?: Gender;
  track?: Track;
  role?: Role;
  entry?: Entry;
  avatarChanges?: number;
}): Session {
  const now = Date.now();
  const session: Session = {
    id: uid(),
    name: seed.name,
    avatar: seed.avatar,
    gender: seed.gender,
    track: seed.track,
    role: seed.role,
    entry: seed.entry,
    completedLessons: [],
    misc: [],
    // "Direkt zum Simulator" drops the player straight into the Cockpit.
    room: seed.entry === 'sim' ? 'cockpit' : undefined,
    tile: seed.entry === 'sim' ? { x: 6, y: 8 } : undefined,
    createdAt: now,
    lastPlayedAt: now,
    playtimeMs: 0,
    visits: 1,
    avatarChanges: seed.avatarChanges ?? 0,
  };
  const state = read();
  write({ sessions: [...state.sessions, session], activeId: session.id });
  return session;
}

function mutate(id: string, fn: (s: Session) => Session): void {
  const state = read();
  let changed = false;
  const sessions = state.sessions.map((s) => {
    if (s.id !== id) return s;
    changed = true;
    return fn(s);
  });
  if (changed) write({ ...state, sessions });
}

/** Persist a session's progress + resume position. */
export function patchProgress(
  id: string,
  patch: Pick<Session, 'completedLessons' | 'misc' | 'room' | 'tile' | 'facing'>,
): void {
  mutate(id, (s) => ({ ...s, ...patch, lastPlayedAt: Date.now() }));
}

/** Record that the session was opened (bumps visits + lastPlayedAt). */
export function recordVisit(id: string): void {
  mutate(id, (s) => ({ ...s, visits: s.visits + 1, lastPlayedAt: Date.now() }));
}

/** Add elapsed active play time. */
export function addPlaytime(id: string, ms: number): void {
  if (ms <= 0) return;
  mutate(id, (s) => ({ ...s, playtimeMs: s.playtimeMs + ms, lastPlayedAt: Date.now() }));
}

/** Append a reward/completion token to misc (deduped). */
export function addReward(id: string, token: string): void {
  mutate(id, (s) =>
    s.misc.includes(token) ? s : { ...s, misc: [...s.misc, token], lastPlayedAt: Date.now() },
  );
}

export function deleteSession(id: string): void {
  const state = read();
  const sessions = state.sessions.filter((s) => s.id !== id);
  const activeId = state.activeId === id ? null : state.activeId;
  write({ sessions, activeId });
}
