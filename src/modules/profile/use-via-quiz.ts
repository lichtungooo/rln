import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import {
  GAMIFICATION_ITEM_TYPES,
  useUserProgress,
  useLog,
  type ViaResultData,
} from "../gamification"
import {
  VIA_STRENGTHS,
  viaAnswerToXp,
  type ViaAnswer,
} from "./via-strengths"

/**
 * Hook fuers VIA-Onboarding-Quiz (Phase F6, 11.05.2026).
 *
 * Lies das eigene via-result-Item (eines pro User), bietet `submit()`
 * zum Speichern + XP-Verteilung + Log-Eintrag.
 *
 * Beim Submit:
 *   1. Antworten persistiert (idempotent — vorhandenes Item ueberschreiben)
 *   2. XP-Vergabe: pro Staerke der Wert aus viaAnswerToXp() auf den
 *      verbundenen Universal-Skill. addXp() aggregiert auto auf den Bereich.
 *   3. Signature Strengths (Top 5) berechnet und gespeichert
 *   4. Log-Eintrag `reflection` mit Quiz-Summary
 */
export function useViaQuiz() {
  const { data: results } = useItems({ type: GAMIFICATION_ITEM_TYPES.viaResult })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { addXp } = useUserProgress()
  const { addEntry } = useLog()

  const myResult = useMemo<(Item & { data: ViaResultData }) | null>(() => {
    if (!currentUser?.id) return null
    const own = results.find((r) => r.createdBy === currentUser.id)
    return (own as (Item & { data: ViaResultData }) | undefined) ?? null
  }, [results, currentUser?.id])

  const hasResult = myResult !== null

  /**
   * Aus den Antworten die 5 hoechsten ableiten.
   * Bei Gleichstand: alphabetisch nach Staerken-ID (deterministisch).
   */
  const computeSignature = useCallback(
    (answers: Record<string, number>): string[] => {
      const entries = Object.entries(answers)
        .filter(([, v]) => v >= 4)
        .sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1]
          return a[0].localeCompare(b[0])
        })
      return entries.slice(0, 5).map(([id]) => id)
    },
    []
  )

  /**
   * Quiz-Antworten speichern. Vergibt XP, schreibt Log-Eintrag,
   * markiert Signature Strengths. Idempotent ueberschreibbar.
   */
  const submit = useCallback(
    async (answers: Record<string, ViaAnswer>) => {
      if (!currentUser?.id) {
        throw new Error("Nicht eingeloggt — kein User-Kontext")
      }

      // XP-Plan zusammenstellen — pro Staerke, summiert auf Skill-ID,
      // weil zwei Staerken (Guete + Soziale Intelligenz) denselben Skill
      // adressieren koennen.
      const skillXpPlan: Record<string, number> = {}
      let totalXp = 0
      for (const strength of VIA_STRENGTHS) {
        const ans = answers[strength.id]
        const xp = viaAnswerToXp(ans)
        if (xp > 0) {
          skillXpPlan[strength.skillId] = (skillXpPlan[strength.skillId] ?? 0) + xp
          totalXp += xp
        }
      }

      // XP schreiben (Synergie + Bereich-Aggregation laufen automatisch)
      if (totalXp > 0) {
        await addXp({ skillXp: skillXpPlan })
      }

      // Signature Strengths
      const signatureStrengthIds = computeSignature(answers)

      // Item speichern
      const itemData: ViaResultData = {
        answers,
        completedAt: new Date().toISOString(),
        signatureStrengthIds,
      }
      if (myResult) {
        await updateItem(myResult.id, { data: itemData })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.viaResult,
          createdBy: currentUser.id,
          data: itemData,
        })
      }

      // Log-Eintrag
      await addEntry({
        type: "reflection",
        timestamp: new Date().toISOString(),
        sourceModule: "profile",
        summary: `VIA-Quiz beantwortet — Top-Staerke: ${
          signatureStrengthIds[0]
            ? VIA_STRENGTHS.find((s) => s.id === signatureStrengthIds[0])?.label ?? "—"
            : "—"
        }`,
        payload: {
          xpGained: totalXp,
          signatureStrengthIds,
          answeredCount: Object.values(answers).filter((v) => v >= 1).length,
        },
      })
    },
    [currentUser?.id, addXp, addEntry, createItem, updateItem, myResult, computeSignature]
  )

  return {
    /** Vorhandenes Ergebnis (eines pro User) */
    result: myResult?.data ?? null,
    hasResult,
    submit,
  }
}
