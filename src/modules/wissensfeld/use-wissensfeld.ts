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
  type VorschlagData,
  type VorschlagStatus,
  type VorschlagSignale,
  type StimmungsbildData,
  type StimmungsbildSignale,
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
  const { data: vorschlaege } = useItems({ type: WISSENSFELD_ITEM_TYPES.vorschlag })
  const { data: entscheidungen } = useItems({ type: WISSENSFELD_ITEM_TYPES.entscheidung })
  const { data: stimmungsbilder } = useItems({ type: WISSENSFELD_ITEM_TYPES.stimmungsbild })
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

  // ============================================================
  // Konsent-Prozess (Phase W4)
  // ============================================================

  /** Vorschlaege, neueste zuerst */
  const vorschlaegeSorted = useMemo<Item[]>(
    () => [...vorschlaege].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [vorschlaege]
  )
  const entscheidungenSorted = useMemo<Item[]>(
    () => [...entscheidungen].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entscheidungen]
  )

  /** Vorschlag formulieren */
  const proposeVorschlag = useCallback(
    async (input: {
      content: string
      tags?: string[]
      frageId?: string
      felder?: string[]
    }): Promise<Item | null> => {
      if (!currentUser?.id) throw new Error("Du bist noch nicht im Kreis angekommen.")
      const data: VorschlagData = {
        content: input.content.trim(),
        tags: input.tags ?? [],
        status: "offen",
        signale: { mittragen: [], bedenken: [], einwand: [] },
        frageId: input.frageId,
        felder: input.felder,
      }
      const created = await createItem({
        type: WISSENSFELD_ITEM_TYPES.vorschlag,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
      return created ?? null
    },
    [currentUser?.id, createItem]
  )

  /** Signal zu einem Vorschlag setzen — toggelt: erneuter Klick zieht zurueck. */
  const signalVorschlag = useCallback(
    async (vorschlagId: string, signal: keyof VorschlagSignale) => {
      if (!currentUser?.id) return
      const item = vorschlaege.find((it) => it.id === vorschlagId)
      if (!item) return
      const data = item.data as VorschlagData
      const next: VorschlagSignale = {
        mittragen: [...(data.signale?.mittragen ?? [])],
        bedenken: [...(data.signale?.bedenken ?? [])],
        einwand: [...(data.signale?.einwand ?? [])],
      }
      // Erst aus allen drei Listen den User entfernen — ein User hat nur ein Signal
      next.mittragen = next.mittragen.filter((id) => id !== currentUser.id)
      next.bedenken = next.bedenken.filter((id) => id !== currentUser.id)
      next.einwand = next.einwand.filter((id) => id !== currentUser.id)
      // Dann das gewaehlte hinzufuegen — auser es war schon das gewaehlte
      const wasActive = (data.signale?.[signal] ?? []).includes(currentUser.id)
      if (!wasActive) next[signal].push(currentUser.id)
      await updateItem(item.id, {
        data: { ...data, signale: next } as unknown as Record<string, unknown>,
      })
    },
    [vorschlaege, currentUser?.id, updateItem]
  )

  /** Status eines Vorschlags weiterdrehen — nur durch den Antragsteller */
  const advanceVorschlag = useCallback(
    async (vorschlagId: string, nextStatus: VorschlagStatus) => {
      if (!currentUser?.id) return
      const item = vorschlaege.find((it) => it.id === vorschlagId)
      if (!item || item.createdBy !== currentUser.id) return
      const data = item.data as VorschlagData
      await updateItem(item.id, {
        data: { ...data, status: nextStatus } as unknown as Record<string, unknown>,
      })
    },
    [vorschlaege, currentUser?.id, updateItem]
  )

  /** Vorschlag zur Entscheidung tragen — nur wenn keine Einwaende. */
  const closeVorschlag = useCallback(
    async (input: { vorschlagId: string; circleOrigin: string; circleDate: string }) => {
      if (!currentUser?.id) return
      const item = vorschlaege.find((it) => it.id === input.vorschlagId)
      if (!item || item.createdBy !== currentUser.id) return
      const data = item.data as VorschlagData
      if ((data.signale?.einwand ?? []).length > 0) {
        throw new Error("Dieser Vorschlag traegt Einwaende — er kehrt in den Kreis zurueck.")
      }

      // Vorschlag als angenommen markieren
      await updateItem(item.id, {
        data: { ...data, status: "angenommen" } as unknown as Record<string, unknown>,
      })

      // Entscheidung als eigenes Item dokumentieren
      await createItem({
        type: WISSENSFELD_ITEM_TYPES.entscheidung,
        createdBy: currentUser.id,
        data: {
          content: data.content,
          tags: data.tags,
          circleOrigin: input.circleOrigin,
          circleDate: input.circleDate,
          vorschlagId: input.vorschlagId,
          frageId: data.frageId,
          felder: data.felder,
        } as unknown as Record<string, unknown>,
      })
    },
    [vorschlaege, currentUser?.id, updateItem, createItem]
  )

  const removeVorschlag = useCallback(
    async (vorschlagId: string) => {
      const v = vorschlaege.find((it) => it.id === vorschlagId)
      if (!v || v.createdBy !== currentUser?.id) return
      await deleteItem(vorschlagId)
    },
    [vorschlaege, currentUser?.id, deleteItem]
  )

  // ============================================================
  // Stimmungsbilder (Phase W5a) — leichte Konsent-Abfrage
  // ============================================================

  const stimmungsbilderSorted = useMemo<Item[]>(
    () => [...stimmungsbilder].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [stimmungsbilder]
  )

  /** Neues Stimmungsbild oeffnen */
  const openStimmungsbild = useCallback(
    async (input: {
      content: string
      tags?: string[]
      felder?: string[]
      circleOrigin?: string
    }): Promise<Item | null> => {
      if (!currentUser?.id) throw new Error("Du bist noch nicht im Kreis angekommen.")
      const data: StimmungsbildData = {
        content: input.content.trim(),
        tags: input.tags,
        felder: input.felder,
        circleOrigin: input.circleOrigin,
        signale: { lebendig: [], werdend: [], fremd: [] },
      }
      const created = await createItem({
        type: WISSENSFELD_ITEM_TYPES.stimmungsbild,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
      return created ?? null
    },
    [currentUser?.id, createItem]
  )

  /** Signal toggeln — ein User hat eine Stimme; neues Signal entfernt vorheriges. */
  const signalStimmungsbild = useCallback(
    async (stimmungsbildId: string, signal: keyof StimmungsbildSignale) => {
      if (!currentUser?.id) return
      const item = stimmungsbilder.find((it) => it.id === stimmungsbildId)
      if (!item) return
      const data = item.data as StimmungsbildData
      const next: StimmungsbildSignale = {
        lebendig: (data.signale?.lebendig ?? []).filter((id) => id !== currentUser.id),
        werdend: (data.signale?.werdend ?? []).filter((id) => id !== currentUser.id),
        fremd: (data.signale?.fremd ?? []).filter((id) => id !== currentUser.id),
      }
      const wasActive = (data.signale?.[signal] ?? []).includes(currentUser.id)
      if (!wasActive) next[signal].push(currentUser.id)
      await updateItem(item.id, {
        data: { ...data, signale: next } as unknown as Record<string, unknown>,
      })
    },
    [stimmungsbilder, currentUser?.id, updateItem]
  )

  const removeStimmungsbild = useCallback(
    async (stimmungsbildId: string) => {
      const s = stimmungsbilder.find((it) => it.id === stimmungsbildId)
      if (!s || s.createdBy !== currentUser?.id) return
      await deleteItem(stimmungsbildId)
    },
    [stimmungsbilder, currentUser?.id, deleteItem]
  )

  return {
    fragen: fragenSorted,
    antwortenByFrage,
    askFrage,
    giveAntwort,
    removeFrage,
    removeAntwort,
    toggleResonanz,
    // Konsent
    vorschlaege: vorschlaegeSorted,
    entscheidungen: entscheidungenSorted,
    proposeVorschlag,
    signalVorschlag,
    advanceVorschlag,
    closeVorschlag,
    removeVorschlag,
    // Stimmungsbilder
    stimmungsbilder: stimmungsbilderSorted,
    openStimmungsbild,
    signalStimmungsbild,
    removeStimmungsbild,
  }
}
