# PRD — Café Campfire

**Ein interaktives Lernspiel zur Einführung von Claude Code im Team**

| | |
|---|---|
| Version | 1.0 |
| Datum | 31. Mai 2026 |
| Status | Phase 1 abgeschlossen (Stufen 1–5 + Trainings-Simulator) |
| Owner | internes Tooling / Developer Enablement |
| Zielplattform | Single-File HTML-Artefakt (Browser, Desktop & Mobile) |

---

## 1. Problem & Motivation

Erfahrene Entwickler:innen stehen KI-Coding-Tools oft skeptisch gegenüber — zu Recht, weil naive Nutzung enttäuscht: vage Prompts, überladener Context, blindes Vertrauen in Auto-Accept. Die übliche Onboarding-Form (Doku-Link, einmaliges Lunch-and-Learn) bleibt abstrakt und wird selten in echtes Verhalten übersetzt.

Das Team braucht eine Einführung, die

- den **Mindset-Shift** vom Tipper zum Spec-Schreiber + Reviewer vermittelt, nicht nur Feature-Listen,
- **realistisch** ist (zeigt, wofür KI taugt *und* wofür nicht),
- in **15–25 Minuten** durchspielbar ist,
- ohne Setup läuft (eine HTML-Datei, kein Login, keine Installation).

## 2. Ziele & Erfolgskriterien

**Primärziel:** Nach dem Durchspielen kann ein Teammitglied benennen, *wann* Claude Code stark ist, *wie* man Context und Prompts steuert, und *welche* Guardrails (Plan Mode, Tests, Hooks) Autonomie erst legitimieren.

**Erfolgskriterien (qualitativ, da internes Tool):**

- Spieler:in schließt alle 5 Stufen ab (Quest-Tracker zeigt 9 Badges).
- Spieler:in spielt den Trainings-Simulator mindestens einmal durch.
- Im Team-Gespräch danach werden konkrete Begriffe verwendet (Plan Mode, CLAUDE.md, Subagent, Trust-Calibration) statt nur "die KI".

**Nicht-Ziel:** Messbare Produktivitäts-KPIs. Das ist ein Enablement-Tool, kein Tracking-System.

## 3. Zielgruppe

Internes Entwicklungsteam, gemischte Seniorität, überwiegend Backend (TypeScript/Node-affin). Annahme: technisch versiert, KI-skeptisch bis -neugierig, wenig Geduld für Marketing-Ton.

Konsequenz fürs Design: kein Hype, ehrliche Quotes aus echten Erfahrungsberichten, jede didaktische Aussage mit Quelle belegt.

## 4. Scope (Phase 1 — umgesetzt)

### 4.1 Spielrahmen
- Top-down 2D-Spiel im Café-Setting. Grid-basierte Bewegung (WASD / Pfeiltasten / virtueller Joystick auf Mobile).
- 5 begehbare Räume, linear verbunden, jeder Raum = eine Lernstufe.
- Avatar-Editor zu Beginn (prozedural, Haut/Haare/Kleidung/Accessoire), Name-Generator, Persistenz via localStorage.
- Quest-Tracker oben: gesammelte Badges + Easter-Egg-Status.

### 4.2 Die 5 Lernstufen
| Stufe | Raum | Mentor | Thema |
|---|---|---|---|
| 1 | Lobby | Roya | Use-Cases — wofür KI taugt (und wofür nicht) |
| 2 | Bibliothek | Pavel | Context Window als knappe Ressource |
| 3 | Atelier | Lia | Promptcraft — 6 Hebel |
| 4 | Werkstatt | Sven + 4 Stationen | Claude Code: CLAUDE.md, Plan Mode, Subagents, MCP & Hooks |
| 5 | Cockpit | Iris | Agent Mode & Trust-Calibration |

Jede Lektion besteht aus Schritt-Typen: Text, Code-Beispiel, Quote (mit Quelle), Quiz (Multiple-Choice ohne "Bestrafung"), Reveal (Konsens-Auflösung), Quellenliste.

### 4.3 Trainings-Simulator (das zentrale Phase-1-Feature)
Interaktives Entscheidungs-Szenario in einem gefakten Terminal. Erstes Szenario: **"Production Hotfix on Friday Afternoon"** (TypeScript/Node/Postgres).

- Linearer Ablauf aus Beats (Narration / Claude-Output / System-Meldung / Entscheidung).
- 4 Entscheidungspunkte; jede Wahl liefert Feedback, ggf. ein Folge-Beat (Mock-Terminal-Reaktion), sammelt Score + Tags.
- Live-Anzeige von Token-Verbrauch und Score.
- 5 mögliche Endings je nach Score/Tags (🏆 Held → 🔴 Sonntag-Anruf), jeweils mit Lesson-Learned und Pfad-Rückblick.
- Wiederspielbar.

