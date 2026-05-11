/**
 * Tree-Schema fuer das Gamification-Modul.
 *
 * Acht universelle Bereiche, fest im Code (in jedem Space gleich, damit
 * der Charakter zwischen Spaces reisen kann). Skills unter den Bereichen
 * sind pro Space frei definierbar (Items vom Typ `skill`).
 *
 * Stand 11.05.2026 — Phase F1: Natur als 8. Saeule.
 *   Permakultur, Imkern, Heilpflanzen, Bushcraft, Solarpunk tragen so
 *   viel Tiefe, dass sie eigene Skill-Welt sind. WEF "Environmental
 *   Stewardship", Gardners Naturalistic Intelligence, Schauberger und
 *   Steiner zeigen alle in diese Richtung.
 *
 * Stand 01.05.2026 — Erweiterung um Bereich "Handwerk" gegenueber
 * Visionsdokument (das 6 Bereiche nennt). Begruendung in
 * `project_gamification_stack.md` (Memory).
 */

import { Heart, Brain, Flame, Sun, Users, Hammer, Sparkles, Leaf, type LucideIcon } from "lucide-react"

export type TreeBereichId =
  | "koerper"
  | "geist"
  | "seele"
  | "bewusstsein"
  | "soziales"
  | "gemeinschaft"
  | "handwerk"
  | "natur"

export interface TreeBereich {
  id: TreeBereichId
  label: string
  /** Kurze Beschreibung — was traegt dieser Bereich. */
  description: string
  /** Was traegt der Mensch in sich, wenn er hier wirkt. */
  spirit: string
  /** Hauptfarbe (Hex) — fuer Visualisierung des Bereichs. */
  color: string
  /** Icon aus lucide-react. */
  icon: LucideIcon
}

export const TREE_BEREICHE: TreeBereich[] = [
  {
    id: "koerper",
    label: "Koerper",
    description: "Was der Koerper kann und traegt",
    spirit: "Staerke, Ausdauer, Vitalitaet",
    color: "#EF4444",
    icon: Heart,
  },
  {
    id: "geist",
    label: "Geist",
    description: "Denken, Verstehen, Lernen",
    spirit: "Intellekt, Klarheit, Fokus",
    color: "#3B82F6",
    icon: Brain,
  },
  {
    id: "seele",
    label: "Seele",
    description: "Tiefe, Bestimmung, Hingabe",
    spirit: "Tiefe, Hingabe, Resonanz",
    color: "#A855F7",
    icon: Flame,
  },
  {
    id: "bewusstsein",
    label: "Bewusstsein",
    description: "Praesenz, Wachheit, Weite",
    spirit: "Praesenz, Weite, Wachheit",
    color: "#F59E0B",
    icon: Sun,
  },
  {
    id: "soziales",
    label: "Soziales",
    description: "Begegnung mit einzelnen Menschen",
    spirit: "Empathie, Mut, Ausstrahlung",
    color: "#EC4899",
    icon: Users,
  },
  {
    id: "gemeinschaft",
    label: "Gemeinschaft",
    description: "Wirken in Gruppen",
    spirit: "Vertrauen, Verlaesslichkeit, Vision",
    color: "#10B981",
    icon: Sparkles,
  },
  {
    id: "handwerk",
    label: "Handwerk",
    description: "Mit den Haenden formen, was die Welt traegt",
    spirit: "Praezision, Geduld, Material",
    color: "#E8751A",
    icon: Hammer,
  },
  {
    id: "natur",
    label: "Natur",
    description: "Pflanzen, Tiere, Wetter — das lebendige Feld lesen und ehren",
    spirit: "Wurzel, Lebendigkeit, Verbundenheit",
    color: "#65A30D",
    icon: Leaf,
  },
]

export const BEREICH_BY_ID: Record<TreeBereichId, TreeBereich> = TREE_BEREICHE.reduce(
  (acc, b) => ({ ...acc, [b.id]: b }),
  {} as Record<TreeBereichId, TreeBereich>
)

