import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"

/**
 * Verleih-Buchungen fuer Marktplatz-Items (Phase M4).
 *
 * Datenmodell:
 *   `marketplace-booking` — eine Anfrage / Reservierung fuer ein lend-Item.
 *   data: { itemId, requesterId, start, end, status, comment }
 *
 * Workflow:
 *   1. Spieler waehlt Datums-Bereich + erstellt Buchung (status=pending)
 *   2. Owner sieht die Anfrage und drueckt approve/reject
 *   3. Approved Buchungen blocken den Kalender — andere koennen den Zeitraum
 *      nicht mehr buchen
 *   4. Nach dem Verleih kann Owner als "completed" markieren (optional)
 */

export const BOOKING_ITEM_TYPE = "marketplace-booking"

export type BookingStatus = "pending" | "approved" | "rejected" | "completed"

export interface BookingData {
  /** ID des Marktplatz-Items das geliehen wird */
  itemId: string
  /** User der ausleihen will (= createdBy) */
  requesterId: string
  /** Owner der das Item anbietet — nur Cache fuer Filter */
  ownerId: string
  /** ISO-Date-Strings (YYYY-MM-DD) */
  start: string
  end: string
  status: BookingStatus
  comment?: string
  respondedAt?: string
  respondedBy?: string
}

export function useBookingsForItem(itemId: string | null, ownerId: string | null) {
  const { data: bookings } = useItems({ type: BOOKING_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  /** Alle Buchungen fuer dieses Item, neueste zuerst. */
  const allForItem = useMemo<Item[]>(() => {
    if (!itemId) return []
    return bookings
      .filter((b) => (b.data as BookingData).itemId === itemId)
      .sort((a, b) => {
        const aStart = (a.data as BookingData).start
        const bStart = (b.data as BookingData).start
        return aStart.localeCompare(bStart)
      })
  }, [bookings, itemId])

  /** Approved-Buchungen fuer Kalender-Blocker. */
  const approved = useMemo<Item[]>(
    () => allForItem.filter((b) => (b.data as BookingData).status === "approved"),
    [allForItem]
  )

  /** Pending-Buchungen — Inbox fuer den Owner. */
  const pending = useMemo<Item[]>(
    () => allForItem.filter((b) => (b.data as BookingData).status === "pending"),
    [allForItem]
  )

  /** Eigene Buchungen fuer dieses Item. */
  const myBookings = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return allForItem.filter((b) => (b.data as BookingData).requesterId === currentUser.id)
  }, [allForItem, currentUser?.id])

  /** Kollidiert ein Datums-Bereich mit einer approved-Buchung? */
  const isRangeBlocked = useCallback(
    (start: string, end: string): boolean => {
      for (const b of approved) {
        const d = b.data as BookingData
        // Overlap-Test: zwei Bereiche ueberlappen wenn (a.start <= b.end) && (a.end >= b.start)
        if (start <= d.end && end >= d.start) return true
      }
      return false
    },
    [approved]
  )

  /** Erstellt eine Buchungsanfrage. */
  const requestBooking = useCallback(
    async (params: { start: string; end: string; comment?: string }) => {
      if (!currentUser?.id || !itemId || !ownerId) {
        throw new Error("Buchung nicht moeglich — fehlende Daten")
      }
      if (isRangeBlocked(params.start, params.end)) {
        throw new Error("Zeitraum ist bereits belegt")
      }
      const data: BookingData = {
        itemId,
        requesterId: currentUser.id,
        ownerId,
        start: params.start,
        end: params.end,
        status: "pending",
        comment: params.comment,
      }
      await createItem({
        type: BOOKING_ITEM_TYPE,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
    },
    [currentUser?.id, itemId, ownerId, isRangeBlocked, createItem]
  )

  /** Owner-Aktion: Anfrage bestaetigen. */
  const approve = useCallback(
    async (booking: Item) => {
      if (!currentUser?.id) return
      const d = booking.data as BookingData
      const next: BookingData = {
        ...d,
        status: "approved",
        respondedAt: new Date().toISOString(),
        respondedBy: currentUser.id,
      }
      await updateItem(booking.id, { data: next as unknown as Record<string, unknown> })
    },
    [currentUser?.id, updateItem]
  )

  /** Owner-Aktion: Anfrage ablehnen. */
  const reject = useCallback(
    async (booking: Item) => {
      if (!currentUser?.id) return
      const d = booking.data as BookingData
      const next: BookingData = {
        ...d,
        status: "rejected",
        respondedAt: new Date().toISOString(),
        respondedBy: currentUser.id,
      }
      await updateItem(booking.id, { data: next as unknown as Record<string, unknown> })
    },
    [currentUser?.id, updateItem]
  )

  /** Owner-Aktion: nach Rueckgabe als "completed" markieren. */
  const markCompleted = useCallback(
    async (booking: Item) => {
      const d = booking.data as BookingData
      const next: BookingData = { ...d, status: "completed" }
      await updateItem(booking.id, { data: next as unknown as Record<string, unknown> })
    },
    [updateItem]
  )

  /** Eigene Buchung zurueckziehen (nur wenn pending). */
  const cancelOwn = useCallback(
    async (booking: Item) => {
      if (!currentUser?.id) return
      const d = booking.data as BookingData
      if (d.requesterId !== currentUser.id) return
      if (d.status !== "pending") return
      await deleteItem(booking.id)
    },
    [currentUser?.id, deleteItem]
  )

  /** Naechster freier Tag ab heute. ISO-Date oder null wenn sehr weit weg. */
  const nextFreeDate = useMemo<string | null>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      if (!isRangeBlocked(iso, iso)) return iso
    }
    return null
  }, [isRangeBlocked])

  return {
    all: allForItem,
    approved,
    pending,
    myBookings,
    isRangeBlocked,
    nextFreeDate,
    requestBooking,
    approve,
    reject,
    markCompleted,
    cancelOwn,
  }
}
