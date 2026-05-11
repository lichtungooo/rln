import { xpToLevel } from "./tree"
import type { SkillData, SkillPrerequisites } from "./types"
import { UNIVERSAL_SKILL_BY_ID } from "./universal-skills"

/**
 * Voraussetzungs-Pruefung fuer Skills (Phase F3, 11.05.2026).
 *
 * Ein Skill ist *offen*, wenn alle Voraussetzungen erfuellt sind oder
 * keine Voraussetzungen definiert sind. Offene Skills erlauben XP-
 * Sammeln und werden im Tree voll dargestellt. Gesperrte Skills sind
 * sichtbar, aber gedaempft — der User sieht, was noch werden will.
 *
 * Filter: AND ueber die drei Felder (all, any, minLevel), OR innerhalb
 * von `any`.
 */

export interface UnlockCheck {
  /** True wenn der Skill offen ist (keine Voraussetzungen oder alle erfuellt). */
  unlocked: boolean
  /** Beschreibung der fehlenden Voraussetzungen (lesbar). */
  missing: string[]
}

/**
 * Prueft ob ein Skill offen ist.
 *
 * @param prereqs - Voraussetzungs-Definition (optional)
 * @param skillXpFn - Liefert XP fuer eine Skill-ID
 * @param skillNameFn - Liefert Anzeigename fuer eine Skill-ID (fuer Missing-Text)
 */
export function isSkillUnlocked(
  prereqs: SkillPrerequisites | undefined,
  skillXpFn: (id: string) => number,
  skillNameFn: (id: string) => string,
): UnlockCheck {
  if (!prereqs) return { unlocked: true, missing: [] }

  const missing: string[] = []

  if (prereqs.all && prereqs.all.length > 0) {
    for (const id of prereqs.all) {
      const lvl = xpToLevel(skillXpFn(id))
      if (lvl < 1) {
        missing.push(`${skillNameFn(id)} Lv 1`)
      }
    }
  }

  if (prereqs.any && prereqs.any.length > 0) {
    const someOpen = prereqs.any.some((id) => xpToLevel(skillXpFn(id)) >= 1)
    if (!someOpen) {
      const names = prereqs.any.map((id) => skillNameFn(id)).join(" oder ")
      missing.push(`${names} Lv 1`)
    }
  }

  if (prereqs.minLevel && prereqs.minLevel.length > 0) {
    for (const req of prereqs.minLevel) {
      const lvl = xpToLevel(skillXpFn(req.skillId))
      if (lvl < req.level) {
        missing.push(`${skillNameFn(req.skillId)} Lv ${req.level}`)
      }
    }
  }

  return { unlocked: missing.length === 0, missing }
}

/**
 * Default-Resolver: liest Skill-Namen aus Universal-Skills + uebergebener
 * Item-Map. Wenn nichts gefunden, faellt auf die Skill-ID zurueck.
 */
export function makeSkillNameResolver(
  itemSkills: Map<string, SkillData>,
): (id: string) => string {
  return (id: string) => {
    const universal = UNIVERSAL_SKILL_BY_ID[id]
    if (universal) return universal.name
    const item = itemSkills.get(id)
    if (item) return item.name
    return id
  }
}
