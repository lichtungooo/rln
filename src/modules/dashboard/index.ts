/**
 * Dashboard-Modul — der private Spiegel.
 *
 * Liest cross-Modul-Daten (Skill-Tree-Progress, Quests, Log, Calendar) und
 * rendert sie als Widget-Grid. Konfigurierbar in spaeteren Phasen.
 */
import { LayoutDashboard } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { DashboardView } from "./DashboardView"

export const dashboardModule: ModuleDefinition = {
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  View: DashboardView,
  itemTypes: ["user-progress", "log-entry", "quest", "event"],
  requiredCapabilities: ["ItemWriter"],
}
