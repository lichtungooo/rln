/**
 * MobileTabSwitcher — Firefox/Chrome-Style Vollbild-Tab-Wechsler.
 *
 * Drei Reiter: Netzwerke · Module · Profil.
 * - Netzwerke: Karten-Grid der Netzwerke (Platzhalter in N4b, kommt in N4c)
 * - Module: offene Module als Karten + verfuegbare Module als Liste
 * - Profil: Profil-Bereich (Platzhalter in N4b, kommt in N4d)
 *
 * Klick auf eine Modul-Karte → springt dorthin, schliesst Switcher.
 * Klick auf X auf einer Modul-Karte → schliesst den Tab.
 * Klick auf einen Listen-Eintrag → oeffnet als neuen Tab.
 */

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { X, Plus, ArrowLeft, Check, Compass, ChevronRight, Pencil, Users, Fingerprint, LogOut, MoreHorizontal, Search } from 'lucide-react'

export interface MobileTab {
  id: string
  label: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export interface MobileSpace {
  id: string
  name: string
  avatar?: string
  /** scope === 'overview' = Spezial-Karte "Alle Werkstaetten" */
  scope?: string
  /** Tags fuer Filter im Spaces-Reiter */
  hashtags?: string[]
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
  spaces: MobileSpace[]
  activeSpaceId?: string
  onSelectSpace: (id: string) => void
  profile: MobileProfile
  onEditProfile: () => void
  onOpenContacts?: () => void
  contactCount?: number
  onVerifyIdentity?: () => void
  onLogout?: () => void
  /** Footer-Aktionen je nach Reiter */
  onSpaceSettings?: () => void
  onCreateSpace?: () => void
  onModuleSettings?: () => void
  /** Reiter, der beim Oeffnen aktiv ist (default: 'modules') */
  initialView?: SwitcherView
}

export interface MobileProfile {
  name: string
  avatar?: string
  did?: string
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
  spaces,
  activeSpaceId,
  onSelectSpace,
  profile,
  onEditProfile,
  onOpenContacts,
  contactCount,
  onVerifyIdentity,
  onLogout,
  onSpaceSettings,
  onCreateSpace,
  onModuleSettings,
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
            Netzwerke
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
        {view === 'spaces' && (
          <SpacesView
            spaces={spaces}
            activeSpaceId={activeSpaceId}
            onSelectSpace={(id) => {
              onSelectSpace(id)
              onClose()
            }}
          />
        )}
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
        {view === 'profile' && (
          <ProfileView
            profile={profile}
            onEditProfile={() => {
              onEditProfile()
              onClose()
            }}
            onOpenContacts={
              onOpenContacts
                ? () => {
                    onOpenContacts()
                    onClose()
                  }
                : undefined
            }
            contactCount={contactCount}
            onVerifyIdentity={
              onVerifyIdentity
                ? () => {
                    onVerifyIdentity()
                    onClose()
                  }
                : undefined
            }
            onLogout={onLogout}
          />
        )}
      </div>

      <SwitcherFooter
        view={view}
        onClose={onClose}
        onSpaceSettings={onSpaceSettings}
        onCreateSpace={onCreateSpace}
        onModuleSettings={onModuleSettings}
      />
    </div>
  )
}

interface SwitcherFooterProps {
  view: SwitcherView
  onClose: () => void
  onSpaceSettings?: () => void
  onCreateSpace?: () => void
  onModuleSettings?: () => void
}