/**
 * Drei innere Bereiche fuer den Synergie-Bonus (Backward Compat).
 * Wird in der Synergie-Liste unten als "Innerer Dreiklang" gespiegelt.
 */
export const INNERE_BEREICHE: TreeBereichId[] = ["seele", "geist", "bewusstsein"]

/**
 * Synergien — Bereiche, die zusammenwachsen, geben einen stillen Bonus.
 *
 * Wenn eine Aktion XP auf ALLE Bereiche einer Synergie verteilt, bekommt
 * sie den Bonus. Mehrere Synergien koennen in einer Aktion gleichzeitig
 * aktiv sein — die Boni addieren sich.
 *
 * Anti-Konsum-Prinzip: kein lautes Feedback, keine Push-Notifications.
 * Die Synergie leuchtet still im Tree.
 *
 * Recherche: skilltree-vertiefung/02-tree-architektur.md (Block F.5),
 *            skilltree-vertiefung/01-skill-universum.md (Block D.4).
 */
export interface Synergie {
  /** Eindeutige ID */
  id: string
  /** Anzeigename */
  name: string
  /** Welche Bereiche muessen zusammenwachsen */
  bereiche: TreeBereichId[]
  /** Bonus-Quote auf die Summe der Synergie-XP (z.B. 0.25 = +25%) */
  bonus: number
  /** Kurze Beschreibung — was traegt diese Synergie */
  spirit: string
}

export const SYNERGIES: Synergie[] = [
  {
    id: "innerer-dreiklang",
    name: "Innerer Dreiklang",
    bereiche: ["seele", "geist", "bewusstsein"],
    bonus: 0.25,
    spirit: "Wenn die drei eins werden, kannst du alles.",
  },
  {
    id: "werkstoff",
    name: "Werkstoff",
    bereiche: ["koerper", "handwerk"],
    bonus: 0.10,
    spirit: "Hand und Werk fliessen — das Tun durchstroemt den Koerper.",
  },
  {
    id: "resonanz",
    name: "Resonanz",
    bereiche: ["soziales", "gemeinschaft"],
    bonus: 0.10,
    spirit: "Naehe und Wirkung wachsen zusammen — Mensch traegt Wir.",
  },
  {
    id: "klarheit",
    name: "Klarheit",
    bereiche: ["geist", "bewusstsein"],
    bonus: 0.10,
    spirit: "Denken und Gewahrsein vereint — der Blick wird scharf.",
  },
  {
    id: "herz-feuer",
    name: "Herz-Feuer",
    bereiche: ["seele", "gemeinschaft"],
    bonus: 0.15,
    spirit: "Gefuehl wird Tat fuer das Ganze — tiefe Verbindung.",
  },
  {
    id: "vollkreis",
    name: "Vollkreis",
    bereiche: ["koerper", "geist", "seele", "bewusstsein", "soziales", "gemeinschaft", "handwerk", "natur"],
    bonus: 0.50,
    spirit: "Alle acht zugleich. Sehr selten. Wakan-Resonanz.",
  },
]

// ============================================================
// Level-Berechnung
// ============================================================

/**
 * Klassische RPG-Kurve: Level n braucht 100 * n^1.5 XP.
 * Level 1: 100, Level 2: 282, Level 3: 519, Level 5: 1118, Level 10: 3162.
 *
 * Ergibt sich gemaechlich + macht hoehere Level wertvoll. Justierbar wenn
 * Live-Daten das anders verlangen.
 */
export function xpToLevel(xp: number): number {
  if (xp <= 0) return 0
  return Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.ceil(100 * Math.pow(level - 1, 1.5))
}

export function progressInLevel(xp: number): { level: number; xpInLevel: number; xpNeeded: number; ratio: number } {
  const level = xpToLevel(xp)
  const startOfLevel = xpForLevel(level)
  const startOfNext = xpForLevel(level + 1)
  const xpInLevel = xp - startOfLevel
  const xpNeeded = startOfNext - startOfLevel
  return {
    level,
    xpInLevel,
    xpNeeded,
    ratio: xpNeeded > 0 ? xpInLevel / xpNeeded : 0,
  }
}
