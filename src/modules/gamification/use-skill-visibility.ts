import { useCallback, useMemo } from "react"
import { useProfileExtension } from "../profile/use-profile-extension"
import type { SkillVisibilityLevel } from "./visibility"

/**
 * Hook fuer Per-Skill-Sichtbarkeit (Phase F9, 11.05.2026).
 *
 * Speichert die Map `skillVisibility` im Profile-Extension-Item (offene
 * Felder-Struktur — schlanker als eigener Item-Typ). Schluessel ist die
 * Skill-ID (Universal- oder Space-Skill), Wert ist die Sichtbarkeits-Stufe.
 *
 * Ungesetzte Skills folgen der Default-Logik (Sicht-Profile + Default).
 */
export function useSkillVisibility() {
  const { data, update } = useProfileExtension()

  const map = useMemo<Record<string, SkillVisibilityLevel>>(() => {
    const raw = (data as { skillVisibility?: Record<string, SkillVisibilityLevel> })
      .skillVisibility
    return raw ?? {}
  }, [data])

  /**
   * Gibt die gesetzte Sichtbarkeit fuer einen Skill zurueck.
   * undefined = kein Override, Default-Logik gilt.
   */
  const get = useCallback(
    (skillId: string): SkillVisibilityLevel | undefined => map[skillId],
    [map]
  )

  /**
   * Setze die Sichtbarkeit fuer einen Skill. `undefined` entfernt den
   * Override (Default-Logik greift wieder).
   */
  const set = useCallback(
    async (skillId: string, level: SkillVisibilityLevel | undefined) => {
      const next = { ...map }
      if (level === undefined) {
        delete next[skillId]
      } else {
        next[skillId] = level
      }
      await update({ skillVisibility: next })
    },
    [map, update]
  )

  return { map, get, set }
}
