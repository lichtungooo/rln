import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { TreeBereichId } from "./tree"
import {
  GAMIFICATION_ITEM_TYPES,
  PAST_EXPERIENCE_XP,
  type PastExperienceData,
} from "./types"
import { useUserProgress } from "./use-progress"
import { useLog } from "./use-log"

/**
 * Hook fuer Vergangenheits-Erfahrungen (Phase F5, 11.05.2026).
 *
 * Liest alle `past-experience`-Items des eingeloggten Users und bietet
 * `add()` zum Anlegen einer neuen Erfahrung. Beim Anlegen wird:
 *
 *   1. das Item als WoT-Item gespeichert
 *   2. XP auf die genannten Bereiche geschrieben (gemaess Mastery-Stufe)
 *   3. ein Log-Eintrag `life_milestone` angelegt
 *
 * Wenn `attestedBy` leer ist, gilt die Erfahrung als **vorlaeufig** —
 * sichtbar, aber im Profil markiert. Peer-Attestation ist ein eigenes
 * Workflow-Stueck (kommt in spaeterer Phase).
 */
export function usePastExperiences() {
  const { data: items } = useItems({ type: GAMIFICATION_ITEM_TYPES.pastExperience })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const { addXp } = useUserProgress()
  const { addEntry } = useLog()

  /**
   * Eigene Vergangenheits-Erfahrungen, neueste zuerst (nach startYear).
   */
  const mine = useMemo<Array<Item & { data: PastExperienceData }>>(() => {
    if (!currentUser?.id) return []
    return items
      .filter((it) => it.createdBy === currentUser.id)
      .sort((a, b) => {
        const aY = (a.data as PastExperienceData).startYear ?? 0
        const bY = (b.data as PastExperienceData).startYear ?? 0
        return bY - aY
      }) as Array<Item & { data: PastExperienceData }>
  }, [items, currentUser?.id])

  /**
   * Erstelle eine neue Vergangenheits-Erfahrung. Verteilt XP, schreibt
   * Log-Eintrag, legt das Item an.
   */
  const add = useCallback(
    async (data: PastExperienceData) => {
      if (!currentUser?.id) {
        throw new Error("Nicht eingeloggt — kein User-Kontext")
      }
      if (!data.title.trim()) {
        throw new Error("Titel fehlt")
      }
      if (data.bereiche.length === 0) {
        throw new Error("Mindestens einen Bereich auswaehlen")
      }

      // 1. XP berechnen — pro Bereich nach Mastery-Stufe
      const xpPerBereich = PAST_EXPERIENCE_XP[data.mastery]
      const bereichXp: Partial<Record<TreeBereichId, number>> = {}
      for (const b of data.bereiche) {
        bereichXp[b] = xpPerBereich
      }

      // 2. XP schreiben
      await addXp({ bereichXp })

      // 3. Item anlegen
      await createItem({
        type: GAMIFICATION_ITEM_TYPES.pastExperience,
        createdBy: currentUser.id,
        data: { ...data, attestedBy: data.attestedBy ?? [] },
      })

      // 4. Log-Eintrag
      const totalXp = xpPerBereich * data.bereiche.length
      const yearText =
        data.startYear && data.endYear
          ? ` (${data.startYear}–${data.endYear})`
          : data.startYear
          ? ` (${data.startYear})`
          : ""
      await addEntry({
        type: "life_milestone",
        timestamp: new Date().toISOString(),
        sourceModule: "profile",
        summary: `Vergangenheit erzaehlt: ${data.title}${yearText}`,
        payload: {
          mastery: data.mastery,
          bereiche: data.bereiche,
          xpGained: totalXp,
          lifePhaseIndex: data.lifePhaseIndex,
          provisional: (data.attestedBy ?? []).length === 0,
        },
      })
    },
    [currentUser?.id, createItem, addXp, addEntry]
  )

  /**
   * Loescht eine Vergangenheits-Erfahrung. **Wichtig:** XP wird **nicht**
   * zurueckgenommen — XP-Subtraktion ist konzeptionell problematisch
   * (Mensch verliert was schon gewachsen ist). Wer eine Erfahrung
   * loescht, loescht nur das Item, nicht das Wachstum.
   */
  const remove = useCallback(
    async (id: string) => {
      await deleteItem(id)
    },
    [deleteItem]
  )

  /**
   * Ob die Erfahrung als bestaetigt gilt (mindestens ein Peer hat attestiert).
   */
  const isAttested = (exp: PastExperienceData): boolean => {
    return (exp.attestedBy ?? []).length > 0
  }

  return { mine, add, remove, isAttested }
}
