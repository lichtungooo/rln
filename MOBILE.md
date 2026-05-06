# RLN Mobile — Architektur

Die Mobile-Sicht der Macher-App folgt dem **Browser-Modell** (Firefox/Chrome). Tabs oben, Vollbild-Switcher per Knopf, keine Bottom-Nav.

> Stand: **2026-05-06** — nach Phasen-Marathon N4a–N4e. Lessons in [Real-Life-Forge/ERFAHRUNGEN.md](../Real-Life-Forge/ERFAHRUNGEN.md) (Erfahrung 22).

---

## Grund-Idee

**Drei Layer:**

```
┌─────────────────────────────────────────┐
│  TOPBAR (immer sichtbar)                │
│  Space-M · Vergr. · ⚙ · [□] · Profil-M   │
├─────────────────────────────────────────┤
│  HIERARCHIE-BAR (per Modul, optional)    │
├─────────────────────────────────────────┤
│                                         │
│  AKTIVES MODUL (Vollbild)               │
│                                         │
└─────────────────────────────────────────┘
```

Klick auf den **Tab-Counter** (□, Firefox-Stil — leeres Rechteck-Icon, ohne Zahl) oeffnet den **Vollbild-Switcher**:

```
┌─────────────────────────────────────────┐
│  ←  [Spaces]  [Module]  [Profil]         │  ← 3-Reiter
├─────────────────────────────────────────┤
│                                         │
│  Inhalt je nach Reiter                  │
│  (scrollbar)                            │
│                                         │
├─────────────────────────────────────────┤
│  •••                            [+ Neu]  │  ← kontext-Footer
└─────────────────────────────────────────┘
```

---

## Topbar Mobile

Datei: [src/pages/MacherApp.tsx](src/pages/MacherApp.tsx) — Header-Block.

Komponenten von links nach rechts:

| Komponente | Klasse / Sichtbarkeit | Aktion |
|------------|------------------------|--------|
| **Workspace-Switcher** (Space-M) | immer | oeffnet `MacherWorkspaceSwitcher` Dropdown |
| **Suche** (`GlobalSearch`) | `hidden sm:block` | nur Tablet+ |
| **Open-Tabs + Hamburger** (`OpenModuleTabs`) | `hidden md:flex` | nur Desktop |
| **Spacer** | `flex-1 md:hidden` | nur Mobile |
| **Tab-Counter** (`Square`-Icon) | `md:hidden` | oeffnet `MobileTabSwitcher` |
| **Status-Badge** | optional | Relay-Status |
| **Vergroesserung** (`FullscreenButton`) | immer | Browser-Vollbild (in der nativen App spaeter weg) |
| **Settings** (Zahnrad) | immer | oeffnet `SpaceSettings` |
| **UserMenu** (Profil-M) | immer | Dropdown — Profil / Kontakte / Verify / Logout |

**Bottom-Nav:** ausgeschaltet (`withBottomNav={false}`). Es gibt keine untere Leiste auf Mobile.

---

## Vollbild-Switcher

Datei: [src/components/MobileTabSwitcher.tsx](src/components/MobileTabSwitcher.tsx).

### Header

- Schliessen-Pfeil links (← oder Escape)
- 3-Reiter-Tab-Bar: **Spaces · Module · Profil**
- Aktiver Reiter mit Unterstrich-Indikator in Theme-Primary

### Reiter-Inhalte

#### Spaces-Reiter
2-Spalten-Karten-Grid aller Workspaces.

| Element | Quelle |
|---------|--------|
| Avatar | `group.data.image` / `group.data.avatar`, sonst Initial im Kreis |
| Name | `group.name` |
| Aktiv-Highlight | `activeSpaceId === space.id` → Ring + *Aktiv*-Label |
| Overview-Spezial | `scope === 'overview'` → Compass-Icon, Karte zuerst |

Klick → `onSelectSpace(id)` + Switcher schliesst.

#### Module-Reiter
Zwei Sektionen untereinander:
1. **Offene Module** — 2-Spalten-Karten, X auf jeder Karte schliesst den Tab (ausser bei letztem Tab)
2. **Verfuegbare Module** — kompakte Liste mit Icon + Name + Plus-Pfeil

Klick auf eine offene Karte → springt dorthin + Switcher schliesst.
Klick auf eine Listen-Zeile → oeffnet als neuen Tab + Switcher schliesst.

