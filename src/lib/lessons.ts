// Lesson scripts for the curriculum.
import type { AvatarConfig } from './avatar';

export type LessonStep =
  | TextStep | CodeStep | QuoteStep | QuizStep | RevealStep | SourcesStep;

export type TextStep = { kind: 'text'; lines: string[] };
export type CodeStep = { kind: 'code'; caption?: string; code: string; note?: string };
export type QuoteStep = {
  kind: 'quote';
  text: string;
  author: string;
  role?: string;
  source: string;
  url: string;
  date?: string;
};
export type QuizOption = { id: string; label: string; good: boolean; why: string };
export type QuizStep = { kind: 'quiz'; prompt: string; type: 'single' | 'multi'; options: QuizOption[] };
export type RevealStep = { kind: 'reveal'; intro: string; outro?: string };
export type SourceRef = { title: string; author?: string; url: string; date?: string; note?: string };
export type SourcesStep = { kind: 'sources'; intro?: string; refs: SourceRef[] };

export type Lesson = {
  id: string;
  number: number | string;
  title: string;
  subtitle: string;
  mentor: string;
  mentorAvatar?: AvatarConfig;
  badge: string;
  steps: LessonStep[];
};

export const ROYA_AVATAR: AvatarConfig = { skin: 2, hairStyle: 0, hairColor: 1, shirt: 2, pants: 9, accessory: 1 };
export const PAVEL_AVATAR: AvatarConfig = { skin: 1, hairStyle: 1, hairColor: 6, shirt: 7, pants: 6, accessory: 1 };
export const LIA_AVATAR: AvatarConfig = { skin: 2, hairStyle: 1, hairColor: 1, shirt: 7, pants: 6, accessory: 1 };
export const SVEN_AVATAR: AvatarConfig = { skin: 3, hairStyle: 5, hairColor: 3, shirt: 1, pants: 5, accessory: 2 };
export const IRIS_AVATAR: AvatarConfig = { skin: 1, hairStyle: 4, hairColor: 0, shirt: 6, pants: 9, accessory: 1 };

// ─── Kapitel 1 — Use-Cases ─────────────────────────────────────────────────────
export const LESSON_USECASES: Lesson = {
  id: 'usecases', number: 1,
  title: 'Wo KI dir wirklich Zeit spart',
  subtitle: 'Kapitel 1 · Realistische Use-Cases',
  mentor: 'Roya', mentorAvatar: ROYA_AVATAR, badge: '✓ Use-Cases',
  steps: [
    { kind: 'text', lines: [
      'Roya: "Hi. 12 Jahre Senior Eng, hab AI lange ignoriert. Hype-Müdigkeit, du kennst das."',
      'Roya: "Bis ich eine Express-4-zu-5-Migration auf einem 30k-LOC-Backend machen sollte. Geschätzt: zwei Tage. Mit Claude Code: 90 Minuten plus eine Stunde Review."',
      'Roya: "Das war kein Trick. Das war ein konkreter Task-Typ wo KI extrem stark ist. Ein anderer Task am selben Tag — eine neue Auth-Architektur designen — war eher unbrauchbar. Beides am selben Tag."',
      'Roya: "Der Unterschied zwischen Frust und Zeitgewinn ist: zu wissen wofür sie taugt. Probier das mal aus."',
    ]},
    { kind: 'quiz', prompt: 'Welche dieser Tasks würdest du heute mit Claude an deiner Seite angehen?', type: 'multi', options: [
      { id: 'migration', label: 'Express 4 → 5 Migration auf 30k LOC', good: true, why: 'Mechanische Refactors über viele Files sind eine Paradedisziplin.' },
      { id: 'tests', label: 'Tests für eine ungetestete utils.ts schreiben', good: true, why: 'Bestehender Code als Spec, klare Output-Form.' },
      { id: 'auth-greenfield', label: 'Neue Auth-Architektur für FinTech ohne Specs designen', good: false, why: 'Novel design, hohe Sicherheitsfolgen — du bist der Architekt.' },
      { id: 'stacktrace', label: 'Flaky CI-Pipeline — Stack-Trace + Logs deuten', good: true, why: 'Pattern-matching aus Trillionen ähnlicher Fehler.' },
      { id: 'hotfix-prod', label: 'Production-Hotfix direkt deployen, ohne Review', good: false, why: 'Niemals. Tests + Review machen Geschwindigkeit erst legitim.' },
      { id: 'boilerplate', label: 'Boilerplate für 12 neue REST-Endpoints', good: true, why: 'Repetitive Strukturarbeit nach Muster.' },
      { id: 'unfamiliar', label: 'Unbekannte Codebase erkunden — "wo wird X gehandhabt?"', good: true, why: 'Subagents lesen 50 Files, du bekommst Zusammenfassung.' },
    ]},
    { kind: 'reveal', intro: 'Konsens-Sicht erfahrener Devs:', outro: 'Mechanisch + bestehende Spec = grünes Licht. Novel + sicherheitskritisch = du bleibst am Steuer.' },
    { kind: 'quote',
      text: 'Als ich nach sieben Stunden aufwachte, hatte ich erwartet ein halbfertiges Chaos zu finden. Stattdessen war der Refactor durch. Nicht nur funktional, sondern produktionsreif. Tests grün. Doku aktualisiert.',
      author: 'Reza Rezvani', role: 'CTO & AI builder, Berlin',
      source: 'I Gave Claude Code 2.0 Our 3-Week Refactor at 11 PM. At 7 AM, It Was Done.',
      url: 'https://alirezarezvani.medium.com/i-gave-claude-code-2-0-our-3-week-refactor-at-11-pm-at-7-am-it-was-done-34decd54e441',
      date: 'Oktober 2025',
    },
    { kind: 'quote',
      text: 'AI-Review hebt den Boden, nicht die Decke. Sie fängt das, was durchrutscht — aber ersetzt nicht architektonisches Urteil.',
      author: 'Senior Software Engineering Manager', role: 'Solo-Migration in 15 Werktagen',
      source: 'The Setup Is the Strategy: How I Orchestrated a Product Migration with Claude Code',
      url: 'https://dev.to/aws-builders/the-setup-is-the-strategy-how-i-orchestrated-a-product-migration-with-claude-code-b92',
      date: 'November 2025',
    },
    { kind: 'text', lines: [
      'Roya: "Wenn du das verinnerlichst, gewinnst du sofort 30-50% Zeit auf den richtigen Tasks. Ohne Magie."',
      'Roya: "Nächstes Kapitel — Pavel in der Bibliothek — erklärt warum dein Context Window dein eigentlicher Engpass ist. Nicht das Modell."',
    ]},
    { kind: 'sources', intro: 'Quellen für dieses Kapitel:', refs: [
      { title: 'I Gave Claude Code 2.0 Our 3-Week Refactor at 11 PM. At 7 AM, It Was Done.', author: 'Reza Rezvani · Medium', url: 'https://alirezarezvani.medium.com/i-gave-claude-code-2-0-our-3-week-refactor-at-11-pm-at-7-am-it-was-done-34decd54e441', date: 'Oktober 2025' },
      { title: 'The Setup Is the Strategy', author: 'DEV Community / aws-builders', url: 'https://dev.to/aws-builders/the-setup-is-the-strategy-how-i-orchestrated-a-product-migration-with-claude-code-b92', date: 'November 2025' },
      { title: 'How Anthropic engineering teams use Claude Code every day', author: 'CodingScape', url: 'https://codingscape.com/blog/how-anthropic-engineering-teams-use-claude-code-every-day', date: 'Dezember 2025' },
    ]},
  ],
};

