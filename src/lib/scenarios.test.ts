import { describe, it, expect } from 'vitest';
import {
  resolveEnding,
  SCENARIO_FRIDAY_HOTFIX,
  SCENARIOS,
  type ScenarioEnding,
} from './scenarios';

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
