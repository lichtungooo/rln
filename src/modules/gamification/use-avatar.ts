import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { AvatarItemData, UserAvatarData } from "./types"
import { GAMIFICATION_ITEM_TYPES } from "./types"

/**
 * Hook fuer den Avatar des current Users.
 *
 * Avatar reist mit dem User ueber Spaces (deshalb 1 user-avatar Item pro
 * User, nicht pro User+Space). Pro Space kann der User aber eine andere
 * Variante (schlicht / magisch / klassisch) und einen anderen Titel
 * waehlen — diese Felder leben in den variantPerSpace / titlePerSpace
 * Maps.
 */
export function useUserAvatar(spaceId: string | null) {
  const { data: avatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.userAvatar })
  const { data: itemDefinitions } = useItems({ type: GAMIFICATION_ITEM_TYPES.avatarItem })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()

  const myAvatar = useMemo<Item | null>(() => {
    if (!currentUser?.id) return null
    return avatarItems.find((it) => it.createdBy === currentUser.id) ?? null
  }, [avatarItems, currentUser?.id])

  const data = useMemo<UserAvatarData>(() => {
    if (!myAvatar) return { ownedItemIds: [], displayedItemIds: [] }
    return myAvatar.data as UserAvatarData
  }, [myAvatar])

  const owned = useMemo<Array<{ id: string; def: AvatarItemData }>>(() => {
    return data.ownedItemIds
      .map((id) => {
        const def = itemDefinitions.find((it) => it.id === id)
        return def ? { id, def: def.data as AvatarItemData } : null
      })
      .filter((x): x is { id: string; def: AvatarItemData } => x !== null)
  }, [data.ownedItemIds, itemDefinitions])

  const displayed = useMemo<Array<{ id: string; def: AvatarItemData }>>(() => {
    return data.displayedItemIds
      .map((id) => {
        const def = itemDefinitions.find((it) => it.id === id)
        return def ? { id, def: def.data as AvatarItemData } : null
      })
      .filter((x): x is { id: string; def: AvatarItemData } => x !== null)
  }, [data.displayedItemIds, itemDefinitions])

  const titleForSpace = useMemo<string | undefined>(() => {
    if (!spaceId) return undefined
    return data.titlePerSpace?.[spaceId]
  }, [data.titlePerSpace, spaceId])

  // Persistenz
  const persist = useCallback(
    async (next: UserAvatarData) => {
      if (!currentUser?.id) return
      if (myAvatar) {
        await updateItem(myAvatar.id, { data: next })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.userAvatar,
          createdBy: currentUser.id,
          data: next,
        })
      }
    },
    [currentUser?.id, myAvatar, createItem, updateItem]
  )

  /** Verleiht dem User ein Item (soulbound) */
  const grantItem = useCallback(
    async (itemId: string) => {
      if (data.ownedItemIds.includes(itemId)) return
      await persist({
        ...data,
        ownedItemIds: [...data.ownedItemIds, itemId],
      })
    },
    [data, persist]
  )

  /** Toggle ob ein Item auf dem Avatar sichtbar ist */
  const toggleDisplayed = useCallback(
    async (itemId: string) => {
      if (!data.ownedItemIds.includes(itemId)) return
      const current = new Set(data.displayedItemIds)
      if (current.has(itemId)) current.delete(itemId)
      else current.add(itemId)
      await persist({
        ...data,
        displayedItemIds: Array.from(current),
      })
    },
    [data, persist]
  )

  /** Setzt den Titel fuer einen Space */
  const setTitle = useCallback(
    async (spaceId: string, title: string) => {
      const titles = { ...(data.titlePerSpace ?? {}) }
      if (title) titles[spaceId] = title
      else delete titles[spaceId]
      await persist({ ...data, titlePerSpace: titles })
    },
    [data, persist]
  )

  const archetypesForSpace = useMemo<string[]>(() => {
    if (!spaceId) return []
    return data.archetypesPerSpace?.[spaceId] ?? []
  }, [data.archetypesPerSpace, spaceId])

  /** Toggle ob ein Archetyp fuer den aktuellen Space aktiv ist */
  const toggleArchetype = useCallback(
    async (spaceId: string, archetypeId: string) => {
      const map = { ...(data.archetypesPerSpace ?? {}) }
      const current = new Set(map[spaceId] ?? [])
      if (current.has(archetypeId)) current.delete(archetypeId)
      else current.add(archetypeId)
      if (current.size > 0) map[spaceId] = Array.from(current)
      else delete map[spaceId]
      await persist({ ...data, archetypesPerSpace: map })
    },
    [data, persist]
  )

  return {
    data,
    owned,
    displayed,
    titleForSpace,
    archetypesForSpace,
    grantItem,
    toggleDisplayed,
    setTitle,
    toggleArchetype,
  }
}