// ─── Kapitel 2 — Context Window ────────────────────────────────────────────────
export const LESSON_CONTEXT: Lesson = {
  id: 'context', number: 2,
  title: 'Context Window — was rein muss, was nicht',
  subtitle: 'Kapitel 2 · Context-Management',
  mentor: 'Pavel', mentorAvatar: PAVEL_AVATAR, badge: '✓ Context Window',
  steps: [
    { kind: 'text', lines: [
      'Pavel: "Hi. Ich bin Pavel. Roya hat dir gezeigt, wofür KI taugt. Ich zeige dir, wo die meisten scheitern: Context-Management."',
      'Pavel: "Das Context Window ist Claudes Arbeitsspeicher pro Session. Aktuell ~200.000 Tokens — ungefähr 500 Seiten Code. Wird schneller voll als du denkst."',
      'Pavel: "Was alles reinzählt: System-Prompt, deine CLAUDE.md, jedes File das gelesen wurde, jeder Tool-Output, die ganze Chat-History."',
      'Pavel: "Zwei Effekte. Erster: \'Lost in the middle\' — Inhalte in der Mitte des Contexts werden schlechter beachtet als Anfang oder Ende."',
      'Pavel: "Zweiter: Output-Tokens sind ~5× teurer als Input. Lange Antworten erzeugen kostet — und macht das Resultat nicht besser."',
    ]},
    { kind: 'code', caption: 'Beispiel — derselbe Bug-Fix, zwei Ansätze:',
      code:
`# Variante A — Kontext-Massaker
"Hier mein ganzes Repo (180k Tokens).
 Findet den Bug."
 → langsam, ungenau, teuer

# Variante B — gezielt
"Lies CLAUDE.md.
 Dann öffne src/auth/login.ts und fix
 den off-by-one bei pagination."
 → 2× präziser, halbe Latenz, ~10× günstiger`,
      note: 'Variante B funktioniert weil Claude weiß WAS und WO — und nichts mit Lärm verdünnt wird.',
    },
    { kind: 'quote',
      text: 'Die meisten Best Practices basieren auf einer einzigen Einschränkung: Claudes Context Window füllt sich schnell, und die Performance verschlechtert sich, je voller es wird.',
      author: 'Anthropic Engineering', role: 'Claude Code Docs',
      source: 'Best Practices for Claude Code',
      url: 'https://code.claude.com/docs/en/best-practices',
    },
    { kind: 'quote',
      text: 'Die Stanford-Studie 2023 zeigte: Genauigkeit fällt um über 30%, wenn relevante Information in der Mitte statt am Anfang oder Ende steht. Chromas 2025-Studie über 18 Frontier-Modelle bestätigt: jedes einzelne Modell zeigt diesen Effekt.',
      author: 'Morph', role: 'basiert auf Liu et al. 2024 + Chroma 2025',
      source: 'Context Rot: Why LLMs Degrade as Context Grows',
      url: 'https://www.morphllm.com/context-rot',
      date: 'März 2026',
    },
    { kind: 'text', lines: [
      'Pavel: "Tools die helfen: agentic search (grep, glob) statt Repo-Dump. CLAUDE.md als persistenter Kontext. /clear zwischen unverwandten Tasks. /compact wenn lang."',
      'Pavel: "Subagents — separate Instanzen mit eigenem Context. Lesen viel, reporten knapp zurück. Dazu mehr bei Sven."',
    ]},
    { kind: 'quiz', prompt: 'Welche dieser Praktiken sparen dir wirklich Context?', type: 'multi', options: [
      { id: 'claude-md', label: 'CLAUDE.md mit Build-/Test-Commands und Coding-Standards pflegen', good: true, why: 'Wird automatisch jede Session geladen.' },
      { id: 'clear', label: 'Bei langen Sessions /clear zwischen unverwandten Tasks', good: true, why: 'Frischer Context = präzisere Antworten.' },
      { id: 'whole-repo', label: 'Das ganze Repo am Anfang laden, "damit Claude alles weiß"', good: false, why: 'Lost in the middle, höhere Kosten, schlechtere Ergebnisse.' },
      { id: 'subagents', label: 'Subagents zur Erkundung — eigener Context', good: true, why: 'Recherche-Last wird verworfen, Hauptcontext bleibt sauber.' },
      { id: 'verbose', label: 'Lange Erklärungen anfordern, "damit nichts übersehen wird"', good: false, why: 'Output ist 5× teurer als Input. Mehr Text ≠ mehr Qualität.' },
      { id: 'at-ref', label: 'Konkretes File via @-Reference anhängen', good: true, why: 'Claude bekommt genau das was relevant ist.' },
      { id: 'compact', label: 'Bei ~50% Context-Verbrauch /compact mit Fokus-Hinweis', good: true, why: 'Komprimiert History, behält wichtige Decisions.' },
    ]},
    { kind: 'reveal', intro: 'Konsens-Sicht:', outro: 'Wenn du nur eine Sache mitnimmst: Context ist deine wichtigste Ressource — wichtiger als das Modell.' },
    { kind: 'quote',
      text: 'Die Engineers die ich tatsächlich shippen sehe, jagen nicht das größte Context-Window. Sie behandeln Context wie RAM auf einem System mit knappen Ressourcen: vorsichtig was geladen wird, bewusst was rausfliegt.',
      author: 'Glen Rhodes', role: 'Engineer / AI-Engineering Blogger',
      source: 'Context window management: treating LLM context as working memory',
      url: 'https://glenrhodes.com/context-window-management-treating-llm-context-as-working-memory-not-unlimited-storage/',
      date: 'April 2026',
    },
    { kind: 'text', lines: [
      'Pavel: "CLAUDE.md ist die einflussreichste Datei in deinem Repo. Sven zeigt dir das in der Werkstatt."',
      'Pavel: "Aber zuerst Lia — Promptcraft."',
    ]},
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'Best Practices for Claude Code', author: 'Anthropic', url: 'https://code.claude.com/docs/en/best-practices' },
      { title: 'Context Rot: Why LLMs Degrade as Context Grows', author: 'Morph', url: 'https://www.morphllm.com/context-rot', date: 'März 2026' },
      { title: 'Context window management as working memory', author: 'Glen Rhodes', url: 'https://glenrhodes.com/context-window-management-treating-llm-context-as-working-memory-not-unlimited-storage/', date: 'April 2026' },
      { title: 'Lost in the Middle — DEV Erfahrungsbericht', author: 'Razu381 · DEV', url: 'https://dev.to/razu381/lost-in-the-middle-why-bigger-context-windows-dont-always-improve-llm-performance-35j8', date: 'Februar 2026' },
    ]},
  ],
};

