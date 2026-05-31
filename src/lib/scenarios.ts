// Scenario engine for the Trainings-Simulator.
// A scenario is a linear sequence of "beats" with embedded decisions.
// Decisions collect score and tags, which determine the ending.

export type ScenarioBeat =
  | NarrationBeat
  | ClaudeBeat
  | SystemBeat
  | DecisionBeat;

export type NarrationBeat = {
  kind: 'narration';
  text: string;
};

export type ClaudeBeat = {
  kind: 'claude';
  /** Lines printed one-by-one (terminal style) */
  lines: string[];
  /** Optional token-counter delta */
  tokens?: number;
};

export type SystemBeat = {
  kind: 'system';
  text: string;
  /** Optional: shows as red/error styled */
  variant?: 'info' | 'warn' | 'error' | 'ok';
};

export type DecisionBeat = {
  kind: 'decision';
  prompt: string;
  options: DecisionOption[];
};

export type DecisionOption = {
  label: string;
  /** Short hint shown under the label */
  hint?: string;
  /** Feedback printed right after picking */
  feedback: string;
  /** Optional follow-up beat injected after feedback */
  followUp?: ClaudeBeat | SystemBeat | NarrationBeat;
  /** Tags collected for ending logic */
  tags?: string[];
  /** Score delta */
  score: number;
};

export type ScenarioEnding = {
  /** All tags that must be present (AND logic) */
  requiresAll?: string[];
  /** Any of these tags triggers it (OR logic) */
  requiresAny?: string[];
  /** Tag that must NOT be present */
  excludes?: string[];
  /** Min score (inclusive) */
  minScore?: number;
  /** Max score (inclusive) */
  maxScore?: number;
  /** Priority — first matching ending wins; defaults to declaration order */
  icon: string;
  title: string;
  lesson: string;
};

