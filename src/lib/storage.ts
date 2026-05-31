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
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completedLessons: [], misc: [] };
    const parsed = JSON.parse(raw);
    return {
      completedLessons: Array.isArray(parsed?.completedLessons) ? parsed.completedLessons : [],
      misc: Array.isArray(parsed?.misc) ? parsed.misc : [],
    };
  } catch {
    return { completedLessons: [], misc: [] };
  }
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