// ─── Kapitel 3 — Promptcraft ───────────────────────────────────────────────────
export const LESSON_PROMPTCRAFT: Lesson = {
  id: 'promptcraft', number: 3,
  title: 'Promptcraft für Devs',
  subtitle: 'Kapitel 3 · Wie du genau das fragst was du brauchst',
  mentor: 'Lia', mentorAvatar: LIA_AVATAR, badge: '✓ Promptcraft',
  steps: [
    { kind: 'text', lines: [
      'Lia: "Hi. Kapitel 3: Promptcraft. Klingt nach Hokuspokus. Ist aber Engineering."',
      'Lia: "Dasselbe Modell, derselbe Task — und je nach Prompt: Junk vs. Production-Code. Sechs Hebel, alle wichtig."',
    ]},
    { kind: 'code', caption: 'Hebel 1 · Spezifität',
      code: `❌ "Fix the bug"\n\n✅ "Fix the off-by-one in src/pagination.ts\n   that drops the last item when\n   totalCount % pageSize === 0.\n   Repro: see test 'should include\n   final partial page'."`,
      note: 'Je konkreter du bist, desto mehr eliminierst du Annahmen.',
    },
    { kind: 'code', caption: 'Hebel 2 · Constraints',
      code: `"Fix the off-by-one in pagination.\n\nConstraints:\n- TypeScript strict mode\n- Keine neuen NPM-Dependencies\n- Public API darf nicht brechen\n- Bestehende Tests bleiben grün"`,
      note: 'Sonst macht die KI was sie für richtig hält.',
    },
    { kind: 'code', caption: 'Hebel 3 · Output-Format',
      code: `"Antworte als unified diff,\n keine Prosa drumherum."\n\nOder:\n\n"Output als JSON mit Schema:\n { changedFiles: string[],\n   summary: string,\n   risk: 'low'|'med'|'high' }"`,
      note: 'Strukturiert > Prosa.',
    },
    { kind: 'code', caption: 'Hebel 4 · Beispiele (Few-Shot)',
      code: `"Hier wie wir Tests schreiben —\n siehe src/auth/login.test.ts.\n\nSchreib analog Tests für\n src/auth/register.ts."\n\n→ Ergebnis matched euren Stil`,
      note: 'Generic Tests vs. "passt in unsere Codebase" — Riesenunterschied.',
    },
    { kind: 'code', caption: 'Hebel 5 · Negative Constraints',
      code: `"Don't refactor unrelated code.\n Don't add comments unless they\n explain WHY (not WHAT).\n Don't change file formatting."`,
      note: 'Verhindert Scope-Creep.',
    },
    { kind: 'text', lines: [
      'Lia: "Hebel 6 — Iteration statt One-Shot. Der wichtigste."',
      'Lia: "Den Prompt 5× neu formulieren ist meistens schlechter als zu sagen: \'Das war fast richtig — aber X war falsch, mach das stattdessen so.\'"',
      'Lia: "Wenn 2 Versuche schon falsch laufen: /clear, neu starten mit besserem Prompt."',
    ]},
    { kind: 'quiz', prompt: 'Vager Prompt: "Schreib mir einen Auth-Flow." Welche Verbesserungen würden den Unterschied machen?', type: 'multi', options: [
      { id: 'spec', label: 'Spezifizieren: "OAuth 2.1 Authorization Code mit PKCE für SPA, Backend in Node/Express"', good: true, why: 'Spezifität eliminiert Annahmen.' },
      { id: 'verbose', label: '"Bitte schreib ganz schön ausführlich" für mehr Detail', good: false, why: 'Mehr Output ≠ besserer Code.' },
      { id: 'stack', label: 'Stack/Constraints: "TS, JWT, Redis-Sessions, kein zusätzliches Package"', good: true, why: 'Constraints verhindern Stack-Entscheidungen der KI.' },
      { id: 'questions', label: 'Bitten: "Stell mir zuerst Fragen wenn was unklar ist"', good: true, why: 'Bei vagen Tasks oft die schnellste Variante.' },
      { id: 'multi-model', label: 'Mehrere Modelle parallel fragen', good: false, why: 'Erst den Prompt fixen — sonst überall der gleiche Mist.' },
      { id: 'format', label: 'Format: "Antwort als drei Files — login.ts, callback.ts, types.ts"', good: true, why: 'Struktur verhindert "Hier ist eine Übersicht"-Antworten.' },
      { id: 'negative', label: 'Negative: "Keine Dependencies einführen die nicht in package.json stehen"', good: true, why: 'Verhindert teure Surprises.' },
      { id: 'polite', label: 'Den Prompt höflicher formulieren', good: false, why: 'Höflichkeit ändert nichts an Output-Qualität.' },
    ]},
    { kind: 'reveal', intro: 'Konsens-Sicht:', outro: 'Spezifität + Constraints + Format-Vorgabe haben den höchsten ROI. Negative Constraints kommen direkt danach.' },
    { kind: 'quote',
      text: 'Stell dir Claude vor wie einen brillanten, aber neuen Mitarbeiter, dem der Kontext deiner Normen und Workflows fehlt. Je präziser du erklärst was du willst, desto besser das Resultat.',
      author: 'Anthropic', role: 'Prompting Best Practices · Goldene Regel',
      source: 'Claude Prompting Best Practices',
      url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
    },
    { kind: 'quote',
      text: 'Claude Code ist keine Autocomplete-Maschine — es ist als ob du jedes Mal wenn du Enter drückst einen neuen Engineer onboardest. Und kein Engineer wird mit halbgarem Briefing glücklich.',
      author: 'Stéphane Derosiaux', role: 'Engineer · Medium',
      source: 'From Bad Prompts to Great Code',
      url: 'https://sderosiaux.medium.com/from-bad-prompts-to-great-code-how-claude-code-made-me-a-10x-engineer-b14d17c37f00',
      date: 'August 2025',
    },
    { kind: 'text', lines: [
      'Lia: "Sven nebenan in der Werkstatt zeigt dir das alles in Aktion — Claude Code im Detail. Das längste Kapitel. Lohnt sich."',
    ]},
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'Claude Prompting Best Practices', author: 'Anthropic', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices' },
      { title: 'From Bad Prompts to Great Code', author: 'Stéphane Derosiaux · Medium', url: 'https://sderosiaux.medium.com/from-bad-prompts-to-great-code-how-claude-code-made-me-a-10x-engineer-b14d17c37f00', date: 'August 2025' },
      { title: 'Best practices for prompt engineering', author: 'Anthropic', url: 'https://claude.com/blog/best-practices-for-prompt-engineering', date: 'Februar 2026' },
    ]},
  ],
};