export type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  /** Mentor / brief-giver name */
  briefBy: string;
  /** Pre-scenario brief (shown before starting) */
  brief: string;
  /** Estimated playtime */
  estimatedMin: number;
  beats: ScenarioBeat[];
  /** Endings evaluated in order — first match wins */
  endings: ScenarioEnding[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Szenario 1: Production Hotfix on Friday Afternoon
// ─────────────────────────────────────────────────────────────────────────────
export const SCENARIO_FRIDAY_HOTFIX: Scenario = {
  id: 'friday-hotfix',
  title: 'Production Hotfix on Friday Afternoon',
  subtitle: 'TypeScript · Node · Postgres · 30k LOC Backend',
  briefBy: 'Iris',
  brief:
    'Es ist Freitag, 16:30. Customer Support meldet einen kritischen Bug: Bestellungen über 1.000€ failen seit dem 9-Uhr-Deploy. ' +
    'Du hast Claude Code offen, dein Team ist halb im Wochenend-Modus. ' +
    'Jede Entscheidung zählt — wie schnell findest du den Bug? Wie sauber fixt du ihn?',
  estimatedMin: 8,
  beats: [
    {
      kind: 'system',
      text: '📱 Slack #incidents · 16:32',
      variant: 'info',
    },
    {
      kind: 'narration',
      text:
        '> @you — Issue #2847. Orders > €1000 failing since 9am deploy. ' +
        'No clear stack trace in Sentry yet. Money-time. — @support-lead',
    },
    {
      kind: 'narration',
      text: 'Du sitzt vor deinem Terminal. Claude Code läuft. Wie öffnest du den Task?',
    },
    {
      kind: 'decision',
      prompt: 'Erste Aktion?',
      options: [
        {
          label: 'Plan Mode aktivieren (Shift+Tab) — read-only erkunden',
          hint: 'Claude liest src/orders/, scannt letzte Commits, plant ohne zu editieren',
          feedback:
            '✓ Smart. 5 Minuten Investition in Verständnis ist Gold bei Production-Bugs. Du verlierst nichts wenn die Diagnose schon im Plan steht.',
          tags: ['plan_mode'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: [
              '> Reading src/orders/...',
              '> Checking git log --since="9am today"...',
              '> Found 3 commits in src/orders/* today',
              '> Plan ready — review before execute',
            ],
            tokens: 4200,
          },
        },
        {
          label: 'Direkt: "@orders.ts fix this" mit Auto-Accept Edits',
          hint: 'Claude liest, editiert ohne Rückfrage',
          feedback:
            '⚠️ Schnell, aber blind. Bei Production-Bugs ist "fix this" ohne Kontext eine Wette. Du sparst 2 Minuten und riskierst 2 Stunden Cleanup.',
          tags: ['yolo'],
          score: -2,
          followUp: {
            kind: 'claude',
            lines: [
              '> Reading src/orders/orders.ts (1340 lines)...',
              '> Reading src/orders/checkout.ts (820 lines)...',
              '> Hmm. "fix this" is vague — let me guess at the issue.',
              '> Proposing change to validateOrderTotal()...',
            ],
            tokens: 11500,
          },
        },
        {
          label: 'Subagent: "Recherchiere die letzten Commits in src/orders/"',
          hint: 'Separater Context, kurze Zusammenfassung zurück',
          feedback:
            '✓ Klassische Erkundungs-Task. Subagent liest 30 Files, du kriegst 5 Zeilen zurück. Hauptcontext bleibt klar.',
          tags: ['subagent', 'investigate'],
          score: 2,
          followUp: {
            kind: 'claude',
            lines: [
              '> Subagent: investigating src/orders/ recent changes...',
              '> Subagent done (3.2k tokens consumed in its context, 380 returned)',
              '> Summary: 3 commits today. Suspicious: migration 20260531_alter_total.sql',
              '>   — changed orders.total from BIGINT to INTEGER',
            ],
            tokens: 2400,
          },
        },
      ],
    },
    {
      kind: 'narration',
      text:
        'Claude hat einen Verdacht: heute morgen wurde eine Migration ausgeführt, ' +
        'die orders.total von BIGINT zu INTEGER geändert hat. INTEGER cutoff ist 2^31 ≈ 21M cents = €215.000.',
    },
    {
      kind: 'narration',
      text:
        '🤔 Moment. Orders > €1.000 failen — nicht > €215.000. Die Symptome passen nicht zur Diagnose. ' +
        'Was machst du als nächstes?',
    },
    {
      kind: 'decision',
      prompt: 'Vor dem Fix...',
      options: [
        {
          label: 'Repro-Test zuerst: "Schreib mir einen Vitest-Repro mit konkretem Input"',
          hint: 'Sicherheitsnetz bauen vor Surgery',
          feedback:
            '✓ Pro-Move. Tests vor Fix. Du bekommst Daten statt Vermutungen.',
          tags: ['tests_first'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: [
              '> Writing test: it("should process orders > €1000")',
              '> Running... ❌ Test fails',
              '> Error: TypeError in parseOrderTotal — expected number, got bigint',
              '> Real bug: ORM cast in parseOrderTotal still expects INTEGER',
              '> Migration changed schema, code path was not updated',
            ],
            tokens: 3100,
          },
        },
        {
          label: 'Rollback den Deploy, Bug-Hunt später',
          hint: 'Schnellste Rückkehr zur Sicherheit',
          feedback:
            '⚠️ Pragmatisch — aber DB-Migrations sind selten rollback-sicher. Daten sind seit 7h drin.',
          tags: ['rollback'],
          score: 0,
          followUp: {
            kind: 'system',
            text:
              '🚨 5min später: Rollback der Migration killt einen anderen Service, der seit 9am auf das neue Schema schreibt. ' +
              'Du hast jetzt 2 Probleme statt 1.',
            variant: 'error',
          },
        },
        {
          label: 'Direkt fix anwenden — Migration zurückrollen via ALTER COLUMN',
          hint: 'Die Diagnose wirkt klar',
          feedback:
            '✗ Klar wirkt was klar wirkt — bis es nicht klar war. Du hast übersehen dass die Symptome nicht zur Diagnose passen.',
          tags: ['rushed'],
          score: -2,
          followUp: {
            kind: 'system',
            text:
              '⚠️ ALTER COLUMN läuft. Schema zurück auf BIGINT. Aber: Bug bleibt. Die Order-Fails kommen weiterhin rein. Du hast die Diagnose nicht verifiziert.',
            variant: 'warn',
          },
        },
      ],
    },
    {
      kind: 'narration',
      text:
        'Der echte Übeltäter ist parseOrderTotal() in src/orders/parse.ts — ' +
        'der ORM-Cast erwartet noch INTEGER, die Migration hat den Schema aber auf BIGINT geändert (umgekehrte Richtung der ursprünglichen Vermutung).',
    },
    {
      kind: 'decision',
      prompt: 'Wie wendest du den Fix an?',
      options: [
        {
          label: 'Plan Mode: Plan schreiben lassen, reviewen, dann Execute',
          hint: '30 Sekunden Plan-Review = Stunden gespart',
          feedback:
            '✓ Bei Production: immer. Plan zeigt 2 Edits, du siehst beide vor Execute.',
          tags: ['planned_fix'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: [
              '> Plan: 2 Edits',
              '>   1. parse.ts:42 — change ORM cast to bigint',
              '>   2. parse.test.ts — add regression test for €1000+ orders',
              '> Reviewing... approve to execute',
            ],
            tokens: 1800,
          },
        },
        {
          label: 'Default Mode — Claude fragt vor jedem Edit',
          hint: 'Du reviewst jeden Diff vor Apply',
          feedback:
            '✓ Vertretbar. Die Reibung kostet 1-2min, gibt dir aber Sichtbarkeit.',
          tags: ['default_mode'],
          score: 2,
        },
        {
          label: 'Auto-Accept Edits — Tests fangen Probleme',
          hint: 'Schnellster Weg durch',
          feedback:
            '⚠️ Bei Production grenzwertig. Wenn dein Stop-Hook die volle Test-Suite ausführt, OK. Sonst riskant.',
          tags: ['auto_accept'],
          score: 0,
        },
      ],
    },
    {
      kind: 'claude',
      lines: [
        '> Applying edits...',
        '> ✓ src/orders/parse.ts updated',
        '> ✓ src/orders/parse.test.ts added',
        '> Running test suite via Stop-Hook...',
      ],
      tokens: 800,
    },
    {
      kind: 'system',
      text: '✓ All 247 tests pass. Lint clean. Typecheck clean.',
      variant: 'ok',
    },
    {
      kind: 'decision',
      prompt: 'Vor dem Merge auf main...',
      options: [
        {
          label: 'Tests grün → direkt Merge & Deploy. Customer Support wartet.',
          hint: 'Vertrauen ins eigene Sicherheitsnetz',
          feedback:
            '✓ Wenn dein Sicherheitsnetz stark ist: vertraue ihm. Sonst hast du es umsonst gebaut.',
          tags: ['trusted_tests'],
          score: 3,
        },
        {
          label: 'Erst Staging-Deploy, manuell verifizieren, dann Production',
          hint: 'Extra Schicht Sicherheit',
          feedback:
            '✓ Bei Production-Hotfix nie verkehrt. Kostet 10min, kann Karriere-Save sein.',
          tags: ['staging_check'],
          score: 2,
        },
        {
          label: 'Direkt Production-Deploy, keine Tests checken',
          hint: 'Maximaler Speed',
          feedback:
            '✗ Genau die Mentalität die Bugs überhaupt erzeugt. Stop-Hook hat dir die grünen Tests serviert — schau hin.',
          tags: ['skipped_check'],
          score: -3,
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['skipped_check', 'rushed', 'yolo'],
      icon: '🔴',
      title: 'Sonntag-Morgen-Anruf',
      lesson:
        'Dein Fix war voreilig. Am Sonntag wird ein zweiter Bug exposed der mit deinen Edits zusammenhängt. ' +
        'Das Postmortem ist hart: "Warum wurde der Bug ohne Repro-Test gefixt? Warum keine Plan-Review?" ' +
        'Lesson: Geschwindigkeit ohne Sicherheitsnetz ist nicht schneller — nur lauter.',
    },
    {
      requiresAll: ['tests_first', 'planned_fix'],
      minScore: 9,
      icon: '🏆',
      title: 'Held des Wochenendes',
      lesson:
        'Sauberer Hotfix in 35 Minuten. Repro-Test dokumentiert das Verhalten, Plan-Review verhinderte Scope-Creep, ' +
        'Stop-Hook hat die Suite gefahren. Das Postmortem schreibt sich fast von selbst. ' +
        'Ein Kollege fragt am Montag wie du das so schnell gemacht hast. Du verweist auf diese Stationen.',
    },
    {
      minScore: 6,
      icon: '🟢',
      title: 'Solider Hotfix',
      lesson:
        'Bug gefixt, Tests grün, Production läuft. Eine Entscheidung hättest du anders treffen können — ' +
        'aber das Sicherheitsnetz hat gehalten. Notiz fürs nächste Mal: noch früher Plan Mode.',
    },
    {
      minScore: 2,
      icon: '🟡',
      title: 'Wackelig durchgekommen',
      lesson:
        'Bug irgendwie gefixt. Niemand weiß genau warum es jetzt funktioniert — der Repro-Test fehlt, ' +
        'der Plan war im Kopf statt im Tool. Im Postmortem stehst du blass da. ' +
        'Die gute Nachricht: nichts ist explodiert. Die schlechte: nächste Woche kann das nochmal so kommen.',
    },
    {
      icon: '🟠',
      title: 'Glück gehabt',
      lesson:
        'Die Production läuft wieder — aber durch eine Mischung aus Tool-Vermeidung und Glück. ' +
        'Wenn das jemand auditiert, gibt es harte Fragen. Lies die Stufen 4 und 5 nochmal — die Werkzeuge sind da.',
    },
  ],
};

export const SCENARIOS: Record<string, Scenario> = {
  [SCENARIO_FRIDAY_HOTFIX.id]: SCENARIO_FRIDAY_HOTFIX,
};

/**
 * Pick the first ending whose constraints all match the given score and tags.
 * Endings are evaluated in declaration order; if none match, the last ending
 * acts as the catch-all fallback. Pure function — safe to unit-test.
 */
export function resolveEnding(
  endings: ScenarioEnding[],
  score: number,
  tags: Iterable<string>,
): ScenarioEnding {
  const tagSet = tags instanceof Set ? tags : new Set(tags);
  for (const e of endings) {
    if (e.requiresAll && !e.requiresAll.every((t) => tagSet.has(t))) continue;
    if (e.requiresAny && !e.requiresAny.some((t) => tagSet.has(t))) continue;
    if (e.excludes && e.excludes.some((t) => tagSet.has(t))) continue;
    if (e.minScore !== undefined && score < e.minScore) continue;
    if (e.maxScore !== undefined && score > e.maxScore) continue;
    return e;
  }
  return endings[endings.length - 1];
}
