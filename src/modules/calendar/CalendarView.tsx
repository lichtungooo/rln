import { useState, useMemo, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight, CalendarDays, List, Layers, MapPin, Tag, Ticket, Clock, Grid3x3, User as UserIcon, X, Download, Link as LinkIcon, Check } from "lucide-react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useCurrentUser,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogTitle,
  AdaptivePanel,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import { CalendarSettingsPanel } from "./CalendarSettingsPanel"
import { MarkdownEditor, MarkdownView } from "./MarkdownEditor"
import { ImageUploadField } from "./ImageUploadField"
import { LocationField, type EventLocation } from "./LocationField"
import { RecurrenceEditor } from "./RecurrenceEditor"
import { expandRecurrence, summarizeRecurrence, type RecurrenceRule, type ExpandedInstance } from "./recurrence"
import { ReminderEditor } from "./ReminderEditor"
import type { Reminder } from "./reminders"
import { useReminderScheduler } from "./useReminderScheduler"
import { ParticipationControls } from "./ParticipationControls"
import { useMyParticipations } from "./useParticipation"
import { generateIcs, downloadIcs, buildIcsDataUrl } from "./ics"
import { SelectionProvider, useChannel, useChannelSync } from "../../components/SelectionContext"
import { CalendarFilterBar, applyCalendarFilter, collectHashtags, emptyFilter, type CalendarFilterState } from "./CalendarFilterBar"
import { DayView } from "./views/DayView"
import { YearView } from "./views/YearView"
import { MyEventsView } from "./views/MyEventsView"
import { useCalendars } from "./useCalendars"
import { TagInput } from "../profile/TagInput"
import { EmptyDemoBanner } from "../../demo/EmptyDemoBanner"
import { PageGrid } from "../../components/PageGrid"
import { StatsBar } from "../gamification"

// ============================================================
// Types
// ============================================================

export type CalendarMode = "event-calendar" | "group-calendar" | "mixed"
export type CalendarView = "day" | "week" | "month" | "year" | "agenda" | "mine"
export type FirstDayOfWeek = "monday" | "sunday"
export type TimeFormat = "24h" | "12h"

export interface CalendarModuleConfig {
  mode: CalendarMode
  defaultView: CalendarView
  /** Welche Item-Typen werden angezeigt? */
  itemTypes: string[]
  /** Farbe pro Item-Typ */
  colors?: Record<string, string>
  firstDayOfWeek: FirstDayOfWeek
  timeFormat: TimeFormat
  /** Standard-Dauer fuer neue Termine (Minuten) */
  defaultDurationMinutes?: number
  /** "Neuer Termin"-Button anzeigen */
  showCreateButton?: boolean
  /** Standard-Reminder fuer neue Events (Minuten vor Start). undefined = aus. */
  defaultReminderMinutes?: number
  /** Browser-Notifications aktivieren */
  notificationsEnabled?: boolean
}

/**
 * Default-Konfig — "alles an" (Demo-First / Subtraction-Design).
 *
 * Frischer Kalender zeigt Events + Termine + Quests. Admins schalten
 * ueber das Inline-Zahnrad ab, was sie nicht brauchen.
 */
export const calendarDefaultConfig: CalendarModuleConfig = {
  mode: "mixed",
  defaultView: "month",
  itemTypes: ["event", "appointment", "quest", "marketplace-booking"],
  colors: {
    event: "#3b82f6",
    appointment: "#10b981",
    quest: "#a855f7",
    "marketplace-booking": "#F59E0B",
  },
  firstDayOfWeek: "monday",
  timeFormat: "24h",
  defaultDurationMinutes: 60,
  showCreateButton: true,
  defaultReminderMinutes: 15,
  notificationsEnabled: true,
}

export interface CalendarViewProps extends ModuleViewProps<CalendarModuleConfig> {
  isPreview?: boolean
}

// ============================================================
// Constants
// ============================================================

const MONTH_NAMES = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

const WEEKDAYS_MO = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const WEEKDAYS_SO = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

// ============================================================
// View
// ============================================================

export function CalendarView(props: CalendarViewProps) {
  // SelectionProvider wraps — Channel "event" fuer Klick-Routing zwischen
  // Calendar-View-Slot (Source) und Event-Detail-Slot (Detail).
  // Klick-Routing-Doktrin: KEIN Modal fuer Detail-Vorschau, sondern 2-Slot-
  // Grid pro Page.
  return (
    <SelectionProvider storageKey={`rln-calendar-${props.spaceId ?? "default"}`}>
      <CalendarInner {...props} />
    </SelectionProvider>
  )
}