// ─── Kapitel 4 Intro — Sven ────────────────────────────────────────────────────
export const LESSON_CC_INTRO: Lesson = {
  id: 'cc-intro', number: 4,
  title: 'Claude Code — die Werkstatt',
  subtitle: 'Kapitel 4 · Übersicht',
  mentor: 'Sven', mentorAvatar: SVEN_AVATAR, badge: '✓ Claude Code Intro',
  steps: [
    { kind: 'text', lines: [
      'Sven: "Yo. Kapitel 4. Die längste — du bist im Endspurt."',
      'Sven: "Claude Code ist die agentische CLI. Du beschreibst was du willst, Claude liest, plant, editiert, testet. Du reviewst Diffs."',
      'Sven: "Das große Mindset-Update: vom Tipper zum Spec-Schreiber + Reviewer. Enormer Hebel wenn richtig genutzt, gefährlich wenn nicht."',
      'Sven: "4 Werkbänke im Raum. Jede ist eine Mini-Lektion mit Quiz."',
      'Sven: "📄 CLAUDE.md  ·  🗺️ Plan Mode  ·  🤖 Subagents  ·  🔌 MCP & Hooks"',
      'Sven: "Geh hin, sprich sie an, arbeite dich durch. Reihenfolge egal — wenn du nur eine machst, mach CLAUDE.md."',
    ]},
  ],
};

// ─── Kapitel 4.1 — CLAUDE.md ───────────────────────────────────────────────────
export const LESSON_CLAUDE_MD: Lesson = {
  id: 'claude-md', number: '4.1',
  title: 'CLAUDE.md — der heilige Gral',
  subtitle: 'Kapitel 4.1',
  mentor: 'Sven', mentorAvatar: SVEN_AVATAR, badge: '✓ CLAUDE.md',
  steps: [
    { kind: 'text', lines: [
      'Sven: "📄 CLAUDE.md. Die einflussreichste Datei in deinem Repo."',
      'Sven: "Liegt am Root. Wird automatisch zu Beginn jeder Session geladen."',
      'Sven: "Was rein gehört: Build-/Test-Commands, Coding-Standards, Architektur-Übersicht, Repo-Conventions, Gotchas."',
    ]},
    { kind: 'code', caption: 'Beispiel CLAUDE.md (gekürzt)',
      code:
`# Project: Acme API

## Stack
- TypeScript (strict), Node 20, Express
- Postgres via Drizzle ORM
- Tests: Vitest, npm run test:int für Integration

## Conventions
- Keine default exports — nur named
- Errors via custom AppError class (src/lib/error.ts)
- Wir nutzen kein lodash; native Array-Methoden bevorzugen

## Gotchas
- /src/legacy ist eingefroren — keine Änderungen
- Migrations niemals manuell editieren — drizzle-kit generate
- Dev-Datenbank reset: npm run db:reset

## After every edit
- npm run lint && npm run typecheck`,
      note: 'Unter 200 Zeilen halten. Sonst frisst CLAUDE.md selbst zu viel Context.',
    },
    { kind: 'text', lines: [
      'Sven: "Was NICHT rein gehört: vollständige Doku, generische Best Practices, Sachen die im Code stehen."',
      'Sven: "Faustregel: Würde Claude den Fehler ohne diese Zeile machen? Wenn nein — raus."',
      'Sven: "/init generiert eine Starter-Version. Als Ausgangspunkt nutzen, dann aggressiv trimmen."',
    ]},
    { kind: 'quiz', prompt: 'Welche dieser Einträge gehören wirklich in eine CLAUDE.md?', type: 'multi', options: [
      { id: 'test-cmd', label: '"pnpm test:integration" für Integration-Tests, nicht "npm"', good: true, why: 'Repo-spezifisches Workflow-Detail.' },
      { id: 'ts-intro', label: 'Eine Kurzanleitung "Was ist TypeScript"', good: false, why: 'Generisch, im Modell-Wissen schon drin.' },
      { id: 'no-lodash', label: '"Wir nutzen kein Lodash — native Array-Methoden"', good: true, why: 'Repo-Convention die Claude nicht ahnen kann.' },
      { id: 'readme-copy', label: 'Die komplette README.md kopieren', good: false, why: 'Redundant. README ist für Menschen.' },
      { id: 'after-edit', label: '"Nach jedem Edit: pnpm lint && pnpm typecheck"', good: true, why: 'Workflow-Hinweis. Optional als Hook.' },
      { id: 'frozen-modules', label: '"Module unter /src/legacy/ sind eingefroren"', good: true, why: 'Klassischer Gotcha.' },
      { id: 'api-docs', label: 'Die Anthropic-API-Doku einkopieren', good: false, why: 'Im Internet öffentlich. Verschwendete Tokens.' },
    ]},
    { kind: 'reveal', intro: 'Konsens:', outro: 'Unter 200 Zeilen. Iteriere monatlich: was hat Claude diesen Monat falsch gemacht? Eine Zeile dazu. Was wurde nie gebraucht? Raus.' },
    { kind: 'quote',
      text: 'Anthropic gibt keine offizielle Längen-Empfehlung, aber der Konsens ist dass < 300 Zeilen ideal sind, kürzer ist besser. Bei HumanLayer ist unsere Root-CLAUDE.md unter 60 Zeilen.',
      author: 'HumanLayer Team', role: 'HumanLayer Blog',
      source: 'Writing a good CLAUDE.md',
      url: 'https://www.humanlayer.dev/blog/writing-a-good-claude-md',
      date: 'November 2025',
    },
    { kind: 'quote',
      text: 'Ohne ein klares Standards-Dokument trifft jede Claude-Session leicht andere Entscheidungen. Mit der Zeit wird deine Codebase zu einem geologischen Aufzeichnung dessen, was Claude an irgendeinem Dienstag für Best Practice hielt.',
      author: 'Charles Herring', role: 'Engineer · Migration eines Legacy-Systems',
      source: 'Teaching Claude the Old Tricks',
      url: 'https://www.charlesherring.com/blog/claude-with-old-code',
      date: 'Februar 2026',
    },
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'Writing a good CLAUDE.md', author: 'HumanLayer Blog', url: 'https://www.humanlayer.dev/blog/writing-a-good-claude-md', date: 'November 2025' },
      { title: 'Teaching Claude the Old Tricks', author: 'Charles Herring', url: 'https://www.charlesherring.com/blog/claude-with-old-code', date: 'Februar 2026' },
    ]},
  ],
};