#### Profil-Reiter
- Avatar (gross zentriert) + Name + verkuerzte DID als Mono-Chip
- Aktions-Liste:
  - **Profil bearbeiten** → `onEditProfile()`
  - **Kontakte** (mit Counter-Badge) → `onOpenContacts()`
  - **Identitaet pruefen** → `onVerifyIdentity()`
  - **Abmelden** (rot) → `onLogout()`

Aktionen schliessen den Switcher und triggern den jeweiligen Vollbild-Dialog.

### Footer (kontext-sensitiv)

| Reiter | Drei-Punkte links | + rechts |
|--------|-------------------|----------|
| **Spaces** | Space-Einstellungen (Allgemein-Tab) | Neuer Space (Group-Dialog) |
| **Module** | Modul-Einstellungen (Module-Tab fuer aktives Modul) | — |
| **Profil** | — (Aktionen sind in der Liste) | — |

Wenn beide Seiten leer → Footer komplett ausgeblendet (z.B. Profil-Reiter).

---

## Edge-Swipe

Datei: [src/components/use-edge-swipe.ts](src/components/use-edge-swipe.ts).

Wischen am linken/rechten Bildschirmrand wechselt zwischen den **offenen Modulen** (Reihenfolge `openModuleIds`). Funktioniert auch mit dem Vollbild-Switcher zusammen — der Switcher ist die zweite Hand fuer den Wechsel.

---

## Komponenten-Verantwortung

| Komponente | Datei | Verantwortet |
|-----------|-------|--------------|
| `MobileTabSwitcher` | `src/components/MobileTabSwitcher.tsx` | Vollbild-Modal mit 3 Reitern + Footer |
| `useEdgeSwipe` | `src/components/use-edge-swipe.ts` | Wisch-Geste am Rand |
| `OpenModuleTabs` | `src/components/OpenModuleTabs.tsx` | Tab-Leiste auf Desktop (Browser-Style) |
| `GlobalSearch` | `src/components/GlobalSearch.tsx` | Suche auf Tablet+ |
| `FullscreenButton` | `src/components/FullscreenButton.tsx` | Browser-Vollbild |

`MobileTabSwitcher` nimmt **alle** Daten + Callbacks per Props — keine eigenen Hooks. So bleibt die Komponente reine Sicht; `MacherApp` orchestriert den Rest.

---

## Was bewusst NICHT da ist

- **Bottom-Nav** — auf Mobile gibt's keine untere Tab-Leiste mehr.
- **Hamburger-Menue auf Mobile** — der Tab-Counter ersetzt es.
- **Suche auf Mobile-Topbar** — die Suche kommt in die Reiter (geplant fuer N5).
- **Tab-Zaehl-Badge im Counter** — bewusst weggelassen (Timo: *"da müssen wir keine Zahl reinpacken"*).

---

## Pattern-Regeln

1. **Browser-Modell als Vorbild.** Wenn unklar wie etwas auf Mobile aussehen soll: schau zu Firefox/Chrome. Patterns sind getestet, Nutzer kennen sie.
2. **Kontext-Footer.** Drei-Punkte = Einstellungen, + = neu. Pro Reiter eine eigene Bedeutung. Aussendruecken: konsistent, innen: spezifisch.
3. **Aktionen spiegeln.** Was im UserMenu steht, steht auch im Profil-Reiter. Single Source of Truth, mehrere Sichten.
4. **Keine eigenen States in Sub-Views.** Wie `SpacesView`, `ModulesView`, `ProfileView` — alle erhalten Daten und Callbacks von oben. Test- und wartungsfreundlich.
5. **`md:hidden` und `hidden md:flex`.** Tailwind-Breakpoint `md` (768px) ist die Grenze zwischen Mobile und Desktop. Der Switcher ist immer da, aber nur ueber den Mobile-Counter erreichbar.

---

## Was als naechstes kommt (offene Phasen)

- **N5 — Spaces durchsuchen.** Alle Spaces im Netz, Hashtag-Filter, Discovery-Karten.
- **N6 — Dashboard-Personalisierung pro Space.** Module als *Dashboard-Modul* markieren. Vorbild Chrome-Startbildschirm.
- **N7 — Profil-Reiter-Ausbau.** Identitaet-Block als Karte, mehrere Identitaeten (Trust-Tokens, Personen-Trennung).
- **PWA-Schliff.** Wenn als App installiert, faellt der Vergroesserungs-Knopf weg.