function CalendarInner({ spaceId, activeGroup, config, isPreview, onOpenSettings }: CalendarViewProps) {
  const cfg = { ...calendarDefaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)

  // Aktive View persistieren pro Space — User kommt zurueck zur gleichen Ansicht
  const viewStorageKey = `rln-calendar-view-${spaceId ?? "default"}`
  const [activeView, setActiveViewRaw] = useState<CalendarView>(() => {
    try {
      const raw = localStorage.getItem(viewStorageKey)
      if (raw && ["day", "week", "month", "year", "agenda", "events", "mine"].includes(raw)) {
        return raw as CalendarView
      }
    } catch {
      // egal
    }
    return cfg.defaultView
  })
  const setActiveView = useCallback(
    (v: CalendarView) => {
      setActiveViewRaw(v)
      try {
        localStorage.setItem(viewStorageKey, v)
      } catch {
        // egal
      }
    },
    [viewStorageKey]
  )
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [currentDay, setCurrentDay] = useState(() => new Date())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [creating, setCreating] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const eventChannel = useChannel("event")
  const [filter, setFilter] = useState<CalendarFilterState>(emptyFilter)
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { mutate: deleteItem } = useDeleteItem()

  // Items pro Typ holen (max 3)
  const eventItems = useItems({ type: cfg.itemTypes.includes("event") ? "event" : "__none__" }).data
  const apptItems = useItems({ type: cfg.itemTypes.includes("appointment") ? "appointment" : "__none__" }).data
  const questItems = useItems({ type: cfg.itemTypes.includes("quest") ? "quest" : "__none__" }).data
  // Marktplatz-Bookings: werden in virtuelle Termine umgemappt mit Titel aus
  // dem zugehoerigen offer-Item ("Verleih: Akkuschrauber Bosch").
  const showBookings = cfg.itemTypes.includes("marketplace-booking")
  const bookingItems = useItems({ type: showBookings ? "marketplace-booking" : "__none__" }).data
  const offerItems = useItems({ type: showBookings ? "offer" : "__none__" }).data

  // Bookings → virtuelle Events (mit data.title + data.start + data.end).
  // Approved + pending sind sichtbar; rejected werden ausgeblendet.
  const bookingAsEvents = useMemo<Item[]>(() => {
    if (!showBookings) return []
    const offerById = new Map(offerItems.map((o) => [o.id, o]))
    return bookingItems
      .map((b) => {
        const d = b.data as Record<string, unknown>
        const status = d.status as string | undefined
        if (status === "rejected") return null
        const itemId = d.itemId as string | undefined
        const offer = itemId ? offerById.get(itemId) : null
        const offerTitle = (offer?.data as Record<string, unknown> | undefined)?.title
        const title = offerTitle ? `Verleih: ${offerTitle}` : "Verleih"
        const start = d.start as string | undefined
        const end = d.end as string | undefined
        if (!start || !end) return null
        // Status-Marker im Titel fuer pending
        const finalTitle = status === "pending" ? `${title} (angefragt)` : title
        const virt: Item = {
          ...b,
          data: {
            ...d,
            title: finalTitle,
            start,
            end,
            // Marker damit der Edit-Dialog weiss: das ist read-only
            _isMarketplaceBooking: true,
          },
        }
        return virt
      })
      .filter((it): it is Item => it !== null)
  }, [bookingItems, offerItems, showBookings])

  const rawItems = useMemo(
    () =>
      [...eventItems, ...apptItems, ...questItems, ...bookingAsEvents].filter(
        (it) => it.data.start
      ),
    [eventItems, apptItems, questItems, bookingAsEvents]
  )

  // Participation fuer Filter
  const { acceptedEventIds, observingEventIds } = useMyParticipations()

  // Multi-Calendar: nur Events sichtbarer Kalender zeigen
  const { calendars, visibleCalendarIds, defaultCalendar } = useCalendars()

  const itemsAfterCalendarFilter = useMemo(() => {
    // Wenn keine Kalender existieren: zeige alles (Backward-Compat)
    if (calendars.length === 0) return rawItems
    return rawItems.filter((it) => {
      const calId = it.data.calendarId as string | undefined
      // Events ohne calendarId zeigen (legacy / vor Phase 8)
      if (!calId) return true
      return visibleCalendarIds.has(calId)
    })
  }, [rawItems, calendars.length, visibleCalendarIds])

  // Filter anwenden
  const allItems = useMemo(
    () =>
      applyCalendarFilter(itemsAfterCalendarFilter, filter, {
        currentUserId: currentUser?.id,
        acceptedEventIds,
        observingEventIds,
      }),
    [itemsAfterCalendarFilter, filter, currentUser?.id, acceptedEventIds, observingEventIds]
  )

  const availableHashtags = useMemo(() => collectHashtags(rawItems), [rawItems])

  // Reminder-Scheduler (Browser-Notifications, nur ausserhalb von Preview)
  useReminderScheduler({
    events: !isPreview && cfg.notificationsEnabled ? allItems : [],
    defaultReminderMinutes: cfg.defaultReminderMinutes,
    onItemOpen: setEditItem,
  })

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      const itemType = cfg.mode === "group-calendar" ? "appointment" : "event"
      // Default-Calendar zuweisen wenn nicht explizit gesetzt
      const calendarId = data.calendarId ?? defaultCalendar?.id
      await createItem({
        type: itemType,
        createdBy: currentUser?.id ?? "anonymous",
        data: { ...data, calendarId },
      })
      setCreating(false)
    },
    [createItem, currentUser?.id, cfg.mode, defaultCalendar?.id]
  )

  const handleUpdate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!editItem) return
      await updateItem(editItem.id, { data: { ...editItem.data, ...data } })
      setEditItem(null)
    },
    [editItem, updateItem]
  )

  const handleDelete = useCallback(async () => {
    if (!editItem) return
    await deleteItem(editItem.id)
    setEditItem(null)
  }, [editItem, deleteItem])

  // Marketplace-Bookings sind im Kalender nur sichtbar, nicht editierbar.
  // Sie werden im Marktplatz-Modul verwaltet — hier waere die Bearbeitung
  // verwirrend (Status/itemId nicht in den Calendar-Feldern abbildbar).
  // Klick auf Event → Channel "event" select → EventDetailPanel im
  // 2. Slot zeigt die Vorschau. Klick-Routing-Doktrin: KEIN Modal,
  // Detail lebt im naechsten Slot rechts.
  const handleItemClick = useCallback((item: Item) => {
    if ((item.data as Record<string, unknown>)._isMarketplaceBooking) {
      return
    }
    eventChannel.select(item.id)
  }, [eventChannel])

  // Calendar als PageGrid mit 6 lockPages — Klick-Routing-Doktrin:
  // 2 Slots pro Page: links Calendar-View (colSpan 4), rechts Event-
  // Detail (colSpan 2). Klick auf Event → Detail erscheint im 2. Slot.
  const calendarPages = [
    { id: "day", name: "Tag", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
    { id: "week", name: "Woche", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
    { id: "month", name: "Monat", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
    { id: "year", name: "Jahr", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
    { id: "agenda", name: "Agenda", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
    { id: "mine", name: "Meine", slots: [
      { id: "view", widget: "calendar-view", colSpan: 4 as const, rowSpan: 4 as const },
      { id: "detail", widget: "event-detail", colSpan: 2 as const, rowSpan: 4 as const },
    ]},
  ]

  // Items im Channel registrieren — damit navApi-Pfeile durch Events
  // blaettern koennen
  useChannelSync("event", allItems)

  return (
    <PageGrid
      storageKey={`rln-calendar-v2-${spaceId ?? "default"}`}
      defaultPages={calendarPages}
      availableWidgets={[
        { id: "calendar-view", label: "Kalender-Sicht", defaultColSpan: 4, defaultRowSpan: 4 },
        { id: "event-detail", label: "Event-Detail", defaultColSpan: 2, defaultRowSpan: 4 },
      ]}
      lockPages
      onActivePageChange={(id) => setActiveView(id as CalendarView)}
      headerRight={<StatsBar />}
      renderWidget={(widgetId) => {
        if (widgetId === "event-detail") {
          return (
            <EventDetailPanel
              items={allItems}
              currentUserId={currentUser?.id}
              colors={cfg.colors ?? {}}
              onEdit={(item) => setEditItem(item)}
            />
          )
        }
        // Default: calendar-view — Toolbar oben (Abonnieren + Neuer Eintrag)
        // statt im PageGrid-Header. Scrollverhalten je nach activeView.
        const isAgenda = activeView === "agenda" || activeView === "mine"
        return (
          <div className={`h-full w-full bg-card border rounded-xl flex flex-col`}>
            {/* Toolbar im Slot — Abonnieren + Neuer Eintrag */}
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-b shrink-0">
              <Button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                size="sm"
                variant="ghost"
                className="h-7"
                title="Kalender abonnieren oder als ICS exportieren"
              >
                <LinkIcon className="h-3.5 w-3.5 mr-1" />
                Abonnieren
              </Button>
              {cfg.showCreateButton && (
                <Button onClick={() => setCreating(true)} size="sm" className="h-7">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Neuer Eintrag
                </Button>
              )}
            </div>

            <div className={`flex-1 min-h-0 p-3 space-y-4 relative ${isAgenda ? "overflow-y-auto" : "overflow-hidden"}`}>
      {/* Empty-State: keiner Termin im Space → Demo-Banner mit Lade-Knopf */}
      {!isPreview && activeGroup && (
        <EmptyDemoBanner
          visible={rawItems.length === 0 && !creating && !editItem}
          isAdmin={isAdmin}
          inline
          title="Noch kein Termin im Kalender"
          adminText="Lass uns mit Demo-Events starten — Sommerfest in Kreuzberg, 3D-Druck-Sprechstunde, Macher-Festival Ferropolis. Plus Werkstaetten und Macher mit Standort. Du kannst alles jederzeit wieder loeschen."
          memberText="Sobald ein Admin Events anlegt, erscheinen sie hier."
        />
      )}

      {/* View-Inhalt */}
      {activeView === "day" && (
        <DayView
          items={allItems}
          currentDay={currentDay}
          onDayChange={setCurrentDay}
          timeFormat={cfg.timeFormat}
          colors={cfg.colors ?? {}}
          onItemClick={handleItemClick}
        />
      )}
      {activeView === "month" && (
        <MonthView
          items={allItems}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          firstDayOfWeek={cfg.firstDayOfWeek}
          colors={cfg.colors ?? {}}
          onItemClick={handleItemClick}
        />
      )}
      {activeView === "year" && (
        <YearView
          items={allItems}
          currentYear={currentYear}
          onYearChange={setCurrentYear}
          firstDayOfWeek={cfg.firstDayOfWeek}
          onDaySelect={(d) => {
            setCurrentMonth(d)
            setActiveView("month")
          }}
        />
      )}
      {activeView === "week" && (
        <AgendaView items={allItems} colors={cfg.colors ?? {}} timeFormat={cfg.timeFormat} onItemClick={handleItemClick} weekOnly />
      )}
      {activeView === "agenda" && (
        <AgendaView items={allItems} colors={cfg.colors ?? {}} timeFormat={cfg.timeFormat} onItemClick={handleItemClick} />
      )}
      {activeView === "mine" && (
        <MyEventsView
          items={allItems}
          colors={cfg.colors ?? {}}
          timeFormat={cfg.timeFormat}
          onItemClick={handleItemClick}
        />
      )}

      {/* Create-Dialog */}
      <EventFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
        defaultDuration={cfg.defaultDurationMinutes ?? 60}
        title={cfg.mode === "group-calendar" ? "Neuer Termin" : "Neues Event"}
        availableHashtags={availableHashtags}
      />

      {/* EventDetailModal entfernt 2026-05-12 — Detail lebt im 2. Slot
          via EventDetailPanel (Klick-Routing-Doktrin, kein Modal). */}

      {/* Edit-Modal — bleibt als echte Aktion, nicht Detail-Routing */}
      <Dialog open={editItem !== null} onOpenChange={(o) => { if (!o) setEditItem(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {editItem && (
            <EventEditForm
              item={editItem}
              onSubmit={handleUpdate}
              onDelete={handleDelete}
              onCancel={() => setEditItem(null)}
              currentUserId={currentUser?.id}
              availableHashtags={availableHashtags}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Subscribe-Modal — Kalender abonnieren via ICS-Download oder Data-URL */}
      <SubscribeModal
        items={allItems}
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        feedName={`Real Life Network — ${activeGroup?.name ?? "Kalender"}`}
      />
            </div>
          </div>
        )
      }}
    />
  )
}

// ============================================================
// Helper: Items + Recurrence-Expansion → flache Liste fuer Render
// ============================================================

interface RenderInstance {
  item: Item
  start: Date
  end: Date | null
  /** Index der Recurrence-Instanz (0 = Original / einmalig) */
  instanceIndex: number
  /** Eindeutiger Key fuer React */
  key: string
}

function expandItemsForRange(items: Item[], rangeStart: Date, rangeEnd: Date): RenderInstance[] {
  const out: RenderInstance[] = []
  for (const item of items) {
    const start = new Date(String(item.data.start))
    if (isNaN(start.getTime())) continue
    const end = item.data.end ? new Date(String(item.data.end)) : null
    const rule = item.data.recurrence as RecurrenceRule | undefined

    const expanded: ExpandedInstance[] = expandRecurrence(start, end, rule, rangeStart, rangeEnd)
    for (const inst of expanded) {
      out.push({
        item,
        start: inst.start,
        end: inst.end,
        instanceIndex: inst.index,
        key: `${item.id}#${inst.index}`,
      })
    }
  }
  return out
}

// ============================================================
// MonthView (Grid mit Tagen + Punkte fuer Events)
// ============================================================

function MonthView({
  items,
  currentMonth,
  onMonthChange,
  firstDayOfWeek,
  colors,
  onItemClick,
}: {
  items: Item[]
  currentMonth: Date
  onMonthChange: (d: Date) => void
  firstDayOfWeek: FirstDayOfWeek
  colors: Record<string, string>
  onItemClick: (item: Item) => void
}) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const weekdays = firstDayOfWeek === "monday" ? WEEKDAYS_MO : WEEKDAYS_SO

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDayOfWeek === "monday"
      ? (firstDay === 0 ? 6 : firstDay - 1)
      : firstDay
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Range fuer Recurrence-Expansion: kompletter sichtbarer Monat (auch Vor-/Nach-Schau)
    const rangeStart = new Date(year, month, 1 - startOffset)
    const rangeEnd = new Date(year, month, daysInMonth + (42 - startOffset - daysInMonth) + 1)
    const instances = expandItemsForRange(items, rangeStart, rangeEnd)

    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - startOffset + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      const date = new Date(year, month, dayNum)
      const dayInstances = instances.filter((inst) => {
        return (
          inst.start.getDate() === date.getDate() &&
          inst.start.getMonth() === date.getMonth() &&
          inst.start.getFullYear() === date.getFullYear()
        )
      })
      return {
        date,
        number: dayNum,
        isCurrentMonth: inMonth,
        isToday: isCurrentMonth && dayNum === today.getDate(),
        instances: dayInstances,
      }
    })
  }, [year, month, items, firstDayOfWeek, isCurrentMonth, today])

  const navigate = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    onMonthChange(next)
  }

  return (
    <div className="space-y-2">
      {/* Kompakter Header — Card-Wrapper raus 2026-05-12 (Timo: Monat
          muss viel kompakter sein) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{MONTH_NAMES[month]} {year}</span>
        <div className="flex gap-0.5 items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onMonthChange(new Date())}>
            Heute
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center bg-border/50 rounded-md overflow-hidden border">
        {weekdays.map((d) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground py-1 bg-muted/30">{d}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            className={`min-h-[3.5rem] p-1 text-[11px] flex flex-col gap-0.5 bg-background ${
              !d.isCurrentMonth
                ? "text-muted-foreground/30 bg-muted/10"
                : d.isToday
                ? "bg-primary/10 font-semibold"
                : "hover:bg-muted/30"
            }`}
          >
            <span className="text-right leading-none">{d.number}</span>
            <div className="flex-1 flex flex-wrap gap-0.5 items-start content-start">
              {d.instances.slice(0, 4).map((inst) => (
                <button
                  key={inst.key}
                  onClick={() => onItemClick(inst.item)}
                  className="w-1.5 h-1.5 rounded-full hover:scale-150 transition-transform"
                  style={{ background: colors[inst.item.type] ?? "#888" }}
                  title={String(inst.item.data.title ?? "")}
                />
              ))}
              {d.instances.length > 4 && (
                <span className="text-[8px] text-muted-foreground leading-none">+{d.instances.length - 4}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// AgendaView (Liste sortiert nach Datum)
// ============================================================

function AgendaView({
  items,
  colors,
  timeFormat,
  onItemClick,
  weekOnly,
}: {
  items: Item[]
  colors: Record<string, string>
  timeFormat: TimeFormat
  onItemClick: (item: Item) => void
  weekOnly?: boolean
}) {
  const instances = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = weekOnly
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    return expandItemsForRange(items, rangeStart, rangeEnd).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
  }, [items, weekOnly])

  if (instances.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        {weekOnly ? "Diese Woche keine Termine." : "Keine kommenden Termine."}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {instances.map((inst) => {
        const it = inst.item
        const d = inst.start
        const loc = it.data.location as EventLocation | undefined
        const cover = it.data.coverImageUrl as string | undefined
        const hashtags = (it.data.hashtags as string[] | undefined) ?? []
        const rule = it.data.recurrence as RecurrenceRule | undefined
        return (
          <button
            key={inst.key}
            onClick={() => onItemClick(it)}
            className="w-full text-left p-3 border rounded-lg hover:bg-muted/30 transition-colors flex gap-3 items-start"
          >
            <div
              className="w-1 self-stretch rounded-full shrink-0"
              style={{ background: colors[it.type] ?? "#888" }}
            />
            {cover && (
              <img src={cover} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm flex items-center gap-2">
                {String(it.data.title ?? "(ohne Titel)")}
                {rule && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {summarizeRecurrence(rule)}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(d, timeFormat)}
                {loc?.address && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <MapPin className="h-3 w-3" />
                    {loc.address}
                  </span>
                )}
              </div>
              {it.data.plainDescription && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {String(it.data.plainDescription)}
                </div>
              )}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hashtags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ============================================================
// EventListView (Cards mit Bildern)
// ============================================================

function EventListView({
  items,
  colors,
  onItemClick,
}: {
  items: Item[]
  colors: Record<string, string>
  onItemClick: (item: Item) => void
}) {
  const instances = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    return expandItemsForRange(items, rangeStart, rangeEnd).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
  }, [items])

  if (instances.length === 0) {
    return <div className="py-12 text-center text-muted-foreground text-sm">Keine Events.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {instances.map((inst) => {
        const it = inst.item
        const cover = it.data.coverImageUrl as string | undefined
        const d = inst.start
        const loc = it.data.location as EventLocation | undefined
        const hashtags = (it.data.hashtags as string[] | undefined) ?? []
        const price = it.data.price as string | undefined
        const rule = it.data.recurrence as RecurrenceRule | undefined
        return (
          <Card
            key={inst.key}
            className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
            onClick={() => onItemClick(it)}
          >
            {cover && (
              <div className="aspect-[16/9] bg-muted">
                <img src={cover} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <div className="w-1 h-5 rounded-full mt-0.5" style={{ background: colors[it.type] ?? "#888" }} />
                <CardTitle className="text-base flex-1">
                  {String(it.data.title ?? "(ohne Titel)")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                {rule && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    {summarizeRecurrence(rule)}
                  </span>
                )}
              </div>
              {loc?.address && (
                <div className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {loc.address}
                </div>
              )}
              {price && (
                <div className="inline-flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  {price}
                </div>
              )}
              {it.data.plainDescription && (
                <p className="text-foreground/70 line-clamp-2 pt-1">
                  {String(it.data.plainDescription)}
                </p>
              )}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {hashtags.slice(0, 5).map((t) => (
                    <span key={t} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                      <Tag className="h-2 w-2" />
                      {t.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ============================================================
// Event-Form (Dialog + Edit-Form)
// ============================================================

function EventFormDialog({
  open,
  onClose,
  onSubmit,
  defaultDuration,
  title,
  availableHashtags,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  defaultDuration: number
  title: string
  availableHashtags?: string[]
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogTitle>{title}</DialogTitle>
        <EventForm
          initialData={{}}
          onSubmit={async (data) => {
            await onSubmit(data)
          }}
          onCancel={onClose}
          defaultDuration={defaultDuration}
          availableHashtags={availableHashtags}
        />
      </DialogContent>
    </Dialog>
  )
}

function EventEditForm({
  item,
  onSubmit,
  onDelete,
  onCancel,
  currentUserId,
  availableHashtags,
}: {
  item: Item
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onDelete: () => void
  onCancel: () => void
  currentUserId?: string
  availableHashtags?: string[]
}) {
  const isOwn = currentUserId === item.createdBy
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Participation oben */}
        <ParticipationControls eventId={item.id} isOwnEvent={isOwn} />

        <h3 className="font-semibold">Bearbeiten</h3>
        <EventForm
          initialData={item.data}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={isOwn ? onDelete : undefined}
          defaultDuration={60}
          availableHashtags={availableHashtags}
        />
      </div>
    </div>
  )
}

function EventForm({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  defaultDuration,
  availableHashtags,
}: {
  initialData: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  defaultDuration: number
  /** Vorhandene Hashtags fuer Autocomplete. */
  availableHashtags?: string[]
}) {
  const { calendars, defaultCalendar } = useCalendars()
  const [calendarId, setCalendarId] = useState<string | undefined>(
    (initialData.calendarId as string | undefined) ?? defaultCalendar?.id
  )
  const [title, setTitle] = useState(String(initialData.title ?? ""))
  const [start, setStart] = useState(toDateTimeLocal(initialData.start))
  const [end, setEnd] = useState(toDateTimeLocal(initialData.end))
  const [allDay, setAllDay] = useState(Boolean(initialData.allDay))
  // Mehrtaegig-Modus: Datum-Range statt Single-Datetime
  const initialMultiDay = Boolean(
    initialData.start && initialData.end && computeIsMultiDay(initialData.start, initialData.end)
  )
  const [multiDay, setMultiDay] = useState(initialMultiDay)
  const [markdownBody, setMarkdownBody] = useState(String(initialData.markdownBody ?? initialData.description ?? ""))
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(
    initialData.coverImageUrl as string | undefined
  )
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[] | undefined>(
    initialData.galleryImageUrls as string[] | undefined
  )
  const [location, setLocation] = useState<EventLocation | undefined>(
    initialData.location as EventLocation | undefined
  )
  const [price, setPrice] = useState(String(initialData.price ?? ""))
  const [ticketUrl, setTicketUrl] = useState(String(initialData.ticketUrl ?? ""))
  const [hashtags, setHashtags] = useState<string[]>(
    Array.isArray(initialData.hashtags) ? (initialData.hashtags as string[]) : []
  )
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(
    initialData.recurrence as RecurrenceRule | undefined
  )
  const [reminders, setReminders] = useState<Reminder[]>(
    (initialData.reminders as Reminder[] | undefined) ?? []
  )
  const [saving, setSaving] = useState(false)
  // Optionale Sektionen — kollabiert by default ausser wenn schon befuellt
  const [showRecurrence, setShowRecurrence] = useState(Boolean(initialData.recurrence))
  const [showReminders, setShowReminders] = useState(
    Array.isArray(initialData.reminders) && (initialData.reminders as Reminder[]).length > 0
  )
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialData.galleryImageUrls || initialData.price || initialData.ticketUrl)
  )

  // Auto-Endzeit bei Startzeit-Eingabe
  const handleStartChange = (v: string) => {
    setStart(v)
    if (!end && v) {
      const startDate = new Date(v)
      const endDate = new Date(startDate.getTime() + defaultDuration * 60 * 1000)
      setEnd(toDateTimeLocal(endDate.toISOString()))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Hashtags normalisieren: # Prefix sicherstellen, lowercase, dedupe
      const normalizedHashtags = Array.from(
        new Set(
          hashtags
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .map((t) => (t.startsWith("#") ? t : `#${t}`))
        )
      )

      // plainDescription aus Markdown (fuer Suche)
      const plainDescription = markdownBody
        .replace(/[#*`>_-]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 500)

      await onSubmit({
        title: title.trim(),
        start: start ? new Date(start).toISOString() : undefined,
        end: end ? new Date(end).toISOString() : undefined,
        allDay,
        markdownBody: markdownBody.trim() || undefined,
        plainDescription: plainDescription || undefined,
        coverImageUrl,
        galleryImageUrls: galleryImageUrls && galleryImageUrls.length > 0 ? galleryImageUrls : undefined,
        location: location && (location.address || location.lat || location.lng) ? location : undefined,
        price: price.trim() || undefined,
        ticketUrl: ticketUrl.trim() || undefined,
        hashtags: normalizedHashtags.length > 0 ? normalizedHashtags : undefined,
        recurrence,
        reminders: reminders.length > 0 ? reminders : undefined,
        calendarId,
      })
    } finally {
      setSaving(false)
    }
  }

  const valid = title.trim().length > 0 && (allDay || start)

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Titel</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Werkstatt-Treffen" />
      </div>

      {/* Kalender-Auswahl (nur wenn mehrere existieren) */}
      {calendars.length > 1 && (
        <div>
          <Label className="text-xs">Kalender</Label>
          <select
            value={calendarId ?? ""}
            onChange={(e) => setCalendarId(e.target.value || undefined)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {calendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.data.name}{c.data.type === "location" ? " (Location)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Coverbild */}
      <ImageUploadField
        mode="cover"
        label="Coverbild"
        hint="Wird in der Event-Liste prominent angezeigt"
        value={coverImageUrl}
        onChange={setCoverImageUrl}
      />

      {/* Datum + Zeit (smart) */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <span className="text-xs">Ganztaegig</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={multiDay}
              onChange={(e) => setMultiDay(e.target.checked)}
            />
            <span className="text-xs">Ueber mehrere Tage</span>
          </label>
        </div>

        {!allDay && !multiDay && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Input type="datetime-local" value={start} onChange={(e) => handleStartChange(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Ende</Label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}

        {allDay && !multiDay && (
          <div>
            <Label className="text-xs">Datum</Label>
            <Input
              type="date"
              value={start.split("T")[0]}
              onChange={(e) => setStart(e.target.value + "T00:00")}
            />
          </div>
        )}

        {multiDay && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Von</Label>
              <Input
                type="date"
                value={start.split("T")[0]}
                onChange={(e) => setStart(e.target.value + "T00:00")}
              />
            </div>
            <div>
              <Label className="text-xs">Bis</Label>
              <Input
                type="date"
                value={end.split("T")[0]}
                onChange={(e) => setEnd(e.target.value + "T23:59")}
              />
            </div>
            {!allDay && (
              <p className="col-span-2 text-[11px] text-muted-foreground/70">
                Mehrtaegige Events laufen ohne Uhrzeit. Aktiviere "Ganztaegig" zur Klarstellung
                oder lass es weg fuer einen offenen Zeitraum.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Beschreibung — Markdown */}
      <div>
        <Label className="text-xs">Beschreibung</Label>
        <MarkdownEditor
          value={markdownBody}
          onChange={setMarkdownBody}
          placeholder="**Was passiert beim Event?** Programm, Ablauf, Mitbringsel..."
          rows={6}
        />
      </div>

      {/* Standort */}
      <div>
        <Label className="text-xs">Standort</Label>
        <LocationField value={location} onChange={setLocation} />
      </div>

      {/* Tags — TagInput mit Enter-Hinzufuegen + Autocomplete */}
      <div>
        <Label className="text-xs">Hashtags</Label>
        <TagInput
          value={hashtags}
          onChange={setHashtags}
          placeholder="Hashtag eingeben + Enter"
          suggestions={availableHashtags ?? []}
          quickSuggestions={8}
        />
      </div>

      {/* Wiederholung — optional */}
      <div className="border rounded-md p-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRecurrence}
            onChange={(e) => {
              setShowRecurrence(e.target.checked)
              if (!e.target.checked) setRecurrence(undefined)
            }}
          />
          <span className="text-xs font-medium">🔁 Wiederholung</span>
          {recurrence && !showRecurrence && (
            <span className="text-[10px] text-muted-foreground ml-2">aktiviert</span>
          )}
        </label>
        {showRecurrence && (
          <div className="mt-2">
            <RecurrenceEditor value={recurrence} onChange={setRecurrence} />
          </div>
        )}
      </div>

      {/* Erinnerungen — optional */}
      <div className="border rounded-md p-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showReminders}
            onChange={(e) => {
              setShowReminders(e.target.checked)
              if (!e.target.checked) setReminders([])
            }}
          />
          <span className="text-xs font-medium">🔔 Erinnerungen</span>
          {reminders.length > 0 && !showReminders && (
            <span className="text-[10px] text-muted-foreground ml-2">{reminders.length} gesetzt</span>
          )}
        </label>
        {showReminders && (
          <div className="mt-2">
            <ReminderEditor value={reminders} onChange={setReminders} />
          </div>
        )}
      </div>

      {/* Erweiterte Optionen aufklappbar */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showAdvanced ? "▾" : "▸"} Erweitert (Bilder, Preis, Tickets)
        </button>
        {showAdvanced && (
          <div className="space-y-3 mt-3 pl-2 border-l-2">
            <ImageUploadField
              mode="gallery"
              label="Galerie"
              hint="Zusaetzliche Bilder (max. 10)"
              value={galleryImageUrls}
              onChange={setGalleryImageUrls}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Preis (optional)</Label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="z.B. 12 EUR / Frei"
                />
              </div>
              <div>
                <Label className="text-xs">Ticket-Link</Label>
                <Input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t">
        {onDelete ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            Loeschen
          </Button>
        ) : <div />}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Abbrechen</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !valid}>
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function computeIsMultiDay(startIso: unknown, endIso: unknown): boolean {
  if (typeof startIso !== "string" || typeof endIso !== "string") return false
  const s = new Date(startIso)
  const e = new Date(endIso)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false
  return (
    s.getFullYear() !== e.getFullYear() ||
    s.getMonth() !== e.getMonth() ||
    s.getDate() !== e.getDate()
  )
}

function toDateTimeLocal(iso: unknown): string {
  if (!iso || typeof iso !== "string") return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  // YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDateTime(d: Date, format: TimeFormat): string {
  const datePart = d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })
  const timePart = format === "24h"
    ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false })
    : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return `${datePart} ${timePart}`
}

// ============================================================
// EventDetailModal — Vorschau bei Klick auf Event
// ============================================================

function EventDetailModal({
  item,
  onClose,
  onEdit,
  currentUserId,
  colors,
}: {
  item: Item | null
  onClose: () => void
  onEdit: () => void
  currentUserId: string | undefined
  colors: Record<string, string>
}) {
  if (!item) return null

  const data = item.data as Record<string, unknown>
  const isOwner = currentUserId === item.createdBy
  const startStr = typeof data.start === "string" ? data.start : null
  const endStr = typeof data.end === "string" ? data.end : null
  const start = startStr ? new Date(startStr) : null
  const end = endStr ? new Date(endStr) : null
  const isAllDay = !!data.allDay
  const coverImage = typeof data.coverImage === "string" ? data.coverImage : undefined
  const markdownBody = typeof data.markdownBody === "string" ? data.markdownBody : undefined
  const title = typeof data.title === "string" ? data.title : "(ohne Titel)"
  const location = (data.location as { lat?: number; lng?: number; address?: string } | undefined) ?? null
  const hashtags = Array.isArray(data.hashtags) ? (data.hashtags as string[]) : []
  const typeColor = colors[item.type] ?? "#A855F7"

  const formatDate = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "short",
    })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col max-h-[85vh]">
          {coverImage && (
            <div className="h-48 w-full overflow-hidden border-b shrink-0">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <header className="flex items-start gap-2">
              <div
                className="w-1 h-6 rounded-full shrink-0 mt-1"
                style={{ background: typeColor }}
              />
              <h2 className="text-xl font-semibold flex-1 leading-tight">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
                aria-label="Schliessen"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {start && (
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{formatDate(start)}</span>
                {!isAllDay && (
                  <>
                    <span>·</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(start)}</span>
                    {end && <span>– {formatTime(end)}</span>}
                  </>
                )}
                {isAllDay && <span className="ml-1 text-[10px] uppercase tracking-wide bg-muted/60 px-1.5 py-0.5 rounded">ganztaegig</span>}
              </div>
            )}

            {location?.address && (
              <div className="text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{location.address}</span>
              </div>
            )}

            {markdownBody && (
              <div className="text-sm">
                <MarkdownView markdown={markdownBody} className="prose-macher" />
              </div>
            )}

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <ParticipationControls eventId={item.id} isOwnEvent={isOwner} />
          </div>

          <div className="px-4 py-3 border-t shrink-0 flex items-center justify-between bg-muted/10">
            <span className="text-[10px] text-muted-foreground italic">
              Vorschau — Aktionen oben (Teilnehmen, Beobachten)
            </span>
            {isOwner && (
              <Button type="button" size="sm" onClick={onEdit}>
                Bearbeiten
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// SubscribeModal — ICS-Download + Data-URL fuer Kalender-Apps
// ============================================================

function SubscribeModal({
  items,
  open,
  onClose,
  feedName,
}: {
  items: Item[]
  open: boolean
  onClose: () => void
  feedName: string
}) {
  if (!open) return null

  const icsContent = generateIcs(items, feedName)

  const handleDownload = () => {
    downloadIcs(icsContent, `${feedName.toLowerCase().replace(/\s+/g, "-")}.ics`)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="text-base font-semibold">
          Kalender abonnieren
        </DialogTitle>

        <div className="space-y-4 mt-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Als ICS-Datei speichern</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Schnappschuss aller {items.length} Termine in einer Datei.
              Importieren in Google Calendar, Apple Calendar, Outlook,
              Thunderbird — funktioniert ueberall.
            </p>
            <Button type="button" size="sm" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Als ICS speichern
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
            <strong className="text-foreground">Echte Subscribe-URL</strong> (mit
            automatischer Aktualisierung in deinem Kalender) folgt sobald der
            eigene Relay-Server steht. Sie wird so aussehen wie
            <span className="font-mono"> https://relay.rln.org/calendar/&lt;slug&gt;.ics</span> —
            in Google/Apple Calendar einfuegen und der Kalender bleibt live
            verbunden. Bis dahin: ICS-Snapshot herunterladen und einmal
            importieren.
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Schliessen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// EventDetailPanel — Vorschau im 2. Slot (Klick-Routing-Doktrin)
// ============================================================

function EventDetailPanel({
  items,
  currentUserId,
  colors,
  onEdit,
}: {
  items: Item[]
  currentUserId: string | undefined
  colors: Record<string, string>
  onEdit: (item: Item) => void
}) {
  const channel = useChannel("event")
  const item = items.find((i) => i.id === channel.selectedId) ?? null

  if (!item) {
    return (
      <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-semibold truncate flex-1">Termin</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-xs text-muted-foreground italic text-center">
            Klick auf einen Termin links — hier siehst du Details + Aktionen.
          </p>
        </div>
      </div>
    )
  }

  const data = item.data as Record<string, unknown>
  const isOwner = currentUserId === item.createdBy
  const startStr = typeof data.start === "string" ? data.start : null
  const endStr = typeof data.end === "string" ? data.end : null
  const start = startStr ? new Date(startStr) : null
  const end = endStr ? new Date(endStr) : null
  const isAllDay = !!data.allDay
  const coverImage = typeof data.coverImage === "string" ? data.coverImage : undefined
  const markdownBody = typeof data.markdownBody === "string" ? data.markdownBody : undefined
  const title = typeof data.title === "string" ? data.title : "(ohne Titel)"
  const location = (data.location as { lat?: number; lng?: number; address?: string } | undefined) ?? null
  const hashtags = Array.isArray(data.hashtags) ? (data.hashtags as string[]) : []
  const typeColor = colors[item.type] ?? "#A855F7"

  const formatDate = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "short",
    })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <div className="w-1 h-4 rounded-full shrink-0" style={{ background: typeColor }} />
        <span className="text-sm font-semibold truncate flex-1">{title}</span>
        <button
          type="button"
          onClick={() => channel.select(null)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label="Auswahl loesen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {coverImage && (
          <div className="aspect-[4/3] rounded-lg border overflow-hidden">
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {start && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(start)}</span>
            {!isAllDay && (
              <>
                <span>·</span>
                <Clock className="h-3 w-3" />
                <span>{formatTime(start)}</span>
                {end && <span>– {formatTime(end)}</span>}
              </>
            )}
            {isAllDay && <span className="text-[9px] uppercase tracking-wide bg-muted/60 px-1.5 py-0.5 rounded">ganztaegig</span>}
          </div>
        )}

        {location?.address && (
          <div className="text-xs flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{location.address}</span>
          </div>
        )}

        {markdownBody && (
          <div className="text-sm">
            <MarkdownView markdown={markdownBody} className="prose-macher text-xs" />
          </div>
        )}

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <ParticipationControls eventId={item.id} isOwnEvent={isOwner} />
      </div>

      {isOwner && (
        <div className="px-3 py-2 border-t shrink-0 bg-muted/10">
          <Button type="button" size="sm" onClick={() => onEdit(item)} className="w-full">
            Bearbeiten
          </Button>
        </div>
      )}
    </div>
  )
}
