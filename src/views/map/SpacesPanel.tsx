import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { demoSpaces } from '@/data/demo'

interface SpacesPanelProps {
  activeSpaceId: string
  onSpaceChange: (spaceId: string) => void
}

export function SpacesPanel({ activeSpaceId, onSpaceChange }: SpacesPanelProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeSpace = demoSpaces.find((s) => s.id === activeSpaceId) ?? demoSpaces[0]

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-2 text-sm shadow-md backdrop-blur-md transition hover:bg-background"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {activeSpace.icon}
        </div>
        <span className="font-medium text-foreground">{activeSpace.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur-md">
          <div className="border-b border-border/40 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Deine Spaces
            </p>
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {demoSpaces.map((space) => {
              const isActive = space.id === activeSpaceId
              return (
                <li key={space.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSpaceChange(space.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                      isActive ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
                      {space.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {space.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {space.members} Mitglieder
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-border/40 p-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Neuen Space gründen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
