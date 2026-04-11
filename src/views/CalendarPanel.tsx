import { useMemo, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { Button, useItems } from '@real-life-stack/toolkit'
import { X, Plus, MapPin, Clock } from 'lucide-react'
import { calendars } from '@/lib/connector'
import { getLocationText } from '@/lib/event-helpers'
import { EventCreateDialog } from './EventCreateDialog'

interface CalendarPanelProps {
  onSelectEvent: (event: Item) => void
  onClose: () => void
  selectedEventId?: string
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

export function CalendarPanel({
  onSelectEvent,
  onClose,
  selectedEventId,
}: CalendarPanelProps) {
  const { data: events } = useItems({ type: 'event' })
  const [createOpen, setCreateOpen] = useState(false)
  const [activeCalendars, setActiveCalendars] = useState<Set<string>>(
    new Set(calendars.map((c) => c.id)),
  )

  const sortedUpcoming = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => {
        const cal = String(e.data.calendar ?? 'privat')
        if (!activeCalendars.has(cal)) return false
        const start = e.data.start ? new Date(String(e.data.start)).getTime() : 0
        return start >= now - 24 * 60 * 60 * 1000
      })
      .sort((a, b) => {
        const aStart = new Date(String(a.data.start)).getTime()
        const bStart = new Date(String(b.data.start)).getTime()
        return aStart - bStart
      })
  }, [events, activeCalendars])

  const toggleCalendar = (id: string) => {
    setActiveCalendars((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <div className="flex max-h-[70vh] w-[22rem] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
        {/* Kopf */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Veranstaltungen</h2>
            <p className="text-xs text-muted-foreground">
              {sortedUpcoming.length}{' '}
              {sortedUpcoming.length === 1 ? 'kommende' : 'kommende'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setCreateOpen(true)}
              title="Neue Veranstaltung"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onClose}
              title="Schließen"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Kalender-Filter */}
        <div className="flex flex-wrap gap-1 border-b border-border/40 px-3 py-2">
          {calendars.map((cal) => {
            const isActive = activeCalendars.has(cal.id)
            return (
              <button
                key={cal.id}
                type="button"
                onClick={() => toggleCalendar(cal.id)}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition ${
                  isActive
                    ? 'border-transparent bg-muted text-foreground'
                    : 'border-border/60 text-muted-foreground opacity-60'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: cal.color }}
                />
                {cal.name}
              </button>
            )
          })}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {sortedUpcoming.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Hier ist noch nichts. Lege die erste Veranstaltung an.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {sortedUpcoming.map((event) => (
                <EventListRow
                  key={event.id}
                  event={event}
                  isSelected={event.id === selectedEventId}
                  onClick={() => onSelectEvent(event)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <EventCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function EventListRow({
  event,
  isSelected,
  onClick,
}: {
  event: Item
  isSelected: boolean
  onClick: () => void
}) {
  const start = event.data.start ? new Date(String(event.data.start)) : null
  const location = getLocationText(event)
  const calendarId = String(event.data.calendar ?? 'privat')
  const cal = calendars.find((c) => c.id === calendarId)
  const title = String(event.data.title ?? 'Ohne Titel')

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60 ${
          isSelected ? 'bg-primary/10' : ''
        }`}
      >
        {/* Datum-Block */}
        {start && (
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              {MONTHS_SHORT[start.getMonth()]}
            </span>
            <span className="text-base font-bold leading-none text-foreground">
              {start.getDate()}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            {cal && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: cal.color }}
              />
            )}
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            {start && (
              <div className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                <span>
                  {start.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-0.5 min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}
