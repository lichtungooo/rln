import {
  Compass,
  Heart,
  BookOpen,
  Sprout,
  Handshake,
  Flower2,
  Sword,
  type LucideIcon,
} from "lucide-react"
import type { TreeBereichId } from "./tree"

/**
 * Archetypen — sieben Wege durch das Leben.
 *
 * Vision (07-Gamification.md): "Klasse aendert nicht *was* der Mensch
 * tun darf, sondern *wie* XP zufliesst + welche Quests vorgeschlagen
 * werden — Einladung, keine Mauer."
 *
 * Pro Space waehlbar (User entscheidet). Mehrere gleichzeitig moeglich
 * — der Mensch ist nicht eine Sache, er traegt mehrere Wege.
 *
 * Pro Archetyp:
 *  - bevorzugte Bereiche (XP fliesst staerker dort hin — als Hinweis,
 *    Multiplier kommt in Phase E spaeter)
 *  - Titel-Vorschlaege (poetisch, auswaehlbar oder eigener Titel)
 *  - typische Quests (Vorschlag — die Quest-Empfehlung-Engine nutzt das)
 */

export type ArchetypeId =
  | "pionier"
  | "heiler"
  | "weiser"
  | "bauer"
  | "brueckenbauer"
  | "mutter"
  | "krieger"

export interface Archetype {
  id: ArchetypeId
  label: string
  description: string
  /** Eine kurze Frage die diesen Archetyp zeichnet */
  question: string
  icon: LucideIcon
  color: string
  /** Bevorzugte Bereiche — XP fliesst staerker dort hin */
  preferredBereiche: TreeBereichId[]
  /** Vorschlaege fuer Titel mit "der" / "die" davor */
  titleSuggestions: string[]
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "pionier",
    label: "Pionier",
    description: "Geht voraus, oeffnet neue Pfade, riskiert das Unbekannte",
    question: "Was hat noch niemand versucht?",
    icon: Compass,
    color: "#F59E0B",
    preferredBereiche: ["bewusstsein", "geist", "soziales"],
    titleSuggestions: ["Pionier", "Pfadfinder", "Wegbereiter", "Wagemutige", "Erkunderin"],
  },
  {
    id: "heiler",
    label: "Heiler",
    description: "Sieht Wunden, traegt Salbe, bringt zurueck in die Mitte",
    question: "Wer braucht eine Hand?",
    icon: Heart,
    color: "#EC4899",
    preferredBereiche: ["seele", "soziales", "koerper"],
    titleSuggestions: ["Heiler", "Heilerin", "Hueter", "Hueterin", "Salbentraeger"],
  },
  {
    id: "weiser",
    label: "Weiser",
    description: "Sieht das Muster, fragt das Wesentliche, lehrt durch Stille",
    question: "Was ist hier die Frage hinter der Frage?",
    icon: BookOpen,
    color: "#A855F7",
    preferredBereiche: ["geist", "bewusstsein", "seele"],
    titleSuggestions: ["Weise", "Weiser", "Frager", "Zeugin", "Lehrer"],
  },
  {
    id: "bauer",
    label: "Bauer",
    description: "Pflegt das Land, baut mit Geduld, naehrt die Vielen",
    question: "Was muss ich saen, was muss ich pflegen?",
    icon: Sprout,
    color: "#10B981",
    preferredBereiche: ["koerper", "handwerk", "gemeinschaft"],
    titleSuggestions: ["Bauer", "Baeuerin", "Hueter des Gartens", "Hueterin der Felder", "Gaertner"],
  },
  {
    id: "brueckenbauer",
    label: "Brueckenbauer",
    description: "Verbindet was getrennt war, uebersetzt zwischen Welten",
    question: "Wer redet noch nicht mit wem?",
    icon: Handshake,
    color: "#3B82F6",
    preferredBereiche: ["soziales", "gemeinschaft", "geist"],
    titleSuggestions: ["Brueckenbauer", "Brueckenbauerin", "Verbinder", "Verbinderin", "Uebersetzerin"],
  },
  {
    id: "mutter",
    label: "Mutter",
    description: "Haelt den Raum, naehrt das Kleine, traegt das Ganze",
    question: "Was wird hier geboren?",
    icon: Flower2,
    color: "#F97316",
    preferredBereiche: ["seele", "gemeinschaft", "koerper"],
    titleSuggestions: ["Mutter", "Vater", "Hueterin des Raumes", "Hueter des Feuers", "Wurzel"],
  },
  {
    id: "krieger",
    label: "Krieger",
    description: "Schuetzt was wertvoll ist, steht ein, wenn es brennt",
    question: "Was muss verteidigt werden?",
    icon: Sword,
    color: "#EF4444",
    preferredBereiche: ["koerper", "soziales", "bewusstsein"],
    titleSuggestions: ["Krieger", "Kriegerin", "Wache", "Wachende", "Schuetzer"],
  },
]

export function getArchetype(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id)
}
