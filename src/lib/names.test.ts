import { describe, it, expect } from 'vitest';
import { randomName } from './names';

describe('randomName', () => {
  it('always returns a non-empty string', () => {
    for (let i = 0; i < 50; i++) {
      const n = randomName();
      expect(typeof n).toBe('string');
      expect(n.length).toBeGreaterThan(0);
    }
  });

  it('never returns the skipped name (no immediate repeats)', () => {
    // Run many times: with skip set, the result must differ from skip.
    for (let i = 0; i < 200; i++) {
      const first = randomName();
      const second = randomName(first);
      expect(second).not.toBe(first);
    }
  });
});
