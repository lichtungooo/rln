/**
 * ModuleGridDropdown — Modul-Schoepfer-Menue.
 *
 * Liegt am Hamburger. Oeffnet sich nach unten, ankert an dessen rechter
 * Kante. Kompakte Liste — eine Zeile pro Modul, Icon + Name. Klick auf
 * eine Zeile oeffnet das Modul als neuen Tab oder springt zum bestehenden.
 */

import { useEffect, useRef, useState } from 'react'
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
      top: rect.bottom + 4,
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

  if (!open || !position) return null

  return (
    <div
      ref={panelRef}
      style={{ top: position.top, right: position.right }}
      className="fixed z-50 w-56 overflow-hidden rounded-md border border-border/60 bg-popover shadow-lg"
    >
      <ul className="py-1">
        {allModules.map((m) => (
          <ModuleRow
            key={m.id}
            module={m}
            isOpen={openModuleIds.has(m.id)}
            onClick={() => onOpen(m.id)}
          />
        ))}
      </ul>
    </div>
  )
}

function ModuleRow({
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
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition ${
          isOpen
            ? 'bg-primary/5 text-foreground'
            : 'text-foreground/90 hover:bg-muted/60'
        }`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />}
        <span className="flex-1 truncate">{module.label}</span>
        {isOpen && <Check className="h-3 w-3 shrink-0 text-primary" />}
      </button>
    </li>
  )
}
