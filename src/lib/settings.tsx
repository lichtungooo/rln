import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

// Das Raster hat 6 Spalten × 4 Reihen = 24 Zellen.
// Das gibt feine Abstufungen für Panel-Größen und -Positionen.
export const GRID_COLS = 6
export const GRID_ROWS = 4

// Eine Panel-Konfiguration: wo und wie groß soll das Panel beim Öffnen sein.
export interface PanelLayout {
  x: number // Spalte: 0 bis GRID_COLS - 1
  y: number // Reihe: 0 bis GRID_ROWS - 1
  w: number // Breite in Spalten: 1 bis GRID_COLS
  h: number // Höhe in Reihen: 1 bis GRID_ROWS
}

export type PanelTypeKey = 'calendar' | 'eventDetail' | 'profile'

export const panelTypeLabels: Record<PanelTypeKey, string> = {
  calendar: 'Kalender',
  eventDetail: 'Event-Detail',
  profile: 'Profil',
}

export interface Settings {
  panels: Record<PanelTypeKey, PanelLayout>
}

const DEFAULT_SETTINGS: Settings = {
  panels: {
    // Kalender: linkes Drittel, volle Höhe (2 Spalten × 4 Reihen = 8 Zellen)
    calendar: { x: 0, y: 0, w: 2, h: 4 },
    // Event-Detail: mittleres Drittel, volle Höhe
    eventDetail: { x: 2, y: 0, w: 2, h: 4 },
    // Profil: rechtes Drittel, volle Höhe
    profile: { x: 4, y: 0, w: 2, h: 4 },
  },
}

const STORAGE_KEY = 'rln-settings-v3'

interface SettingsContextValue {
  settings: Settings
  setPanelLayout: (panel: PanelTypeKey, layout: Partial<PanelLayout>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function clampLayout(layout: PanelLayout): PanelLayout {
  const w = Math.max(1, Math.min(GRID_COLS, layout.w))
  const h = Math.max(1, Math.min(GRID_ROWS, layout.h))
  const x = Math.max(0, Math.min(GRID_COLS - w, layout.x))
  const y = Math.max(0, Math.min(GRID_ROWS - h, layout.y))
  return { x, y, w, h }
}

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      panels: {
        ...DEFAULT_SETTINGS.panels,
        ...(parsed.panels ?? {}),
      },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: Settings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Silent fail
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const setPanelLayout = useCallback(
    (panel: PanelTypeKey, partial: Partial<PanelLayout>) => {
      setSettings((prev) => {
        const merged = { ...prev.panels[panel], ...partial }
        return {
          ...prev,
          panels: {
            ...prev.panels,
            [panel]: clampLayout(merged),
          },
        }
      })
    },
    [],
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const value = useMemo(
    () => ({ settings, setPanelLayout, resetSettings }),
    [settings, setPanelLayout, resetSettings],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return ctx
}
