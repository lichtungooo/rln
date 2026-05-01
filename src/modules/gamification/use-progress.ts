import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { TreeBereichId } from "./tree"
import { progressInLevel } from "./tree"
import type { SkillData, UserProgressData } from "./types"
import { GAMIFICATION_ITEM_TYPES } from "./types"

/**
 * Hook fuer User-Progress (XP pro Skill + Bereich) im aktuellen Space.
 *
 * Liest das `user-progress`-Item des current Users (eines pro User pro
 * Space, identifiziert ueber createdBy === currentUser.id) und bietet
 * `addXp(skillId, amount)` zum Schreiben.
 *
 * Beim Schreiben wird automatisch `bereichXp` aggregiert — gegen die
 * bereitgestellten Skill-Definitionen.
 */
export function useUserProgress() {
  const { data: progressItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.userProgress })
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()

  const myProgress = useMemo<Item | null>(() => {
    if (!currentUser?.id) return null
    return progressItems.find((it) => it.createdBy === currentUser.id) ?? null
  }, [progressItems, currentUser?.id])

  const data = useMemo<UserProgressData>(() => {
    if (!myProgress) {
      return { skillXp: {}, bereichXp: {}, updatedAt: new Date(0).toISOString() }
    }
    return myProgress.data as UserProgressData
  }, [myProgress])

  /**
   * Liefert XP fuer einen Skill.
   */
  const skillXp = useCallback((skillId: string): number => data.skillXp[skillId] ?? 0, [data])

  /**
   * Liefert XP fuer einen Bereich (aggregiert aus allen Skills + direkten
   * bereichXp-Eintraegen).
   */
  const bereichXp = useCallback(
    (bereichId: TreeBereichId): number => data.bereichXp[bereichId] ?? 0,
    [data]
  )

  /**
   * Liefert Level + Progress fuer einen Bereich.
   */
  const bereichProgress = useCallback(
    (bereichId: TreeBereichId) => progressInLevel(bereichXp(bereichId)),
    [bereichXp]
  )

  /**
   * Liefert Level + Progress fuer einen Skill.
   */
  const skillProgress = useCallback(
    (skillId: string) => progressInLevel(skillXp(skillId)),
    [skillXp]
  )

  /**
   * Verteilt XP auf Skills und Bereiche und persistiert.
   * `skillXp` wird auf passende `bereichXp` aggregiert (ueber die
   * Skill-Definitionen im Space).
   */
  const addXp = useCallback(
    async (input: {
      skillXp?: Record<string, number>
      bereichXp?: Partial<Record<TreeBereichId, number>>
    }) => {
      if (!currentUser?.id) {
        throw new Error("Nicht eingeloggt — kein User-Progress")
      }
      const skillById = new Map<string, SkillData>(
        skillItems.map((it) => [it.id, it.data as SkillData])
      )

      const nextSkillXp = { ...data.skillXp }
      const nextBereichXp = { ...data.bereichXp }

      // 1. skillXp anwenden + auf Bereich aggregieren
      for (const [skillId, amount] of Object.entries(input.skillXp ?? {})) {
        nextSkillXp[skillId] = (nextSkillXp[skillId] ?? 0) + amount
        const skill = skillById.get(skillId)
        if (skill) {
          const bId = skill.bereichId
          nextBereichXp[bId] = (nextBereichXp[bId] ?? 0) + amount
        }
      }

      // 2. direkte bereichXp anwenden
      for (const [bId, amount] of Object.entries(input.bereichXp ?? {})) {
        const id = bId as TreeBereichId
        nextBereichXp[id] = (nextBereichXp[id] ?? 0) + (amount ?? 0)
      }

      const nextData: UserProgressData = {
        skillXp: nextSkillXp,
        bereichXp: nextBereichXp,
        updatedAt: new Date().toISOString(),
      }

      if (myProgress) {
        await updateItem(myProgress.id, { data: nextData })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.userProgress,
          createdBy: currentUser.id,
          data: nextData,
        })
      }
    },
    [currentUser?.id, skillItems, data, myProgress, createItem, updateItem]
  )

  return {
    data,
    skillXp,
    bereichXp,
    skillProgress,
    bereichProgress,
    addXp,
    /** Liste aller Skill-Definitionen im aktiven Space */
    skills: skillItems,
  }
}