// ─── Kapitel 4.2 — Plan Mode ──────────────────────────────────────────────────
export const LESSON_PLAN_MODE: Lesson = {
  id: 'plan-mode', number: '4.2',
  title: 'Plan Mode + Slash-Commands',
  subtitle: 'Kapitel 4.2',
  mentor: 'Sven', mentorAvatar: SVEN_AVATAR, badge: '✓ Plan Mode',
  steps: [
    { kind: 'text', lines: [
      'Sven: "🗺️ Plan Mode. Das wichtigste Feature für nicht-triviale Tasks."',
      'Sven: "Aktivierung: Shift+Tab. Claude wechselt in Read-Only — liest, fragt, plant. Schreibt aber nichts."',
      'Sven: "Du reviewst den Plan. Korrigierst Missverständnisse FRÜH — bevor irgendwas editiert wurde."',
      'Sven: "Faustregel: \'Wenn ich den Diff in einem Satz beschreiben kann, skipp ich Plan Mode. Sonst plane ich erst.\'"',
    ]},
    { kind: 'code', caption: 'Slash-Commands für den Alltag',
      code:
`/clear
  → Frischer Context.
    Zwischen unverwandten Tasks.

/compact
  → Lange Session zusammenfassen.
  → Mit Fokus: "/compact behalte
     Login-Diskussion und Test-Setup"

/rewind  (oder Doppel-Esc)
  → Zurück zu vorigem Checkpoint.

@src/auth/login.ts
  → File explizit referenzieren.

/init
  → Initiale CLAUDE.md generieren.

/usage
  → Token-Verbrauch + Kosten anzeigen.`,
      note: 'Jede Aktion erstellt automatisch einen Checkpoint. Du kannst experimentieren und einfach zurückrollen.',
    },
    { kind: 'quiz', prompt: 'In welcher Situation würdest du Plan Mode aktivieren?', type: 'multi', options: [
      { id: 'typo', label: 'Einen Typo in einer Variable umbenennen', good: false, why: 'Trivial. Plan Mode wäre Overhead.' },
      { id: 'webhook', label: 'Neuer Webhook-Handler über 4 Files', good: true, why: 'Mehrere Schritte. Plan früh reviewen erspart Rework.' },
      { id: 'sync-async', label: 'Refactor: sync API → Promise, 12 Aufrufstellen', good: true, why: 'Hohes Risiko. Plan Mode unverzichtbar.' },
      { id: 'explain', label: '"Erklär mir was diese Funktion macht"', good: false, why: 'Read-only sowieso.' },
      { id: 'db-migration', label: 'DB-Schema-Änderung mit Datenmigration', good: true, why: 'Datenverlust-Risiko. Plan Mode Pflicht.' },
      { id: 'prettier', label: 'Format-Fix mit Prettier auf alle Files', good: false, why: 'Mechanisch, deterministisch.' },
    ]},
    { kind: 'reveal', intro: 'Konsens:', outro: 'Plan Mode bei allem mit "betrifft mehrere Files" oder "schwer rückgängig".' },
    { kind: 'quote',
      text: 'Aus der Praxis: Feature-Flags können riskante Verhaltens-Änderungen isolieren. Nutze Claudes Checkpoints um schnell zu einem früheren Zustand zurückzurollen wenn ein Vorschlag schiefgeht.',
      author: 'Claire (Skywork AI)', role: 'Senior Engineer · Refactor Playbook',
      source: 'How to use Claude Code Plugin for Safe Refactoring & Migration',
      url: 'https://skywork.ai/blog/how-to-use-claude-code-plugin-for-refactoring-migration-guide/',
      date: 'Oktober 2025',
    },
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'How to use Claude Code Plugin for Safe Refactoring', author: 'Skywork AI', url: 'https://skywork.ai/blog/how-to-use-claude-code-plugin-for-refactoring-migration-guide/', date: 'Oktober 2025' },
      { title: 'Best Practices for Claude Code', author: 'Anthropic', url: 'https://code.claude.com/docs/en/best-practices' },
    ]},
  ],
};

