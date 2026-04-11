import { useEffect, useState } from 'react'
import {
  X,
  Settings as SettingsIcon,
  LayoutGrid,
  User,
  Bell,
  Info,
  Sliders,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@real-life-stack/toolkit'
import {
  useSettings,
  panelTypeLabels,
  GRID_COLS,
  GRID_ROWS,
  type PanelTypeKey,
  type PanelLayout,
} from '@/lib/settings'

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
  const { settings, setPanelLayout, resetSettings } = useSettings()

  const panelTypes: PanelTypeKey[] = ['calendar', 'eventDetail', 'profile']

  return (
    <div className="space-y-6 text-sm">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          Öffnungs-Verhalten der Fenster
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Das Raster hat <strong>{GRID_COLS} Spalten × {GRID_ROWS} Reihen</strong> = {GRID_COLS * GRID_ROWS} Zellen.
          Lege für jedes Modul Position und Größe fest. Einmal geöffnet, kannst
          du jedes Fenster frei verschieben und vergrößern.
        </p>
      </div>

      <div className="space-y-4">
        {panelTypes.map((panel) => {
          const current = settings.panels[panel]
          return (
            <div
              key={panel}
              className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4"
            >
              <h5 className="text-sm font-semibold text-foreground">
                {panelTypeLabels[panel]}
              </h5>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberDropdown
                  label="Breite"
                  unit="Spalten"
                  value={current.w}
                  min={1}
                  max={GRID_COLS}
                  onChange={(w) => setPanelLayout(panel, { w })}
                />
                <NumberDropdown
                  label="Höhe"
                  unit="Reihen"
                  value={current.h}
                  min={1}
                  max={GRID_ROWS}
                  onChange={(h) => setPanelLayout(panel, { h })}
                />
                <NumberDropdown
                  label="Spalte"
                  unit=""
                  value={current.x + 1}
                  min={1}
                  max={GRID_COLS}
                  onChange={(v) => setPanelLayout(panel, { x: v - 1 })}
                />
                <NumberDropdown
                  label="Reihe"
                  unit=""
                  value={current.y + 1}
                  min={1}
                  max={GRID_ROWS}
                  onChange={(v) => setPanelLayout(panel, { y: v - 1 })}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <GridPreview layout={current} />
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      {current.w}×{current.h} Zellen
                    </strong>{' '}
                    bei Spalte {current.x + 1}, Reihe {current.y + 1}
                  </p>
                  <p className="mt-0.5">
                    Nimmt {((current.w * current.h) / (GRID_COLS * GRID_ROWS) * 100).toFixed(0)}%
                    der Bildschirmfläche ein.
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-2">
        <Button variant="outline" size="sm" onClick={resetSettings}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Auf Standard zurücksetzen
        </Button>
      </div>
    </div>
  )
}

// --- Dropdown für eine Zahl mit min/max ---

function NumberDropdown({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const options: number[] = []
  for (let i = min; i <= max; i++) options.push(i)

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
            {unit && ` ${unit}`}
          </option>
        ))}
      </select>
    </label>
  )
}

// --- Grid-Vorschau: 6×4 Mini-Raster ---

function GridPreview({ layout }: { layout: PanelLayout }) {
  return (
    <div
      className="grid shrink-0 gap-0.5 rounded border border-border/60 bg-muted/30 p-1"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 0.5rem)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 0.4rem)`,
      }}
    >
      {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
        const col = i % GRID_COLS
        const row = Math.floor(i / GRID_COLS)
        const isCovered =
          col >= layout.x &&
          col < layout.x + layout.w &&
          row >= layout.y &&
          row < layout.y + layout.h
        return (
          <div
            key={i}
            className={`rounded-[1px] ${
              isCovered ? 'bg-primary' : 'bg-border/40'
            }`}
          />
        )
      })}
    </div>
  )
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
