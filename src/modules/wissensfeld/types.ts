/**
 * Wissensfeld — Datenmodell.
 *
 * Fünf Item-Typen, die zusammen einen Spiegel des kollektiven Bewusstseins
 * tragen. Jeder Typ ist eigenstaendig, jeder traegt sein Wesen:
 *
 *   - frage         — Der Samen. Sie ruft nach Antwort.
 *   - antwort       — Die Bluete. Sie steht fuer sich.
 *   - erkenntnis    — Was ein Kreis erkannt hat.
 *   - vorschlag     — Im Konsent gepruefter Weg.
 *   - entscheidung  — Was die Gemeinschaft sich gibt.
 *
 * Alle leben als Items im WoT-Doc. Sichtbar fuer das Vertrauensnetz.
 */

import type { TreeBereichId } from "../gamification"

export const WISSENSFELD_ITEM_TYPES = {
  frage: "frage",
  antwort: "antwort",
  erkenntnis: "erkenntnis",
  stimmungsbild: "stimmungsbild",
  vorschlag: "vorschlag",
  entscheidung: "entscheidung",
} as const

// ============================================================
// Themen-Felder — Einladungen, keine Schubladen
// ============================================================

/**
 * Die zehn Themen-Felder aus der Vision. Tags duerfen frei sein, doch diese
 * Felder bilden das Grundgewebe — ein Wissens-Rhizom, in dem alles mit
 * allem verknuepft sein darf.
 *
 * Jedes Feld ist mit einem Bereich aus dem Skill-Tree verbunden — das
 * macht das Wissensfeld anschlussfaehig an die Avatar-Reise.
 */
export interface ThemenFeld {
  id: string
  label: string
  hint: string
  /** Welcher Skill-Tree-Bereich resoniert mit diesem Feld? */
  bereichId?: TreeBereichId
  /** Lucide-Icon-Name */
  icon: string
  /** Hex-Farbe */
  color: string
}

export const THEMEN_FELDER: ThemenFeld[] = [
  {
    id: "seele-geist-bewusstsein",
    label: "Seele, Geist, Bewusstsein",
    hint: "Verbindung mit dem Hoeheren Selbst, Meditation, innere Wahrheit",
    bereichId: "seele",
    icon: "Sparkles",
    color: "#A855F7",
  },
  {
    id: "koerper-heilung",
    label: "Koerper & Heilung",
    hint: "Naturheilkunde, Ernaehrung, Bewegung, Gesundheit",
    bereichId: "koerper",
    icon: "Heart",
    color: "#EF4444",
  },
  {
    id: "natur-schoepfung",
    label: "Natur & Schoepfung",
    hint: "Permakultur, Erdverbindung, Pflanzenmedizin, Jahreszyklen",
    bereichId: "koerper",
    icon: "Leaf",
    color: "#10B981",
  },
  {
    id: "naturrecht-souveraenitaet",
    label: "Naturrecht & Souveraenitaet",
    hint: "Eigenermaechtigung, indigener Status, Freiheit",
    bereichId: "geist",
    icon: "Scale",
    color: "#F59E0B",
  },
  {
    id: "gemeinschaft-vertrauen",
    label: "Gemeinschaft & Vertrauen",
    hint: "Kreise, Familien, Doerfer, Verbuende",
    bereichId: "gemeinschaft",
    icon: "Users",
    color: "#3B82F6",
  },
  {
    id: "macht-befreiung",
    label: "Macht & Befreiung",
    hint: "Eigenverantwortung, wie Macht funktioniert, wie sie zurueckkehrt",
    bereichId: "bewusstsein",
    icon: "Sun",
    color: "#FBBF24",
  },
  {
    id: "handwerk-kreativitaet",
    label: "Handwerk & Kreativitaet",
    hint: "Kunst, Handwerk, Musik, Spiel",
    bereichId: "handwerk",
    icon: "Hammer",
    color: "#E8751A",
  },
  {
    id: "wertschoepfung-austausch",
    label: "Wertschoepfung & Austausch",
    hint: "Begabung x Beduerfnis x Begegnung, jenseits Geld-als-Massstab",
    bereichId: "soziales",
    icon: "HandHeart",
    color: "#EC4899",
  },
  {
    id: "wissen-weisheit",
    label: "Wissen, Weisheit & Weitergabe",
    hint: "Lernen, Bildung, Information vs Weisheit, Aeltestenwissen",
    bereichId: "geist",
    icon: "BookOpen",
    color: "#6366F1",
  },
  {
    id: "heimat-ahnen",
    label: "Heimat & Ahnen",
    hint: "Verwurzelung, Familie, Herkunft, was uns mit den Vorfahren verbindet",
    bereichId: "seele",
    icon: "TreePine",
    color: "#84CC16",
  },
]

