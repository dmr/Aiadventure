// Single source of truth for the player's journey / gamification goal.
// The goal: complete all 5 stages (each = its mentor lesson) AND pass at least
// one Trainings-Simulator → earn the Vibe-Check certificate.

import type { RoomId } from './world';

export type Stage = {
  /** 1..5 */
  n: number;
  room: RoomId;
  /** the mentor lesson whose completion marks this stage done */
  lessonId: string;
  title: string;
  mentor: string;
  emoji: string;
};

export const STAGES: Stage[] = [
  { n: 1, room: 'eingang', lessonId: 'usecases', title: 'Use-Cases', mentor: 'Roya', emoji: '🧭' },
  { n: 2, room: 'cafebar', lessonId: 'context', title: 'Context Window', mentor: 'Pavel', emoji: '📚' },
  { n: 3, room: 'lounge', lessonId: 'promptcraft', title: 'Promptcraft', mentor: 'Lia', emoji: '✏️' },
  { n: 4, room: 'garten', lessonId: 'cc-intro', title: 'Claude Code', mentor: 'Sven', emoji: '🛠️' },
  { n: 5, room: 'cockpit', lessonId: 'agent-mode', title: 'Agent Mode', mentor: 'Iris', emoji: '🚀' },
];

/** misc-token awarded for surviving a Trainings-Simulator */
export const SIM_REWARD = 'sim-survived';

// ── Role & entry (start selection) ───────────────────────────────────────────
export type Role = 'dev' | 'lead' | 'curious';
export type Entry = 'tour' | 'sim';

export const ROLE_LABELS: Record<Role, string> = {
  dev: 'Entwickler:in',
  lead: 'Lead / EM',
  curious: 'Neugierig',
};

/** Which simulators are highlighted for a role (content filter/recommendation). */
export function recommendedScenarios(role?: Role): string[] {
  if (role === 'lead') return ['manager-rollout'];
  if (role === 'dev') return ['friday-hotfix', 'greenfield-spec'];
  return [];
}

export type JourneyProgress = {
  stagesDone: number;
  totalStages: number;
  simDone: boolean;
  /** lessonIds of completed stages */
  doneIds: string[];
  /** all goals met → certificate available */
  certificateEarned: boolean;
  /** 0..1 across stages + the simulator goal */
  ratio: number;
};

function toSet(v: Set<string> | Iterable<string>): Set<string> {
  return v instanceof Set ? v : new Set(v);
}

export function journeyProgress(
  completedLessons: Set<string> | Iterable<string>,
  misc: Set<string> | Iterable<string>,
): JourneyProgress {
  const lessons = toSet(completedLessons);
  const m = toSet(misc);
  const doneIds = STAGES.filter(s => lessons.has(s.lessonId)).map(s => s.lessonId);
  const stagesDone = doneIds.length;
  const simDone = m.has(SIM_REWARD);
  const totalGoals = STAGES.length + 1; // stages + one simulator
  return {
    stagesDone,
    totalStages: STAGES.length,
    simDone,
    doneIds,
    certificateEarned: stagesDone === STAGES.length && simDone,
    ratio: (stagesDone + (simDone ? 1 : 0)) / totalGoals,
  };
}

export function isStageDone(stage: Stage, completedLessons: Set<string> | Iterable<string>): boolean {
  return toSet(completedLessons).has(stage.lessonId);
}