function SwitcherFooter({
  view,
  onClose,
  onSpaceSettings,
  onCreateSpace,
  onModuleSettings,
}: SwitcherFooterProps) {
  // Welche Aktionen pro Reiter
  const left =
    view === 'spaces'
      ? onSpaceSettings
      : view === 'modules'
        ? onModuleSettings
        : undefined

  const leftLabel =
    view === 'spaces'
      ? 'Netzwerk-Einstellungen'
      : view === 'modules'
        ? 'Modul-Einstellungen'
        : ''

  const right =
    view === 'spaces'
      ? onCreateSpace
      : undefined

  const rightLabel = view === 'spaces' ? 'Neues Netzwerk' : ''

  // Wenn beide Seiten leer — Footer komplett ausblenden
  if (!left && !right) return null

  const handleLeft = () => {
    if (left) {
      left()
      onClose()
    }
  }
  const handleRight = () => {
    if (right) {
      right()
      onClose()
    }
  }

  return (
    <footer className="flex h-14 shrink-0 items-center justify-between border-t border-border/60 bg-background px-3">
      {left ? (
        <button
          type="button"
          onClick={handleLeft}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
          aria-label={leftLabel}
          title={leftLabel}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      ) : (
        <div className="h-10 w-10" />
      )}

      {right ? (
        <button
          type="button"
          onClick={handleRight}
          className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          aria-label={rightLabel}
          title={rightLabel}
        >
          <Plus className="h-4 w-4" />
          <span>{rightLabel}</span>
        </button>
      ) : (
        <div className="h-10 w-10" />
      )}
    </footer>
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

interface SpacesViewProps {
  spaces: MobileSpace[]
  activeSpaceId?: string
  onSelectSpace: (id: string) => void
}

function SpacesView({ spaces, activeSpaceId, onSelectSpace }: SpacesViewProps) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const overview = useMemo(() => spaces.filter((s) => s.scope === 'overview'), [spaces])
  const regular = useMemo(() => spaces.filter((s) => s.scope !== 'overview'), [spaces])

  // Alle Hashtags aus den Spaces sammeln (uniq, sortiert)
  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const s of regular) {
      for (const t of s.hashtags ?? []) set.add(t)
    }
    return Array.from(set).sort()
  }, [regular])

  // Filter anwenden — Name-Match + optionaler Tag-Match
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return regular.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false
      if (activeTag && !(s.hashtags ?? []).includes(activeTag)) return false
      return true
    })
  }, [regular, query, activeTag])

  // Wenn keine Filter aktiv: Overview zuerst zeigen. Sonst Overview ausblenden.
  const showOverview = !query && !activeTag
  const showFilter = regular.length >= 3 || allTags.length > 0

  if (spaces.length === 0) {
    return (
      <PlatzhalterView
        icon={Compass}
        title="Netzwerke"
        hint="Du hast noch keine Netzwerke. Lege eins ueber das Plus unten rechts an."
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Suche + Hashtag-Filter — nur ab 3 Spaces oder wenn Tags da */}
      {showFilter && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Netzwerke durchsuchen"
              className="h-9 w-full rounded-md border border-border/60 bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <FilterChip
                active={activeTag === null}
                onClick={() => setActiveTag(null)}
              >
                Alle
              </FilterChip>
              {allTags.map((tag) => (
                <FilterChip
                  key={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  #{tag}
                </FilterChip>
              ))}
            </div>
          )}
        </>
      )}

      {/* Karten — Overview zuerst (nur ohne aktiven Filter), dann gefilterte */}
      <div className="grid grid-cols-2 gap-3">
        {showOverview && overview.map((s) => (
          <SpaceCard
            key={s.id}
            space={s}
            isActive={s.id === activeSpaceId}
            onClick={() => onSelectSpace(s.id)}
          />
        ))}
        {filtered.map((s) => (
          <SpaceCard
            key={s.id}
            space={s}
            isActive={s.id === activeSpaceId}
            onClick={() => onSelectSpace(s.id)}
          />
        ))}
      </div>

      {/* Hinweis wenn Filter alles wegfiltert */}
      {filtered.length === 0 && (query || activeTag) && (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Kein Netzwerk passt zu *
            {query && <span className="font-mono">{query}</span>}
            {query && activeTag && ' · '}
            {activeTag && <span className="font-mono">#{activeTag}</span>}*.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setActiveTag(null)
            }}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Filter zuruecksetzen
          </button>
        </div>
      )}
    </div>
  )
}

interface SpaceCardProps {
  space: MobileSpace
  isActive: boolean
  onClick: () => void
}

function SpaceCard({ space, isActive, onClick }: SpaceCardProps) {
  const isOverview = space.scope === 'overview'
  const initial = space.name.trim().slice(0, 1).toUpperCase() || '?'
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted/40 transition ${
        isActive ? 'border-primary/60 ring-2 ring-primary/30' : 'border-border/60'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
            isOverview ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
          }`}
        >
          {space.avatar ? (
            <img src={space.avatar} alt={space.name} className="h-full w-full object-cover" />
          ) : isOverview ? (
            <Compass className="h-6 w-6" />
          ) : (
            <span className="text-lg font-semibold">{initial}</span>
          )}
        </div>
        <span className="line-clamp-2 text-sm font-medium text-foreground">
          {space.name}
        </span>
        {isActive && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Aktiv
          </span>
        )}
      </button>
    </div>
  )
}

interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border/60 bg-background text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

interface ProfileViewProps {
  profile: MobileProfile
  onEditProfile: () => void
  onOpenContacts?: () => void
  contactCount?: number
  onVerifyIdentity?: () => void
  onLogout?: () => void
}

function ProfileView({
  profile,
  onEditProfile,
  onOpenContacts,
  contactCount,
  onVerifyIdentity,
  onLogout,
}: ProfileViewProps) {
  const initial = profile.name.trim().slice(0, 1).toUpperCase() || '?'
  const didShort = profile.did
    ? profile.did.length > 18
      ? `${profile.did.slice(0, 8)}…${profile.did.slice(-6)}`
      : profile.did
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Kopfblock — Avatar + Name + DID */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold">{initial}</span>
          )}
        </div>
        <div>
          <div className="text-base font-semibold text-foreground">{profile.name}</div>
          {didShort && (
            <div
              className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              title={profile.did}
            >
              {didShort}
            </div>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <ul className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <ProfileAction icon={Pencil} label="Profil bearbeiten" onClick={onEditProfile} />
        {onOpenContacts && (
          <ProfileAction
            icon={Users}
            label="Kontakte"
            badge={contactCount && contactCount > 0 ? String(contactCount) : undefined}
            onClick={onOpenContacts}
          />
        )}
        {onVerifyIdentity && (
          <ProfileAction
            icon={Fingerprint}
            label="Identitaet pruefen"
            onClick={onVerifyIdentity}
          />
        )}
        {onLogout && (
          <ProfileAction
            icon={LogOut}
            label="Abmelden"
            tone="danger"
            onClick={onLogout}
          />
        )}
      </ul>
    </div>
  )
}

interface ProfileActionProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  badge?: string
  tone?: 'default' | 'danger'
  onClick: () => void
}

function ProfileAction({ icon: Icon, label, badge, tone = 'default', onClick }: ProfileActionProps) {
  const isDanger = tone === 'danger'
  return (
    <li className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-muted/50 ${
          isDanger ? 'text-destructive' : 'text-foreground'
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
            isDanger ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm font-medium">{label}</span>
        {badge && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  )
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
