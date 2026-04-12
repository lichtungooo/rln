import { useCallback, useEffect, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { ConnectorProvider } from '@real-life-stack/toolkit'
import { MapView } from './views/MapView'
import { CalendarPanel } from './views/CalendarPanel'
import { EventDetailPanel } from './views/EventDetailPanel'
import { EventCreateDialog } from './views/EventCreateDialog'
import { ProfilePanel } from './views/ProfilePanel'
import { SettingsDialog } from './views/SettingsDialog'
import { PanelWorkspace, type PanelDef } from './views/PanelWorkspace'
import { SettingsProvider, useSettings } from './lib/settings'
import { SpacesPanel } from './views/map/SpacesPanel'
import { SearchBar } from './views/map/SearchBar'
import { ModuleCarousel } from './views/map/ModuleCarousel'
import { ProfileCluster } from './views/map/ProfileCluster'
import { LayerSwitcher } from './views/map/LayerSwitcher'
import { FilterButton } from './views/map/FilterButton'
import { HudBar } from './views/map/HudBar'
import { ActionButton } from './views/map/ActionButton'
import { connector, initConnector } from './lib/connector'
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initConnector().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted-foreground">
        Das Real Life Network wacht auf...
      </div>
    )
  }

  return (
    <ErrorBoundary label="App">
      <SettingsProvider>
        <ConnectorProvider connector={connector}>
          <AppInner />
        </ConnectorProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}

function AppInner() {
  const { settings } = useSettings()
  const [activeSpaceId, setActiveSpaceId] = useState('adventure-de')
  const [activeModule, setActiveModule] = useState('map')
  const [selectedEvent, setSelectedEvent] = useState<Item | null>(null)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Lock-Status pro Panel: gelockte Panels bleiben beim Karten-Klick offen
  const [lockedPanels, setLockedPanels] = useState<Set<string>>(new Set())

  const toggleLock = useCallback((panelId: string) => {
    setLockedPanels((prev) => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }, [])

  // Karten-Klick: alle ungelockten Panels schließen
  const handleMapClick = useCallback(() => {
    if (!lockedPanels.has('calendar')) {
      setActiveModule('map')
    }
    if (!lockedPanels.has('event-detail')) {
      setSelectedEvent(null)
    }
    if (!lockedPanels.has('profile')) {
      setProfileOpen(false)
    }
  }, [lockedPanels])

  const showCalendarPanel = activeModule === 'calendar'

  return (
    <div className="relative h-dvh w-dvw overflow-hidden">
      {/* Die Karte ist immer präsent, als Vollbild-Ebene hinter allem */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary label="Karte">
          <MapView onMapClick={handleMapClick} />
        </ErrorBoundary>
      </div>

      {/* Modul-Karussell: absolut mittig oben, über allem */}
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2">
        <div className="pointer-events-auto">
          <ModuleCarousel
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />
        </div>
      </div>

      {/* Oben links: Spaces */}
      <div className="pointer-events-none absolute left-4 top-4 z-30">
        <div className="pointer-events-auto">
          <SpacesPanel
            activeSpaceId={activeSpaceId}
            onSpaceChange={setActiveSpaceId}
          />
        </div>
      </div>

      {/* Oben rechts: Suche + Profil-Cluster */}
      <div className="pointer-events-none absolute right-4 top-4 z-30">
        <div className="pointer-events-auto flex items-center gap-2">
          <SearchBar />
          <ProfileCluster
            userName="Timo"
            onProfileClick={() => setProfileOpen((o) => !o)}
            onSettingsClick={() => setSettingsOpen((o) => !o)}
          />
        </div>
      </div>

      {/* Rechte Seite mittig: Karten-Layer-Wähler */}
      <div className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2">
        <div className="pointer-events-auto">
          <LayerSwitcher />
        </div>
      </div>

      {/* Schwebende Panels im Raster-Workspace */}
      <PanelWorkspace
        panels={
          [
            ...(showCalendarPanel
              ? [
                  {
                    id: 'calendar',
                    layout: settings.panels.calendar,
                    content: (
                      <ErrorBoundary label="Kalender">
                        <PanelWithLock
                          panelId="calendar"
                          locked={lockedPanels.has('calendar')}
                          onToggleLock={toggleLock}
                        >
                          <CalendarPanel
                            onSelectEvent={setSelectedEvent}
                            onClose={() => setActiveModule('map')}
                            selectedEventId={selectedEvent?.id}
                          />
                        </PanelWithLock>
                      </ErrorBoundary>
                    ),
                  },
                ]
              : []),
            ...(selectedEvent
              ? [
                  {
                    id: 'event-detail',
                    layout: settings.panels.eventDetail,
                    content: (
                      <ErrorBoundary label="Event-Detail">
                        <PanelWithLock
                          panelId="event-detail"
                          locked={lockedPanels.has('event-detail')}
                          onToggleLock={toggleLock}
                        >
                          <EventDetailPanel
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                          />
                        </PanelWithLock>
                      </ErrorBoundary>
                    ),
                  },
                ]
              : []),
            ...(profileOpen
              ? [
                  {
                    id: 'profile',
                    layout: settings.panels.profile,
                    content: (
                      <ErrorBoundary label="Profil">
                        <PanelWithLock
                          panelId="profile"
                          locked={lockedPanels.has('profile')}
                          onToggleLock={toggleLock}
                        >
                          <ProfilePanel onClose={() => setProfileOpen(false)} />
                        </PanelWithLock>
                      </ErrorBoundary>
                    ),
                  },
                ]
              : []),
          ] as PanelDef[]
        }
      />

      {/* Einstellungen als Modal-Dialog über allem */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Unterer Rand: Filter links, HUD mittig, Aktions-Knopf rechts */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex items-end justify-between gap-4 px-4">
        <div className="pointer-events-auto">
          <FilterButton />
        </div>
        <div className="pointer-events-auto">
          <HudBar />
        </div>
        <div className="pointer-events-auto">
          <ActionButton onNewEvent={() => setCreateEventOpen(true)} />
        </div>
      </div>

      {/* Dialog für neues Event (vom Aktions-Knopf) */}
      <EventCreateDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
      />
    </div>
  )
}

// Wrapper: zeigt ein kleines Schloss-Icon oben rechts im Panel
import { Lock, Unlock } from 'lucide-react'

function PanelWithLock({
  panelId,
  locked,
  onToggleLock,
  children,
}: {
  panelId: string
  locked: boolean
  onToggleLock: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative h-full w-full">
      {children}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleLock(panelId)
        }}
        className={`absolute right-10 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full transition ${
          locked
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-black/20 text-white/80 hover:bg-black/40'
        }`}
        title={locked ? 'Fenster lösen' : 'Fenster festhalten'}
      >
        {locked ? (
          <Lock className="h-3 w-3" />
        ) : (
          <Unlock className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}
