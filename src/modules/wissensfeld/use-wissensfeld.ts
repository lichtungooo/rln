import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import {
  WISSENSFELD_ITEM_TYPES,
  type FrageData,
  type AntwortData,
  type ResonanzData,
} from "./types"

/**
 * Wissensfeld-Hook.
 *
 * Hier lebt der Kreislauf:
 *   - Fragen entstehen
 *   - Antworten tragen
 *   - Resonanz fliesst
 *
 * Keine Kommentare, keine Threads, keine Likes. Wer eine Antwort
 * teilt, gibt eine eigene. Wer beruehrt ist, leuchtet ein Signal —
 * sanft, nicht laut.
 */

export function useWissensfeld() {
  const { data: fragen } = useItems({ type: WISSENSFELD_ITEM_TYPES.frage })
  const { data: antworten } = useItems({ type: WISSENSFELD_ITEM_TYPES.antwort })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  /** Antworten gruppiert pro Frage-ID */
  const antwortenByFrage = useMemo<Record<string, Item[]>>(() => {
    const map: Record<string, Item[]> = {}
    for (const a of antworten) {
      const fid = (a.data as AntwortData).frageId
      if (!fid) continue
      if (!map[fid]) map[fid] = []
      map[fid].push(a)
    }
    // Pro Frage: neueste Antworten zuerst
    for (const fid of Object.keys(map)) {
      map[fid].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
    return map
  }, [antworten])

  /** Fragen, neueste zuerst */
  const fragenSorted = useMemo<Item[]>(
    () => [...fragen].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [fragen]
  )

  /** Eine Frage saeen */
  const askFrage = useCallback(
    async (data: FrageData): Promise<Item | null> => {
      if (!currentUser?.id) throw new Error("Du bist noch nicht im Kreis angekommen.")
      const created = await createItem({
        type: WISSENSFELD_ITEM_TYPES.frage,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
      return created ?? null
    },
    [currentUser?.id, createItem]
  )

  /** Eine Antwort tragen */
  const giveAntwort = useCallback(
    async (input: {
      frageId: string
      content: string
      tags?: string[]
      circleOrigin?: string
      felder?: string[]
    }): Promise<Item | null> => {
      if (!currentUser?.id) throw new Error("Du bist noch nicht im Kreis angekommen.")
      const data: AntwortData = {
        frageId: input.frageId,
        content: input.content.trim(),
        tags: input.tags ?? [],
        circleOrigin: input.circleOrigin,
        felder: input.felder,
        resonanz: { beruehrt: [], willBesprechen: [] },
      }
      const created = await createItem({
        type: WISSENSFELD_ITEM_TYPES.antwort,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
      return created ?? null
    },
    [currentUser?.id, createItem]
  )

  /** Frage zurueckziehen — nur eigene */
  const removeFrage = useCallback(
    async (frageId: string) => {
      const f = fragen.find((it) => it.id === frageId)
      if (!f || f.createdBy !== currentUser?.id) return
      await deleteItem(frageId)
    },
    [fragen, currentUser?.id, deleteItem]
  )

  /** Antwort zurueckziehen — nur eigene */
  const removeAntwort = useCallback(
    async (antwortId: string) => {
      const a = antworten.find((it) => it.id === antwortId)
      if (!a || a.createdBy !== currentUser?.id) return
      await deleteItem(antwortId)
    },
    [antworten, currentUser?.id, deleteItem]
  )

  /**
   * Resonanz-Signal toggeln. "beruehrt" oder "willBesprechen".
   * Idempotent: erneuter Klick zieht das Signal zurueck.
   */
  const toggleResonanz = useCallback(
    async (antwortId: string, signal: "beruehrt" | "willBesprechen") => {
      if (!currentUser?.id) return
      const item = antworten.find((it) => it.id === antwortId)
      if (!item) return
      const data = item.data as AntwortData
      const current = new Set(data.resonanz?.[signal] ?? [])
      if (current.has(currentUser.id)) current.delete(currentUser.id)
      else current.add(currentUser.id)
      const nextResonanz: ResonanzData = {
        beruehrt: signal === "beruehrt" ? Array.from(current) : data.resonanz?.beruehrt ?? [],
        willBesprechen:
          signal === "willBesprechen"
            ? Array.from(current)
            : data.resonanz?.willBesprechen ?? [],
      }
      await updateItem(item.id, {
        data: { ...data, resonanz: nextResonanz } as unknown as Record<string, unknown>,
      })
    },
    [antworten, currentUser?.id, updateItem]
  )

  return {
    fragen: fragenSorted,
    antwortenByFrage,
    askFrage,
    giveAntwort,
    removeFrage,
    removeAntwort,
    toggleResonanz,
  }
}
