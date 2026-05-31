# Café Campfire

Ein interaktives Lernspiel zur Einführung von Claude Code im Team — als
**offline-fähige PWA** (Vite 8 · React 19 · TypeScript · Tailwind · shadcn/ui).

- Produkt-/Inhaltsvision: [`PRD.md`](./PRD.md)
- Prüfbare Anforderungen: [`ANFORDERUNGEN.md`](./ANFORDERUNGEN.md)

## Schnellstart

Voraussetzung: Node 22+, pnpm.

```bash
pnpm install      # Dependencies installieren
pnpm dev          # Dev-Server mit Hot-Reload
pnpm build        # Production-Build nach dist/ (inkl. Service Worker + Manifest)
pnpm preview      # gebauten Stand lokal servieren (PWA real testen)
pnpm lint         # ESLint
pnpm test         # Vitest (Watch)
pnpm test:run     # Vitest (einmalig, für CI)
pnpm gen:icons    # PWA-Icons aus public/app-icon.svg neu generieren
```

## PWA & Offline

Das Spiel ist eine installierbare PWA. Nach dem ersten Online-Laden cached der
Service Worker (Workbox via `vite-plugin-pwa`) den App-Shell und alle
gleich-origin Assets — danach läuft alles **offline**, inklusive Neuladen.
Updates werden automatisch gezogen; ein dezenter Hinweis bietet Neuladen an.

> Offline am besten über `pnpm build && pnpm preview` testen — im `vite dev`
> ist der Service Worker bewusst deaktiviert, um Cache-Überraschungen beim
> Entwickeln zu vermeiden.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` baut und veröffentlicht `dist/` auf GitHub Pages.

1. Repo-Settings → **Pages** → *Build and deployment* → Source: **GitHub Actions**.
2. Push auf `main` (oder Workflow manuell auslösen) deployt automatisch.

Der Base-Path ist `/Aiadventure/` (exakter Repo-Name — GitHub-Pages-Pfade sind
case-sensitive). Für ein anderes Repo oder eine eigene Domain via `BASE_PATH`
überschreiben, z. B. `BASE_PATH=/ pnpm build`.

## Projektstruktur

```
src/
  App.tsx              Screen-Routing (title -> editor -> game)
  components/
    TitleScreen.tsx    Startbildschirm
    AvatarEditor.tsx   Avatar-Anpassung
    GameScreen.tsx     Spiel-Loop, Räume, Dialoge, Lesson-Views
    SandboxRunner.tsx  Trainings-Simulator
    AvatarCanvas.tsx   prozedurale Avatar-Zeichnung
    Joystick.tsx       virtueller Mobile-Joystick
    PwaReloadPrompt.tsx  Offline-/Update-Hinweis
    ui/                shadcn-Komponenten
  lib/                 framework-freie, getestete Kernlogik
    world.ts           Räume, Tiles, NPCs, Interactables, Exits
    lessons.ts         9 Lektionsskripte + Quotes + Quellen
    scenarios.ts       Sandbox-Engine + "Friday Hotfix" + resolveEnding()
    avatar.ts          Avatar-Konfiguration
    names.ts           Namensgenerator
    storage.ts         localStorage-Persistenz
  test/                Test-Setup + Stubs

ANFORDERUNGEN.md       Anforderungsdokument (prüfbare Requirements)
PRD.md                 Product Requirements Document (Vision)
```

## Tests

Vitest + jsdom + Testing Library. Schwerpunkt auf der framework-freien
`src/lib`-Logik (inkl. datengetriebener Welt-Integritätschecks) plus
Smoke-Tests für UI-Einstieg.

## Inhaltlich erweitern

- **Neue Lektion:** Eintrag in `src/lib/lessons.ts` + Verknüpfung über `lessonId`
  an einem NPC oder Interactable in `src/lib/world.ts`. Der Integritätstest
  stellt sicher, dass jede referenzierte `lessonId` existiert.
- **Neues Simulator-Szenario:** Szenario-Objekt in `src/lib/scenarios.ts` zur
  `SCENARIOS`-Map hinzufügen, dann über ein Interactable mit `sandboxId` triggern.
