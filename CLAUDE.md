# Real Life Network (RLN)

Der Werkzeugkasten, der Menschen in die Realitaet fuehrt. Live auf [real-life.network](https://real-life.network).

Repo: github.com/lichtungooo/rln

> **Wichtig fuer Sessions:** Lies in dieser Reihenfolge beim Start:
> 1. Diese Datei
> 2. [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung, Antons Stack
> 3. [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Vision: Module als Daten + Konfigurator + AI
> 4. [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — wie baue ich ein neues Modul

---

## Was ist RLN

Real Life Network ist die Marke. Spaces leben darin — Macher, Lichtung, Ganja-Map, Vom-Land-in-den-Mund, Real Life Game und alles was kommt.

**URL-Struktur:**
- `real-life.network/` → RLN-Landing (was ist das)
- `real-life.network/macher` → Macher-Space
- `real-life.network/lichtung` → Lichtung-Space
- `real-life.network/<slug>/<modul>` → konkretes Modul im Space

**Andere Domains:**
- `macher-map.org` → reduzierte Landing, leitet auf real-life.network/macher
- `lichtung.ooo` → reduzierte Landing, leitet auf real-life.network/lichtung
- Jeder Space-Domain wird zur Showroom-Landing fuer den jeweiligen Space

Migration siehe [project_rln_domain_umzug.md](memory) und [PROZESS.md](PROZESS.md).

---

## Dev-Server (FEST — niemals aendern!)

**Port: 5173** mit `strictPort: true` in `vite.config.ts`.

```bash
cd rln
pnpm dev
# laeuft auf http://localhost:5173/
```

### Warum fester Port

- **IndexedDB ist origin-gebunden** — wenn der Port wechselt, ist Login + alle Daten weg.
- `strictPort: true` heisst: Vite startet **NUR** auf 5173. Wenn der Port belegt ist: Fehler statt Hop.
- Wenn der Server nicht startet: alten Vite-Prozess beenden (Task-Manager oder `taskkill /F /IM node.exe`), **nicht** einen anderen Port nehmen.

### Port-Belegung im Workspace

| App | Port | Repo |
|-----|------|------|
| **RLN (Real Life Network)** | **5173** | `rln/` |
| **RLS Reference App** | **5174** | `real-life-stack/apps/reference/` |
| **Storybook** | 6006 | `real-life-stack/packages/toolkit/` |

---

## Architektur

RLN ist ein **rein statisches Frontend** auf Antons Real-Life-Stack + Web-of-Trust. Kein klassisches Backend. Identitaet, Items, Sync laufen alle ueber WoT.

Toolkit-Imports kommen ueber Vite-Aliase aus `../real-life-stack/`:

| Alias | Was |
|-------|-----|
| `@real-life-stack/toolkit` | UI-Komponenten + Hooks + ConnectorProvider |
| `@real-life-stack/data-interface` | Item-Modell + Capability-Interfaces |
| `@real-life-stack/wot-connector` | Web-of-Trust-Connector (E2E-verschluesselt) |
| `@real-life-stack/local-connector` | IndexedDB-Persistenz (Dev/Test) |
| `@real-life-stack/mock-connector` | In-Memory (Stories/Tests) |

### Routing (App.tsx)

```
/                   → RLN-Landing (statisch, Vorbild Web of Trust)
/<slug>/*           → Space-App (WoT-App, Hauptarbeit)
                      Slug: macher, lichtung, ganja-map, ...
/datenschutz        → PrivacyPage
/impressum          → ImpressumPage
```

---

## Modul-System (das Herzstueck)

Module sind die einzelnen Funktionen eines Spaces (Karte, Kanban, Marktplatz, Modulschmiede, Profil-Editor, ...).

### Zwei Arten von Modulen

| | **Code-Modul** | **Daten-Modul** |
|---|---|---|
| **Was** | TypeScript-Komponente | JSON-Schema |
| **Wer baut** | Programmierer | Mensch im Konfigurator + KI |
| **Beispiele** | Karte (Leaflet), Kanban, Modulschmiede | Marktplatz, Skill-Tree, Quest |
| **Verteilung** | Im Repo | Items vom Typ `module-template` im WoT |

Code-Module sind fuer komplexe Sachen. Daten-Module sind fuer alles andere — sie werden zur Laufzeit aus Schema gerendert.

### Modul-Ordnerstruktur

```
src/modules/
├── index.ts                      # Re-Exporte
├── registry.ts                   # ModuleDefinition + zentrale Registry
├── schema-types.ts               # ModuleSchema, LayoutDefinition, ActionDefinition
├── types.ts                      # ModuleFieldConfig, FieldType, FieldVisibility
├── use-module-config.ts          # useModuleConfig + useIsSpaceAdmin
├── renderers/                    # Wiederverwendbare Renderer
├── map/                          # CODE-Modul: Karte mit Leaflet
├── kanban/                       # CODE-Modul: Kanban-Board
├── calendar/                     # CODE-Modul: Vorzeige-Kalender (7 Ansichten)
├── profile/                      # Profil-Editor (Dialog)
├── marketplace/                  # DATEN-Modul: Marktplatz aus Schema
├── modulschmiede/                # CODE-Modul: Konfigurator-UI
├── members/                      # CODE-Modul: Mitglieder + Rollen
└── theme/                        # CODE-Modul: Theme-Picker
```

### Modul-Konfig pro Space

Konfig pro Space + pro Modul liegt in:
```ts
group.data.moduleConfig[<modulId>]
```

Schreiben ueber `useModuleConfig().setModuleConfig(group, moduleId, config)`.
Berechtigung: `useIsSpaceAdmin(spaceId)` (Owner ODER expliziter "admin" in `group.data.roles`).

### Vollbild-Settings

Jeder Space-Admin hat ein zentrales Vollbild-Settings (erreichbar ueber den Edit-Knopf am Workspace-Switcher). 7 Tabs:
- Allgemein (Name, Slug, Parent, Hashtags)
- Theme (5 Welten + Live-Preview)
- Module (Toggles + Sub-Konfig + Live-Preview pro Modul)
- Modulschmiede (Templates verwalten)
- Mitglieder (Rollen)
- Demo-Daten (Showroom-Inhalte)
- Erweitert (Reset, Export)

Inline-Zahnrad auf Karte/Kalender ist Shortcut → springt direkt zum richtigen Modul-Tab.

---

## Spaces-Hierarchie

Spaces tragen `group.data.parentSpaceId` + `slug` + `hashtags`.

- **Root-Space** zeigt Sub-Spaces aggregiert (alle Pins, alle Termine)
- **Sub-Space** zeigt nur eigene Inhalte
- **Workspace-Switcher** ist hierarchisch — Root + eingerueckte Sub-Spaces
- **Hierarchie-Bar** oberhalb jedes Moduls macht die Position sichtbar (↑ Parent + Sub-Space-Pillen)

Skalierung: ein Macher-Root mit Macher-Berlin, Macher-Hamburg, Macher-Kassel — Pins werden je Sub-Space gepflegt, Aggregation auf Root-Ebene.

---

## Profile (Sonderfall)

Antons WoT-Connector speichert nur `name`, `bio`, `avatar`. Alles andere (Skills, Offers, Needs, Address, Phone) wandert in ein **Profile-Extension-Item** (`type: "profile-extension"`). Plus: Avatar persistiert ueber Reload nicht zuverlaessig in Antons doc — deshalb auch im Extension-Item.

Implementiert in `src/modules/profile/use-profile-extension.ts` mit `splitProfileUpdates()`. Lese-Prioritaet: **Extension > Master (Antons WoT) > currentUser fallback**.

---

## Persistenz-Schichten

| Wo | Was |
|----|-----|
| **Antons WoT-Doc** (`doc.profile`) | name, bio, avatar |
| **Items im WoT-Doc** | Tasks, Posts, Events, Places, Offers, Needs, Profile-Extensions, Module-Templates |
| **Group-Data** (`group.data.modules`, `group.data.moduleConfig`, `parentSpaceId`, `slug`, `hashtags`, `theme`) | Konfig pro Space |
| **localStorage** | UI-State (aktiver Connector, aktiver Space, aktives Modul) |
| **IndexedDB (per Yjs/automerge)** | Persistierung des kompletten WoT-Docs |

---

## Sprache

Deutsch. Klar wie Schiller, kraftvoll wie Goethe. **Kein Gendern, kein Wokismus** — siehe [feedback_klare_sprache_regeln](memory).

In Code: englische Identifier, deutsche UI-Texte, deutsche Kommentare. Konsistent mit Antons Reference App.

Pro Space eigene Tonalitaet:
- Macher: erdig, gamifiziert (`/macher-sprache`)
- Lichtung: sanft, atmend (`/herzens-sprache`)

---

## Wichtige Dateien

- [src/pages/MacherApp.tsx](src/pages/MacherApp.tsx) — App-Root, Connector-Setup, Module-Router
- [src/modules/registry.ts](src/modules/registry.ts) — ModuleDefinition + zentrale Map
- [src/settings/SpaceSettings.tsx](src/settings/SpaceSettings.tsx) — Vollbild-Settings mit 7 Tabs
- [src/spaces/space-data.ts](src/spaces/space-data.ts) — Helper fuer Slug/Hierarchie/Hashtags
- [src/spaces/MacherWorkspaceSwitcher.tsx](src/spaces/MacherWorkspaceSwitcher.tsx) — hierarchischer Switcher
- [vite.config.ts](vite.config.ts) — Aliase, fester Port
- [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung
- [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Modulschmiede-Vision
- [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — neuen Modul bauen

---

## Migration (April → Mai 2026)

Dieses Repo war urspruenglich ein anderer rln-Prototyp (Panel-System, Carousel) — der April-Stand liegt auf Branch `archive/v0-april-2026`. Am 30.04.2026 wurde der vollstaendige macher-map-Code in dieses Repo migriert. Macher-Map wird zum Space innerhalb von RLN.

Old: `macher-map.org/app/spaces/<uuid>/<modul>`
New: `real-life.network/macher/<modul>`
