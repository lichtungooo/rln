import type { Item } from '@real-life-stack/data-interface'
import { Button } from '@real-life-stack/toolkit'
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  Navigation,
  Video,
  UserPlus,
  Users,
} from 'lucide-react'
import { MarkdownContent } from '@/components/MarkdownContent'
import { MiniMap } from '@/components/MiniMap'
import { calendars } from '@/lib/connector'
import { getLocationText, getLocationCoords } from '@/lib/event-helpers'

interface EventDetailPanelProps {
  event: Item
  onClose: () => void
}

export function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const start = event.data.start ? new Date(String(event.data.start)) : null
  const end = event.data.end ? new Date(String(event.data.end)) : null
  const title = String(event.data.title ?? 'Ohne Titel')
  const description = String(event.data.description ?? '')
  const location = getLocationText(event)
  const coords = getLocationCoords(event)
  const coverImage = event.data.coverImage as string | undefined
  const videoUrl = event.data.videoUrl as string | undefined
  const calendarId = String(event.data.calendar ?? 'privat')
  const cal = calendars.find((c) => c.id === calendarId)

  const formatDate = (d: Date | null) =>
    d?.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }) ?? ''
  const formatTime = (d: Date | null) =>
    d?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) ?? ''

  const mapsUrl = location
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`
    : undefined

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
      {/* Kopfbereich: kompaktes Cover + Drag-Handle */}
      <div className="panel-drag-handle relative h-24 w-full shrink-0 cursor-move overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${cal?.color ?? 'oklch(0.63 0.16 55)'} 0%, oklch(0.95 0.03 55) 100%)`,
            }}
          />
        )}

        {/* Kalender-Badge */}
        {cal && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cal.color }}
              />
              <span className="text-[10px] font-medium text-foreground">
                {cal.name}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white"
          title="Schließen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrollbarer Inhalt */}
      <div className="flex-1 overflow-y-auto">
        {/* Titel + Meta */}
        <div className="border-b border-border/30 px-4 py-3">
          <h2 className="text-base font-semibold leading-tight text-foreground">
            {title}
          </h2>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(start)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formatTime(start)}
                {end && <> bis {formatTime(end)}</>}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Beschreibung */}
        {description && (
          <div className="border-b border-border/30 bg-muted/25 px-4 py-3">
            <div className="text-sm leading-relaxed">
              <MarkdownContent markdown={description} />
            </div>
          </div>
        )}

        {/* Ort mit Mini-Karte */}
        {(location || coords) && (
          <div className="border-b border-border/30 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                Ort
              </h3>
            </div>
            {coords ? (
              <div className="overflow-hidden rounded-xl border border-border/40">
                <MiniMap
                  lat={coords.lat}
                  lng={coords.lng}
                  zoom={14}
                  className="h-36 w-full"
                />
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-xl border border-border/40 bg-muted/30">
                <div className="text-center">
                  <MapPin className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-[11px] text-muted-foreground">{location}</p>
                </div>
              </div>
            )}
            {location && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">{location}</p>
            )}
          </div>
        )}

        {/* Teilnehmer */}
        <div className="border-b border-border/30 bg-muted/25 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Teilnehmer
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Hier erscheinen bald die Menschen, die teilnehmen.
          </p>
        </div>

        {/* Video-Einbettung */}
        {videoUrl && (
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                Video
              </h3>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl bg-muted">
              <VideoEmbed url={videoUrl} />
            </div>
          </div>
        )}
      </div>

      {/* Aktions-Leiste unten */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border/40 bg-muted/20 px-3 py-2">
        <Button variant="default" size="sm" className="flex-1">
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Teilnehmen
        </Button>
        {mapsUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
          >
            <Navigation className="mr-1.5 h-3.5 w-3.5" />
            Hinweg
          </Button>
        )}
      </div>
    </div>
  )
}

function VideoEmbed({ url }: { url: string }) {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  )
  if (youtubeMatch) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    )
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        {url}
      </a>
    </div>
  )
}
