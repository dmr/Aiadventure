import { describe, it, expect } from 'vitest';
import { PROCUREMENT_TASKS } from './procurement';
import { SCENARIOS, resolveEnding } from './scenarios';

describe('procurement tasks', () => {
  it('exposes 3 clear tasks, each registered in SCENARIOS', () => {
    expect(PROCUREMENT_TASKS.length).toBe(3);
    for (const t of PROCUREMENT_TASKS) {
      expect(t.task.length).toBeGreaterThan(0);
      expect(SCENARIOS[t.id], t.id).toBe(t.scenario);
    }
  });

  it('each task has a privacy-failure (🔴) and a clean (🏆) outcome reachable', () => {
    for (const t of PROCUREMENT_TASKS) {
      const icons = t.scenario.endings.map((e) => e.icon);
      expect(icons).toContain('🔴');
      expect(icons).toContain('🏆');
      // last ending is an unconstrained catch-all
      const last = t.scenario.endings[t.scenario.endings.length - 1];
      expect(last.requiresAll ?? last.requiresAny ?? last.minScore ?? last.maxScore).toBeUndefined();
      // a no-op resolve still returns something
      expect(resolveEnding(t.scenario.endings, 0, [])).toBeTruthy();
    }
  });
});
