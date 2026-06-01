import { describe, it, expect } from 'vitest';
import { STAGES, SIM_REWARD, journeyProgress, isStageDone, recommendedScenarios } from './journey';
import { LESSONS } from './lessons';
import { ROOMS } from './world';
import { SCENARIOS } from './scenarios';

describe('journey stages', () => {
  it('has 5 stages numbered 1..5', () => {
    expect(STAGES.map((s) => s.n)).toEqual([1, 2, 3, 4, 5]);
  });

  it('every stage references a real lesson and a real room', () => {
    for (const s of STAGES) {
      expect(LESSONS[s.lessonId], s.lessonId).toBeDefined();
      expect(ROOMS[s.room], s.room).toBeDefined();
    }
  });
});

describe('journeyProgress', () => {
  const allStages = STAGES.map((s) => s.lessonId);

  it('reports zero progress for a fresh player', () => {
    const p = journeyProgress(new Set(), new Set());
    expect(p.stagesDone).toBe(0);
    expect(p.simDone).toBe(false);
    expect(p.certificateEarned).toBe(false);
    expect(p.ratio).toBe(0);
  });

  it('counts completed stages and the simulator', () => {
    const p = journeyProgress(new Set([allStages[0], allStages[1]]), new Set());
    expect(p.stagesDone).toBe(2);
    expect(p.certificateEarned).toBe(false);
  });

  it('requires all 5 stages AND a simulator for the certificate', () => {
    expect(journeyProgress(new Set(allStages), new Set()).certificateEarned).toBe(false);
    expect(journeyProgress(new Set(allStages), new Set([SIM_REWARD])).certificateEarned).toBe(true);
    expect(journeyProgress(new Set(allStages), new Set([SIM_REWARD])).ratio).toBe(1);
  });

  it('ignores non-stage lessons when counting stages', () => {
    // station lessons (e.g. claude-md) are bonus, not stages
    const p = journeyProgress(new Set(['claude-md', 'plan-mode']), new Set());
    expect(p.stagesDone).toBe(0);
  });

  it('isStageDone reflects completion', () => {
    expect(isStageDone(STAGES[0], new Set([STAGES[0].lessonId]))).toBe(true);
    expect(isStageDone(STAGES[0], new Set())).toBe(false);
  });
});

describe('recommendedScenarios', () => {
  it('recommends role-fitting scenarios that all exist', () => {
    expect(recommendedScenarios('lead')).toContain('manager-rollout');
    expect(recommendedScenarios('dev').length).toBeGreaterThan(0);
    expect(recommendedScenarios('curious')).toEqual([]);
    expect(recommendedScenarios(undefined)).toEqual([]);
    for (const role of ['dev', 'lead'] as const) {
      for (const id of recommendedScenarios(role)) {
        expect(SCENARIOS[id], id).toBeDefined();
      }
    }
  });
});
