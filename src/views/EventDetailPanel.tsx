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
} from 'lucide-react'
import { MarkdownContent } from '@/components/MarkdownContent'
import { calendars } from '@/lib/connector'
import { getLocationText } from '@/lib/event-helpers'

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
    <div className="flex max-h-[80vh] w-[26rem] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
      {/* Coverbild oder Gradient-Platzhalter */}
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        {coverImage ? (
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${cal?.color ?? 'oklch(0.63 0.16 55)'} 0%, oklch(0.95 0.03 55) 100%)`,
            }}
          >
            <span className="text-5xl font-light text-white/80 drop-shadow-lg">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {cal && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
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

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white"
          title="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollbarer Inhalt */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight text-foreground">
            {title}
          </h2>
        </div>

        {/* Meta-Zeile */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">{formatDate(start)}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">
              {formatTime(start)}
              {end && <> bis {formatTime(end)}</>}
            </span>
          </div>
          {location && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">{location}</span>
            </div>
          )}
        </div>

        {/* Beschreibung */}
        {description && (
          <div className="border-t border-border/40 pt-4">
            <MarkdownContent markdown={description} />
          </div>
        )}

        {/* Video-Einbettung */}
        {videoUrl && (
          <div className="border-t border-border/40 pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Video className="h-3.5 w-3.5" />
              <span>Video</span>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <VideoEmbed url={videoUrl} />
            </div>
          </div>
        )}
      </div>

      {/* Aktions-Leiste unten */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border/40 bg-muted/20 p-3">
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
