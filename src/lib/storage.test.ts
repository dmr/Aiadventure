import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  loadPrefs,
  savePrefs,
  clearPrefs,
  loadProgress,
  saveProgress,
  clearProgress,
  type Prefs,
} from './storage';

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns an empty object when nothing is stored', () => {
    expect(loadPrefs()).toEqual({});
  });

  it('round-trips prefs through localStorage', () => {
    const prefs: Prefs = {
      name: 'Sir Refactor',
      gender: 'd',
      avatar: { skin: 1, hairStyle: 0, hairColor: 2, shirt: 0, pants: 6, accessory: 0 },
    };
    savePrefs(prefs);
    expect(loadPrefs()).toEqual(prefs);
  });

  it('clearPrefs removes stored data', () => {
    savePrefs({ name: 'Doc Diff' });
    clearPrefs();
    expect(loadPrefs()).toEqual({});
  });

  it('returns {} on corrupted JSON instead of throwing', () => {
    localStorage.setItem('cafe-campfire-prefs-v1', '{not valid json');
    expect(loadPrefs()).toEqual({});
  });

  it('returns {} when stored value is not an object', () => {
    localStorage.setItem('cafe-campfire-prefs-v1', '"a string"');
    expect(loadPrefs()).toEqual({});
  });

  it('savePrefs swallows storage errors (e.g. quota / private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => savePrefs({ name: 'Bytebär' })).not.toThrow();
  });
});

describe('progress', () => {
  afterEach(() => localStorage.clear());

  it('defaults to empty arrays when nothing is stored', () => {
    expect(loadProgress()).toEqual({ completedLessons: [], misc: [] });
  });

  it('round-trips progress through localStorage', () => {
    const progress = { completedLessons: ['usecases', 'context'], misc: ['cat-friend'] };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it('clearProgress resets to defaults', () => {
    saveProgress({ completedLessons: ['usecases'], misc: [] });
    clearProgress();
    expect(loadProgress()).toEqual({ completedLessons: [], misc: [] });
  });

  it('coerces malformed/missing fields to empty arrays', () => {
    localStorage.setItem('cafe-campfire-progress-v1', JSON.stringify({ completedLessons: 'nope' }));
    expect(loadProgress()).toEqual({ completedLessons: [], misc: [] });
  });
});
