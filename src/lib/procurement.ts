// Alternative story track: "KI im Einkauf" — concrete procurement tasks with a
// strong data-privacy focus. Reuses the Trainings-Simulator scenario engine.

import type { Scenario } from './scenarios';

// ─────────────────────────────────────────────────────────────────────────────
// Task 1: Angebotsvergleich mit KI (Vertraulichkeit der Lieferantendaten)
// ─────────────────────────────────────────────────────────────────────────────
export const TASK_ANGEBOTE: Scenario = {
  id: 'einkauf-angebote',
  title: 'Angebotsvergleich mit KI',
  subtitle: 'Einkauf · 5 vertrauliche Lieferanten-Angebote',
  briefBy: 'Dana',
  brief:
    'Fünf Angebote mit vertraulichen Preisen und Konditionen sollen verglichen werden. ' +
    'KI schafft das in Minuten — aber die Daten sind sensibel und teils unter NDA. Wie gehst du vor?',
  estimatedMin: 6,
  beats: [
    { kind: 'system', text: '🛒 Aufgabe · Vergabe-Empfehlung bis 15:00', variant: 'info' },
    { kind: 'narration', text: 'Du hast die PDFs offen. Erstes Setup — welches Werkzeug?' },
    {
      kind: 'decision',
      prompt: 'Welches KI-Tool / Setup?',
      options: [
        {
          label: 'Freigegebenes Enterprise-Tool mit AVV, kein Training auf euren Daten',
          hint: 'Datenschutz zuerst',
          feedback: '✓ Richtig: vertrauliche Daten nur in Werkzeuge mit Vertrag und ohne Trainingsnutzung.',
          tags: ['approved_tool', 'privacy'],
          score: 3,
        },
        {
          label: 'Schnell in ein kostenloses öffentliches Chat-Tool kopieren',
          hint: 'Spart Zeit',
          feedback: '✗ Die AGB erlauben oft Training auf Eingaben. Vertrauliche Preise wären preisgegeben.',
          tags: ['public_leak'],
          score: -3,
          followUp: {
            kind: 'system',
            text: '⚠️ Hinweis: Die Eingaben dieses Dienstes dürfen laut AGB zum Training verwendet werden. NDA-Bruch-Risiko.',
            variant: 'error',
          },
        },
        {
          label: 'Erst Preise/Namen schwärzen, dann nur Strukturdaten vergleichen',
          hint: 'Weniger Risiko',
          feedback: '✓ Schwärzen reduziert das Risiko deutlich — gut, wenn kein Enterprise-Tool verfügbar ist.',
          tags: ['redaction'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Wie formulierst du die Aufgabe?',
      options: [
        {
          label: 'Klare Tabelle: nur Preis, Lieferzeit, Zahlungsziel — nur nötige Felder',
          hint: 'Datenminimierung',
          feedback: '✓ Nur das Nötige teilen. Klare Aufgabe → verwertbares Ergebnis.',
          tags: ['data_minimization'],
          score: 3,
        },
        {
          label: 'Alle PDFs komplett hochladen, inkl. interner Notizen & Margen',
          hint: 'Sicher ist sicher',
          feedback: '⚠️ Mehr Daten als nötig — interne Margen und Notizen gehören da nicht rein.',
          tags: ['oversharing'],
          score: -2,
        },
        {
          label: 'Nur die relevanten Felder als anonymisierte Tabelle',
          hint: 'Anonymisiert',
          feedback: '✓ Sauber: anonymisiert und auf das Nötige beschränkt.',
          tags: ['data_minimization'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Vor der Vergabe-Empfehlung...',
      options: [
        {
          label: 'KI-Ergebnis gegen die Originale prüfen (Zahlen verifizieren)',
          hint: 'Vertrauen ist gut, Kontrolle besser',
          feedback: '✓ Pflicht: KI-Ausgaben bei Vergabe-Relevanz immer gegen die Quelle prüfen.',
          tags: ['verify'],
          score: 3,
        },
        {
          label: 'KI-Tabelle direkt an die Geschäftsführung, ungeprüft',
          hint: 'Schnell raus',
          feedback: '✗ Ein Zahlendreher → falsche Vergabe. Blindes Vertrauen ist im Einkauf teuer.',
          tags: ['blind_trust'],
          score: -3,
          followUp: {
            kind: 'system',
            text: '🚨 Stichprobe später zeigt: ein Zahlendreher im KI-Output hätte fast zur falschen Vergabe geführt.',
            variant: 'warn',
          },
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['public_leak', 'blind_trust', 'oversharing'],
      icon: '🔴',
      title: 'Datenleck im Einkauf',
      lesson:
        'Vertrauliche Daten im falschen Tool oder ungeprüfte Ergebnisse — genau so entstehen NDA-Brüche und Fehlvergaben. ' +
        'Lesson: freigegebenes Tool mit Vertrag, nur nötige Daten, Ergebnisse verifizieren.',
    },
    {
      requiresAll: ['approved_tool', 'data_minimization', 'verify'],
      minScore: 8,
      icon: '🏆',
      title: 'Sauber & sicher vergeben',
      lesson:
        'Richtiges Tool, Datenminimierung, verifizierte Zahlen — schnelle KI-Unterstützung ohne Datenschutz-Risiko. So geht KI im Einkauf.',
    },
    { minScore: 6, icon: '🟢', title: 'Solide & vorsichtig', lesson: 'Gut abgesichert. Beim nächsten Mal noch konsequenter nur das Nötige teilen.' },
    { minScore: 2, icon: '🟡', title: 'Gerade noch sauber', lesson: 'Es ist nichts passiert — aber näher an Glück als an Methode. Datenschutz konsequenter mitdenken.' },
    { icon: '🟠', title: 'Riskant durchgekommen', lesson: 'Die Empfehlung steht, aber mit zu viel Risiko. Tool-Wahl und Verifikation sind der Hebel.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Task 2: Lieferantendaten bereinigen (DSGVO / PII)
// ─────────────────────────────────────────────────────────────────────────────
export const TASK_DSGVO: Scenario = {
  id: 'einkauf-dsgvo',
  title: 'Lieferantendaten bereinigen (DSGVO)',
  subtitle: 'Einkauf · Lieferanten-DB mit Kontakt-PII',
  briefBy: 'Dana',
  brief:
    'Die Lieferanten-Datenbank ist voller Dubletten und veralteter Kontakte — Namen, E-Mails, Telefonnummern, ' +
    'also personenbezogene Daten. KI soll bereinigen und anreichern. Die DSGVO sitzt im Nacken.',
  estimatedMin: 6,
  beats: [
    { kind: 'system', text: '🛒 Aufgabe · Lieferanten-DB bereinigen', variant: 'info' },
    { kind: 'narration', text: 'Personenbezogene Daten im Spiel. Bevor du KI ansetzt — was klärst du zuerst?' },
    {
      kind: 'decision',
      prompt: 'Rechtsgrundlage & Setup?',
      options: [
        {
          label: 'Auftragsverarbeitungsvertrag (AVV) mit dem Anbieter, EU-Hosting',
          hint: 'DSGVO-Basis',
          feedback: '✓ Bei PII-Verarbeitung durch Dritte: AVV + EU/„angemessenes Schutzniveau" sind Pflicht.',
          tags: ['avv', 'eu_hosting'],
          score: 3,
        },
        {
          label: 'Egal, Hauptsache schnell — irgendein US-Gratis-Tool',
          hint: 'Sofort loslegen',
          feedback: '✗ Drittland-Transfer ohne Garantien = DSGVO-Verstoß-Risiko mit Bußgeld-Potenzial.',
          tags: ['third_country'],
          score: -3,
          followUp: {
            kind: 'system',
            text: '⚠️ Datentransfer in ein Drittland ohne geeignete Garantien — Datenschutzbeauftragte:r würde das stoppen.',
            variant: 'error',
          },
        },
        {
          label: 'Erst prüfen, ob personenbezogene Daten überhaupt nötig sind',
          hint: 'Notwendigkeit zuerst',
          feedback: '✓ Beste Frage überhaupt: Was nicht verarbeitet wird, muss nicht geschützt werden.',
          tags: ['necessity'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Datenminimierung?',
      options: [
        {
          label: 'Nur Firmendaten + Rollen anreichern, private Handynummern raus',
          hint: 'So wenig PII wie möglich',
          feedback: '✓ Datenminimierung: nur was den Zweck erfüllt.',
          tags: ['minimization'],
          score: 3,
        },
        {
          label: 'Komplette PII inkl. Privatadressen mitschicken',
          hint: 'Lieber vollständig',
          feedback: '⚠️ Mehr personenbezogene Daten = mehr Risiko und mehr Pflichten.',
          tags: ['excess_pii'],
          score: -2,
        },
        {
          label: 'Wo möglich pseudonymisieren',
          hint: 'IDs statt Klarnamen',
          feedback: '✓ Pseudonymisierung senkt das Risiko deutlich.',
          tags: ['pseudonym'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Aufbewahrung & Betroffenenrechte?',
      options: [
        {
          label: 'Löschkonzept + Opt-out respektieren, Verarbeitung dokumentieren',
          hint: 'Rechenschaftspflicht',
          feedback: '✓ Dokumentierte Verarbeitung + Löschfristen = DSGVO-Rechenschaftspflicht erfüllt.',
          tags: ['retention', 'documented'],
          score: 3,
        },
        {
          label: 'Daten „für später" unbegrenzt behalten',
          hint: 'Könnte man mal brauchen',
          feedback: '⚠️ Speicherbegrenzung verletzt — Daten ohne Zweck und Frist sind ein Risiko.',
          tags: ['hoarding'],
          score: -2,
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['third_country', 'excess_pii', 'hoarding'],
      icon: '🔴',
      title: 'DSGVO-Vorfall',
      lesson:
        'Drittland-Transfer, zu viel PII oder Daten-Horten — das sind die Klassiker, die Bußgelder und Audits auslösen. ' +
        'Lesson: AVV/EU-Hosting, Datenminimierung, Löschkonzept.',
    },
    {
      requiresAll: ['avv', 'minimization', 'retention'],
      minScore: 8,
      icon: '🏆',
      title: 'DSGVO-konform bereinigt',
      lesson:
        'Vertrag, EU-Hosting, nur nötige Daten, dokumentiert und mit Löschfrist. So wird KI-gestützte Datenpflege rechtssicher.',
    },
    { minScore: 6, icon: '🟢', title: 'Datenschutz gewahrt', lesson: 'Solide. Pseudonymisierung und Dokumentation noch konsequenter machen.' },
    { minScore: 2, icon: '🟡', title: 'Knapp im Rahmen', lesson: 'Funktioniert, aber mit Lücken. DSGVO-Pflichten gehören an den Anfang, nicht ans Ende.' },
    { icon: '🟠', title: 'Auditrisiko', lesson: 'Bei einer Prüfung gäbe es Fragen. Rechtsgrundlage und Löschkonzept sind der Hebel.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Task 3: Vertrags- & NDA-Prüfung mit KI (Vertraulichkeit)
// ─────────────────────────────────────────────────────────────────────────────
export const TASK_VERTRAG: Scenario = {
  id: 'einkauf-vertrag',
  title: 'Vertragsprüfung mit KI',
  subtitle: 'Einkauf · Rahmenvertrag + NDA',
  briefBy: 'Dana',
  brief:
    'Ein neuer Rahmenvertrag samt NDA soll geprüft werden. KI kann Klauseln zusammenfassen — ' +
    'aber der Vertrag ist streng vertraulich und enthält teils Geheimnisse der Gegenseite.',
  estimatedMin: 6,
  beats: [
    { kind: 'system', text: '🛒 Aufgabe · Vertragsprüfung bis morgen', variant: 'info' },
    { kind: 'narration', text: 'Streng vertraulich. Erste Entscheidung — wie und wo prüfst du?' },
    {
      kind: 'decision',
      prompt: 'Tool-Wahl bei vertraulichem Vertrag?',
      options: [
        {
          label: 'Freigegebenes Tool, keine Speicherung/kein Training, Zugriff dokumentiert',
          hint: 'Vertraulichkeit gewahrt',
          feedback: '✓ Vertrauliche Verträge nur in Werkzeuge mit Vertraulichkeitszusage und ohne Datennutzung.',
          tags: ['approved_tool', 'no_retention'],
          score: 3,
        },
        {
          label: 'Öffentliches Tool, Vertragstext reinpasten',
          hint: 'Schnell verstanden',
          feedback: '✗ NDA-Bruch: vertraulicher Text in einem Dienst ohne Vertraulichkeitszusage.',
          tags: ['confidentiality_breach'],
          score: -3,
          followUp: {
            kind: 'system',
            text: '⚠️ Der eingefügte Text könnte gespeichert/verarbeitet werden — die NDA verbietet genau das.',
            variant: 'error',
          },
        },
        {
          label: 'Nur anonymisierte Auszüge / Standardklauseln prüfen lassen',
          hint: 'Minimaler Kontext',
          feedback: '✓ Auszüge ohne identifizierende Details senken das Risiko stark.',
          tags: ['excerpt'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Was lässt du die KI tun?',
      options: [
        {
          label: 'Klauseln zusammenfassen + Risiken markieren — Entscheidung bei dir/Legal',
          hint: 'KI assistiert, Mensch entscheidet',
          feedback: '✓ Richtig: KI als Verständnishilfe, die Bewertung bleibt beim Menschen.',
          tags: ['human_decision'],
          score: 3,
        },
        {
          label: 'KI „entscheiden" lassen, ob unterschrieben wird',
          hint: 'Spart eine Schleife',
          feedback: '✗ Rechtliche Entscheidungen delegiert man nicht an ein Sprachmodell.',
          tags: ['ai_decides'],
          score: -2,
        },
        {
          label: 'Nur Verständnishilfe, finale Prüfung durch Legal',
          hint: 'Sicherheitsnetz Legal',
          feedback: '✓ Solide: Legal hat das letzte Wort.',
          tags: ['legal_review'],
          score: 2,
        },
      ],
    },
    {
      kind: 'decision',
      prompt: 'Nach der KI-Analyse?',
      options: [
        {
          label: 'KI-Ausgabe gegen die Originalklauseln verifizieren, Fundstellen zitieren',
          hint: 'Belege statt Behauptungen',
          feedback: '✓ Halluzinationen ausschließen: jede Aussage gegen die Quelle prüfen.',
          tags: ['verify'],
          score: 3,
        },
        {
          label: 'KI-Zusammenfassung blind übernehmen',
          hint: 'Klingt plausibel',
          feedback: '✗ Bei Verträgen ist „klingt plausibel" gefährlich — eine erfundene Klausel reicht.',
          tags: ['blind_trust'],
          score: -2,
        },
      ],
    },
  ],
  endings: [
    {
      requiresAny: ['confidentiality_breach', 'ai_decides', 'blind_trust'],
      icon: '🔴',
      title: 'NDA gebrochen',
      lesson:
        'Vertraulicher Text im falschen Tool, oder der KI die Entscheidung überlassen — beides bricht Vertrauen und Vertrag. ' +
        'Lesson: vertrauliches nur in zugesicherte Werkzeuge, Mensch/Legal entscheidet, Aussagen verifizieren.',
    },
    {
      requiresAll: ['approved_tool', 'human_decision', 'verify'],
      minScore: 8,
      icon: '🏆',
      title: 'Vertraulich & korrekt geprüft',
      lesson:
        'Sicheres Tool, KI als Assistenz, Entscheidung bei Legal, Aussagen belegt — schnelle Vertragsprüfung ohne Vertraulichkeitsbruch.',
    },
    { minScore: 6, icon: '🟢', title: 'Sauber geprüft', lesson: 'Gut. Noch konsequenter nur Auszüge statt Volltext teilen.' },
    { minScore: 2, icon: '🟡', title: 'Mit Restrisiko durch', lesson: 'Hat geklappt, aber mit Lücken bei Vertraulichkeit oder Verifikation.' },
    { icon: '🟠', title: 'Heikel gelaufen', lesson: 'Die Prüfung steht, aber mit Vertraulichkeitsrisiko. Tool-Wahl und Verifikation sind der Hebel.' },
  ],
};

export type ProcurementTask = { id: string; scenario: Scenario; task: string };

/** The clear procurement tasks offered in the "KI im Einkauf" hub, in order. */
export const PROCUREMENT_TASKS: ProcurementTask[] = [
  { id: TASK_ANGEBOTE.id, scenario: TASK_ANGEBOTE, task: 'Vergleiche 5 vertrauliche Angebote — ohne Datenleck.' },
  { id: TASK_DSGVO.id, scenario: TASK_DSGVO, task: 'Bereinige Lieferanten-PII — DSGVO-konform.' },
  { id: TASK_VERTRAG.id, scenario: TASK_VERTRAG, task: 'Prüfe einen Vertrag samt NDA — vertraulich.' },
];
