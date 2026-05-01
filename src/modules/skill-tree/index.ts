/**
 * Skill-Tree-Modul — Faehigkeitenbaum sichtbar machen.
 *
 * Visualisiert:
 *   - Total-Level + Total-XP des current Users
 *   - 7 Bereich-Cards (Koerper/Geist/Seele/Bewusstsein/Soziales/Gemeinschaft/Handwerk)
 *   - pro Bereich: Level + XP-Balken + Skills aufklappbar
 *   - Synergie-Bonus-Hinweis wenn die drei inneren Bereiche gleichzeitig
 *     wachsen (Vision: "Wenn die eins werden, kannst du alles.")
 *
 * Liest XP via useUserProgress(), keine Schreib-Aktionen — XP wird nur
 * von Quest-Abschluss-Pfaden geschrieben.
 */
import { TreePine } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { SkillTreeView } from "./SkillTreeView"

export const skillTreeModule: ModuleDefinition = {
  id: "skill-tree",
  label: "Skill-Tree",
  icon: TreePine,
  View: SkillTreeView,
  itemTypes: ["skill", "user-progress"],
  requiredCapabilities: ["ItemWriter"],
}
