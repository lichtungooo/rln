/**
 * ModuleGridDropdown — Modul-Schoepfer-Menue.
 *
 * Liegt am Hamburger. Oeffnet sich nach unten, ankert an dessen rechter
 * Kante. Die Module sind in Bereiche gruppiert: Sehen, Schoepfen, Wachsen.
 * Klick auf eine Modul-Karte oeffnet sie als neuen Tab — oder springt zum
 * bestehenden, falls schon offen.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType, RefObject, SVGProps } from 'react'
import { Check } from 'lucide-react'
import type { OpenModule } from './OpenModuleTabs'

interface ModuleGridDropdownProps {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLButtonElement | null>
  allModules: OpenModule[]
  openModuleIds: Set<string>
  onOpen: (id: string) => void
}

// Bereiche — Reihenfolge legt die Anzeige fest. Module ohne Bereich landen
// in 'Weitere'.
const MODULE_AREAS: Array<{ id: string; label: string; ids: string[] }> = [
  {
    id: 'sehen',
    label: 'Sehen',
    ids: ['dashboard', 'map', 'marketplace', 'calendar'],
  },
  {
    id: 'schoepfen',
    label: 'Schoepfen',
    ids: ['kanban', 'quest', 'wissensfeld', 'valluet'],
  },
  {
    id: 'wachsen',
    label: 'Wachsen',
    ids: ['skill-tree', 'avatar'],
  },
]

export function ModuleGridDropdown({
  open,
  onClose,
  anchorRef,
  allModules,
  openModuleIds,
  onOpen,
}: ModuleGridDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null)

  // Position relativ zum Hamburger berechnen — rechte Kante alignen
  useEffect(() => {
    if (!open) return
    const btn = anchorRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    })
  }, [open, anchorRef])

  // Aussen-Klick + Escape schliessen
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t)) return
      if (anchorRef.current?.contains(t)) return
      onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose, anchorRef])

  const grouped = useMemo(() => {
    const byId = new Map(allModules.map((m) => [m.id, m]))
    const usedIds = new Set<string>()
    const groups = MODULE_AREAS.map((area) => {
      const items = area.ids
        .map((id) => byId.get(id))
        .filter((m): m is OpenModule => Boolean(m))
      items.forEach((m) => usedIds.add(m.id))
      return { id: area.id, label: area.label, items }
    }).filter((g) => g.items.length > 0)

    const weitere = allModules.filter((m) => !usedIds.has(m.id))
    if (weitere.length > 0) {
      groups.push({ id: 'weitere', label: 'Weitere', items: weitere })
    }
    return groups
  }, [allModules])

  if (!open || !position) return null

  return (
    <div
      ref={panelRef}
      style={{ top: position.top, right: position.right }}
      className="fixed z-50 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border/60 bg-popover shadow-2xl"
    >
      <div className="max-h-[70vh] overflow-y-auto p-3">
        {grouped.map((group) => (
          <section key={group.id} className="mb-3 last:mb-0">
            <h3 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {group.items.map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  isOpen={openModuleIds.has(m.id)}
                  onClick={() => onOpen(m.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ModuleCard({
  module,
  isOpen,
  onClick,
}: {
  module: OpenModule
  isOpen: boolean
  onClick: () => void
}) {
  const Icon = module.icon as
    | ComponentType<SVGProps<SVGSVGElement>>
    | undefined
  return (
    <button
      type="button"
      onClick={onClick}
      title={module.label}
      className={`group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs transition ${
        isOpen
          ? 'border-primary/40 bg-primary/5'
          : 'border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5'
      }`}
    >
      {isOpen && (
        <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-2 w-2" />
        </span>
      )}
      {Icon && <Icon className="h-5 w-5 text-foreground" />}
      <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
        {module.label}
      </span>
    </button>
  )
}
