import { Aperture } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { SpiegelView, spiegelDefaultConfig, type SpiegelModuleConfig } from "./SpiegelView"

/**
 * Spiegel-Modul — drei Linsen auf denselben Menschen.
 *
 * Avatar (wer du bist) + Quest (was du tust) + Skill (was du kannst).
 * Drei Tabs, ein Modul. Ersetzt drei separate Modul-Tabs durch eine
 * konsistente Sicht — wie das AC-Charakter-Sheet.
 */
export const spiegelModule: ModuleDefinition<SpiegelModuleConfig> = {
  id: "spiegel",
  label: "Profil",
  icon: Aperture,
  View: SpiegelView,
  defaultConfig: spiegelDefaultConfig,
  itemTypes: [
    "skill",
    "user-progress",
    "log-entry",
    "avatar-item",
    "user-avatar",
    "quest",
    "quest-completion",
    "past-experience",
    "via-result",
  ],
  requiredCapabilities: ["ItemWriter"],
}

export type { SpiegelModuleConfig, SpiegelTab } from "./SpiegelView"
