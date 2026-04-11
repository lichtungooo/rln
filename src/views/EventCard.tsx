import type { Item } from '@real-life-stack/data-interface'
import { MapPin, Clock } from 'lucide-react'
import { calendars } from '@/lib/connector'
import { getLocationText } from '@/lib/event-helpers'

interface EventCardProps {
  event: Item
  onClick?: () => void
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

export function EventCard({ event, onClick }: EventCardProps) {
  const start = event.data.start ? new Date(String(event.data.start)) : null
  const coverImage = event.data.coverImage as string | undefined
  const location = getLocationText(event)
  const title = String(event.data.title ?? 'Ohne Titel')
  const calendarId = String(event.data.calendar ?? 'privat')
  const cal = calendars.find((c) => c.id === calendarId)

  const formatTime = (d: Date | null) =>
    d?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) ?? ''

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Coverbild oder Gradient-Platzhalter */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${cal?.color ?? 'oklch(0.63 0.16 55)'} 0%, oklch(0.95 0.03 55) 100%)`,
            }}
          >
            <span className="text-4xl font-light text-white/80 drop-shadow">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Datum-Chip oben links */}
        {start && (
          <div className="absolute left-3 top-3 flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-white/95 shadow-md backdrop-blur-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              {MONTHS_SHORT[start.getMonth()]}
            </span>
            <span className="text-xl font-bold leading-none text-foreground">
              {start.getDate()}
            </span>
          </div>
        )}

        {/* Kalender-Markierung oben rechts */}
        {cal && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cal.color }}
              />
              <span className="text-[11px] font-medium text-foreground">
                {cal.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inhalt unten */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {start && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(start)} Uhr</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