// ─── Kapitel 4.3 — Subagents ───────────────────────────────────────────────────
export const LESSON_SUBAGENTS: Lesson = {
  id: 'subagents', number: '4.3',
  title: 'Subagents — Context delegieren',
  subtitle: 'Kapitel 4.3',
  mentor: 'Sven', mentorAvatar: SVEN_AVATAR, badge: '✓ Subagents',
  steps: [
    { kind: 'text', lines: [
      'Sven: "🤖 Subagents. Fast niemand nutzt sie früh genug."',
      'Sven: "Eine Subagent ist eine separate Claude-Instanz mit EIGENEM Context Window. Macht eine Recherche, gibt dir kurze Zusammenfassung zurück."',
      'Sven: "Das Geniale: dein Hauptcontext bleibt sauber."',
    ]},
    { kind: 'code', caption: 'Anwendung — Codebase-Erkundung',
      code:
`# Statt manuell 30 Files zu lesen:
"Use a subagent to investigate
 how our auth system handles
 token refresh and report back
 with file paths and a summary."

→ Subagent liest 30 Files.
→ Du kriegst 5 Zeilen Erkenntnis.
→ Hauptcontext: nicht angefasst.`,
      note: 'Wenn deine Recherche den Hauptcontext um >20% wachsen lassen würde — delegiere.',
    },
    { kind: 'code', caption: 'Custom Subagent in .claude/agents/security-reviewer.md',
      code:
`---
name: security-reviewer
description: Reviews code for security issues
tools: Read, Grep, Glob
model: opus
permissionMode: plan
---

You are a senior security engineer.
Review code for:
- Injection (SQL, XSS, command)
- Auth/authz flaws
- Secrets in code
- Insecure data handling

Provide line refs + suggested fixes.`,
      note: 'YAML-Frontmatter steuert Tools, Modell, Berechtigungen.',
    },
    { kind: 'text', lines: [
      'Sven: "Pre-built: Explore (Haiku, schnelle Suche), Plan (read-only Analyse). Custom legst du in .claude/agents/ ab."',
      'Sven: "Pattern: Explore → Plan → Execute. Jede Phase ein Subagent. Human Review zwischen Plan und Execute."',
      'Sven: "Subagents können auch parallel laufen. Mehr Durchsatz."',
    ]},
    { kind: 'quiz', prompt: 'Wann lohnt sich ein Subagent?', type: 'multi', options: [
      { id: 'auth-investigate', label: '"Wo wird der User-Login validiert?" in einem 200-File Backend', good: true, why: 'Klassische Erkundungs-Task.' },
      { id: 'one-line', label: 'Eine einzelne Zeile Code ändern', good: false, why: 'Overhead.' },
      { id: 'security-review', label: 'Nach Refactor: Security-Review aller geänderten Files', good: true, why: 'Spezialisierter Fokus.' },
      { id: 'simple-fn', label: '"Schreib mir eine Funktion die X macht"', good: false, why: 'Isolierte Coding-Task.' },
      { id: 'pattern-research', label: 'Vor Implementieren: "Wie strukturiert unser Codebase ähnliche Features?"', good: true, why: 'Recherche-Phase.' },
      { id: 'parallel', label: 'Zwei parallele Tasks: Bug A in Branch X, Tests für Y in Branch Z', good: true, why: 'Parallelisierung mit Worktrees.' },
      { id: 'rename-var', label: 'Eine Variable in einem File umbenennen', good: false, why: 'Trivial.' },
    ]},
    { kind: 'reveal', intro: 'Konsens-Heuristik:', outro: 'Wenn Recherche länger braucht als Implementierung — Subagent. Wenn Tasks parallel sein können — Subagents.' },
    { kind: 'quote',
      text: 'Sag Claude explizit dass es Subagents nutzen soll: "Use a subagent to review this code for security issues." Die Recherche landet im Subagent-Context und wird verworfen, dein Hauptcontext bleibt sauber.',
      author: 'Anthropic', role: 'Claude Code Best Practices',
      source: 'Best Practices for Claude Code',
      url: 'https://code.claude.com/docs/en/best-practices',
    },
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'Best Practices for Claude Code', author: 'Anthropic', url: 'https://code.claude.com/docs/en/best-practices' },
      { title: 'awesome-claude-code-subagents', author: 'VoltAgent · GitHub', url: 'https://github.com/VoltAgent/awesome-claude-code-subagents' },
    ]},
  ],
};

