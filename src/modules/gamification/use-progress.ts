import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { TreeBereichId } from "./tree"
import { progressInLevel, SYNERGIES, type Synergie } from "./tree"
import type { SkillData, UserProgressData } from "./types"
import { GAMIFICATION_ITEM_TYPES } from "./types"
import { UNIVERSAL_SKILLS, UNIVERSAL_SKILL_BY_ID } from "./universal-skills"
import { isSkillUnlocked, type UnlockCheck } from "./prerequisites"

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
   * Lookup: Skill-Definition aus Universal-Code-Skills oder WoT-Items.
   */
  const lookupSkill = useCallback(
    (skillId: string): SkillData | undefined => {
      const universal = UNIVERSAL_SKILL_BY_ID[skillId]
      if (universal) return universal
      const item = skillItems.find((it) => it.id === skillId)
      return item ? (item.data as SkillData) : undefined
    },
    [skillItems]
  )

  /**
   * Prueft, ob ein Skill offen ist (Voraussetzungen erfuellt).
   * Liefert auch eine Liste fehlender Voraussetzungen fuer die UI.
   */
  const isUnlocked = useCallback(
    (skillId: string): UnlockCheck => {
      const def = lookupSkill(skillId)
      if (!def) return { unlocked: true, missing: [] }
      return isSkillUnlocked(
        def.prerequisites,
        skillXp,
        (id) => lookupSkill(id)?.name ?? id,
      )
    },
    [lookupSkill, skillXp]
  )

  /**
   * Verteilt XP auf Skills und Bereiche und persistiert.
   *
   * Auto-Aggregation: skillXp[holz] += 20 wird zusaetzlich auf
   * bereichXp[handwerk] += 20 (anhand der Skill-Definition).
   *
   * **Synergie-Bonus (Phase E1, 01.05.2026):** Wenn diese eine Aktion
   * gleichzeitig auf alle drei inneren Bereiche (Seele + Geist +
   * Bewusstsein) zahlt, kommt zusaetzlich +25% auf die Summe der inneren
   * Bereiche dazu, gleichmaessig aufgeteilt. Vision: "Wenn die eins
   * werden, kannst du alles." Synergie-Effekt wird im Log-Eintrag
   * markiert (im Aufrufer, ueber den Rueckgabewert).
   */
  const addXp = useCallback(
    async (input: {
      skillXp?: Record<string, number>
      bereichXp?: Partial<Record<TreeBereichId, number>>
    }): Promise<{
      synergyTriggered: boolean
      synergyBonus: number
      triggeredSynergies: Array<{ synergie: Synergie; bonus: number }>
    }> => {
      if (!currentUser?.id) {
        throw new Error("Nicht eingeloggt — kein User-Progress")
      }
      // Map kennt sowohl space-spezifische Item-Skills als auch die
      // universellen Code-Skills — beide tragen XP zum richtigen Bereich.
      const skillById = new Map<string, SkillData>()
      for (const u of UNIVERSAL_SKILLS) {
        skillById.set(u.id, u)
      }
      for (const it of skillItems) {
        skillById.set(it.id, it.data as SkillData)
      }

      const nextSkillXp = { ...data.skillXp }
      const nextBereichXp = { ...data.bereichXp }

      // Tracking: wieviel XP geht in dieser Aktion auf welchen Bereich?
      const thisActionBereichXp: Partial<Record<TreeBereichId, number>> = {}

      // 1. skillXp anwenden + auf Bereich aggregieren
      for (const [skillId, amount] of Object.entries(input.skillXp ?? {})) {
        nextSkillXp[skillId] = (nextSkillXp[skillId] ?? 0) + amount
        const skill = skillById.get(skillId)
        if (skill) {
          const bId = skill.bereichId
          nextBereichXp[bId] = (nextBereichXp[bId] ?? 0) + amount
          thisActionBereichXp[bId] = (thisActionBereichXp[bId] ?? 0) + amount
        }
      }

      // 2. direkte bereichXp anwenden
      for (const [bId, amount] of Object.entries(input.bereichXp ?? {})) {
        const id = bId as TreeBereichId
        nextBereichXp[id] = (nextBereichXp[id] ?? 0) + (amount ?? 0)
        thisActionBereichXp[id] = (thisActionBereichXp[id] ?? 0) + (amount ?? 0)
      }

      // 3. Synergie-Pruefung: alle definierten Synergien durchlaufen.
      //    Wenn ALLE Bereiche einer Synergie in dieser Aktion XP bekommen,
      //    addieren wir den Bonus auf die Synergie-Summe und verteilen ihn
      //    gleichmaessig zurueck auf die Synergie-Bereiche.
      const triggeredSynergies: Array<{ synergie: Synergie; bonus: number }> = []
      let synergyBonus = 0
      for (const syn of SYNERGIES) {
        const scores = syn.bereiche.map((b) => thisActionBereichXp[b] ?? 0)
        const allActive = scores.every((x) => x > 0)
        if (!allActive) continue

        const sum = scores.reduce((a, b) => a + b, 0)
        const bonus = Math.round(sum * syn.bonus)
        synergyBonus += bonus
        triggeredSynergies.push({ synergie: syn, bonus })

        const perBereich = Math.round(bonus / syn.bereiche.length)
        for (const b of syn.bereiche) {
          nextBereichXp[b] = (nextBereichXp[b] ?? 0) + perBereich
        }
      }
      const synergyTriggered = triggeredSynergies.length > 0

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

      return { synergyTriggered, synergyBonus, triggeredSynergies }
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
    isUnlocked,
    lookupSkill,
    /** Liste aller Skill-Definitionen im aktiven Space */
    skills: skillItems,
  }
}
