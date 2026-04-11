import { useState } from 'react'
import { Map as MapIcon, Calendar as CalendarIcon } from 'lucide-react'
import {
  AppShell,
  AppShellMain,
  Navbar,
  NavbarStart,
  NavbarCenter,
  NavbarEnd,
  WorkspaceSwitcher,
  UserMenu,
  ModuleTabs,
  BottomNav,
} from '@real-life-stack/toolkit'
import { demoSpaces } from './data/demo'

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
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])
  const [activeModule, setActiveModule] = useState('map')

  return (
    <AppShell>
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

      <AppShellMain withBottomNav>
        <div className="container mx-auto px-4 pt-6 max-w-5xl">
          <p className="text-foreground">Inhalt: {activeModule}</p>
        </div>
      </AppShellMain>

      <BottomNav
        items={modules}
        activeItem={activeModule}
        onItemChange={setActiveModule}
      />
    </AppShell>
  )
}
