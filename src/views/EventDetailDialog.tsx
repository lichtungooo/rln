import type { Item } from '@real-life-stack/data-interface'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@real-life-stack/toolkit'
import {
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

interface EventDetailDialogProps {
  event: Item | null
  onClose: () => void
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const open = event !== null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {event && <EventDetailBody event={event} onClose={onClose} />}
        {!event && <DialogTitle className="sr-only">Kein Event</DialogTitle>}
      </DialogContent>
    </Dialog>
  )
}

function EventDetailBody({ event, onClose }: { event: Item; onClose: () => void }) {
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
      year: 'numeric',
    }) ?? ''
  const formatTime = (d: Date | null) =>
    d?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) ?? ''

  const mapsUrl = location
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`
    : undefined

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Coverbild */}
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
            <span className="text-6xl font-light text-white/80 drop-shadow-lg">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {cal && (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cal.color }}
              />
              <span className="text-xs font-medium text-foreground">{cal.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollbarer Inhalt */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold leading-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Meta-Zeile */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">{formatDate(start)}</span>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground">
              {formatTime(start)}
              {end && <> bis {formatTime(end)}</>}
            </span>
          </div>
          {location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground">{location}</span>
            </div>
          )}
        </div>

        {/* Beschreibung */}
        {description && (
          <div className="border-t pt-5">
            <MarkdownContent markdown={description} />
          </div>
        )}

        {/* Video-Einbettung (Platzhalter) */}
        {videoUrl && (
          <div className="border-t pt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <VideoEmbed url={videoUrl} />
            </div>
          </div>
        )}

        {/* Kartenausschnitt (Platzhalter, echte Map kommt später) */}
        {location && (
          <div className="border-t pt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Ort auf der Karte</span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">{location}</span>
                </div>
              </div>
              {/* Dekorative Raster-Linien als Karten-Andeutung */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute h-px w-full bg-primary/30"
                    style={{ top: `${(i + 1) * 14}%` }}
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-primary/30"
                    style={{ left: `${(i + 1) * 11}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aktions-Leiste unten, fest */}
      <div className="flex shrink-0 items-center gap-2 border-t bg-muted/30 p-4">
        <Button variant="default" className="flex-1">
          <UserPlus className="mr-2 h-4 w-4" />
          Teilnehmen
        </Button>
        {mapsUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Hinweg
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Schließen
        </Button>
      </div>
    </div>
  )
}

function VideoEmbed({ url }: { url: string }) {
  // YouTube-Einbettung erkennen
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

  // Vimeo-Einbettung erkennen
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

  // Fallback: einfacher Link
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
