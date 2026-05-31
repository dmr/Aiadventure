import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadPrefs, savePrefs, clearPrefs, type Prefs } from './storage';

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
