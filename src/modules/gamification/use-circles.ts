import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { GAMIFICATION_ITEM_TYPES, type CircleData } from "./types"

/**
 * Hook fuer Kreise (Phase F8, 11.05.2026).
 *
 * Lies die eigenen Kreise (createdBy = currentUser.id), bietet CRUD
 * sowie Member-Hinzufuegen/-Entfernen als komfortable Methoden.
 *
 * Diaspora-Aspects-Pattern: nur ich sehe meine Kreise, andere wissen
 * nicht, in welchem Kreis sie sind.
 */
export function useCircles() {
  const { data: items } = useItems({ type: GAMIFICATION_ITEM_TYPES.circle })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  const mine = useMemo<Array<Item & { data: CircleData }>>(() => {
    if (!currentUser?.id) return []
    return items.filter((it) => it.createdBy === currentUser.id) as Array<
      Item & { data: CircleData }
    >
  }, [items, currentUser?.id])

  const add = useCallback(
    async (data: CircleData): Promise<void> => {
      if (!currentUser?.id) throw new Error("Nicht eingeloggt")
      if (!data.name.trim()) throw new Error("Name fehlt")
      await createItem({
        type: GAMIFICATION_ITEM_TYPES.circle,
        createdBy: currentUser.id,
        data: { ...data, memberIds: data.memberIds ?? [] },
      })
    },
    [currentUser?.id, createItem]
  )

  const update = useCallback(
    async (id: string, patch: Partial<CircleData>) => {
      const item = mine.find((c) => c.id === id)
      if (!item) throw new Error("Kreis nicht gefunden")
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

  const addMember = useCallback(
    async (circleId: string, memberDid: string) => {
      const item = mine.find((c) => c.id === circleId)
      if (!item) return
      if (item.data.memberIds.includes(memberDid)) return
      await update(circleId, { memberIds: [...item.data.memberIds, memberDid] })
    },
    [mine, update]
  )

  const removeMember = useCallback(
    async (circleId: string, memberDid: string) => {
      const item = mine.find((c) => c.id === circleId)
      if (!item) return
      await update(circleId, {
        memberIds: item.data.memberIds.filter((m) => m !== memberDid),
      })
    },
    [mine, update]
  )

  /**
   * Liefert alle Kreise, in denen ein bestimmter Mensch (DID) ist.
   * Wird von der Share-Profile-Logik benutzt, um zu bestimmen, welches
   * Profil ein Schauender zu sehen bekommt.
   */
  const circlesContaining = useCallback(
    (memberDid: string): Array<Item & { data: CircleData }> => {
      return mine.filter((c) => c.data.memberIds.includes(memberDid))
    },
    [mine]
  )

  return {
    mine,
    add,
    update,
    remove,
    addMember,
    removeMember,
    circlesContaining,
  }
}
