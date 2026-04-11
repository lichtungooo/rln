import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, Calendar, MapPin, Users, Sparkles } from 'lucide-react'

const filterCategories = [
  { id: 'events', label: 'Veranstaltungen', icon: Calendar, active: true },
  { id: 'places', label: 'Orte', icon: MapPin, active: true },
  { id: 'people', label: 'Menschen', icon: Users, active: false },
  { id: 'projects', label: 'Projekte', icon: Sparkles, active: false },
]

export function FilterButton() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<Set<string>>(
    new Set(filterCategories.filter((c) => c.active).map((c) => c.id)),
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur-md transition hover:bg-background"
        title="Filter"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur-md">
          <div className="border-b border-border/40 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Auf der Karte zeigen
            </p>
          </div>
          <ul className="py-1">
            {filterCategories.map((cat) => {
              const Icon = cat.icon
              const isActive = active.has(cat.id)
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-muted"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border'
                      }`}
                    >
                      {isActive && <Icon className="h-3 w-3" />}
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{cat.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
