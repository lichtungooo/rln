/**
 * Settings-Modul — kein Dialog mehr, sondern eine echte Modul-View.
 *
 * Vollbild wie Dashboard. Tab-Bar oben (PageGrid mit lockPages),
 * 3-Spalten-Drilldown im Slot. Klick auf das globale Settings-Zahnrad
 * navigiert zu /<slug>/settings.
 */
import { Settings as SettingsIcon } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { SettingsView } from "../../settings/SpaceSettings"

export const settingsModule: ModuleDefinition = {
  id: "settings",
  label: "Einstellungen",
  icon: SettingsIcon,
  fullWidth: true,
  View: SettingsView,
}
