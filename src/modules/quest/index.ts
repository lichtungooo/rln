/**
 * Quest-Modul — klare Aufgaben mit klarer Belohnung.
 *
 * Items vom Typ `quest` werden im Modul angelegt + abgeschlossen. Beim
 * Abschluss verteilt die Quest-Engine XP auf Skills + Bereiche, verleiht
 * Avatar-Items und schreibt einen Log-Eintrag.
 *
 * Phase B1 (01.05.2026): nur Self-Report-Verification (Klick "Erledigt").
 * QR/Peer/Attestation kommen in Phase B2.
 */
import { Trophy } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { QuestView, questDefaultConfig, type QuestModuleConfig } from "./QuestView"

export const questModule: ModuleDefinition<QuestModuleConfig> = {
  id: "quest",
  label: "Quests",
  icon: Trophy,
  View: QuestView,
  defaultConfig: questDefaultConfig,
  itemTypes: ["quest", "quest-completion"],
  requiredCapabilities: ["ItemWriter"],
}

export type { QuestModuleConfig } from "./QuestView"
export { useQuests, QUEST_COMPLETION_TYPE } from "./use-quests"
export type { QuestData } from "./quest-engine"
