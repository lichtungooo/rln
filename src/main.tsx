import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { App } from './App'
import { patchLeafletForMapAccess } from './lib/map-access'
import { startHidingUtopiaUi } from './lib/hide-utopia-ui'

// Leaflet einmal patchen, bevor utopia-ui seine Karte erzeugt.
patchLeafletForMapAccess()

// utopia-ui's eigene Navbar und Controls werden dauerhaft aus dem DOM
// entfernt, damit nur unsere schwebenden Elemente sichtbar sind.
startHidingUtopiaUi()

// StrictMode ist bewusst weggelassen, weil Leaflet (im utopia-ui) seine DOM-Container
// nicht mehrfach initialisieren darf. React StrictMode ruft Effekte im Dev-Modus zweifach
// auf und würde den Karten-Container verdoppeln — das bricht die Karte.
createRoot(document.getElementById('root')!).render(<App />)
