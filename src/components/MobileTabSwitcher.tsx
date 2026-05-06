/**
 * MobileTabSwitcher — Firefox/Chrome-Style Vollbild-Tab-Wechsler.
 *
 * Oeffnet sich beim Klick auf den Tab-Counter in der Mobile-Top-Bar.
 * Zeigt offene Tabs als grosse, beruehrungs-freundliche Karten oben
 * und alle verfuegbaren Module als kompakte Liste darunter.
 *
 * Klick auf eine Tab-Karte → springt dorthin, schliesst Switcher.
 * Klick auf X auf einer Karte → schliesst den Tab.
 * Klick auf einen Listen-Eintrag → oeffnet als neuen Tab.
 */

import { useEffect } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { X, Plus, ArrowLeft, Check } from 'lucide-react'

export interface MobileTab {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

interface MobileTabSwitcherProps {
  open: boolean
  onClose: () => void
  allModules: MobileTab[]
  openModules: MobileTab[]
  activeId: string
  onSelect: (id: string) => void
  onCloseTab: (id: string) => void
  onOpen: (id: string) => void
}

export function MobileTabSwitcher({
  open,
  onClose,
  allModules,
  openModules,
  activeId,
  onSelect,
  onCloseTab,
  onOpen,
}: MobileTabSwitcherProps) {
  // Body-Scroll sperren waehrend offen
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // Escape schliesst
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const openIds = new Set(openModules.map((m) => m.id))
  const closedModules = allModules.filter((m) => !openIds.has(m.id))

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Kopf */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label="Schliessen"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="flex-1 text-base font-semibold text-foreground">
          Tabs <span className="text-muted-foreground">({openModules.length})</span>
        </h2>
      </header>

      {/* Inhalt — scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Offene Tabs als grosse Karten */}
        {openModules.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            {openModules.map((m) => {
              const Icon = m.icon
              const isActive = m.id === activeId
              return (
                <div
                  key={m.id}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted/40 transition ${
                    isActive
                      ? 'border-primary/60 ring-2 ring-primary/30'
                      : 'border-border/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(m.id)
                      onClose()
                    }}
                    className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
                  >
                    {Icon && (
                      <Icon
                        className={`h-7 w-7 ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                    <span className="line-clamp-2 text-sm font-medium text-foreground">
                      {m.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Aktiv
                      </span>
                    )}
                  </button>
                  {openModules.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCloseTab(m.id)
                      }}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-muted"
                      aria-label={`${m.label} schliessen`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Verfuegbare Module — kompakte Liste */}
        {closedModules.length > 0 && (
          <div>
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Neuen Tab oeffnen
            </h3>
            <ul className="overflow-hidden rounded-lg border border-border/60 bg-card">
              {closedModules.map((m, idx) => {
                const Icon = m.icon
                return (
                  <li key={m.id}>
                    {idx > 0 && <div className="mx-3 h-px bg-border/40" />}
                    <button
                      type="button"
                      onClick={() => {
                        onOpen(m.id)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {Icon ? <Icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {m.label}
                      </span>
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Wenn alles offen ist und nichts mehr zu oeffnen */}
        {closedModules.length === 0 && openModules.length > 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center">
            <Check className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Alle Module sind als Tabs geoeffnet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
