import { useState, useRef, useEffect } from 'react'
import { Plus, Calendar, MapPin, X } from 'lucide-react'

interface ActionButtonProps {
  onNewEvent?: () => void
  onSetLocation?: () => void
}

export function ActionButton({ onNewEvent, onSetLocation }: ActionButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => {
              onNewEvent?.()
              setOpen(false)
            }}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-background/95 py-2 pl-4 pr-3 shadow-lg backdrop-blur-md transition hover:bg-background"
          >
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Neues Event
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Calendar className="h-4 w-4" />
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onSetLocation?.()
              setOpen(false)
            }}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-background/95 py-2 pl-4 pr-3 shadow-lg backdrop-blur-md transition hover:bg-background"
          >
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Mein Ort setzen
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <MapPin className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition ${
          open
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        title={open ? 'Schließen' : 'Aktion'}
      >
        {open ? <X className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  )
}
