import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { App } from './App'

// StrictMode ist bewusst weggelassen, weil Leaflet (im utopia-ui) seine DOM-Container
// nicht mehrfach initialisieren darf. React StrictMode ruft Effekte im Dev-Modus zweifach
// auf und würde den Karten-Container verdoppeln — das bricht die Karte.
createRoot(document.getElementById('root')!).render(<App />)
