import { useEffect, useState } from 'react'
import {
  X,
  Settings as SettingsIcon,
  LayoutGrid,
  User,
  Bell,
  Info,
  Sliders,
} from 'lucide-react'
import { GridConfigurator } from './settings/GridConfigurator'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

type CategoryId = 'general' | 'panels' | 'profile' | 'notifications' | 'about'

interface Category {
  id: CategoryId
  label: string
  icon: typeof SettingsIcon
}

const categories: Category[] = [
  { id: 'general', label: 'Allgemein', icon: Sliders },
  { id: 'panels', label: 'Fenster & Raster', icon: LayoutGrid },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { id: 'about', label: 'Über', icon: Info },
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('panels')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dunkler Hintergrund wie im Event-Dialog */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Dialog-Inhalt */}
      <div className="relative flex h-[85vh] max-h-[720px] w-full max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
        {/* Linke Seite: Kategorien */}
        <div className="flex w-52 shrink-0 flex-col border-r border-border/40 bg-muted/20">
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-4">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Einstellungen</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-0.5">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Rechte Seite: Inhalt */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              {categories.find((c) => c.id === activeCategory)?.label}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeCategory === 'general' && <GeneralSettings />}
            {activeCategory === 'panels' && <PanelSettings />}
            {activeCategory === 'profile' && (
              <PlaceholderSettings text="Profil-Einstellungen wachsen, sobald das Profil-Modul vollständig ist." />
            )}
            {activeCategory === 'notifications' && (
              <PlaceholderSettings text="Benachrichtigungs-Einstellungen kommen mit dem Notifications-Modul." />
            )}
            {activeCategory === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Kategorie: Allgemein ---

function GeneralSettings() {
  return (
    <div className="space-y-4 text-sm">
      <SettingRow label="Sprache" description="Die Sprache der Oberfläche.">
        <span className="text-muted-foreground">Deutsch</span>
      </SettingRow>
      <SettingRow
        label="Theme"
        description="Hell oder dunkel — kommt in einer nächsten Runde."
      >
        <span className="text-muted-foreground">Hell</span>
      </SettingRow>
    </div>
  )
}

// --- Kategorie: Fenster & Raster ---

function PanelSettings() {
  return <GridConfigurator />
}

// --- Kategorie: Über ---

function AboutSettings() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold text-foreground">Real Life Network</h4>
        <p className="text-xs text-muted-foreground">
          Version 0.1.0 — im Entstehen
        </p>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>Ein Werkzeug für echte Begegnungen im wirklichen Leben.</p>
        <p>
          Vision von <span className="font-medium text-foreground">Timo</span>,
          gebaut gemeinsam mit{' '}
          <span className="font-medium text-foreground">Eli</span>.
        </p>
      </div>
      <div className="flex flex-col gap-1 text-xs">
        <a
          href="https://github.com/real-life-network/rln"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          github.com/real-life-network/rln
        </a>
      </div>
    </div>
  )
}

// --- Hilfskomponenten ---

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function PlaceholderSettings({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
