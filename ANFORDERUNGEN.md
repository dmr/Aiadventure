# Anforderungsdokument — Café Campfire

**Interaktives Lernspiel zur Einführung von Claude Code im Team**

| | |
|---|---|
| Version | 2.0 |
| Datum | 31. Mai 2026 |
| Status | Umgesetzt: Vite-8/React-19-PWA, Stufen 1–5 + Trainings-Simulator |
| Bezug | Ergänzt das `PRD.md` (Produkt-/Inhaltsvision) um prüfbare Anforderungen |

Dieses Dokument hält **prüfbare Anforderungen** fest. Das *Warum* und die
inhaltliche Vision stehen im `PRD.md`; hier geht es um *Was* das System leisten
muss und *woran* wir das messen.

---

## 1. Zweck & Abgrenzung

Café Campfire ist eine clientseitige Single-Page-Web-App (PWA), die KI-Coding
mit Claude Code spielerisch und ehrlich vermittelt. Es gibt **kein Backend,
keine Accounts, kein Tracking**. Persistenz ausschließlich lokal (localStorage).

**In Scope:** Spielrahmen, 5 Lernstufen, Trainings-Simulator, Offline-Fähigkeit,
Deployment auf GitHub Pages.
**Out of Scope:** Server, Telemetrie, geräteübergreifende Synchronisation,
echte CLI-Anbindung.

## 2. Stakeholder & Nutzergruppen

| Rolle | Interesse |
|---|---|
| Teammitglied (Spieler:in) | In 15–25 min ein realistisches Bild von Claude Code bekommen |
| Developer Enablement (Owner) | Wartbares, erweiterbares Enablement-Tool ohne Betriebskosten |
| Beitragende | Klare Struktur, um Lektionen/Szenarien hinzuzufügen |

## 3. Funktionale Anforderungen (FR)

| ID | Anforderung | Priorität |
|---|---|---|
| FR-1 | Beim Start erscheint ein Titelbildschirm mit Einstieg ("Reinkommen"). | Muss |
| FR-2 | Avatar-Editor: Haut, Frisur, Haarfarbe, Shirt, Hose, Accessoire wählbar; prozedural gerendert. | Muss |
| FR-3 | Namensgenerator schlägt einen Namen vor und kann neu gewürfelt werden (kein direkter Wiederholung). | Muss |
| FR-4 | Avatar, Name und Geschlecht werden in localStorage persistiert und beim Neustart geladen. | Muss |
| FR-5 | Top-down-Bewegung auf Tile-Grid via WASD/Pfeiltasten (Desktop) und virtuellem Joystick (Touch). | Muss |
| FR-6 | Kollision: Wände, Möbel, Wasser, blockierende Deko und NPCs sind nicht begehbar. | Muss |
| FR-7 | 5 verbundene Räume; Türen/Exits führen auf begehbare Spawn-Tiles im Zielraum. | Muss |
| FR-8 | Interaktion mit NPC/Objekt in Reichweite startet die zugehörige Lektion bzw. den Simulator. | Muss |
| FR-9 | Jede der 5 Lektionen unterstützt die Schritt-Typen Text, Code, Quote (mit Quelle), Quiz, Reveal, Quellenliste. | Muss |
| FR-10 | Quiz gibt Feedback ohne "Bestrafung"; Quellen-Links öffnen extern. | Muss |
| FR-11 | Quest-Tracker zeigt gesammelte Badges inkl. Easter-Egg-Status. | Soll |
| FR-12 | Trainings-Simulator spielt ein Szenario als Beat-Sequenz mit Entscheidungen ab. | Muss |
| FR-13 | Entscheidungen sammeln Score und Tags; Live-Anzeige von Token-Verbrauch und Score. | Muss |
| FR-14 | Das Ende wird deterministisch aus Score/Tags ermittelt (`resolveEnding`); Simulator ist wiederspielbar. | Muss |
| FR-15 | Nutzer:in kann zum Titelbildschirm zurückkehren. | Soll |

## 4. Nicht-funktionale Anforderungen (NFR)

### 4.1 PWA & Offline
| ID | Anforderung |
|---|---|
| NFR-PWA-1 | Web-App-Manifest mit Name, Theme/Background-Color, `standalone`, Icons (192, 512, maskable). |
| NFR-PWA-2 | Service Worker (Workbox via vite-plugin-pwa) precached den App-Shell und alle gleich-origin Assets. |
| NFR-PWA-3 | Nach dem ersten Online-Laden ist das Spiel **vollständig offline** spielbar (Neuladen eingeschlossen, `navigateFallback`). |
| NFR-PWA-4 | Updates werden automatisch gezogen (`autoUpdate`); ein dezenter Hinweis bietet Neuladen / signalisiert Offline-Bereitschaft. |
| NFR-PWA-5 | Installierbar auf Desktop und Mobile (Add to Home Screen). |

