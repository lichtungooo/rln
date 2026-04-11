import { useEffect, useState } from 'react'
import { Map as MapIcon, Calendar as CalendarIcon } from 'lucide-react'
import type { Item } from '@real-life-stack/data-interface'
import {
  Navbar,
  NavbarStart,
  NavbarCenter,
  NavbarEnd,
  WorkspaceSwitcher,
  UserMenu,
  ModuleTabs,
  ConnectorProvider,
} from '@real-life-stack/toolkit'
import { MapView } from './views/MapView'
import { CalendarPanel } from './views/CalendarPanel'
import { EventDetailPanel } from './views/EventDetailPanel'
import { demoSpaces } from './data/demo'
import { connector, initConnector } from './lib/connector'
import { ErrorBoundary } from './components/ErrorBoundary'

const workspaces = demoSpaces.map((s) => ({
  id: s.id,
  name: s.name,
}))

const modules = [
  { id: 'map', label: 'Karte', icon: MapIcon },
  { id: 'calendar', label: 'Kalender', icon: CalendarIcon },
]

const currentUser = {
  id: 'timo',
  name: 'Timo',
}

export function App() {
  const [ready, setReady] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])
  const [activeModule, setActiveModule] = useState('map')
  const [selectedEvent, setSelectedEvent] = useState<Item | null>(null)

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
          {/* Karte: immer präsent als Vollbild-Ebene hinter allem */}
          <div className="absolute inset-0 z-0">
            <ErrorBoundary label="Karte">
              <MapView />
            </ErrorBoundary>
          </div>

          {/* Navbar schwebt oben */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
            <div className="pointer-events-auto">
              <Navbar>
                <NavbarStart>
                  <WorkspaceSwitcher
                    workspaces={workspaces}
                    activeWorkspace={activeWorkspace}
                    onWorkspaceChange={setActiveWorkspace}
                  />
                </NavbarStart>
                <NavbarCenter>
                  <ModuleTabs
                    modules={modules}
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                  />
                </NavbarCenter>
                <NavbarEnd>
                  <UserMenu user={currentUser} />
                </NavbarEnd>
              </Navbar>
            </div>
          </div>

          {/* Schwebende Panels über der Karte, unter der Navbar.
              Die Panels leben in der oberen Hälfte, damit unten Platz
              für das HUD und links/rechts Platz für Karten-Controls bleibt. */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-start gap-4 px-16 pt-[4.5rem]">
            {/* Kalender-Liste links */}
            {showCalendarPanel && (
              <div className="pointer-events-auto flex-shrink-0">
                <ErrorBoundary label="Kalender">
                  <CalendarPanel
                    onSelectEvent={setSelectedEvent}
                    onClose={() => setActiveModule('map')}
                    selectedEventId={selectedEvent?.id}
                  />
                </ErrorBoundary>
              </div>
            )}

            {/* Mittelraum bleibt für die Karte frei */}
            <div className="flex-1" />

            {/* Event-Detail rechts */}
            {selectedEvent && (
              <div className="pointer-events-auto flex-shrink-0">
                <ErrorBoundary label="Event-Detail">
                  <EventDetailPanel
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </ConnectorProvider>
    </ErrorBoundary>
  )
}
