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

// ─────────────────────────────────────────────────────────────────────────────
// Szenario 2: Greenfield — Der neue Notification-Service
// Lernziel: Spec-first, der Mensch bleibt Architekt, schmale Slices.
// ─────────────────────────────────────────────────────────────────────────────
export const SCENARIO_GREENFIELD: Scenario = {
  id: 'greenfield-spec',
  title: 'Greenfield: Der neue Notification-Service',
  subtitle: 'Python · FastAPI · keine Specs · 0 LOC',
  briefBy: 'Sven',
  brief:
    'Montagmorgen. Der PM: "Wir brauchen einen Notification-Service — E-Mail, SMS, Push. ' +
    'Bau das mal mit Claude, du hast die Woche. Details klären wir unterwegs." ' +
    'Mehr steht nicht im Ticket. Leeres Repo, Claude Code ist bereit. Wie startest du?',
  estimatedMin: 7,
  beats: [
    { kind: 'system', text: '📋 Jira NOTIF-1 · Montag 09:14', variant: 'info' },
    {
      kind: 'narration',
      text:
        '> "Notification-Service: E-Mail, SMS, Push. Details klären wir unterwegs." — @pm. ' +
        'Ein Satz. Sonst nichts.',
    },
    {
      kind: 'narration',
      text: 'Greenfield, leeres Repo. Bei novel Design bist du der Architekt — nicht die KI. Erste Aktion?',
    },
    {
      kind: 'decision',
      prompt: 'Wie beginnst du?',
      options: [
        {
          label: 'Erst Spec: Claude Rückfragen stellen lassen, dann kurzes Design-Doc',
          hint: 'Annahmen explizit machen, bevor Code entsteht',
          feedback:
            '✓ Bei vagen Greenfield-Tasks der schnellste Weg. Die Fragen entlarven das, was im Ticket fehlt.',
          tags: ['spec_first'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: [
              '> Bevor ich baue — ein paar Fragen:',
              '>   1. Welche Provider (SES/SendGrid? Twilio? APNs/FCM)?',
              '>   2. Retry-Policy & Idempotenz bei Doppel-Sends?',
              '>   3. Rate Limits / Throttling pro Empfänger?',
              '>   4. Ist "Push" wirklich nötig — oder reicht E-Mail im MVP?',
            ],
            tokens: 1900,
          },
        },
        {
          label: '"Bau einen Notification-Service in FastAPI" — Auto-Accept, los',
          hint: 'Claude legt sofort los',
          feedback:
            '⚠️ Du delegierst die wichtigsten Entscheidungen an Zufall. Die KI errät Provider und Architektur, die niemand bestellt hat.',
          tags: ['yolo', 'no_spec'],
          score: -2,
          followUp: {
            kind: 'claude',
            lines: [
              '> Creating 14 files...',
              '> Chose Twilio + SendGrid + Firebase (assumed)',
              '> Added Celery + Redis for async (assumed)',
              '> Scaffolded an abstract ProviderStrategy hierarchy...',
            ],
            tokens: 9800,
          },
        },
        {
          label: 'Subagent: "Wie machen andere Services im Monorepo Outbound-Calls?"',
          hint: 'Erst die bestehenden Muster verstehen',
          feedback:
            '✓ Konsistenz schlägt Neuerfindung. Vielleicht gibt es schon Bausteine, die du nicht neu bauen musst.',
          tags: ['subagent', 'consistency'],
          score: 2,
          followUp: {
            kind: 'claude',
            lines: [
              '> Subagent: scanning monorepo for outbound patterns...',
              '> Found: shared lib outbound/ with retry + idempotency keys',
              '> Found: SES already wired in billing-service',
              '> Summary returned (420 tokens) — reuse, don\'t reinvent',
            ],
            tokens: 2200,
          },
        },
      ],
    },
    {
      kind: 'narration',
      text:
        'Es klärt sich: Es gibt bereits eine `outbound/`-Lib mit Retry + Idempotenz, ' +
        'SES ist schon angebunden — und "Push" meinte der PM eigentlich nur für iOS (APNs), irgendwann.',
    },
    {
      kind: 'decision',
      prompt: 'Architektur-Entscheidungen?',
      options: [
        {
          label: 'Plan Mode: Claude schlägt vor, DU entscheidest Provider & Grenzen',
          hint: 'Der Mensch bleibt Architekt',
          feedback: '✓ Genau richtig. Bei novel Design triffst du die folgenreichen Entscheidungen.',
          tags: ['planned', 'architect_human'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: [
              '> Plan: MVP = nur E-Mail über bestehende outbound/-Lib',
              '> SMS/Push als spätere Slices, klar abgegrenzt',
              '> Kein Kafka, kein Celery — YAGNI. Approve?',
            ],
            tokens: 1500,
          },
        },
        {
          label: 'Claude entscheidet die Architektur, du reviewst nur den Code',
          hint: 'Schein-Geschwindigkeit',
          feedback: '✗ Architektur ohne menschliche Entscheidung ist die teuerste Art, schnell zu wirken.',
          tags: ['ai_architect'],
          score: -3,
          followUp: {
            kind: 'system',
            text:
              '🏗️ Claude wählt Event-Sourcing mit Kafka — massiv over-engineered für 3 Notification-Typen. ' +
              'Niemand hat das bestellt; jetzt steht es im Repo.',
            variant: 'warn',
          },
        },
        {
          label: 'Default Mode, iterativ Feature für Feature — du führst',
          hint: 'Reibung gibt Sichtbarkeit',
          feedback: '✓ Vertretbar. Etwas langsamer, dafür behältst du die Kontrolle über jede Entscheidung.',
          tags: ['default_mode'],
          score: 2,
        },
      ],
    },
    {
      kind: 'claude',
      lines: [
        '> Implementing email slice via outbound/...',
        '> Writing tests for templating + retry...',
      ],
      tokens: 2600,
    },
    { kind: 'system', text: '✓ E-Mail-Slice: 18 Tests grün. SMS/APNs als nächste Slices geplant.', variant: 'ok' },
    {
      kind: 'decision',
      prompt: 'Vor dem ersten PR...',
      options: [
        {
          label: 'Schmaler vertikaler Slice (nur E-Mail) als PR — früh Feedback',
          hint: 'Klein liefern, früh lernen',
          feedback: '✓ Der PM sieht früh etwas Echtes und kann korrigieren, bevor Aufwand verbrennt.',
          tags: ['thin_slice'],
          score: 3,
        },
        {
          label: 'Erst alles fertig bauen (E-Mail+SMS+Push), dann ein großer PR',
          hint: 'Ein großer Wurf',
          feedback: '⚠️ Big-Bang-Risiko: viel Arbeit, bevor du weißt, ob die Annahmen stimmen.',
          tags: ['big_bang'],
          score: -2,
          followUp: {
            kind: 'system',
            text:
              '🗑️ PM sieht das fertige Ding: "SMS brauchen wir doch nicht, Push ist nächstes Quartal." ' +
              '~60 % der Woche weggeworfen.',
            variant: 'error',
          },
        },
        {
          label: 'PR mit E-Mail + dokumentierten offenen Fragen für SMS/Push',
          hint: 'Liefern und Unklarheiten sichtbar machen',
          feedback: '✓ Solide. Du lieferst Wert und machst die Lücken explizit.',
          tags: ['thin_slice', 'documented'],
          score: 2,
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['ai_architect', 'big_bang', 'no_spec'],
      icon: '🔴',
      title: 'Das Scope-Monster',
      lesson:
        'Ohne Spec und ohne menschliche Architektur-Entscheidung ist ein System entstanden, das niemand bestellt hat — ' +
        'over-engineered, halb am Bedarf vorbei. Lesson: Bei Greenfield ist Spezifizieren die eigentliche Arbeit. ' +
        'Die KI baut, was du entscheidest — nicht, was sie errät.',
    },
    {
      requiresAll: ['spec_first', 'planned'],
      minScore: 8,
      icon: '🏆',
      title: 'Sauber spezifiziert',
      lesson:
        'Rückfragen zuerst, du als Architekt, ein schmaler Slice mit Tests. Der PM korrigierte früh, ' +
        'nichts wurde verschwendet. Genau so wird KI bei novel Design ein Hebel statt ein Risiko.',
    },
    {
      minScore: 6,
      icon: '🟢',
      title: 'Solide geliefert',
      lesson: 'Funktionierender Slice, Kontrolle behalten. Beim nächsten Mal noch früher die Spec festklopfen.',
    },
    {
      minScore: 2,
      icon: '🟡',
      title: 'Durchgewurschtelt',
      lesson:
        'Am Ende lief etwas — aber mehr durch Nachsteuern als durch Plan. Spec-first hätte dir den Zickzack erspart.',
    },
    {
      icon: '🟠',
      title: 'Über-engineered',
      lesson:
        'Es steht Code da, aber zu viel davon und am Bedarf vorbei. Lies Stufe 3 (Promptcraft) und 4 (Plan Mode) nochmal.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Szenario 3: Der unbeaufsichtigte Agent (Autonomie & Kosten)
// Lernziel: Guardrails (Hooks/Scope) legitimieren Autonomie; Context-Hygiene.
// ─────────────────────────────────────────────────────────────────────────────
export const SCENARIO_RUNAWAY_AGENT: Scenario = {
  id: 'runaway-agent',
  title: 'Der unbeaufsichtigte Agent',
  subtitle: 'Node · Monorepo · 23 Uhr · bypass-permissions',
  briefBy: 'Iris',
  brief:
    'Freitagnacht, du willst fertig werden. Ein großes, mechanisches Refactor steht an (Legacy-Modul modernisieren, ~200 Files). ' +
    'Verlockend: Claude im "bypass permissions"-Mode laufen lassen und schlafen gehen. ' +
    'Autonomie ist mächtig — aber nur so weit, wie dein Sicherheitsnetz reicht. Was tust du?',
  estimatedMin: 6,
  beats: [
    { kind: 'system', text: '🌙 23:04 · bypass-permissions verfügbar', variant: 'info' },
    {
      kind: 'narration',
      text: 'Das Refactor ist mechanisch, aber groß. Über Nacht autonom laufen lassen? Wie setzt du den Lauf auf?',
    },
    {
      kind: 'decision',
      prompt: 'Setup für den autonomen Lauf?',
      options: [
        {
          label: 'Stop-Hook mit Lint + Test + Typecheck — DANN Auto-Accept',
          hint: 'Erst das Netz, dann der Sprung',
          feedback: '✓ Autonomie wird durch Guardrails legitim. Ein Stop-Hook fängt Fehler, bevor sie sich stapeln.',
          tags: ['guardrail', 'hook'],
          score: 3,
          followUp: {
            kind: 'claude',
            lines: ['> Stop-Hook: pnpm lint && pnpm test && tsc --noEmit', '> Blockiert Fortsetzung bei rotem Check'],
            tokens: 600,
          },
        },
        {
          label: 'bypass-permissions, kein Hook, gute Nacht',
          hint: 'Maximaler Speed, null Aufsicht',
          feedback: '✗ Autonomie ohne Netz ist kein Mut, sondern ein Lottoschein.',
          tags: ['yolo_unattended'],
          score: -3,
          followUp: {
            kind: 'system',
            text:
              '☠️ 02:00: Claude bekämpft einen Lint-Autofix mit einem eigenen Edit — Endlosschleife. ' +
              '47 Commits, 1,2 Mio Tokens, Tests waren nie grün.',
            variant: 'error',
          },
        },
        {
          label: 'Scope eng: nur src/legacy/, klare Done-Bedingung, dann beobachten',
          hint: 'Kleiner Radius, klares Ziel',
          feedback: '✓ Enger Scope + Abbruchkriterium macht autonomes Arbeiten überschaubar.',
          tags: ['scoped'],
          score: 2,
        },
      ],
    },
    {
      kind: 'narration',
      text: 'Der Lauf startet. Während Claude arbeitet — wie gehst du mit Kontext und Kosten um?',
    },
    {
      kind: 'decision',
      prompt: 'Während des Laufs...',
      options: [
        {
          label: 'Kosten-Budget im Blick, /clear zwischen unverwandten Batches',
          hint: 'Frischer Context = präzisere Edits',
          feedback: '✓ Context-Hygiene hält Qualität hoch und Kosten unten — Output ist 5× teurer als Input.',
          tags: ['cost_aware', 'context_hygiene'],
          score: 3,
        },
        {
          label: 'Ganzes Monorepo als Kontext mitgeben, "damit nichts übersehen wird"',
          hint: 'Mehr Kontext = besser, oder?',
          feedback: '⚠️ "Lost in the middle": riesiger Context senkt Genauigkeit und kostet ein Vermögen.',
          tags: ['whole_repo'],
          score: -2,
          followUp: {
            kind: 'system',
            text:
              '📉 Context bei 95 %. Claude vergisst die Regel aus File 1 und ändert eine API, die unangetastet bleiben sollte.',
            variant: 'warn',
          },
        },
        {
          label: 'Batchweise: 20 Files → review → commit → /clear → nächster Batch',
          hint: 'Kleine, prüfbare Häppchen',
          feedback: '✓ Saubere Batches mit Zwischen-Commits — leicht zu reviewen, leicht zurückzurollen.',
          tags: ['batched', 'context_hygiene'],
          score: 2,
        },
      ],
    },
    {
      kind: 'claude',
      lines: ['> Batch 1/10: 20 files...', '> Stop-Hook: lint ✓ test ✓ typecheck ✓', '> Commit a1b2c3d'],
      tokens: 3400,
    },
    {
      kind: 'decision',
      prompt: 'Am Morgen, vor dem Merge auf main...',
      options: [
        {
          label: 'Diff gezielt reviewen — Stichproben + alle API-Grenzen',
          hint: 'Du bleibst verantwortlich',
          feedback: '✓ Auch bei grünen Tests: du merge-st, also reviewst du. Besonders die Schnittstellen.',
          tags: ['reviewed'],
          score: 3,
        },
        {
          label: 'Tests grün = merge, Diff ungelesen',
          hint: 'Vertrauen ins Netz',
          feedback: '⚠️ Tests decken nur, was sie abdecken. Ungelesene 200-File-Diffs sind ein Vertrauensvorschuss ohne Deckung.',
          tags: ['trusted_blindly'],
          score: 0,
          followUp: {
            kind: 'system',
            text: '🩹 Coverage liegt bei 60 %. Ein ungetesteter Pfad in der Billing-Logik wurde stillschweigend mitverändert.',
            variant: 'warn',
          },
        },
        {
          label: 'Subagent: "Fasse die riskantesten Änderungen zusammen", dann gezielt prüfen',
          hint: 'Review fokussieren statt 200 Diffs starren',
          feedback: '✓ Clever. Der Subagent priorisiert, du prüfst, wo es zählt.',
          tags: ['reviewed', 'subagent'],
          score: 2,
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['yolo_unattended', 'whole_repo'],
      icon: '🔴',
      title: 'Die 1,2-Mio-Token-Nacht',
      lesson:
        'Autonomie ohne Guardrails: Endlosschleifen, explodierende Kosten, ein Diff dem niemand traut. ' +
        'Lesson: Plan Mode, Stop-Hooks, enger Scope und Context-Hygiene sind das, was Autonomie überhaupt erst legitimiert.',
    },
    {
      requiresAll: ['guardrail', 'reviewed'],
      minScore: 8,
      icon: '🏆',
      title: 'Autonomie mit Netz',
      lesson:
        'Stop-Hook als Sicherheitsnetz, saubere Batches, fokussiertes Review am Morgen. ' +
        'So wird "über Nacht laufen lassen" vom Glücksspiel zum legitimen Werkzeug.',
    },
    {
      minScore: 6,
      icon: '🟢',
      title: 'Kontrolliert geliefert',
      lesson: 'Der Lauf war eingehegt und das Ergebnis geprüft. Beim nächsten Mal das Sicherheitsnetz noch früher spannen.',
    },
    {
      minScore: 2,
      icon: '🟡',
      title: 'Gerade nochmal gut',
      lesson: 'Es ist nichts explodiert — aber näher an Glück als an Methode. Guardrails hätten dir die Nervosität erspart.',
    },
    {
      icon: '🟠',
      title: 'Blindflug mit Glück',
      lesson:
        'Production läuft, aber durch Tool-Vermeidung und Zufall. Lies Stufe 5 (Trust-Calibration) nochmal — die Werkzeuge sind da.',
    },
  ],
};

export const SCENARIOS: Record<string, Scenario> = {
  [SCENARIO_FRIDAY_HOTFIX.id]: SCENARIO_FRIDAY_HOTFIX,
  [SCENARIO_GREENFIELD.id]: SCENARIO_GREENFIELD,
  [SCENARIO_RUNAWAY_AGENT.id]: SCENARIO_RUNAWAY_AGENT,
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
