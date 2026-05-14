/**
 * Skill-Bahn-Modul — neue Visualisierung der Skill-Ketten.
 *
 * Zeigt die Hauptketten pro Bereich als horizontale Bahn mit Tier-Stufen.
 * Anschluss an das neue Skill-System (skill-system.ts) ab 14.05.2026.
 *
 * Modul-ID: skill-bahn
 * Route: /<slug>/skill-bahn
 */

import { Route } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { SkillBahnView } from "./SkillBahnView"

export const skillBahnModule: ModuleDefinition = {
  id: "skill-bahn",
  label: "Skill-Bahn",
  icon: Route,
  View: SkillBahnView,
  fullWidth: true,
  itemTypes: [],
  requiredCapabilities: [],
}

export { SkillBahnView }
export { SkillKettenBahn } from "./SkillKettenBahn"
