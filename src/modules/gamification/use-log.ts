import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { LogEntryData, LogEntryType, LogEntryVisibility } from "./types"
import { GAMIFICATION_ITEM_TYPES } from "./types"

/**
 * Hook fuer das Log-Modul.
 *
 * Liest Log-Eintraege des current Users + bietet `addEntry()` zum Schreiben.
 * Eintraege sind privat by default (visibility = "private").
 *
 * Cross-Modul: jedes Modul kann diesen Hook nutzen um Aktionen zu loggen
 * (Quest-Abschluss, Event-Teilnahme, Trust-Verifikation, ...).
 */
export function useLog() {
  const { data: allEntries } = useItems({ type: GAMIFICATION_ITEM_TYPES.logEntry })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()

  const myEntries = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return allEntries
      .filter((it) => it.createdBy === currentUser.id)
      .sort((a, b) => {
        const aTime = new Date((a.data as LogEntryData).timestamp).getTime()
        const bTime = new Date((b.data as LogEntryData).timestamp).getTime()
        return bTime - aTime // neueste zuerst
      })
  }, [allEntries, currentUser?.id])

  /**
   * Schreibt einen neuen Log-Eintrag fuer den current User.
   */
  const addEntry = useCallback(
    async (input: {
      type: LogEntryType
      summary: string
      sourceModule: string
      payload?: Record<string, unknown>
      relatedItemId?: string
      visibility?: LogEntryVisibility
    }): Promise<Item | null> => {
      if (!currentUser?.id) return null
      const data: LogEntryData = {
        type: input.type,
        timestamp: new Date().toISOString(),
        sourceModule: input.sourceModule,
        summary: input.summary,
        payload: input.payload,
        relatedItemId: input.relatedItemId,
        visibility: input.visibility ?? "private",
      }
      const created = await createItem({
        type: GAMIFICATION_ITEM_TYPES.logEntry,
        createdBy: currentUser.id,
        data,
      })
      return created ?? null
    },
    [currentUser?.id, createItem]
  )

  /**
   * Filtert Eintraege.
   */
  const filter = useCallback(
    (input: {
      types?: LogEntryType[]
      sourceModules?: string[]
      since?: string
      until?: string
      visibility?: LogEntryVisibility[]
    }) => {
      return myEntries.filter((it) => {
        const d = it.data as LogEntryData
        if (input.types && !input.types.includes(d.type)) return false
        if (input.sourceModules && !input.sourceModules.includes(d.sourceModule)) return false
        if (input.since && new Date(d.timestamp) < new Date(input.since)) return false
        if (input.until && new Date(d.timestamp) > new Date(input.until)) return false
        if (input.visibility && !input.visibility.includes(d.visibility ?? "private")) return false
        return true
      })
    },
    [myEntries]
  )

  /**
   * Markiert einen Eintrag (wichtig, schoen, wiederholen).
   */
  const toggleMark = useCallback(
    async (entryId: string, mark: string) => {
      const entry = allEntries.find((it) => it.id === entryId)
      if (!entry) return
      const d = entry.data as LogEntryData
      const marks = new Set(d.marks ?? [])
      if (marks.has(mark)) marks.delete(mark)
      else marks.add(mark)
      await updateItem(entryId, {
        data: { ...d, marks: Array.from(marks) },
      })
    },
    [allEntries, updateItem]
  )

  /**
   * Setzt einen Kommentar / eine Reflexion zu einem Eintrag.
   */
  const setComment = useCallback(
    async (entryId: string, comment: string) => {
      const entry = allEntries.find((it) => it.id === entryId)
      if (!entry) return
      const d = entry.data as LogEntryData
      await updateItem(entryId, {
        data: { ...d, comment },
      })
    },
    [allEntries, updateItem]
  )

  /**
   * Aendert die Sichtbarkeit eines Eintrags (z.B. fuers Profil freigeben).
   */
  const setVisibility = useCallback(
    async (entryId: string, visibility: LogEntryVisibility) => {
      const entry = allEntries.find((it) => it.id === entryId)
      if (!entry) return
      const d = entry.data as LogEntryData
      await updateItem(entryId, {
        data: { ...d, visibility },
      })
    },
    [allEntries, updateItem]
  )

  return {
    entries: myEntries,
    addEntry,
    filter,
    toggleMark,
    setComment,
    setVisibility,
  }
}
