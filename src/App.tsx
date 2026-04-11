import { useEffect, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { ConnectorProvider } from '@real-life-stack/toolkit'
import { MapView } from './views/MapView'
import { CalendarPanel } from './views/CalendarPanel'
import { EventDetailPanel } from './views/EventDetailPanel'
import { EventCreateDialog } from './views/EventCreateDialog'
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
  const [activeSpaceId, setActiveSpaceId] = useState('adventure-de')
  const [activeModule, setActiveModule] = useState('map')
  const [selectedEvent, setSelectedEvent] = useState<Item | null>(null)
  const [createEventOpen, setCreateEventOpen] = useState(false)

  const showCalendarPanel = activeModule === 'calendar'

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
      <ConnectorProvider connector={connector}>
        <div className="relative h-dvh w-dvw overflow-hidden">
          {/* Die Karte ist immer präsent, als Vollbild-Ebene hinter allem */}
          <div className="absolute inset-0 z-0">
            <ErrorBoundary label="Karte">
              <MapView />
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
              <ProfileCluster userName="Timo" />
            </div>
          </div>

          {/* Rechte Seite mittig: Karten-Layer-Wähler */}
          <div className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2">
            <div className="pointer-events-auto">
              <LayerSwitcher />
            </div>
          </div>

          {/* Schwebende Modul-Panels (Kalender, Event-Detail) */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-start gap-4 px-4 pt-20">
            {showCalendarPanel && (
              <div className="pointer-events-auto ml-20 flex-shrink-0">
                <ErrorBoundary label="Kalender">
                  <CalendarPanel
                    onSelectEvent={setSelectedEvent}
                    onClose={() => setActiveModule('map')}
                    selectedEventId={selectedEvent?.id}
                  />
                </ErrorBoundary>
              </div>
            )}

            <div className="flex-1" />

            {selectedEvent && (
              <div className="pointer-events-auto mr-24 flex-shrink-0">
                <ErrorBoundary label="Event-Detail">
                  <EventDetailPanel
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>

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
      </ConnectorProvider>
    </ErrorBoundary>
  )
}
