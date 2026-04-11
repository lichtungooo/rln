import { useMemo, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useItems,
} from '@real-life-stack/toolkit'
import { Plus, LayoutGrid, List, Calendar as CalendarIcon } from 'lucide-react'
import { calendars } from '@/lib/connector'
import { getLocationText } from '@/lib/event-helpers'
import { EventCard } from './EventCard'
import { EventCreateDialog } from './EventCreateDialog'
import { EventDetailDialog } from './EventDetailDialog'

type ViewMode = 'grid' | 'list' | 'month'

export function CalendarView() {
  const { data: events, isLoading } = useItems({ type: 'event' })
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Item | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeCalendars, setActiveCalendars] = useState<Set<string>>(
    new Set(calendars.map((c) => c.id)),
  )

  const visibleEvents = useMemo(() => {
    return events.filter((e) => {
      const cal = String(e.data.calendar ?? 'privat')
      return activeCalendars.has(cal)
    })
  }, [events, activeCalendars])

  const sortedUpcoming = useMemo(() => {
    const now = Date.now()
    return [...visibleEvents]
      .filter((e) => {
        const start = e.data.start ? new Date(String(e.data.start)).getTime() : 0
        return start >= now
      })
      .sort((a, b) => {
        const aStart = new Date(String(a.data.start)).getTime()
        const bStart = new Date(String(b.data.start)).getTime()
        return aStart - bStart
      })
  }, [visibleEvents])

  const toggleCalendar = (id: string) => {
    setActiveCalendars((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-5">
      {/* Kopfzeile */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Veranstaltungen
          </h2>
          <p className="text-sm text-muted-foreground">
            {sortedUpcoming.length}{' '}
            {sortedUpcoming.length === 1 ? 'Veranstaltung in der Zukunft' : 'Veranstaltungen in der Zukunft'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeSwitcher value={viewMode} onChange={setViewMode} />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Veranstaltung
          </Button>
        </div>
      </div>

      {/* Kalender-Filter */}
      <div className="flex flex-wrap gap-2">
        {calendars.map((cal) => {
          const isActive = activeCalendars.has(cal.id)
          return (
            <button
              key={cal.id}
              type="button"
              onClick={() => toggleCalendar(cal.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                isActive
                  ? 'border-transparent bg-muted text-foreground'
                  : 'border-border text-muted-foreground opacity-60'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cal.color }}
              />
              {cal.name}
            </button>
          )
        })}
      </div>

      {/* Inhalte nach Ansicht */}
      {viewMode === 'grid' && (
        <EventGrid events={sortedUpcoming} onSelect={setSelectedEvent} />
      )}
      {viewMode === 'list' && (
        <EventList events={sortedUpcoming} onSelect={setSelectedEvent} />
      )}
      {viewMode === 'month' && (
        <MonthOverview events={visibleEvents} onSelect={setSelectedEvent} />
      )}

      {isLoading && sortedUpcoming.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Veranstaltungen laden...
        </p>
      )}
      {!isLoading && sortedUpcoming.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Hier ist noch nichts. Lade Menschen ein, indem du die erste Veranstaltung anlegst.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialoge */}
      <EventCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

function ViewModeSwitcher({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  const modes: { id: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { id: 'grid', icon: LayoutGrid, label: 'Karten' },
    { id: 'list', icon: List, label: 'Liste' },
    { id: 'month', icon: CalendarIcon, label: 'Monat' },
  ]
  return (
    <div className="flex items-center gap-0.5 rounded-full border bg-background p-0.5">
      {modes.map((m) => {
        const Icon = m.icon
        const isActive = value === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={m.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function EventGrid({
  events,
  onSelect,
}: {
  events: Item[]
  onSelect: (event: Item) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onClick={() => onSelect(event)} />
      ))}
    </div>
  )
}

function EventList({
  events,
  onSelect,
}: {
  events: Item[]
  onSelect: (event: Item) => void
}) {
  const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  return (
    <div className="space-y-2">
      {events.map((event) => {
        const start = event.data.start ? new Date(String(event.data.start)) : null
        const calendarId = String(event.data.calendar ?? 'privat')
        const cal = calendars.find((c) => c.id === calendarId)
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className="flex w-full items-center gap-4 rounded-lg border bg-card p-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
          >
            {start && (
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-[10px] font-semibold uppercase">
                  {MONTHS[start.getMonth()]}
                </span>
                <span className="text-lg font-bold leading-none">
                  {start.getDate()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {String(event.data.title)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {start && (
                  <span>
                    {start.toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    Uhr
                  </span>
                )}
                {(() => {
                  const loc = getLocationText(event)
                  return loc ? (
                    <>
                      <span>·</span>
                      <span className="truncate">{loc}</span>
                    </>
                  ) : null
                })()}
              </div>
            </div>
            {cal && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: cal.color }}
                title={cal.name}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function MonthOverview({
  events,
  onSelect,
}: {
  events: Item[]
  onSelect: (event: Item) => void
}) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ]
  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Item[]>()
    events.forEach((e) => {
      if (!e.data.start) return
      const d = new Date(String(e.data.start))
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(e)
      }
    })
    return map
  }, [events, year, month])

  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null
  })
  const today = now.getDate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {monthNames[month]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdays.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={i} className="aspect-square" />
            }
            const dayEvents = eventsByDay.get(day) ?? []
            const isToday = day === today
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg border p-1 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-transparent'
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    isToday ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {day}
                </div>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => {
                    const calendarId = String(e.data.calendar ?? 'privat')
                    const cal = calendars.find((c) => c.id === calendarId)
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onSelect(e)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] hover:bg-muted"
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cal?.color }}
                        />
                        <span className="truncate">{String(e.data.title)}</span>
                      </button>
                    )
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-muted-foreground">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