### 4.2 Qualität & Betrieb
| ID | Anforderung |
|---|---|
| NFR-Q-1 | `pnpm lint`, `pnpm test:run` und `pnpm build` laufen fehlerfrei. |
| NFR-Q-2 | Kernlogik (`src/lib`) ist mit Unit-Tests abgedeckt; Welt-Integrität (Exits, lessonIds, sandboxIds) wird automatisiert geprüft. |
| NFR-Q-3 | CI führt Lint, Test und Build bei jedem Push/PR aus. |
| NFR-Q-4 | Deployment erfolgt automatisiert auf GitHub Pages (Build → Artifact → Pages). |
| NFR-Q-5 | Production-Bundle bleibt schlank (Richtwert: JS gzip < 150 KB). |

### 4.3 Kompatibilität & Bedienung
| ID | Anforderung |
|---|---|
| NFR-C-1 | Aktuelle Evergreen-Browser (Chrome, Edge, Firefox, Safari) inkl. Mobile-Safari. |
| NFR-C-2 | Responsiv von ~320 px Breite bis Desktop; Touch- und Tastatursteuerung. |
| NFR-C-3 | Graceful Degradation: ohne localStorage (Privatmodus) bleibt das Spiel spielbar (ohne Persistenz). |
| NFR-C-4 | Ohne Netzfont-Zugriff fällt die Typografie sauber auf System-Schriften zurück. |

## 5. Technische Anforderungen

- **Build:** Vite 8, React 19, TypeScript, Tailwind CSS 3, shadcn/ui (Radix).
- **PWA:** `vite-plugin-pwa` (Workbox, `generateSW`, `registerType: autoUpdate`).
- **Paketmanager:** pnpm; reproduzierbar via `--frozen-lockfile`.
- **Base-Path:** `/aiadventure/` (GitHub Pages Project Site), per `BASE_PATH` überschreibbar.
- **Tests:** Vitest + jsdom + Testing Library.
- **Architektur:** Logik in `src/lib` (framework-frei, testbar), UI in `src/components`.

## 6. Teststrategie

- **Unit:** Persistenz, Namensgenerator, Avatar-Wertebereiche, Welt-Helfer
  (`canEnterTile`, `findExitAt`, `nearestInteraction`), Ending-Auflösung.
- **Integrität (datengetrieben):** Jeder Exit zeigt auf einen realen Raum mit
  begehbarem Spawn; jede referenzierte `lessonId`/`sandboxId` existiert.
- **Szenario:** Best-/Worst-Case-Pfad des Friday-Hotfix führen zu den
  erwarteten Endings (🏆 / 🔴).
- **Komponenten (Smoke):** Titelbildschirm rendert und startet; App mountet
  inkl. PWA-Hook-Stub.
- **Lücke / manuell:** End-to-End-Durchlauf des Simulators im echten Browser,
  Installierbarkeit und Offline-Verhalten (Lighthouse/DevTools).

## 7. Abnahmekriterien

- [x] Alle 5 Stufen begehbar und abschließbar.
- [x] Trainings-Simulator startbar, Entscheidungen wirken auf Score/Tags, Endings greifen.
- [x] PWA installierbar; nach erstem Laden offline spielbar.
- [x] `lint` + `test:run` + `build` grün; CI vorhanden.
- [x] GitHub-Pages-Deployment-Workflow vorhanden.
- [ ] Manueller E2E-/Offline-/Install-Test im Browser durch das Team.

## 8. Offene Punkte & Risiken

| Thema | Status / Gegenmaßnahme |
|---|---|
| Manueller Offline-/Install-Test | offen — durch Team vor Rollout |
| Google-Fonts via `@import` (externer Request) | Font ist rein kosmetisch; offline greift System-Fallback. Optional: Fonts self-hosten für 100 % offline-konsistente Typografie. |
| Mock-Outputs im Simulator wirken evtl. "fake" | nach Team-Feedback iterieren |
| Bundle enthält viele ungenutzte shadcn/ui-Komponenten | Tree-Shaking entfernt Ungenutztes; ungenutzte Quellen können später aufgeräumt werden |
