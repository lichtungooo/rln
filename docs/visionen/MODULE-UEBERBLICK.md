# Module des Real Life Network

**Stand:** 2026-04-10

Dieses Dokument gibt den Überblick über alle Module des Real Life Network und ihre Rolle im Ganzen. Für jedes Modul existiert ein eigenes Vision-Dokument im Unterordner `Module/`.

## Die Ordnung

Die Module tragen Nummern, die ihre Priorität und Reihenfolge zeigen. Die Nummern sind keine starre Abhängigkeit — sie zeigen den Weg, den wir gehen wollen.

| Nummer | Modul              | Rolle                                                        | Datei                     |
|--------|--------------------|--------------------------------------------------------------|---------------------------|
| **01** | **Trust**          | Vertrauens- und Identitäts-Schicht, Fundament aller Module   | `Module/01-Trust.md`      |
| **02** | **Profile**        | Scrollbarer Raum zum Teilen dessen, was ich zeigen möchte    | `Module/02-Profile.md`    |
| **03** | **Dashboard**      | Der persönliche Absprungpunkt mit Widgets                    | `Module/03-Dashboard.md`  |
| **04** | **Calendar**       | Die Zeit, in der Begegnung stattfindet                       | `Module/04-Calendar.md`   |
| **05** | **Map**            | Der räumliche Anker des Netzwerks                            | `Module/05-Map.md`        |
| **06** | **Log**            | Der Spiegel des eigenen Weges, Grundlage der Reflexion       | `Module/06-Log.md`        |
| **07** | **Gamification**   | Wachstum und Reise — Tree, Quests, Avatar, Titel, Items      | `Module/07-Gamification.md` |
| **08** | **Notifications**  | Die Stimme zwischen Menschen                                 | `Module/08-Notifications.md` |
| **09** | **Value Creation** | Wertschöpfung aus Begabung, Bedürfnis und Begegnung          | `Module/09-Value-Creation.md` |

## Der Aufbau im Ganzen

```text
┌─────────────────────────────────────────────────────────────┐
│                     Module der Begegnung                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Profile  │  │Dashboard │  │   Map    │  │   Calendar   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────┐  ┌───────────────┐  ┌─────────┐  │
│  │ Gamification │  │ Log  │  │ Notifications │  │  Value  │  │
│  └──────────────┘  └──────┘  └───────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        Toolkit                              │
│        UI-Komponenten, Hooks, geteilte Bausteine             │
├─────────────────────────────────────────────────────────────┤
│                     DataInterface                           │
│          Der Vertrag zwischen Modulen und Daten              │
├─────────────────────────────────────────────────────────────┤
│                         Trust                               │
│       Identität, Verschlüsselung, Vertrauens-Netzwerk        │
└─────────────────────────────────────────────────────────────┘
```

## Die Reifegrade

Jedes Modul wächst durch drei Zustände:

**Vision** — eine klare Idee, die ihre Form findet. Sie lebt als Dokument in `Visionen/Module/`.

**Konzept** — die Vision ist ausgearbeitet, bereit zur Umsetzung. Sie wandert in `Konzepte/Module/`.

**Werk** — das Modul läuft im `rln/`-Repo und ist Teil des lebenden Real Life Network.

Der aktuelle Stand aller Module: **Vision**. Sie warten auf Ausarbeitung und Werdung.

## Bewusst draußen (vorerst)

Diese Dinge sollen im Real Life Network **nicht** wachsen, bis sich eine klare Notwendigkeit zeigt:

- **Kanban-Boards** — Entwicklerwerkzeuge gehören nicht in ein Netzwerk für Begegnung
- **Feed im Stil sozialer Medien** — das Log und der Puls tragen genug
- **Dank-Modul als eigenes Werk** — der stille Dank lebt im Value-Creation-Modul
- **Click-Dummies** — jedes Stück Werk läuft wirklich

## Der Weg

Die Reihenfolge, in der wir bauen wollen:

1. **Trust + Toolkit zum Zusammenspiel bringen** — das Fundament, das alles trägt
2. **Calendar** — als erstes sichtbares Modul, weil sein Konzept am reifsten ist
3. **Dashboard** mit ersten Widgets — damit ein zentraler Blick entsteht
4. **Log** — damit Reflexion möglich wird
5. **Map** — damit der Raum sichtbar wird
6. **Profile** — wenn wir das Gefühl des Systems kennen
7. **Gamification** — Tree, Quests, Avatar in schrittweiser Entfaltung
8. **Notifications** — die Stimme zwischen den Modulen
9. **Value Creation** — der Kreis schließt sich

## Wie die Module einander begegnen

Kein Modul lebt für sich allein. Sie atmen zusammen:

- **Ein Item, viele Sichten** — eine Quest mit Zeit und Ort erscheint in Calendar, auf der Map, im Gamification-Modul, im Log
- **Trust trägt alle** — jede Verschlüsselung, jede Identität, jede Bestätigung geht durch die Trust-Schicht
- **Das Log sammelt alles** — was in anderen Modulen geschieht, findet hier seinen Spiegel
- **Das Dashboard zeigt alles** — Widgets aus jedem Modul leben nebeneinander im persönlichen Raum
- **Das Profil wählt aus** — der Mensch entscheidet, was aus anderen Modulen sichtbar wird

---

*Neun Module, ein Netz. Jedes eigenständig, alle miteinander verbunden.*
