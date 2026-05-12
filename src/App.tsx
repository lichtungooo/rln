import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import ImpressumPage from './pages/ImpressumPage'

const MacherApp = lazy(() => import('./pages/MacherApp'))

/**
 * URL-Struktur:
 *   /                      → Landing (Default oder RLN-Landing)
 *   /<slug>                → Netzwerk (Default-Modul)
 *   /<slug>/<modul>        → Netzwerk + Modul
 *   /<slug>/<modul>/<id>   → Netzwerk + Modul + Item
 *   /datenschutz           → PrivacyPage
 *   /impressum             → ImpressumPage
 *
 * Backwards-Compat:
 *   /app/spaces/<id>/<modul>  → leitet auf /<slug-or-id>/<modul>
 */

const RESERVED_SLUGS = new Set(['datenschutz', 'impressum', 'app'])

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Laden...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Statische Pfade haben Vorrang vor Slug-Routes */}
          <Route path="/datenschutz" element={<PrivacyPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />

          {/* Backwards-Compat: alte /app/* URLs auf neue Slug-Routes */}
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="/app/*" element={<LegacyAppRedirect />} />

          {/* Slug-basierte Netzwerk-Routes */}
          <Route path="/:slug" element={<SpaceRoute />} />
          <Route path="/:slug/:module" element={<SpaceRoute />} />
          <Route path="/:slug/:module/:itemId" element={<SpaceRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

/**
 * Wenn der erste Pfad-Segment ein reservierter Slug ist (z.B. "datenschutz"),
 * sollte React Router den passenden Route-Eintrag oben auswaehlen — nicht hier
 * landen. Diese Komponente prueft also nur den fall durch wo der slug echt ist.
 */
function SpaceRoute() {
  const { slug } = useParams<{ slug: string }>()
  if (slug && RESERVED_SLUGS.has(slug)) {
    return <Navigate to="/" replace />
  }
  return <MacherApp />
}

/**
 * Backwards-Compat fuer alte URLs `/app/spaces/<id>/<modul>`.
 * Wir leiten auf `/<id>/<modul>` weiter — die App loest die ID dann zum Slug
 * auf und kann eine zweite Weiterleitung machen.
 */
function LegacyAppRedirect() {
  const location = useLocation()
  const path = location.pathname
  // /app/spaces/<id>/<modul>  →  /<id>/<modul>
  const match = path.match(/^\/app\/spaces\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/)
  if (!match) {
    return <Navigate to="/" replace />
  }
  const [, id, mod, itemId] = match
  const target =
    itemId ? `/${id}/${mod}/${itemId}`
    : mod ? `/${id}/${mod}`
    : `/${id}`
  return <Navigate to={target + location.search + location.hash} replace />
}
