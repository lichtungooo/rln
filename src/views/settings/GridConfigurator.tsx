import { useCallback, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@real-life-stack/toolkit'
import {
  useSettings,
  panelTypeLabels,
  GRID_COLS,
  GRID_ROWS,
  type PanelTypeKey,
  type PanelLayout,
} from '@/lib/settings'

// Farben pro Modul — für den farbigen Block im Raster
const PANEL_COLORS: Record<PanelTypeKey, { bg: string; text: string; light: string }> = {
  calendar: { bg: 'bg-orange-500', text: 'text-white', light: 'bg-orange-200' },
  eventDetail: { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-200' },
  profile: { bg: 'bg-green-500', text: 'text-white', light: 'bg-green-200' },
}

const ALL_PANELS: PanelTypeKey[] = ['calendar', 'eventDetail', 'profile']

export function GridConfigurator() {
  const { settings, setPanelLayout, applySettings } = useSettings()

  // Welches Modul wird gerade platziert?
  const [activePanelType, setActivePanelType] = useState<PanelTypeKey>('calendar')

  // Drag-State: Start-Zelle und aktuelle Zelle beim Ziehen
  const [dragStart, setDragStart] = useState<{ col: number; row: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ col: number; row: number } | null>(null)
  const isDragging = useRef(false)

  // Erfolgs-Feedback
  const [applied, setApplied] = useState(false)

  // Berechne das Rechteck aus Start/End (egal in welche Richtung gezogen)
  const getDragRect = useCallback(() => {
    if (!dragStart || !dragEnd) return null
    const minCol = Math.min(dragStart.col, dragEnd.col)
    const maxCol = Math.max(dragStart.col, dragEnd.col)
    const minRow = Math.min(dragStart.row, dragEnd.row)
    const maxRow = Math.max(dragStart.row, dragEnd.row)
    return {
      x: minCol,
      y: minRow,
      w: maxCol - minCol + 1,
      h: maxRow - minRow + 1,
    }
  }, [dragStart, dragEnd])

  const handleMouseDown = (col: number, row: number) => {
    isDragging.current = true
    setDragStart({ col, row })
    setDragEnd({ col, row })
  }

  const handleMouseEnter = (col: number, row: number) => {
    if (isDragging.current) {
      setDragEnd({ col, row })
    }
  }

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false
      const rect = getDragRect()
      if (rect) {
        setPanelLayout(activePanelType, rect)
      }
      setDragStart(null)
      setDragEnd(null)
    }
  }

  const handleApply = () => {
    applySettings()
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }

  const dragRect = getDragRect()

  // Welches Panel belegt welche Zelle?
  const getCellOwner = (col: number, row: number): PanelTypeKey | null => {
    for (const panel of ALL_PANELS) {
      const l = settings.panels[panel]
      if (col >= l.x && col < l.x + l.w && row >= l.y && row < l.y + l.h) {
        return panel
      }
    }
    return null
  }

  // Ist diese Zelle gerade im Drag-Bereich?
  const isInDragRect = (col: number, row: number): boolean => {
    if (!dragRect) return false
    return (
      col >= dragRect.x &&
      col < dragRect.x + dragRect.w &&
      row >= dragRect.y &&
      row < dragRect.y + dragRect.h
    )
  }

  return (
    <div className="space-y-5">
      {/* Anleitung */}
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          Fenster auf dem Raster platzieren
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Wähle unten ein Modul, dann <strong>klicke und ziehe</strong> auf dem
          Raster, um den Bereich zu markieren. Das Modul wird dort geöffnet.
        </p>
      </div>

      {/* Modul-Auswahl */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Modul platzieren:</span>
        <div className="flex gap-1">
          {ALL_PANELS.map((panel) => {
            const isActive = activePanelType === panel
            const colors = PANEL_COLORS[panel]
            return (
              <button
                key={panel}
                type="button"
                onClick={() => setActivePanelType(panel)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? `${colors.bg} ${colors.text} shadow-sm`
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isActive ? 'bg-white/60' : colors.bg}`}
                />
                {panelTypeLabels[panel]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Das interaktive Raster */}
      <div
        className="select-none rounded-xl border border-border/60 bg-muted/20 p-3"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging.current) {
            isDragging.current = false
            const rect = getDragRect()
            if (rect) {
              setPanelLayout(activePanelType, rect)
            }
            setDragStart(null)
            setDragEnd(null)
          }
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 3rem)`,
          }}
        >
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
            const col = i % GRID_COLS
            const row = Math.floor(i / GRID_COLS)
            const owner = getCellOwner(col, row)
            const inDrag = isInDragRect(col, row)
            const activeColors = PANEL_COLORS[activePanelType]

            let cellClass = 'rounded-lg border-2 transition-all duration-100 '

            if (inDrag) {
              // Aktiver Drag-Bereich
              cellClass += `${activeColors.light} border-dashed ${
                activePanelType === 'calendar'
                  ? 'border-orange-400'
                  : activePanelType === 'eventDetail'
                    ? 'border-blue-400'
                    : 'border-green-400'
              }`
            } else if (owner) {
              // Bereits belegtes Feld
              const ownerColors = PANEL_COLORS[owner]
              cellClass += `${ownerColors.bg} border-transparent`
            } else {
              // Leeres Feld
              cellClass += 'bg-background border-border/30 hover:border-border/60 hover:bg-muted/40 cursor-crosshair'
            }

            return (
              <div
                key={i}
                className={cellClass}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleMouseDown(col, row)
                }}
                onMouseEnter={() => handleMouseEnter(col, row)}
              >
                {owner && !inDrag && isTopLeftOfPanel(settings.panels[owner], col, row) && (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
                      {panelTypeLabels[owner]}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        {ALL_PANELS.map((panel) => {
          const l = settings.panels[panel]
          return (
            <span key={panel} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded ${PANEL_COLORS[panel].bg}`} />
              {panelTypeLabels[panel]}
              <span className="text-foreground font-medium">
                {l.w}×{l.h}
              </span>
              bei Spalte {l.x + 1}, Reihe {l.y + 1}
            </span>
          )
        })}
      </div>

      {/* Aktions-Leiste */}
      <div className="flex items-center gap-3 border-t border-border/40 pt-4">
        <Button onClick={handleApply}>
          {applied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Angewendet
            </>
          ) : (
            'Anwenden'
          )}
        </Button>
        {applied && (
          <span className="text-xs text-green-600 font-medium">
            Schließe das Fenster, um das Ergebnis zu sehen.
          </span>
        )}
      </div>
    </div>
  )
}

// Prüft, ob (col, row) die obere linke Ecke eines Panel-Bereichs ist.
function isTopLeftOfPanel(layout: PanelLayout, col: number, row: number): boolean {
  return col === layout.x && row === layout.y
}
