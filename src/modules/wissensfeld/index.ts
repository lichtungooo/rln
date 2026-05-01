/**
 * Wissensfeld — ein Spiegel des kollektiven Bewusstseins.
 *
 * Phase W1 (01.05.2026): Frage saeen, Antwort tragen, Themen-Felder,
 * Tags. W2 bringt Resonanz interaktiv. W3 webt Rhizom + Wissensgraph.
 * W4 traegt Konsent (Vorschlag → Einwand → Entscheidung).
 *
 * Vision: Real-Life-Network/Konzepte/WISSENSFELD-SPEZIFIKATION.md
 */
import { Flame } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { WissensfeldView } from "./WissensfeldView"
import { WISSENSFELD_ITEM_TYPES } from "./types"

export const wissensfeldModule: ModuleDefinition = {
  id: "wissensfeld",
  label: "Wissensfeld",
  icon: Flame,
  View: WissensfeldView,
  itemTypes: [
    WISSENSFELD_ITEM_TYPES.frage,
    WISSENSFELD_ITEM_TYPES.antwort,
    WISSENSFELD_ITEM_TYPES.erkenntnis,
    WISSENSFELD_ITEM_TYPES.vorschlag,
    WISSENSFELD_ITEM_TYPES.entscheidung,
  ],
  requiredCapabilities: ["ItemWriter"],
}

export {
  WISSENSFELD_ITEM_TYPES,
  THEMEN_FELDER,
  type FrageData,
  type AntwortData,
  type ErkenntnisData,
  type VorschlagData,
  type EntscheidungData,
  type ResonanzData,
  type ThemenFeld,
} from "./types"
export { useWissensfeld } from "./use-wissensfeld"
