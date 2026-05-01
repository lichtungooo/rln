/**
 * Quest-Engine — zentrale Logik fuer Quest-Abschluss.
 *
 * Wird von QuestView aufgerufen wenn ein User eine Quest abschliesst.
 * Triggert XP-Verteilung, Item-Verleihung, Log-Eintrag — alle drei Effekte
 * passieren atomic-ish (kein Rollback bei Teil-Fehler, aber jeder Effekt
 * ist idempotent).
 */

import type {
  QuestGamificationFields,
  TreeBereichId,
} from "../gamification"

export interface QuestData extends QuestGamificationFields {
  title: string
  description?: string
  markdownBody?: string
  start?: string
  end?: string
  location?: { lat: number; lng: number; address?: string }
  hashtags?: string[]
}

/**
 * Was beim Abschluss einer Quest passiert — vorbereitete XP-Verteilung
 * und Item-Liste, plus eine Log-Zusammenfassung.
 *
 * Reine Funktion: berechnet was zu tun ist, fuehrt es aber nicht aus.
 * Die Hooks (useUserProgress, useUserAvatar, useLog) machen die
 * tatsaechlichen Aufrufe.
 */
export interface QuestCompletionPlan {
  skillXp: Record<string, number>
  bereichXp: Partial<Record<TreeBereichId, number>>
  rewardItemIds: string[]
  logSummary: string
  logPayload: Record<string, unknown>
}

export function planQuestCompletion(
  questId: string,
  questData: QuestData
): QuestCompletionPlan {
  const skillXp: Record<string, number> = { ...(questData.skillXp ?? {}) }
  const bereichXp: Partial<Record<TreeBereichId, number>> = {
    ...(questData.bereichXp ?? {}),
  }
  const rewardItemIds = questData.rewardItems ?? []

  const totalXp =
    Object.values(skillXp).reduce((a, b) => a + b, 0) +
    Object.values(bereichXp).reduce((a, b) => a + (b ?? 0), 0)

  return {
    skillXp,
    bereichXp,
    rewardItemIds,
    logSummary: `Quest abgeschlossen: ${questData.title} (+${totalXp} XP)`,
    logPayload: {
      questId,
      title: questData.title,
      skillXp,
      bereichXp,
      rewardItemIds,
      totalXp,
    },
  }
}
