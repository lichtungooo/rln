import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import {
  GAMIFICATION_ITEM_TYPES,
  useUserProgress,
  useUserAvatar,
  useLog,
} from "../gamification"
import { planQuestCompletion, type QuestData } from "./quest-engine"

/**
 * Hook fuer Quests im aktuellen Space.
 *
 * - liest alle `quest`-Items
 * - liest alle `quest-completion`-Items des current Users
 * - bietet `complete(questId)` der die ganze Engine durchspielt
 */
export const QUEST_COMPLETION_TYPE = "quest-completion"

export interface QuestCompletionData {
  questId: string
  completedAt: string
  /** Verifikations-Mode der genutzt wurde */
  verification: "self" | "qr" | "peer" | "attestation"
}

export function useQuests() {
  const { data: questItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.quest })
  const { data: completions } = useItems({ type: QUEST_COMPLETION_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const { addXp } = useUserProgress()
  const { grantItem } = useUserAvatar(null)
  const { addEntry } = useLog()

  // Welche Quests hat der current User abgeschlossen?
  const myCompletions = useMemo<Record<string, Item>>(() => {
    if (!currentUser?.id) return {}
    const map: Record<string, Item> = {}
    for (const c of completions) {
      if (c.createdBy !== currentUser.id) continue
      const data = c.data as QuestCompletionData
      map[data.questId] = c
    }
    return map
  }, [completions, currentUser?.id])

  const isCompleted = useCallback(
    (questId: string): boolean => Boolean(myCompletions[questId]),
    [myCompletions]
  )

  const complete = useCallback(
    async (questItem: Item, verification: QuestCompletionData["verification"] = "self") => {
      if (!currentUser?.id) {
        throw new Error("Nicht eingeloggt")
      }
      if (myCompletions[questItem.id]) {
        return // bereits abgeschlossen — idempotent
      }

      const questData = questItem.data as QuestData
      const plan = planQuestCompletion(questItem.id, questData)

      // 1. Completion-Item anlegen (markiert die Quest als erledigt fuer den User)
      await createItem({
        type: QUEST_COMPLETION_TYPE,
        createdBy: currentUser.id,
        data: {
          questId: questItem.id,
          completedAt: new Date().toISOString(),
          verification,
        },
      })

      // 2. XP verteilen
      if (
        Object.keys(plan.skillXp).length > 0 ||
        Object.keys(plan.bereichXp).length > 0
      ) {
        await addXp({ skillXp: plan.skillXp, bereichXp: plan.bereichXp })
      }

      // 3. Items verleihen (soulbound)
      for (const itemId of plan.rewardItemIds) {
        await grantItem(itemId)
      }

      // 4. Log-Eintrag schreiben
      await addEntry({
        type: "quest_completed",
        sourceModule: "quest",
        summary: plan.logSummary,
        payload: plan.logPayload,
        relatedItemId: questItem.id,
      })
    },
    [currentUser?.id, myCompletions, createItem, addXp, grantItem, addEntry]
  )

  /** Macht die Quest fuer den User wieder offen (loescht Completion-Item) */
  const uncomplete = useCallback(
    async (questId: string) => {
      const completion = myCompletions[questId]
      if (!completion) return
      await deleteItem(completion.id)
    },
    [myCompletions, deleteItem]
  )

  return {
    quests: questItems,
    isCompleted,
    completion: (questId: string) => myCompletions[questId],
    complete,
    uncomplete,
  }
}
