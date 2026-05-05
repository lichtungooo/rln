/**
 * MobileTabBar — kompakte Tab-Leiste am unteren Bildschirmrand fuer Mobile.
 *
 * Zeigt die offenen Module als horizontale Liste mit Icons. Aktiver Tab
 * hervorgehoben. Rechts ein Plus-Knopf, der das gleiche Modul-Grid-
 * Dropdown wie der Hamburger der Navbar oeffnet.
 *
 * Auf grossen Bildschirmen unsichtbar (sm:hidden).
 */

import { useRef, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { Plus, X } from 'lucide-react'
import { ModuleGridDropdown } from './ModuleGridDropdown'

export interface MobileTabModule {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

interface MobileTabBarProps {
  allModules: MobileTabModule[]
  openModules: MobileTabModule[]
  activeId: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onOpen: (id: string) => void
}

export function MobileTabBar({
  allModules,
  openModules,
  activeId,
  onSelect,
  onClose,
  onOpen,
}: MobileTabBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const plusButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center gap-1 border-t border-border/60 bg-background/95 px-2 backdrop-blur sm:hidden">
        {/* Tab-Liste — scrollbar */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-thin">
          {openModules.map((m) => {
            const Icon = m.icon
            const active = m.id === activeId
            const closable = openModules.length > 1
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m.id)}
                title={m.label}
                className={`group relative flex h-10 min-w-[2.75rem] shrink-0 flex-col items-center justify-center rounded-md px-2 text-[10px] font-medium transition ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="mt-0.5 max-w-[3.5rem] truncate">{m.label}</span>
                {closable && active && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose(m.id)
                    }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground/80 text-background"
                    aria-label={`${m.label} schliessen`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Punkt-Indikator — zeigt Position in der Tab-Liste */}
        {openModules.length > 1 && (
          <div className="flex shrink-0 items-center gap-1 px-1">
            {openModules.map((m) => (
              <span
                key={m.id}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  m.id === activeId ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Plus-Knopf — oeffnet Modul-Grid */}
        <button
          ref={plusButtonRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition ${
            menuOpen
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          aria-label="Modul oeffnen"
        >
          <Plus className="h-5 w-5" />
        </button>
      </nav>

      <ModuleGridDropdown
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={plusButtonRef}
        allModules={allModules}
        openModuleIds={new Set(openModules.map((m) => m.id))}
        onOpen={(id) => {
          onOpen(id)
          setMenuOpen(false)
        }}
      />
    </>
  )
}
