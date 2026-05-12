/**
 * Settings-Modul — Vollbild-Modul-Route /<slug>/settings.
 *
 * Aufbau: PageGrid mit lockPages (5 Tabs als Pages) + pro Tab eigene
 * Slot-Konfig. Mobile-Drilldown ueber PageGrid mobileDrilldown=true.
 * Klick-Routing ueber SelectionContext-Channels.
 *
 * Architektur-Doktrin: feedback_klick_routing_doktrin.md
 * Neubau-Plan: project_settings_neubau.md
 */
import { Settings as SettingsIcon } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { SettingsView } from "../../settings/SettingsView"

export const settingsModule: ModuleDefinition = {
  id: "settings",
  label: "Einstellungen",
  icon: SettingsIcon,
  fullWidth: true,
  View: SettingsView,
}