// ============================================================
// Item-Daten
// ============================================================

export interface FrageData {
  /** Die Frage selbst — kurz, klar, Samen */
  content: string
  /** Rhizomatische Tags ohne #-Zeichen */
  tags: string[]
  /** Aus welchem Kreis kommt sie? Free-Text oder Kreis-ID (spaeter). */
  circleOrigin?: string
  /** Ort des Entstehens (optional) */
  location?: { lat: number; lng: number; address?: string }
  /** Vorformulierte Antwort-Impulse — Einladungen, keine Wahrheiten */
  suggestedAnswers?: string[]
  /** Themen-Feld-IDs aus THEMEN_FELDER */
  felder?: string[]
}

/** Resonanz-Signale: User-IDs derer, die das Signal gegeben haben. */
export interface ResonanzData {
  /** 🌱 Das beruehrt mich */
  beruehrt: string[]
  /** 🔥 Das will ich im Kreis besprechen */
  willBesprechen: string[]
}

export interface AntwortData {
  /** Die Antwort selbst — eigenstaendig, nicht kommentiert */
  content: string
  /** ID der Frage auf die geantwortet wird */
  frageId: string
  /** Tags */
  tags: string[]
  /** Aus einem Kreis entstanden? */
  circleOrigin?: string
  /** Resonanz-Signale */
  resonanz: ResonanzData
  /** Themen-Felder */
  felder?: string[]
}

/**
 * Stimmungsbild — schnelle Konsent-Abfrage ohne 5-Status-Workflow.
 * Drei Resonanz-Stufen, kein Einwand-Drama. "Wo stehen wir gerade?"
 */
export interface StimmungsbildSignale {
  /** ✨ Lebendig in mir */
  lebendig: string[]
  /** 🌊 Noch im Werden */
  werdend: string[]
  /** ✋ Nicht meins */
  fremd: string[]
}

export interface StimmungsbildData {
  /** Kurze Frage — "Wie steht ihr zu...?" */
  content: string
  /** Tags fuer das Wissens-Netz */
  tags?: string[]
  /** Themen-Felder */
  felder?: string[]
  /** Signale */
  signale: StimmungsbildSignale
  /** Aus welchem Kreis kam die Frage? */
  circleOrigin?: string
  /** Wann wird das Stimmungsbild geschlossen? Optional. */
  closesAt?: string
}

export interface ErkenntnisData {
  /** Was wurde erkannt? */
  content: string
  /** Tags */
  tags: string[]
  /** Aus welchem Kreis kam sie? */
  circleOrigin: string
  /** Wann (ISO-Date) */
  circleDate: string
  /** Welche Frage wird damit geklaert? (optional) */
  frageId?: string
  /** Themen-Felder */
  felder?: string[]
}

export type VorschlagStatus =
  | "offen"
  | "im-kreis"
  | "einwandpruefung"
  | "angenommen"
  | "zurueck-im-kreis"

export interface VorschlagSignale {
  /** ✅ Kann ich mittragen */
  mittragen: string[]
  /** ⚠️ Habe Bedenken — braucht weiteren Kreis */
  bedenken: string[]
  /** 🛑 Schwerwiegender Einwand */
  einwand: string[]
}

export interface VorschlagData {
  /** "Wir schlagen vor, dass..." */
  content: string
  /** Tags */
  tags: string[]
  /** Aktueller Status im Konsent-Prozess */
  status: VorschlagStatus
  /** Status-Aenderung-Verlauf */
  signale: VorschlagSignale
  /** Welche Frage motivierte den Vorschlag? */
  frageId?: string
  /** Themen-Felder */
  felder?: string[]
}

export interface EntscheidungData {
  /** Was wurde entschieden? */
  content: string
  /** Tags */
  tags: string[]
  /** In welchem Kreis? */
  circleOrigin: string
  /** Wann (ISO-Date) */
  circleDate: string
  /** Welche Erkenntnisse flossen ein? Item-IDs */
  grundlage?: string[]
  /** Aus welchem Vorschlag entstand sie? */
  vorschlagId?: string
  /** Welche Frage klaert sie? */
  frageId?: string
  /** Themen-Felder */
  felder?: string[]
}
