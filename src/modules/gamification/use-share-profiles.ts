import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { GAMIFICATION_ITEM_TYPES, type ShareProfileData } from "./types"
import { useCircles } from "./use-circles"

/**
 * Hook fuer Share-Profile (Phase F8, 11.05.2026).
 *
 * Lies die eigenen Sicht-Profile + bietet CRUD. Plus:
 * `pickProfileFor(viewerDid)` waehlt das passende Profil basierend
 * auf den Kreisen, in denen der Schauende steckt.
 *
 * Logik beim Anschauen:
 *   - Ist der Schauer im Kreis "Vertraute" → das Profil, das
 *     "Vertraute" als targetCircleId hat
 *   - Ist er in mehreren Kreisen → das erste passende
 *   - Ist er in keinem Kreis → undefined (= Default-Sicht oeffentlich)
 */
export function useShareProfiles() {
  const { data: items } = useItems({ type: GAMIFICATION_ITEM_TYPES.shareProfile })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const { circlesContaining } = useCircles()

  const mine = useMemo<Array<Item & { data: ShareProfileData }>>(() => {
    if (!currentUser?.id) return []
    return items.filter((it) => it.createdBy === currentUser.id) as Array<
      Item & { data: ShareProfileData }
    >
  }, [items, currentUser?.id])

  const add = useCallback(
    async (data: ShareProfileData): Promise<void> => {
      if (!currentUser?.id) throw new Error("Nicht eingeloggt")
      if (!data.name.trim()) throw new Error("Name fehlt")
      await createItem({
        type: GAMIFICATION_ITEM_TYPES.shareProfile,
        createdBy: currentUser.id,
        data: {
          ...data,
          visibleBereiche: data.visibleBereiche ?? [],
          targetCircleIds: data.targetCircleIds ?? [],
        },
      })
    },
    [currentUser?.id, createItem]
  )

  const update = useCallback(
    async (id: string, patch: Partial<ShareProfileData>) => {
      const item = mine.find((p) => p.id === id)
      if (!item) throw new Error("Profil nicht gefunden")
      await updateItem(id, { data: { ...item.data, ...patch } })
    },
    [mine, updateItem]
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteItem(id)
    },
    [deleteItem]
  )

  /**
   * Sicht-Profil fuer einen Schauenden waehlen.
   * Liefert das erste Profil, dessen targetCircleIds einen Kreis
   * enthaelt, in dem der Schauer Mitglied ist.
   */
  const pickProfileFor = useCallback(
    (viewerDid: string): (Item & { data: ShareProfileData }) | undefined => {
      const viewerCircles = circlesContaining(viewerDid).map((c) => c.id)
      if (viewerCircles.length === 0) return undefined
      return mine.find((p) =>
        (p.data.targetCircleIds ?? []).some((tc) => viewerCircles.includes(tc))
      )
    },
    [mine, circlesContaining]
  )

  return { mine, add, update, remove, pickProfileFor }
}
