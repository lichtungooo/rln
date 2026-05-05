/**
 * useCurrencies — Hook fuer die Wertformen eines Spaces.
 *
 * Default-Waehrungen (z.B. "dank") leben im Code und sind immer vorhanden.
 * Eigene Wertformen pro Kreis (Werkstatt-Coin, Lichtschein, Hofgulden)
 * werden als Items vom Typ "currency-meta" im WoT angelegt.
 *
 * Der Hook reicht beide Welten gemerged zurueck — Default plus Items —
 * und stellt Helfer bereit zum Anlegen, Bearbeiten und Loeschen.
 */

import { useMemo, useCallback } from 'react'
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from '@real-life-stack/toolkit'
import {
  CURRENCY_META_ITEM_TYPE,
  DEFAULT_CURRENCIES,
  type CurrencyMeta,
} from './types'

export interface CurrencyEntity {
  id: string
  itemId?: string
  meta: CurrencyMeta
  /** Default-Waehrung aus dem Code, nicht editier- oder loeschbar. */
  isDefault: boolean
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'wertform'
}

export function useCurrencies() {
  const { data: items } = useItems({ type: CURRENCY_META_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  /** Liste aller Wertformen (Default zuerst, dann WoT-Items). */
  const list = useMemo<CurrencyEntity[]>(() => {
    const defaults: CurrencyEntity[] = Object.values(DEFAULT_CURRENCIES).map(
      (meta) => ({
        id: meta.id,
        meta,
        isDefault: true,
      }),
    )

    const fromItems: CurrencyEntity[] = items
      .filter((it) => it.data && typeof it.data === 'object' && 'id' in it.data)
      .map((it) => {
        const meta = it.data as CurrencyMeta
        return {
          id: meta.id,
          itemId: it.id,
          meta,
          isDefault: false,
        }
      })

    // Items mit gleicher id wie Default werden ignoriert (Default schuetzt).
    const defaultIds = new Set(defaults.map((d) => d.id))
    const filtered = fromItems.filter((e) => !defaultIds.has(e.id))

    return [...defaults, ...filtered]
  }, [items])

  /** Lookup-Map currency-id → CurrencyMeta. */
  const map = useMemo<Record<string, CurrencyMeta>>(() => {
    const m: Record<string, CurrencyMeta> = {}
    for (const e of list) m[e.id] = e.meta
    return m
  }, [list])

  /** Pruefe, ob eine id schon vergeben ist. */
  const isIdTaken = useCallback(
    (id: string, ignoreItemId?: string) =>
      list.some(
        (e) => e.id === id && e.itemId !== ignoreItemId,
      ),
    [list],
  )

  const createCurrency = useCallback(
    async (input: Omit<CurrencyMeta, 'id'> & { id?: string }) => {
      if (!currentUser?.id) return null
      const baseId = input.id?.trim() || slugify(input.label)
      let id = baseId
      let n = 2
      while (isIdTaken(id)) {
        id = `${baseId}-${n}`
        n++
      }
      const meta: CurrencyMeta = {
        id,
        label: input.label,
        symbol: input.symbol,
        color: input.color,
        bg: input.bg,
        beschreibung: input.beschreibung,
        stueckelungen: input.stueckelungen,
        gueltigkeitJahre: input.gueltigkeitJahre,
      }
      return await createItem({
        type: CURRENCY_META_ITEM_TYPE,
        createdBy: currentUser.id,
        data: meta,
      })
    },
    [createItem, currentUser?.id, isIdTaken],
  )

  const updateCurrency = useCallback(
    async (itemId: string, patch: Partial<CurrencyMeta>) => {
      const entry = list.find((e) => e.itemId === itemId)
      if (!entry || entry.isDefault) return
      await updateItem(itemId, { data: { ...entry.meta, ...patch } })
    },
    [list, updateItem],
  )

  const removeCurrency = useCallback(
    async (itemId: string) => {
      const entry = list.find((e) => e.itemId === itemId)
      if (!entry || entry.isDefault) return
      await deleteItem(itemId)
    },
    [list, deleteItem],
  )

  return {
    list,
    map,
    createCurrency,
    updateCurrency,
    removeCurrency,
    isIdTaken,
  }
}
