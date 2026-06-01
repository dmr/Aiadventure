// Tiny wrapper around localStorage. Fails gracefully if storage is unavailable
// (private browsing, sandbox restrictions, quota exceeded etc.).

import type { AvatarConfig } from './avatar';

const KEY = 'cafe-campfire-prefs-v1';

export type Gender = 'w' | 'm' | 'd';

export type Prefs = {
  avatar?: AvatarConfig;
  name?: string;
  gender?: Gender;
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Prefs;
    return {};
  } catch {
    return {};
  }
}

export function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Ignore — sandbox / private mode / quota issues
  }
}

export function clearPrefs(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Game progress (completed lessons + collected rewards/easter-eggs)
// ─────────────────────────────────────────────────────────────────────────────

const PROGRESS_KEY = 'cafe-campfire-progress-v1';

export type Progress = {
  /** lesson ids the player has finished */
  completedLessons: string[];
  /** misc rewards / easter-egg tokens (e.g. "cat-friend", "sim-survived") */
  misc: string[];
  /** last room id, so returning players resume where they were */
  room?: string;
  /** last tile position in that room */
  tile?: { x: number; y: number };
  /** last facing direction */
  facing?: string;
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completedLessons: [], misc: [] };
    const parsed = JSON.parse(raw);
    return {
      completedLessons: Array.isArray(parsed?.completedLessons) ? parsed.completedLessons : [],
      misc: Array.isArray(parsed?.misc) ? parsed.misc : [],
      room: typeof parsed?.room === 'string' ? parsed.room : undefined,
      tile:
        parsed?.tile && typeof parsed.tile.x === 'number' && typeof parsed.tile.y === 'number'
          ? { x: parsed.tile.x, y: parsed.tile.y }
          : undefined,
      facing: typeof parsed?.facing === 'string' ? parsed.facing : undefined,
    };
  } catch {
    return { completedLessons: [], misc: [] };
  }
}

/** True if the player has any saved state (used to greet returning players). */
export function hasSavedProgress(): boolean {
  const p = loadProgress();
  return p.completedLessons.length > 0 || p.misc.length > 0 || !!p.room;
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // Ignore — sandbox / private mode / quota issues
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding (show the tutorial once for first-time players)
// ─────────────────────────────────────────────────────────────────────────────

const TUTORIAL_KEY = 'cafe-campfire-tutorial-seen-v1';

export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch {
    // Ignore
  }
}

// One-time hint that the avatar can be customised any time from the top button.
const AVATAR_HINT_KEY = 'cafe-campfire-avatar-hint-v1';

export function hasSeenAvatarHint(): boolean {
  try {
    return localStorage.getItem(AVATAR_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function markAvatarHintSeen(): void {
  try {
    localStorage.setItem(AVATAR_HINT_KEY, '1');
  } catch {
    // Ignore
  }
}
