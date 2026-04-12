import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  useCreateItem,
} from '@real-life-stack/toolkit'
import { ImagePlus, Video } from 'lucide-react'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { calendars } from '@/lib/connector'

interface EventCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultStart = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return toLocalInputValue(d)
}

const defaultEnd = () => {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 3)
  return toLocalInputValue(d)
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

export function EventCreateDialog({ open, onOpenChange }: EventCreateDialogProps) {
  const createItem = useCreateItem()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)
  const [location, setLocation] = useState('')
  const [calendar, setCalendar] = useState('privat')
  const [allDay, setAllDay] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle('')
    setDescription('')
    setCoverImage('')
    setVideoUrl('')
    setStart(defaultStart())
    setEnd(defaultEnd())
    setLocation('')
    setCalendar('privat')
    setAllDay(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Der Titel fehlt noch.')
      return
    }
    if (!allDay && new Date(end) <= new Date(start)) {
      setError('Die Endzeit muss nach der Startzeit liegen.')
      return
    }

    setSubmitting(true)
    try {
      await createItem({
        type: 'event',
        createdBy: 'timo',
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          start: localInputToIso(start),
          end: allDay ? localInputToIso(start) : localInputToIso(end),
          location: location.trim() || undefined,
          calendar,
          allDay,
        },
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.')
    } finally {
      setSubmitting(false)
    }
  }

  const cal = calendars.find((c) => c.id === calendar)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Neue Veranstaltung</DialogTitle>
          <DialogDescription>
            Trage eine Veranstaltung ein, mit Bild, Beschreibung, Ort.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Coverbild-Vorschau + URL-Eingabe */}
          <div className="space-y-2">
            <Label>Coverbild</Label>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-dashed border-input bg-muted/30">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Vorschau"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${cal?.color ?? 'oklch(0.63 0.16 55)'} 0%, oklch(0.95 0.03 55) 100%)`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2 text-white/80">
                    <ImagePlus className="h-10 w-10" />
                    <span className="text-sm">Vorschau erscheint hier</span>
                  </div>
                </div>
              )}
            </div>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... (Bild-URL)"
            />
          </div>

          {/* Titel */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wildkräuterwanderung"
              autoFocus
              className="text-lg"
            />
          </div>

          {/* Beschreibung mit Markdown-Editor */}
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Was erwartet die Teilnehmer? Markdown ist möglich."
            />
          </div>

          {/* Ganztägig */}
          <div className="flex items-center gap-2">
            <input
              id="allDay"
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="allDay" className="cursor-pointer">
              Ganztägig
            </Label>
          </div>

          {/* Datum und Zeit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">{allDay ? 'Tag' : 'Beginn'}</Label>
              <Input
                id="start"
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? start.slice(0, 10) : start}
                onChange={(e) =>
                  setStart(allDay ? `${e.target.value}T00:00` : e.target.value)
                }
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="end">Ende</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Ort */}
          <div className="space-y-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Wo findet es statt?"
            />
          </div>

          {/* Video-URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video-Link
            </Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube- oder Vimeo-Link"
            />
          </div>

          {/* Kalender-Auswahl */}
          <div className="space-y-2">
            <Label htmlFor="calendar">Kalender</Label>
            <select
              id="calendar"
              value={calendar}
              onChange={(e) => setCalendar(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Wird gespeichert...' : 'Veranstaltung anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