// ─── Kapitel 4.4 — MCP & Hooks ─────────────────────────────────────────────────
export const LESSON_MCP_HOOKS: Lesson = {
  id: 'mcp-hooks', number: '4.4',
  title: 'MCP & Hooks — Workflow-Integration',
  subtitle: 'Kapitel 4.4',
  mentor: 'Sven', mentorAvatar: SVEN_AVATAR, badge: '✓ MCP & Hooks',
  steps: [
    { kind: 'text', lines: [
      'Sven: "🔌 MCP und Hooks. Hier passt sich Claude Code an dein Workflow an."',
      'Sven: "MCP = Model Context Protocol. Erweitert Claude um Tools für externe Services: Linear, GitHub, eigene DB, Slack, Sentry."',
      'Sven: "Jeder MCP-Server bringt eigene Tools mit — werden Claudes Toolbox hinzugefügt."',
    ]},
    { kind: 'code', caption: 'Beispiel-Workflow mit MCP — /fix-issue 1234',
      code:
`# Custom-Command in .claude/commands/
fix-issue.md → "/fix-issue $ARGS"

Schritte (alle automatisch):
 1. Linear-MCP holt Ticket #1234
 2. Plan Mode mit Ticket als Spec
 3. User Approval
 4. Execute: Branch + Edits + Tests
 5. GitHub-MCP erstellt PR
    mit Body aus Ticket-Description

→ Du klickst Approve. Fertig.`,
      note: 'Was vorher 30min Tool-Switching war wird zum Single-Command-Workflow.',
    },
    { kind: 'text', lines: [
      'Sven: "Hooks: Lifecycle-Punkte an denen automatisch Code läuft. PreToolUse, PostToolUse, Stop."',
      'Sven: "PostToolUse auf Edit ist der Klassiker — automatisch lint + typecheck. Claude sieht Fehler sofort, korrigiert selbst."',
    ]},
    { kind: 'code', caption: 'Beispiel-Hook in .claude/hooks/post-edit.sh',
      code:
`#!/bin/bash
# Läuft nach jedem File-Edit

cd "$CLAUDE_PROJECT_DIR"

pnpm lint --fix "$CLAUDE_TOOL_FILE"
pnpm typecheck

if [ $? -ne 0 ]; then
  echo "❌ Typecheck broken — fix vor weiter"
  exit 2  # Claude sieht den Fehler
fi`,
      note: 'Stop-Hook läuft wenn Claude meint fertig zu sein. Da kannst du den vollen Test-Suite hängen.',
    },
    { kind: 'quiz', prompt: 'Wofür sind MCP und Hooks die richtige Wahl?', type: 'multi', options: [
      { id: 'lint-on-edit', label: 'Linter automatisch nach jedem Edit ausführen', good: true, why: 'Klassischer PostToolUse-Hook.' },
      { id: 'jira-mcp', label: 'Linear/Jira aus dem Coding-Flow', good: true, why: 'Klassischer MCP-Use-Case.' },
      { id: 'rename-typo', label: 'Einen Typo fixen', good: false, why: 'Standard-Edit.' },
      { id: 'tests-on-stop', label: 'Test-Suite wenn Claude "fertig" meldet', good: true, why: 'Stop-Hook. Dein Sicherheitsnetz.' },
      { id: 'slack-merge', label: 'Slack-DM nach PR-Merge', good: true, why: 'MCP-Workflow.' },
      { id: 'rename-fn', label: 'Eine Funktion umbenennen', good: false, why: 'Standard-Edit.' },
      { id: 'db-schema', label: 'Eigene DB abfragen für Schema-Vergleich', good: true, why: 'Custom-DB-MCP.' },
    ]},
    { kind: 'reveal', intro: 'Konsens:', outro: 'Was du eh manuell machst → Hook. Externer Service den du regelmäßig brauchst → MCP. Beides commit-bar im Repo, ganzes Team profitiert.' },
    { kind: 'quote',
      text: 'Ich habe einen TDD-Skill ergänzt, der den Agent zwingt failing Tests zu schreiben bevor er Implementierungs-Code schreibt. Der Agent hörte auf, mittendrin "Sieg" zu erklären — weil die externe Test-Suite, nicht das eigene Urteil, definierte was "fertig" bedeutet.',
      author: 'Kenta Imoto', role: 'Engineer · DEV Community',
      source: 'I turned on auto-approve in Claude Code and broke CI in 30 minutes',
      url: 'https://dev.to/kenimo49/i-turned-on-auto-approve-in-claude-code-and-broke-ci-in-30-minutes-1g1a',
      date: 'April 2026',
    },
    { kind: 'text', lines: [
      'Sven: "Wenn du das alles nutzt — Plan Mode + CLAUDE.md + Subagents + MCP + Hooks — hat dein Workflow ein Sicherheitsnetz auf jeder Ebene."',
      'Sven: "Agentic mit Guardrails heißt: du wirst Reviewer, KI macht die Tipparbeit, Tests sind das Veto."',
      'Sven: "Du hast die Werkstatt durch. In der Tür rechts wartet Iris im Cockpit — letzte Kapitel."',
    ]},
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'I turned on auto-approve in Claude Code and broke CI in 30 minutes', author: 'Kenta Imoto · DEV', url: 'https://dev.to/kenimo49/i-turned-on-auto-approve-in-claude-code-and-broke-ci-in-30-minutes-1g1a', date: 'April 2026' },
      { title: 'Best Practices for Claude Code', author: 'Anthropic', url: 'https://code.claude.com/docs/en/best-practices' },
    ]},
  ],
};

