# Café Campfire

Ein interaktives Lernspiel zur Einführung von Claude Code im Team. Siehe `PRD.md` für Produktdetails.

## Schnellstart

Die fertige, spielbare Version liegt als einzelne Datei vor:

```
cafe-campfire.html
```

Einfach im Browser öffnen — keine Installation, kein Server nötig.

## Entwicklung

Voraussetzung: Node 20+, pnpm (oder npm).

```bash
pnpm install      # Dependencies installieren
pnpm dev          # Dev-Server mit Hot-Reload
pnpm build        # Production-Build nach dist/
pnpm lint         # ESLint
```

## Single-File-Bundle erzeugen

Das Spiel wird mit dem web-artifacts-builder-Skript zu einer einzelnen
selbstständigen HTML-Datei gebundelt (alle JS/CSS inlined):

```bash
bash scripts/bundle-artifact.sh   # erzeugt bundle.html
```

## Projektstruktur

```
src/
  App.tsx              Screen-Routing (title -> editor -> game)
  components/
    TitleScreen.tsx    Startbildschirm
    AvatarEditor.tsx   Avatar-Anpassung
    GameScreen.tsx     Spiel-Loop, Raeume, Dialoge, Lesson-Views
    SandboxRunner.tsx  Trainings-Simulator
    AvatarCanvas.tsx   prozedurale Avatar-Zeichnung
    Joystick.tsx       virtueller Mobile-Joystick
    ui/                shadcn-Komponenten
  lib/
    world.ts           Raeume, Tiles, NPCs, Interactables, Exits
    lessons.ts         9 Lektionsskripte + Quotes + Quellen
    scenarios.ts       Sandbox-Engine + "Friday Hotfix"-Szenario
    avatar.ts          Avatar-Konfiguration
    names.ts           Namensgenerator
    storage.ts         localStorage-Persistenz

PRD.md                 Product Requirements Document
cafe-campfire.html     fertiges Single-File-Bundle (spielbar)
```

## Inhaltlich erweitern

- Neue Lektion: Eintrag in src/lib/lessons.ts + Verknuepfung ueber lessonId
  an einem NPC oder Interactable in src/lib/world.ts.
- Neues Simulator-Szenario: Szenario-Objekt in src/lib/scenarios.ts zur
  SCENARIOS-Map hinzufuegen, dann ueber ein Interactable mit sandboxId triggern.
