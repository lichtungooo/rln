/**
 * MobileTabSwitcher — Firefox/Chrome-Style Vollbild-Tab-Wechsler.
 *
 * Drei Reiter: Spaces · Module · Profil.
 * - Spaces: Karten-Grid der Spaces (Platzhalter in N4b, kommt in N4c)
 * - Module: offene Module als Karten + verfuegbare Module als Liste
 * - Profil: Profil-Bereich (Platzhalter in N4b, kommt in N4d)
 *
 * Klick auf eine Modul-Karte → springt dorthin, schliesst Switcher.
 * Klick auf X auf einer Modul-Karte → schliesst den Tab.
 * Klick auf einen Listen-Eintrag → oeffnet als neuen Tab.
 */

import { useEffect, useState } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { X, Plus, ArrowLeft, Check, LayoutGrid, User } from 'lucide-react'

export interface MobileTab {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

type SwitcherView = 'spaces' | 'modules' | 'profile'

interface MobileTabSwitcherProps {
  open: boolean
  onClose: () => void
  allModules: MobileTab[]
  openModules: MobileTab[]
  activeId: string
  onSelect: (id: string) => void
  onCloseTab: (id: string) => void
  onOpen: (id: string) => void
  /** Reiter, der beim Oeffnen aktiv ist (default: 'modules') */
  initialView?: SwitcherView
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
  initialView = 'modules',
}: MobileTabSwitcherProps) {
  const [view, setView] = useState<SwitcherView>(initialView)

  // Beim Oeffnen auf den Wunsch-Reiter springen
  useEffect(() => {
    if (open) setView(initialView)
  }, [open, initialView])

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Kopf — Schliessen-Knopf + 3-Reiter-Tab-Bar */}
      <header className="flex h-12 shrink-0 items-center border-b border-border/60 bg-background">
        <button
          type="button"
          onClick={onClose}
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label="Schliessen"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <nav className="flex flex-1 items-stretch" role="tablist">
          <ReiterButton active={view === 'spaces'} onClick={() => setView('spaces')}>
            Spaces
          </ReiterButton>
          <ReiterButton active={view === 'modules'} onClick={() => setView('modules')}>
            Module
          </ReiterButton>
          <ReiterButton active={view === 'profile'} onClick={() => setView('profile')}>
            Profil
          </ReiterButton>
        </nav>
      </header>

      {/* Inhalt — scrollbar */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {view === 'spaces' && <SpacesView />}
        {view === 'modules' && (
          <ModulesView
            allModules={allModules}
            openModules={openModules}
            activeId={activeId}
            onSelect={onSelect}
            onCloseTab={onCloseTab}
            onOpen={onOpen}
            onClose={onClose}
          />
        )}
        {view === 'profile' && <ProfileView />}
      </div>
    </div>
  )
}

interface ReiterButtonProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function ReiterButton({ active, onClick, children }: ReiterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`relative flex flex-1 items-center justify-center px-2 text-sm font-semibold transition ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary" />
      )}
    </button>
  )
}

interface ModulesViewProps {
  allModules: MobileTab[]
  openModules: MobileTab[]
  activeId: string
  onSelect: (id: string) => void
  onCloseTab: (id: string) => void
  onOpen: (id: string) => void
  onClose: () => void
}

function ModulesView({
  allModules,
  openModules,
  activeId,
  onSelect,
  onCloseTab,
  onOpen,
  onClose,
}: ModulesViewProps) {
  const openIds = new Set(openModules.map((m) => m.id))
  const closedModules = allModules.filter((m) => !openIds.has(m.id))

  return (
    <>
      {/* Offene Module als grosse Karten */}
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
    </>
  )
}

function SpacesView() {
  return <PlatzhalterView icon={LayoutGrid} title="Spaces" hint="Bald siehst du hier alle deine Spaces als Karten. Wechseln, durchsuchen, neue entdecken." />
}

function ProfileView() {
  return <PlatzhalterView icon={User} title="Profil" hint="Bald siehst du hier deinen Profil-Bereich — Avatar, Identitaet, freigegebene Inhalte." />
}

interface PlatzhalterViewProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  hint: string
}

function PlatzhalterView({ icon: Icon, title, hint }: PlatzhalterViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}