// ─── Kapitel 5 — Agent Mode ────────────────────────────────────────────────────
export const LESSON_AGENT_MODE: Lesson = {
  id: 'agent-mode', number: 5,
  title: 'Agent Mode — du wirst Pilot',
  subtitle: 'Kapitel 5 · Mindset & Trust-Calibration',
  mentor: 'Iris', mentorAvatar: IRIS_AVATAR, badge: '✓ Agent Mode',
  steps: [
    { kind: 'text', lines: [
      'Iris: "Du hast es durchgezogen. Letzte Kapitel — und die ist nicht über Tools. Sondern über Haltung."',
      'Iris: "Agent Mode heißt: Claude liest, plant, editiert, testet — autonom, im Loop. Das ist nicht mehr Pair Programming. Du bist Pilot, KI ist die Crew."',
      'Iris: "Der Mindset-Shift: vom Tipper zum Spec-Schreiber + Reviewer. Eine andere Kompetenz. Senior-Devs sind anfangs schlecht darin — gewohnt selbst zu tippen."',
    ]},
    { kind: 'code', caption: 'Permission Modes — Autonomie-Kapitel',
      code:
`# Via Shift+Tab umschaltbar:

🛡️  Plan Mode
   read-only, plant nur, fragt oft
   → für Architektur, riskante Tasks

🤝  Default
   fragt vor jeder Edit-Aktion
   → für die meisten Coding-Tasks

⚡  Auto-Accept Edits
   editiert ohne Rückfrage
   shell-commands fragt es noch
   → für mechanische Refactors mit Tests

🔥  Bypass / "YOLO"
   keine Rückfragen, alles geht
   → nur in Sandbox / Container!`,
      note: 'Je weniger reversibel der Output, desto restriktiver der Mode.',
    },
    { kind: 'text', lines: [
      'Iris: "Trust-Calibration ist die Kernkompetenz. Was lässt du laufen ohne Aufsicht?"',
      'Iris: "Drei Faktoren: Reversibilität, Blast-Radius, Test-Coverage."',
      'Iris: "Alle drei grün: laufen lassen. Einer rot: hinschauen. Zwei rot: Plan Mode oder gar nicht."',
    ]},
    { kind: 'code', caption: 'Loop-Awareness — der wichtigste Reflex',
      code:
`# Wenn der Agent falsch läuft:

❌ NICHT: warten bis er fertig ist
   und dann frustriert sein

✅ ESC drücken — sofort

✅ /rewind statt erneut prompten

✅ Wenn 2 Versuche schon falsch:
   /clear, neu starten mit
   besser formuliertem Prompt`,
      note: '30 Sekunden Korrektur jetzt > 5 Minuten Müll später.',
    },
    { kind: 'text', lines: [
      'Iris: "Tests sind dein Gatekeeper. Stop-Hook mit voller Test-Suite. Bricht ein Test, der Agent korrigiert."',
      'Iris: "Long-Running Tasks: 10 Minuten Arbeit → mach was anderes, /resume später. Headless mode (-p) für CI."',
    ]},
    { kind: 'quiz', prompt: 'Welche Tasks würdest du auf Auto-Accept laufen lassen?', type: 'multi', options: [
      { id: 'prettier', label: 'Prettier-Format-Pass auf 200 Files', good: true, why: 'Deterministisch, reversibel via Git.' },
      { id: 'callbacks', label: 'Refactor: Callbacks → Promises in 30 Files, mit Test-Suite', good: true, why: 'Mechanisch, Tests fangen Regressionen.' },
      { id: 'deps-update', label: 'package.json Dependencies updaten und PR erstellen', good: false, why: 'Security-Implikationen, Breaking-Changes.' },
      { id: 'todos-issues', label: 'TODO-Kommentare via Linear-MCP zu Issues machen', good: true, why: 'Read-only auf Code, Write nur in externes Issue-System.' },
      { id: 'hotfix-prod', label: 'Customer-reported Production-Hotfix', good: false, why: 'Höchster Blast-Radius. Plan Mode + manueller Review.' },
      { id: 'gen-tests', label: '1000 auto-generierte Tests laufen lassen und mergen', good: false, why: 'Mehr Tests ≠ besser.' },
      { id: 'db-migration', label: 'Schema-Migration auf Production-DB', good: false, why: 'Niemals. Irreversibel ohne Backup.' },
      { id: 'dead-code', label: 'Toten Code entfernen den Coverage-Tool markiert', good: true, why: 'Reversibel via Git.' },
    ]},
    { kind: 'reveal', intro: 'Konsens:', outro: 'Reversibilität × Blast-Radius × Test-Coverage. Alle drei gut → Autonomie geben. Ein roter Faktor → Plan Mode.' },
    { kind: 'quote',
      text: 'Experten flippen nicht einfach einen Schalter und gehen weg. Sie lassen den Agent laufen — aber sie schauen zu. Wenn die Richtung zu driften beginnt, ziehen sie die Bremse. Nicht jedes Mal — nur 9% der Zeit.',
      author: 'Kenta Imoto', role: 'analysiert Anthropic-Studie 2026',
      source: 'I turned on auto-approve in Claude Code and broke CI in 30 minutes',
      url: 'https://dev.to/kenimo49/i-turned-on-auto-approve-in-claude-code-and-broke-ci-in-30-minutes-1g1a',
      date: 'April 2026',
    },
    { kind: 'quote',
      text: 'Die durchschnittliche Session-Länge bei Auto-Approve-Nutzern wuchs in drei Monaten von unter 25 auf über 45 Minuten. Die Modelle blieben gleich. Es war menschliches Vertrauen das die Modell-Fähigkeit eingeholt hat.',
      author: 'Anthropic Research', role: 'Measuring AI Autonomy — Large-Scale Study',
      source: 'AI agent autonomy rises as users gain trust',
      url: 'https://dig.watch/updates/ai-agent-autonomy-rises-as-users-gain-trust-in-anthropics-claude-code',
      date: 'Februar 2026',
    },
    { kind: 'text', lines: [
      'Iris: "Letzter Hinweis. Parallele Agents sind ein Game-Changer."',
      'Iris: "Ein Agent fixt Bug A in einem Worktree. Anderer schreibt Tests für Feature B. Du machst was anderes. 20 Minuten später: zwei PRs zum Review. Andere Art zu arbeiten."',
      'Iris: "Was du dafür brauchst: gute Specs schreiben können, Diffs lesen können, Tests vertrauen. Genau die Skills die du gelernt hast."',
    ]},
    { kind: 'quote',
      text: 'Stripe rollte Claude Code an 1.370 Engineers aus. Ein Team schloss eine 10.000-Zeilen Scala-zu-Java-Migration in 4 Tagen ab — Arbeit die auf 10 Engineer-Wochen geschätzt war.',
      author: 'Anthropic', role: 'Customer Spotlight',
      source: 'Claude Code · Anthropic Product Page',
      url: 'https://www.anthropic.com/product/claude-code',
    },
    { kind: 'text', lines: [
      'Iris: "Du bist durch. Use-Cases, Context, Promptcraft, Claude Code, Agent Mode mit Trust-Calibration."',
      'Iris: "Glückwunsch. Geh tippen — oder besser: hör auf zu tippen und fang an zu reviewen."',
      'Iris: "👇 Übrigens: der Trainings-Simulator unten im Raum (🎮) lässt dich einen Production-Hotfix durchspielen. Wenn du wirklich was lernen willst statt nur darüber zu lesen — probier den."',
    ]},
    { kind: 'sources', intro: 'Quellen:', refs: [
      { title: 'I turned on auto-approve in Claude Code and broke CI in 30 minutes', author: 'Kenta Imoto · DEV', url: 'https://dev.to/kenimo49/i-turned-on-auto-approve-in-claude-code-and-broke-ci-in-30-minutes-1g1a', date: 'April 2026' },
      { title: 'AI agent autonomy rises as users gain trust', author: 'Digital Watch (Anthropic-Studie)', url: 'https://dig.watch/updates/ai-agent-autonomy-rises-as-users-gain-trust-in-anthropics-claude-code', date: 'Februar 2026' },
      { title: 'Claude Code', author: 'Anthropic Product Page (Stripe Case Study)', url: 'https://www.anthropic.com/product/claude-code' },
    ]},
  ],
};

export const LESSONS: Record<string, Lesson> = {
  [LESSON_USECASES.id]: LESSON_USECASES,
  [LESSON_CONTEXT.id]: LESSON_CONTEXT,
  [LESSON_PROMPTCRAFT.id]: LESSON_PROMPTCRAFT,
  [LESSON_CC_INTRO.id]: LESSON_CC_INTRO,
  [LESSON_CLAUDE_MD.id]: LESSON_CLAUDE_MD,
  [LESSON_PLAN_MODE.id]: LESSON_PLAN_MODE,
  [LESSON_SUBAGENTS.id]: LESSON_SUBAGENTS,
  [LESSON_MCP_HOOKS.id]: LESSON_MCP_HOOKS,
  [LESSON_AGENT_MODE.id]: LESSON_AGENT_MODE,
};
