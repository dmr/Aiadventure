import { describe, it, expect } from 'vitest';
import {
  resolveEnding,
  SCENARIO_FRIDAY_HOTFIX,
  SCENARIOS,
  type Scenario,
  type ScenarioEnding,
} from './scenarios';

// Walk every decision in a scenario taking the option chosen by `pick`,
// accumulating score + tags, and resolve the resulting ending.
function playPath(scenario: Scenario, pick: 'best' | 'worst') {
  let score = 0;
  const tags = new Set<string>();
  for (const beat of scenario.beats) {
    if (beat.kind !== 'decision') continue;
    const sorted = [...beat.options].sort((a, b) =>
      pick === 'best' ? b.score - a.score : a.score - b.score,
    );
    const opt = sorted[0];
    score += opt.score;
    opt.tags?.forEach((t) => tags.add(t));
  }
  return resolveEnding(scenario.endings, score, tags);
}

describe('resolveEnding', () => {
  const endings: ScenarioEnding[] = [
    { requiresAny: ['blew_up'], icon: '🔴', title: 'Boom', lesson: '' },
    { requiresAll: ['a', 'b'], minScore: 9, icon: '🏆', title: 'Hero', lesson: '' },
    { minScore: 6, icon: '🟢', title: 'Solid', lesson: '' },
    { icon: '🟠', title: 'Fallback', lesson: '' },
  ];

  it('matches the first ending whose constraints all hold', () => {
    expect(resolveEnding(endings, 12, ['a', 'b']).title).toBe('Hero');
  });

  it('honours requiresAny (OR) tags', () => {
    expect(resolveEnding(endings, 12, ['blew_up', 'a', 'b']).title).toBe('Boom');
  });

  it('respects minScore thresholds', () => {
    // Has a+b but score below 9 → falls through to the score-6 ending.
    expect(resolveEnding(endings, 7, ['a', 'b']).title).toBe('Solid');
  });

  it('returns the last ending as a catch-all when nothing matches', () => {
    expect(resolveEnding(endings, 0, []).title).toBe('Fallback');
  });

  it('accepts a Set of tags as well as an array', () => {
    expect(resolveEnding(endings, 12, new Set(['a', 'b'])).title).toBe('Hero');
  });

  it('excludes endings carrying a forbidden tag', () => {
    const withExclude: ScenarioEnding[] = [
      { minScore: 5, excludes: ['cheated'], icon: '✅', title: 'Clean', lesson: '' },
      { icon: '🟠', title: 'Tainted', lesson: '' },
    ];
    expect(resolveEnding(withExclude, 8, ['cheated']).title).toBe('Tainted');
    expect(resolveEnding(withExclude, 8, []).title).toBe('Clean');
  });
});

describe('all scenarios (data-driven integrity)', () => {
  const entries = Object.entries(SCENARIOS);

  it('registers each scenario under its own id', () => {
    for (const [id, scenario] of entries) {
      expect(scenario.id).toBe(id);
    }
  });

  it.each(entries)('%s is structurally valid', (_id, scenario) => {
    const decisions = scenario.beats.filter((b) => b.kind === 'decision');
    expect(decisions.length).toBeGreaterThan(0);
    expect(scenario.endings.length).toBeGreaterThan(0);

    for (const beat of decisions) {
      expect(beat.options.length).toBeGreaterThanOrEqual(2);
      for (const opt of beat.options) {
        expect(opt.feedback.length).toBeGreaterThan(0);
        expect(Number.isFinite(opt.score)).toBe(true);
      }
    }

    // The last ending must be an unconstrained catch-all so a path always resolves.
    const last = scenario.endings[scenario.endings.length - 1];
    expect(last.requiresAll ?? last.requiresAny ?? last.minScore ?? last.maxScore).toBeUndefined();
  });

  it.each(entries)('%s: best path → 🏆, worst path → 🔴', (_id, scenario) => {
    expect(playPath(scenario, 'best').icon).toBe('🏆');
    expect(playPath(scenario, 'worst').icon).toBe('🔴');
  });
});

describe('Friday Hotfix scenario integrity', () => {
  it('is registered in the SCENARIOS map under its id', () => {
    expect(SCENARIOS[SCENARIO_FRIDAY_HOTFIX.id]).toBe(SCENARIO_FRIDAY_HOTFIX);
  });

  it('has at least one decision and a non-empty endings list', () => {
    const decisions = SCENARIO_FRIDAY_HOTFIX.beats.filter((b) => b.kind === 'decision');
    expect(decisions.length).toBeGreaterThan(0);
    expect(SCENARIO_FRIDAY_HOTFIX.endings.length).toBeGreaterThan(0);
  });

  it('every decision option has feedback and a numeric score', () => {
    for (const beat of SCENARIO_FRIDAY_HOTFIX.beats) {
      if (beat.kind !== 'decision') continue;
      expect(beat.options.length).toBeGreaterThan(0);
      for (const opt of beat.options) {
        expect(opt.feedback.length).toBeGreaterThan(0);
        expect(typeof opt.score).toBe('number');
      }
    }
  });

  it('the worst-case path resolves to the failure ending', () => {
    // Pick the lowest-scoring option at every decision.
    let score = 0;
    const tags = new Set<string>();
    for (const beat of SCENARIO_FRIDAY_HOTFIX.beats) {
      if (beat.kind !== 'decision') continue;
      const worst = [...beat.options].sort((a, b) => a.score - b.score)[0];
      score += worst.score;
      worst.tags?.forEach((t) => tags.add(t));
    }
    expect(resolveEnding(SCENARIO_FRIDAY_HOTFIX.endings, score, tags).icon).toBe('🔴');
  });

  it('the best-case path resolves to the hero ending', () => {
    let score = 0;
    const tags = new Set<string>();
    for (const beat of SCENARIO_FRIDAY_HOTFIX.beats) {
      if (beat.kind !== 'decision') continue;
      const best = [...beat.options].sort((a, b) => b.score - a.score)[0];
      score += best.score;
      best.tags?.forEach((t) => tags.add(t));
    }
    expect(resolveEnding(SCENARIO_FRIDAY_HOTFIX.endings, score, tags).icon).toBe('🏆');
  });
});