### 4.4 Didaktische Substanz
- 13 verifizierte Quotes aus echten Erfahrungsberichten (Medium, DEV.to, HumanLayer, Charles Herring, Glen Rhodes) sowie Anthropic-Doku und Stanford/Chroma-Forschung.
- 26 anklickbare Quellen-Links (öffnen in neuem Tab).

## 5. Tech-Stack & Architektur

- **Build:** Vite + React 18 + TypeScript, Tailwind CSS, shadcn/ui (Radix-Primitives).
- **Auslieferung:** Über `web-artifacts-builder` zu *einer* selbstständigen HTML-Datei gebundelt (alle JS/CSS inlined, ~400 KB). Keine Server-Abhängigkeit, kein externer Request außer den Quellen-Links.
- **Bewegung:** logische Tile-Koordinaten als State, visuelles Smoothing per CSS-Transition (180 ms/Tile). Kollision via `canEnterTile`.
- **Avatare:** prozedurales Canvas-Rendering (`AvatarCanvas`), Config aus Indizes für Haut/Haar/Kleidung.

### Verzeichnis-Überblick
```
src/
  App.tsx              Screen-Routing (title → editor → game)
  components/
    TitleScreen.tsx    Startbildschirm
    AvatarEditor.tsx   Avatar-Anpassung
    GameScreen.tsx     Spiel-Loop, Räume, Dialoge, Lesson-Views
    SandboxRunner.tsx  Trainings-Simulator (State-Machine + Terminal-UI)
    AvatarCanvas.tsx   prozedurale Avatar-Zeichnung
    Joystick.tsx       virtueller Mobile-Joystick
    ui/                shadcn-Komponenten
  lib/
    world.ts           Räume, Tiles, NPCs, Interactables, Exits
    lessons.ts         alle 9 Lektionsskripte + Quotes + Quellen
    scenarios.ts       Sandbox-Szenario-Engine + "Friday Hotfix"
    avatar.ts          Avatar-Konfiguration & Rendering-Daten
    names.ts           Namensgenerator
    storage.ts         localStorage-Persistenz
```

## 6. Non-Goals (bewusst ausgeschlossen)

- Kein Backend, kein Account, kein Fortschritts-Tracking über Geräte hinweg.
- Keine Echtzeit-Anbindung an die tatsächliche Claude-Code-CLI — der Simulator ist bewusst gefakt.
- Keine Gamification mit Punkterangliste über Personen hinweg.
- Kein vollständiges Branching im Simulator (lineare Beats mit Inline-Folge-Reaktion statt Entscheidungsbaum — Wartbarkeit vor Verzweigungstiefe).

## 7. Roadmap (geplant, noch nicht umgesetzt)

**Phase 2 — Fehlerkabinett (Anti-Patterns).** Galerie mit 4–5 dokumentierten realen Failures (z. B. $5000-Token-Rechnung, auto-approve killt CI, ignorierte 800-Zeilen-CLAUDE.md). Jede Station: Quote + Kontext + Lesson Learned. Content existiert bereits in den recherchierten Quellen.

**Phase 3 — Stack-Adapter (klein gehalten).** Stack-Auswahl im Avatar-Editor (TypeScript/Python/Go/Java/Rust), persistiert in localStorage. Wenige Lektionen reagieren mit stack-spezifischen Beispielen. Bewusst minimal, um Content-Explosion zu vermeiden.

**Mögliche Erweiterungen.** Weitere Simulator-Szenarien, Hot-Takes-Mini-Feature, kombinierte Real-World-Workshops.

## 8. Risiken & offene Punkte

| Risiko | Bewertung | Gegenmaßnahme |
|---|---|---|
| Mock-Outputs im Simulator wirken fake → Lerneffekt sinkt | mittel | plausible, knappe Terminal-Ausgaben; iterieren nach Team-Feedback |
| Permission-Mode-Namen (YOLO/Bypass) ändern sich in echter CLI | niedrig | bei Bedarf Begriffe nachziehen |
| Quest-Tracker mit 9 Badges braucht horizontales Scrollen auf kleinen Screens | niedrig | bereits horizontal scrollbar |
| Runtime der Sandbox noch nicht im Browser durchgetestet (nur Build verifiziert) | offen | manueller Durchlauf durch Team vor breitem Rollout |

## 9. Akzeptanzkriterien Phase 1

- [x] Alle 5 Stufen begehbar und abschließbar.
- [x] Quotes mit funktionierenden Quellen-Links.
- [x] Trainings-Simulator startbar, 4 Entscheidungen, score-/tag-basierte Endings.
- [x] Single-File-HTML baut und bundelt ohne Fehler.
- [x] Mobile-Steuerung (Joystick) und Desktop-Steuerung (Tastatur) funktionsfähig.
- [ ] Manueller End-to-End-Test des Simulators im Browser (durch Team).
