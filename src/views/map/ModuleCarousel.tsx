import { useState, useEffect } from 'react'
import {
  Map as MapIcon,
  Calendar as CalendarIcon,
  ShoppingBag,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

export interface Module {
  id: string
  label: string
  shortLabel: string
  icon: LucideIcon
  disabled?: boolean
}

export const allModules: Module[] = [
  { id: 'markt', label: 'Markt', shortLabel: 'Markt', icon: ShoppingBag, disabled: true },
  { id: 'map', label: 'Karte', shortLabel: 'Karte', icon: MapIcon },
  { id: 'calendar', label: 'Kalender', shortLabel: 'Kal.', icon: CalendarIcon },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dash.', icon: LayoutDashboard, disabled: true },
]

interface ModuleCarouselProps {
  activeModule: string
  onModuleChange: (id: string) => void
}

// Gibt drei Module zurück: vorheriges, fokussiertes, nächstes.
// Endlos über Modulo-Rotation.
function pickVisible(modules: Module[], focusIndex: number) {
  const n = modules.length
  const prev = modules[(focusIndex - 1 + n) % n]
  const current = modules[focusIndex]
  const next = modules[(focusIndex + 1) % n]
  return { prev, current, next }
}

export function ModuleCarousel({ activeModule, onModuleChange }: ModuleCarouselProps) {
  // Der Fokus-Index beschreibt, welches Modul gerade in der Mitte steht
  // — unabhängig vom aktiven Modul. Die Pfeile bewegen den Fokus, ohne
  // das aktive Modul zu ändern. Der Klick auf die Mitte wählt das Modul aus.
  const [focusIndex, setFocusIndex] = useState(() =>
    Math.max(0, allModules.findIndex((m) => m.id === activeModule)),
  )

  // Wenn sich das aktive Modul von außen ändert, zieht der Fokus nach.
  useEffect(() => {
    const idx = allModules.findIndex((m) => m.id === activeModule)
    if (idx >= 0) setFocusIndex(idx)
  }, [activeModule])

  const { prev, current, next } = pickVisible(allModules, focusIndex)

  const rotate = (dir: 'left' | 'right') => {
    const n = allModules.length
    setFocusIndex((i) => (dir === 'left' ? (i - 1 + n) % n : (i + 1) % n))
  }

  const selectCurrent = () => {
    if (!current.disabled && current.id !== activeModule) {
      onModuleChange(current.id)
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/90 p-1 shadow-md backdrop-blur-md">
      <button
        type="button"
        onClick={() => rotate('left')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Vorheriges Modul"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        <ModuleButton
          module={prev}
          position="side"
          isActive={prev.id === activeModule}
          onClick={() => rotate('left')}
        />
        <ModuleButton
          module={current}
          position="center"
          isActive={current.id === activeModule}
          onClick={selectCurrent}
        />
        <ModuleButton
          module={next}
          position="side"
          isActive={next.id === activeModule}
          onClick={() => rotate('right')}
        />
      </div>

      <button
        type="button"
        onClick={() => rotate('right')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Nächstes Modul"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function ModuleButton({
  module,
  position,
  isActive,
  onClick,
}: {
  module: Module
  position: 'side' | 'center'
  isActive: boolean
  onClick: () => void
}) {
  const Icon = module.icon
  const isCenter = position === 'center'
  const label = isCenter ? module.label : module.shortLabel

  const centerStyle = isActive
    ? 'bg-primary text-primary-foreground shadow-sm'
    : 'bg-muted/60 text-foreground hover:bg-muted'

  return (
    <button
      type="button"
      disabled={module.disabled}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition ${
        isCenter
          ? `w-28 px-3 py-1.5 text-sm ${centerStyle}`
          : 'w-16 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted'
      } ${module.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      title={module.disabled ? `${module.label} — kommt bald` : module.label}
    >
      <Icon className={isCenter ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span className="truncate">{label}</span>
    </button>
  )
}
