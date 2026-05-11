# Real Life Network (RLN)

Der Werkzeugkasten, der Menschen in die Realitaet fuehrt. Live auf [real-life.network](https://real-life.network).

Repo: github.com/lichtungooo/rln

> **Wichtig fuer Sessions:** Lies in dieser Reihenfolge beim Start:
> 1. Diese Datei
> 2. [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung, Antons Stack
> 3. [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Vision: Module als Daten + Konfigurator + AI
> 4. [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — wie baue ich ein neues Modul
> 5. [MOBILE.md](MOBILE.md) — Topbar, Vollbild-Switcher, Edge-Swipe (lesen, bevor an Mobile-UI gearbeitet wird)

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

## Modul-Doktrin — ein System, ein Design, eine Usability

Alle RLN-Module folgen demselben Pattern. Timo's Worte (11.05.2026):
*"Definiere unsere Vorgehensweise für alle Module gleich — ein System mit einem Design und einer Usability."*

Diese Doktrin hat vier Schichten. Wer ein Modul baut oder refactor't, beachtet sie alle.

### Schicht 1 — Layout

**Cockpit-Modul** (User stellt sich seine Sicht selbst zusammen):
→ `PageGrid` aus `src/components/PageGrid.tsx`. Beliebige Pages, konfigurierbar.
Beispiel: Dashboard. Spaeter: Settings.

**Funktions-Modul** (feste Funktion mit mehreren Ansichten):
→ `PageGrid` mit `lockPages: true` ODER eigener Hero+Tabs-Header. Pages/Tabs sind fest.
Beispiel: Profil (Avatar/Quest/Skill), Kalender (Tag/Woche/Monat/...).

**Fullscreen-Modul** (das Modul IST der Inhalt):
→ `fullWidth: true`, eigene Logik. Beispiel: Map.

### Schicht 2 — Header

| Element | Verwendung |
|---------|-----------|
| Linear-Gradient orange→violett | Toolbar-Hintergrund — gleich in allen Modulen |
| Tab-Buttons (Pille) | `bg-foreground text-background` aktiv, `text-muted-foreground hover:bg-muted/50` inaktiv |
| `+` Button | Nur in PageGrid ohne lockPages — neue Page anlegen |
| `headerRight: ReactNode` | Modul-spezifisch — z.B. `<StatsBar />` (XP+Trust) in Dashboard/Profil |
| Zahnrad rechts oben | **NUR EINES** pro Sichtfeld. Globales App-Zahnrad ist weg — Page-Konfig lebt im Modul (PageGrid-Zahnrad), Space-Settings ueber Workspace-Switcher Edit. |
| **KEINE** Modul-interne Suche | globale Suche oben im App-Header reicht |

### Schicht 3 — Widget

Jedes Widget rendert sich self-contained in seinen Slot:

```tsx
<div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
  {/* Optional Header: Icon + Label + X (bei Detail-Widgets) */}
  <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
    <Icon className="h-4 w-4 shrink-0" style={{ color }} />
    <span className="text-sm font-semibold truncate flex-1">{label}</span>
    {/* Bei Detail: */}
    <button onClick={() => select(null)}><X /></button>
  </div>
  {/* Content scrollt intern */}
  <div className="p-3 flex-1 overflow-y-auto">
    ...
  </div>
</div>
```

Bei Source-Widgets (Liste): `ArrowRight`-Icon oben rechts springt zum Modul-Detail (Backward-Kompat).
Responsive Layouts via ResizeObserver wenn das Widget sich an Slot-Groesse anpassen soll (Vorbild `DashboardHero`).

### Schicht 4 — Klick-Routing (KERNKONZEPT)

**Pfeile rechts/links sind NIE fuer Page/Tab-Wechsel, sondern IMMER fuer interne Navigation im aktiven Widget.**

Tabs/Pages werden manuell oben geklickt.

Pattern:
1. **Container** wrappt Inhalt mit `<SelectionProvider>` (aus `src/components/SelectionContext.tsx`)
2. **Source-Widget**: `useChannelSync(channelId, items)` + `select(item.id)` beim Klick
3. **Detail-Widget**: `useChannel(channelId)` → `selected` rendern
4. **Container**: `useNavigation()` liefert prev/next/canPrev/canNext → an PageGrid `navApi` Prop
5. Pfeile aussen nur sichtbar wenn `activeChannelId !== null`
6. **Beim Page/Tab-Wechsel**: `select(null)` zuruecksetzen ist Aufgabe des Detail-Widgets (X-Button)

**Channel-Namen-Konvention:**
- `quest` — Quests (Source: QuestWidget, Detail: QuestDetailWidget)
- `event` — Termine (CalendarWidget ↔ EventDetailWidget)
- `bereich` — 8 Bereiche (TreeWidget ↔ BereichDetailWidget)
- `skill` — einzelne Skills (SpiegelSkillTab intern)
- `log` — Log-Eintraege (geplant)
- `place` — Karten-Pins (geplant)
- `contact` — Personen/Kontakte (geplant)

Item-IDs sind eindeutig im Channel (default: Item.id).

### Konventionen — was NICHT geht

- ❌ **Pfeile fuer Page/Tab-Wechsel.** Tabs werden manuell geklickt.
- ❌ **Modul-internes Settings-Zahnrad**, das andere Aufgaben hat als das PageGrid-Zahnrad. Aktuell ist nur eines erlaubt — naechstes: globales App-Zahnrad uebernimmt.
- ❌ **Modul-interne Suche.** Es gibt eine globale Suche oben im App-Header.
- ❌ **Klick auf Item → Modul-Sprung** als Default. Wenn ein Detail-Widget existiert, sollte der Klick es fuettern. Modul-Sprung gibt's per `ArrowRight`-Icon im Widget-Header (Backward-Kompat).
- ❌ **Page-Scroll** des gesamten Moduls. Nur Widgets scrollen intern.

### Mobile (PageGrid responsive)

Bei Container-Breite < 768px schaltet PageGrid auf Single-Column-Modus um:
- Slots stapeln untereinander mit `min-height = rowSpan * 180px`
- Page-Inhalt scrollt vertikal (einzige Ausnahme von der no-scroll-Regel)
- Page-Tabs scrollen horizontal wenn zu viele
- Klick-Routing-Pfeile wandern in die Header-Bar
- Drag-and-Drop ist auf Mobile deaktiviert (Touch waere verwirrend)
- ResizeObserver erkennt Resize live (Browser-Fenster verkleinern)

### Drag-and-Drop + Resize (Desktop)

Slots in PageGrid lassen sich per Drag-and-Drop tauschen UND in der
Groesse aendern. Jeder Slot zeigt beim Hover zwei Handles:

- **Grip oben rechts** — Drag-and-Drop: zieht den Slot, Drop auf einen
  anderen Slot tauscht die Positionen
- **Ecke unten rechts** — Resize: Drag aendert colSpan + rowSpan. Werte
  snappen auf valide Stufen (Breit 1/2/3/6, Hoch 1/2/3/4)

Persistenz greift automatisch via PageGrid-localStorage.

- Mobile: kein Drag/Resize — Slot-Konfig nur via Zahnrad
- Visuelle Hinweise: gedraggter Slot opacity 40%, Drop-Target Primary-Ring

### Was DANN passiert

Wenn alle Module dieser Doktrin folgen:
- Mensch lernt das System einmal, kann es ueberall.
- Jedes Modul fuehlt sich an wie das gleiche — nur mit anderen Inhalten.
- Der Mensch baut sich seine Welt selbst zusammen, ueber Slots und Channels.
- Mobile / Desktop / Tablet gleich — PageGrid passt sich automatisch an.

---

## PageGrid — Default-Pattern fuer Modul-UIs (Meilenstein 11.05.2026)

`src/components/PageGrid.tsx` ist die geteilte Grundlage fuer alle neuen Modul-UIs. **Wer ein neues Modul baut oder ein bestehendes refactor't, nimmt PageGrid.** Dashboard und Profil teilen sich diesen Code; Kalender/Marketplace/Wissensfeld folgen als naechstes.

### Was es ist

Ein konfigurierbares Grid: Mensch baut sich seine Modul-Oberflaeche selbst — wie ein Chrome-Startbildschirm. Mehrere Seiten, pro Seite ein 6-spaltiges Grid mit Widget-Slots.

### Wie es funktioniert

- **6-spaltiges Grid** pro Seite. Slots haben `colSpan: 1|2|3|6` und `rowSpan: 1|2|3|4`.
- **Mehrere Seiten** als Tabs oben. Default-Pages liefert das Modul, der User legt eigene an mit `+`.
- **Pfeile aussen** = Page-Wechsel. Pfeile innen (im Widget) = Inhalts-Wechsel innerhalb des Slots.
- **Zahnrad rechts oben** = Widget hinzu/entfernen/Groesse aendern, Seite umbenennen, Seite loeschen.
- **NICHT scrollbar global.** Nur Widgets scrollen intern (`overflow-auto` im Widget-Inneren).
- **Persistenz** in `localStorage` pro Space: Key-Konvention `rln-<modulId>-<spaceId>`.

### Wie man es einbindet

```ts
// Im Modul-index.ts:
export const dingModule: ModuleDefinition = {
  id: "ding",
  label: "Ding",
  icon: SomeIcon,
  fullWidth: true,         // <-- WICHTIG: PageGrid nimmt vollen Platz
  View: DingView,
}

// In DingView.tsx:
import { PageGrid, type GridPage, type AvailableWidget } from "../../components/PageGrid"

const WIDGETS: AvailableWidget[] = [
  { id: "foo", label: "Foo", defaultColSpan: 2, defaultRowSpan: 2 },
  // ...
]

const DEFAULT_PAGES: GridPage[] = [
  { id: "start", name: "Start", slots: [{ id: "s1", widget: "foo", colSpan: 6, rowSpan: 4 }] },
]

export function DingView({ spaceId, activeGroup }: ModuleViewProps) {
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "foo": return <FooWidget />
      // ...
    }
  }
  return (
    <PageGrid
      storageKey={`rln-ding-${spaceId ?? "default"}`}
      defaultPages={DEFAULT_PAGES}
      availableWidgets={WIDGETS}
      renderWidget={renderWidget}
    />
  )
}
```

### Konventionen

- **Kein eigenes Settings-Zahnrad** im Modul-Toolbar — das hat PageGrid schon. Modul-spezifische Konfig (z.B. Mode, Item-Typen) lebt in Space-Settings.
- **Keine eigene Suche** im Modul — die globale Suche oben im Header reicht.
- **Widget-Box-Standard:** `rounded-xl border bg-card overflow-hidden`
- **Widget-Self-Sizing:** Widget rendert sich `h-full w-full` in seinen Slot. Wenn das Widget sich an Slot-Groesse anpassen soll, ResizeObserver (Vorbild `DashboardHero`: bei `width >= 480` volle Optik, sonst kompakt).
- **XL-Widgets** (default 6x4) zeigen volle Tab-Layouts (Two-Panel etc.). **Kompakte Widgets** (default 2x2) zeigen Snapshot/Liste mit Klick auf "Mehr" zum entsprechenden Modul.

### Header-Stil (auch fuer Module ohne volles Grid)

Selbst Module die noch kein PageGrid haben (z.B. Calendar mit seinen festen View-Modi) uebernehmen den **Tab-Button-Stil** aus PageGrid:

- Linear-Gradient orange→violett als Toolbar-Hintergrund
- Aktiv: `bg-foreground text-background font-semibold`
- Inaktiv: `text-muted-foreground hover:text-foreground hover:bg-muted/50`
- `rounded-md` Pille, `px-2.5 py-1.5 text-sm`

So fuehlen sich alle Module aus einem Guss an, auch wenn intern unterschiedlich strukturiert.

### Wann PageGrid, wann eigene Struktur?

**PageGrid** ist fuer Module die ein **persoenliches Cockpit** sind — der User stellt sich seine Sicht selbst zusammen (Dashboard).

**Eigene Struktur** ist fuer Module mit **fester Funktions-Logik**, wo Tabs unterschiedliche Modi bedeuten:
- Profil: 3 feste Linsen (Avatar / Quest / Skill)
- Kalender: 7 feste View-Modi (Tag / Woche / Monat / Jahr / Agenda / Events / Meine)

Dort uebernimmt man nur den **Tab-Button-Stil** (Pille, Gradient-Hintergrund) und die **Pfeile-aussen-Konvention** (intern durch Inhalt blaettern via onNavReady-API), aber NICHT die konfigurierbaren Pages.

### Stand 12.05.2026 — alle Module auf PageGrid

| Modul | Status |
|-------|--------|
| Dashboard | ✅ PageGrid (Pages konfigurierbar) + 6 Channels (quest, event, bereich, log, place, skill) |
| Profil (Spiegel) | ✅ PageGrid mit lockPages — 3 feste Tabs + Channels |
| Calendar | ✅ PageGrid mit 7 lockPages (Tag/Woche/Monat/Jahr/Agenda/Events/Meine) |
| Marketplace | ✅ PageGrid mit 3 lockPages (Sachen/Begabungen/Beduerfnisse) |
| Wissensfeld | ✅ PageGrid mit 4 lockPages (Fragen/Erkenntnisse/Konsent/Spirit) |
| Valluet | ✅ PageGrid mit 4 lockPages (Alle/Geschoepft/Empfangen/Geteilt) |
| Settings | ✅ PageGrid mit 7 lockPages (Vollbild-Dialog), controlled-mode + 3-Spalten-Drilldown im Slot |
| Map | Bleibt fullscreen (Karte = Inhalt, kein Tab-Header) |
| Kanban | Eigener Header (toolkit-extern), StatsBar drueber |

**Alle Module mit Tabs nutzen jetzt PageGrid mit `lockPages: true`** —
einheitliches Tab-Pattern (Pille, Linear-Gradient, foreground/background),
StatsBar im headerRight, fullWidth.

### Klick-Routing — Kernkonzept fuer Pfeile (Timo-Klarstellung 11.05.2026)

**Pfeile rechts/links sind NIE fuer Page/Tab-Wechsel, sondern IMMER fuer interne Navigation im aktiven Widget.**

So funktioniert das Pattern:
1. User klickt ein Item in einem Quell-Widget (z.B. Quest in Quest-Liste)
2. Detail oeffnet sich in einem anderen Slot, den der User dafuer definiert hat ("welches Fenster arbeitet mit welchem zusammen")
3. Pfeile blaettern durch die Items des Quell-Widgets
4. Das aktive Item zeigt sich live im Detail-Slot
5. Tabs/Pages oben werden manuell geklickt, nicht durch Pfeile gewechselt

Vorbild: SpiegelSkillTab — Klick auf Skill oeffnet Detail-Panel, Pfeile rotieren durch Skills im Bereich.

**Implementierung (offen, kommt naechste Iteration):**
- Globaler "selectedItem"-State pro Widget-Typ
- Widget-Konfig "Welcher Slot ist mein Detail-Target?"
- Pfeile wirken auf das zuletzt geklickte Quell-Widget

### Header-Stats (StatsBar)

XP-Balken + Trust-Zahl + Marker (Aelteste, Synergien) sind als wiederverwendbare Komponente `src/modules/gamification/StatsBar.tsx`. Wird in Profil-Hero und Dashboard-Header (via PageGrid `headerRight` Prop) genutzt. Trust = `useContacts().activeContacts.length` — reine Zahl, keine Bewertung.

### Offene Themen

- ✅ **Klick-Routing** (11.05.2026): 6 Channels via SelectionContext
- ✅ **Doppeltes Zahnrad weg** (12.05.2026 — wieder aufgegriffen): EIN globales Settings-Zahnrad oben rechts, kontextsensitiv (oeffnet Module-Tab mit aktivem moduleId). PageGrid-internes Zahnrad raus, Map-Inline-Zahnrad raus, Haeuschen-Button raus → durch QR-Code-Button (Handshake) ersetzt.
- **Settings als Grid-Drilldown** (offen): SpaceSettings soll 3-Spalten-Layout auf Desktop bekommen (Top-Tabs / Sub-Items / Detail) und Firefox-Drilldown auf Mobile. Mobile-Drilldown existiert in MobileSpaceSettings.tsx, Module-Detail-Stufe fehlt. Header bekam 12.05. den Modul-Doktrin-Gradient.
- **Page-Konfig-Modal**: Code lebt noch in PageGrid (PageConfigModal), wird aber nicht aufgerufen. Soll ueber globales Settings → Module-Tab → Modul-Detail integriert werden.
- ✅ **Drag-and-Drop + Resize** fuer Slots (Desktop, 11.05.2026)
- ✅ **Mobile**: PageGrid single-column stack, Pfeile im Header. Settings Firefox-Drilldown.
- ✅ **HUD** aktiv in Modulen ohne eigene StatsBar.

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
- [src/components/MobileTabSwitcher.tsx](src/components/MobileTabSwitcher.tsx) — Mobile Vollbild-Switcher (3 Reiter + Footer)
- [src/components/OpenModuleTabs.tsx](src/components/OpenModuleTabs.tsx) — Browser-Style Tabs auf Desktop
- [vite.config.ts](vite.config.ts) — Aliase, fester Port
- [ARCHITEKTUR.md](ARCHITEKTUR.md) — All-WoT-Entscheidung
- [MODULSCHMIEDE.md](MODULSCHMIEDE.md) — Modulschmiede-Vision
- [MODUL-DEV-GUIDE.md](MODUL-DEV-GUIDE.md) — neuen Modul bauen
- [MOBILE.md](MOBILE.md) — Mobile-Architektur (Topbar, Switcher, Edge-Swipe)

---

## Migration (April → Mai 2026)

Dieses Repo war urspruenglich ein anderer rln-Prototyp (Panel-System, Carousel) — der April-Stand liegt auf Branch `archive/v0-april-2026`. Am 30.04.2026 wurde der vollstaendige macher-map-Code in dieses Repo migriert. Macher-Map wird zum Space innerhalb von RLN.

Old: `macher-map.org/app/spaces/<uuid>/<modul>`
New: `real-life.network/macher/<modul>`
