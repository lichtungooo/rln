/**
 * OpenModuleTabs — Browser-Style-Tab-Leiste fuer offene Module.
 *
 * Tabs leben von links nach rechts in Eroeffnungs-Reihenfolge. Jeder Tab
 * traegt Icon + Label + Schliessen-X. Bei wenig Platz schrumpfen die Tabs
 * — bis nur das Icon bleibt. Hover zeigt den vollen Namen.
 *
 * Rechts ausserhalb der Tab-Liste lebt der Hamburger (Modul-Schoepfer).
 * Mobile bekommt eine eigene Layout-Variante (kommt in Phase N3).
 */

import { forwardRef, useEffect, useRef, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { X, Menu } from 'lucide-react'
import { ModuleGridDropdown } from './ModuleGridDropdown'

export interface OpenModule {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

interface OpenModuleTabsProps {
  /** Alle verfuegbaren Module — fuer das Dropdown. */
  allModules: OpenModule[]
  /** Aktuell offene Tabs (Reihenfolge ist Eroeffnungs-Reihenfolge). */
  openModules: OpenModule[]
  activeId: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onOpen: (id: string) => void
}

export function OpenModuleTabs({
  allModules,
  openModules,
  activeId,
  onSelect,
  onClose,
  onOpen,
}: OpenModuleTabsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  // Beim Wechsel des aktiven Tabs in die Sichtbarkeit scrollen
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeId])

  return (
    <div className="flex h-full w-full items-center gap-1">
      {/* Tab-Leiste — scrollbar bei Ueberlauf */}
      <div className="flex flex-1 items-stretch gap-0.5 overflow-x-auto scrollbar-thin">
        {openModules.map((m) => (
          <TabButton
            key={m.id}
            ref={m.id === activeId ? activeTabRef : null}
            module={m}
            active={m.id === activeId}
            closable={openModules.length > 1}
            onSelect={() => onSelect(m.id)}
            onClose={() => onClose(m.id)}
          />
        ))}
      </div>

      {/* Hamburger rechts — oeffnet Modul-Grid */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
          menuOpen
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title="Modul oeffnen"
        aria-label="Modul oeffnen"
      >
        <Menu className="h-4 w-4" />
      </button>

      <ModuleGridDropdown
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={menuButtonRef}
        allModules={allModules}
        openModuleIds={new Set(openModules.map((m) => m.id))}
        onOpen={(id) => {
          onOpen(id)
          setMenuOpen(false)
        }}
      />
    </div>
  )
}

interface TabButtonProps {
  module: OpenModule
  active: boolean
  closable: boolean
  onSelect: () => void
  onClose: () => void
}

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { module, active, closable, onSelect, onClose },
  ref,
) {
  const Icon = module.icon
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      title={module.label}
      className={`group relative flex h-8 min-w-[2rem] max-w-[10rem] shrink-0 items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition ${
        active
          ? 'border-primary/50 bg-primary/10 text-foreground'
          : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="hidden truncate sm:inline">{module.label}</span>
      {closable && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="ml-0.5 hidden h-4 w-4 shrink-0 items-center justify-center rounded-sm opacity-0 transition group-hover:flex group-hover:opacity-100 hover:bg-foreground/10 sm:flex"
          aria-label={`${module.label} schliessen`}
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  )
})
