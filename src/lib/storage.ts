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
