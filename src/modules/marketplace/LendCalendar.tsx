import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, CheckCircle2, Clock, X, Users } from "lucide-react"
import {
  Button,
  Input,
  Label,
  Textarea,
  useCurrentUser,
  useMembers,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { useBookingsForItem, type BookingData, type BookingStatus } from "./use-bookings"

/**
 * LendCalendar — Verfuegbarkeits-Strip + Buchungs-Form + Owner-Inbox.
 *
 * Wird nur im Detail-View bei priceType=lend angezeigt.
 *
 * Drei Sektionen:
 *   1. Verfuegbarkeits-Strip — naechste 30 Tage als Spalten (rot=belegt,
 *      gruen=frei, gelb=angefragt). Zeigt auf einen Blick, wann die
 *      Motorsaege frei ist.
 *   2. Buchungs-Form (fuer Nicht-Owner) — Datums-Bereich + Kommentar.
 *   3. Owner-Inbox + Buchungsliste — Anfragen approve/reject, bestaetigte
 *      Buchungen mit Requester-Name.
 */

export interface LendCalendarProps {
  itemId: string
  ownerId: string
  spaceId: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return isoDate(t)
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "angefragt",
  approved: "bestaetigt",
  rejected: "abgelehnt",
  completed: "abgeschlossen",
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "#F59E0B",
  approved: "#10B981",
  rejected: "#94A3B8",
  completed: "#6366F1",
}

export function LendCalendar({ itemId, ownerId, spaceId }: LendCalendarProps) {
  const { data: currentUser } = useCurrentUser()
  const { data: members } = useMembers(spaceId)
  const isOwner = currentUser?.id === ownerId

  const {
    all,
    approved,
    pending,
    myBookings,
    nextFreeDate,
    requestBooking,
    approve,
    reject,
    markCompleted,
    cancelOwn,
  } = useBookingsForItem(itemId, ownerId)

  const [start, setStart] = useState<string>(() => todayIso())
  const [end, setEnd] = useState<string>(() => addDays(todayIso(), 1))
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 30-Tage-Strip ab heute
  const days = useMemo(() => {
    const result: Array<{ iso: string; label: string; weekday: string; status: BookingStatus | null }> = []
    const t = todayIso()
    for (let i = 0; i < 30; i++) {
      const iso = addDays(t, i)
      const date = new Date(iso)
      const weekday = date.toLocaleDateString("de-DE", { weekday: "narrow" })
      const label = date.getDate().toString()

      let status: BookingStatus | null = null
      // Approved hat Vorrang ueber Pending
      for (const b of approved) {
        const d = b.data as BookingData
        if (iso >= d.start && iso <= d.end) {
          status = "approved"
          break
        }
      }
      if (!status) {
        for (const b of pending) {
          const d = b.data as BookingData
          if (iso >= d.start && iso <= d.end) {
            status = "pending"
            break
          }
        }
      }
      result.push({ iso, label, weekday, status })
    }
    return result
  }, [approved, pending])

  const memberName = (id: string): string => {
    const m = members.find((mm) => mm.id === id)
    return m?.displayName ?? id.slice(0, 8)
  }

  const handleRequest = async () => {
    if (!start || !end) return
    if (start > end) {
      setError("End-Datum muss nach Start-Datum liegen.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await requestBooking({ start, end, comment: comment.trim() || undefined })
      setComment("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Buchung fehlgeschlagen")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 border-t pt-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" style={{ color: "#F59E0B" }} />
        <h3 className="text-base font-bold">Verfuegbarkeit</h3>
        {nextFreeDate && (
          <span className="text-xs text-muted-foreground ml-auto">
            Naechste freie Zeit:{" "}
            <span className="font-semibold text-foreground">
              {new Date(nextFreeDate).toLocaleDateString("de-DE", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </span>
        )}
      </div>

      {/* 30-Tage-Strip */}
      <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-px bg-muted/40 rounded-md overflow-hidden p-px">
        {days.map((d) => {
          const bg =
            d.status === "approved"
              ? STATUS_COLOR.approved
              : d.status === "pending"
              ? STATUS_COLOR.pending
              : "#fff"
          const fg = d.status ? "#fff" : "var(--foreground)"
          const titleParts = [
            new Date(d.iso).toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }),
            d.status ? STATUS_LABEL[d.status] : "frei",
          ]
          return (
            <div
              key={d.iso}
              className="aspect-[2/3] flex flex-col items-center justify-center text-[8px] font-semibold leading-none"
              style={{ background: bg, color: fg, opacity: d.status ? 1 : 0.7 }}
              title={titleParts.join(" — ")}
            >
              <span className="opacity-70 mb-0.5">{d.weekday}</span>
              <span>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLOR.approved }} />
          bestaetigt
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLOR.pending }} />
          angefragt
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-white border" />
          frei
        </span>
      </div>

      {/* Buchungs-Form fuer Nicht-Owner */}
      {!isOwner && currentUser?.id && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" />
            Buchung anfragen
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Von</Label>
              <Input
                type="date"
                value={start}
                min={todayIso()}
                onChange={(e) => setStart(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Bis</Label>
              <Input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Anmerkung (optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Wofuer brauchst du es? Wann holst du ab?"
              className="min-h-16"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={handleRequest} disabled={busy}>
              {busy ? "Sende..." : "Anfrage senden"}
            </Button>
          </div>

          {/* Eigene laufende Buchungen */}
          {myBookings.length > 0 && (
            <div className="border-t pt-3 space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deine Anfragen
              </div>
              {myBookings.map((b) => {
                const d = b.data as BookingData
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                        style={{ background: STATUS_COLOR[d.status] }}
                      >
                        {STATUS_LABEL[d.status]}
                      </span>
                      <span className="truncate">
                        {new Date(d.start).toLocaleDateString("de-DE")} –{" "}
                        {new Date(d.end).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    {d.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => cancelOwn(b)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        title="Anfrage zurueckziehen"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Owner-Inbox + Buchungsliste */}
      {isOwner && (
        <OwnerBookingList
          bookings={all}
          memberName={memberName}
          onApprove={approve}
          onReject={reject}
          onComplete={markCompleted}
        />
      )}
    </div>
  )
}

function OwnerBookingList({
  bookings,
  memberName,
  onApprove,
  onReject,
  onComplete,
}: {
  bookings: Item[]
  memberName: (id: string) => string
  onApprove: (b: Item) => Promise<void>
  onReject: (b: Item) => Promise<void>
  onComplete: (b: Item) => Promise<void>
}) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border-dashed border-2 p-4 text-center text-xs text-muted-foreground">
        <Users className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/40" />
        Noch keine Buchungsanfragen.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Users className="h-4 w-4" />
        Buchungen ({bookings.length})
      </div>
      {bookings.map((b) => {
        const d = b.data as BookingData
        return (
          <div
            key={b.id}
            className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border"
          >
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 mt-0.5"
              style={{ background: STATUS_COLOR[d.status] }}
            >
              {STATUS_LABEL[d.status]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {memberName(d.requesterId)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(d.start).toLocaleDateString("de-DE", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                bis{" "}
                {new Date(d.end).toLocaleDateString("de-DE", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </div>
              {d.comment && (
                <div className="text-xs italic mt-1 text-muted-foreground">
                  &laquo;{d.comment}&raquo;
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {d.status === "pending" && (
                <>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onReject(b)}>
                    Ablehnen
                  </Button>
                  <Button size="sm" className="h-7 px-2" onClick={() => onApprove(b)}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    OK
                  </Button>
                </>
              )}
              {d.status === "approved" && (
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onComplete(b)}>
                  Erledigt
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
