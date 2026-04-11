import { useEffect, useRef, useState, type ReactNode } from 'react'
import GridLayout, { type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { GRID_COLS, GRID_ROWS, type PanelLayout } from '@/lib/settings'

// Der Panel-Workspace ist ein 6×4-Raster über der Karte (24 Zellen).
// Jedes Panel trägt seine gewünschte Position und Größe mit sich.
// Wenn zwei Panels denselben Platz wollen, findet das System für
// das spätere einen freien Ausweich-Platz.

export interface PanelDef {
  id: string
  layout: PanelLayout
  content: ReactNode
}

interface PanelWorkspaceProps {
  panels: PanelDef[]
}

// Prüft, ob ein Rechteck in das Raster passt und nicht kollidiert.
function fits(
  x: number,
  y: number,
  w: number,
  h: number,
  existing: Layout[],
): boolean {
  if (x < 0 || y < 0 || x + w > GRID_COLS || y + h > GRID_ROWS) return false
  for (const item of existing) {
    const overlaps =
      x < item.x + item.w &&
      x + w > item.x &&
      y < item.y + item.h &&
      y + h > item.y
    if (overlaps) return false
  }
  return true
}

// Sucht einen freien Platz für w×h, bevorzugt nahe an der Wunsch-Position.
function findFreePlace(
  existing: Layout[],
  preferX: number,
  preferY: number,
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } | null {
  // Erst die Wunsch-Position direkt
  if (fits(preferX, preferY, w, h, existing)) {
    return { x: preferX, y: preferY, w, h }
  }

  // Dann alle anderen Plätze, sortiert nach Abstand zur Wunsch-Position
  const candidates: { x: number; y: number; dist: number }[] = []
  for (let x = 0; x <= GRID_COLS - w; x++) {
    for (let y = 0; y <= GRID_ROWS - h; y++) {
      if (fits(x, y, w, h, existing)) {
        const dist = Math.abs(x - preferX) + Math.abs(y - preferY)
        candidates.push({ x, y, dist })
      }
    }
  }
  candidates.sort((a, b) => a.dist - b.dist)
  if (candidates.length > 0) {
    return { x: candidates[0].x, y: candidates[0].y, w, h }
  }

  // Kein Platz in voller Größe — versuche kleiner
  if (w > 1 || h > 1) {
    if (w > 1) {
      const smaller = findFreePlace(existing, preferX, preferY, w - 1, h)
      if (smaller) return smaller
    }
    if (h > 1) {
      const smaller = findFreePlace(existing, preferX, preferY, w, h - 1)
      if (smaller) return smaller
    }
  }

  return null
}

export function PanelWorkspace({ panels }: PanelWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Layout pro Panel-ID. Benutzer-Anpassungen (Drag/Resize) bleiben erhalten.
  const [layouts, setLayouts] = useState<Record<string, Layout>>({})

  useEffect(() => {
    setLayouts((prev) => {
      const openIds = new Set(panels.map((p) => p.id))
      const next: Record<string, Layout> = {}

      for (const [id, layout] of Object.entries(prev)) {
        if (openIds.has(id)) next[id] = layout
      }

      let changed = Object.keys(next).length !== Object.keys(prev).length

      for (const panel of panels) {
        if (!next[panel.id]) {
          const existingLayouts = Object.values(next)
          const { x, y, w, h } = panel.layout

          const place = findFreePlace(existingLayouts, x, y, w, h)
          const p = place ?? { x, y, w: 1, h: 1 }

          next[panel.id] = {
            i: panel.id,
            x: p.x,
            y: p.y,
            w: p.w,
            h: p.h,
            minW: 1,
            minH: 1,
            maxW: GRID_COLS,
            maxH: GRID_ROWS,
          }
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [panels])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      setContainerWidth(el.clientWidth)
      setContainerHeight(el.clientHeight)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const currentLayout: Layout[] = panels
    .map((p) => layouts[p.id])
    .filter((l): l is Layout => l !== undefined)

  const rowHeight =
    containerHeight > 0
      ? (containerHeight - 12 * (GRID_ROWS - 1)) / GRID_ROWS
      : 150

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayouts((prev) => {
      const next = { ...prev }
      let changed = false
      for (const item of newLayout) {
        const old = prev[item.i]
        if (
          !old ||
          old.x !== item.x ||
          old.y !== item.y ||
          old.w !== item.w ||
          old.h !== item.h
        ) {
          next[item.i] = { ...old, ...item }
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-4 top-20 bottom-20 z-20"
    >
      {containerWidth > 0 &&
        panels.length > 0 &&
        currentLayout.length === panels.length && (
          <GridLayout
            className="layout"
            layout={currentLayout}
            cols={GRID_COLS}
            rowHeight={rowHeight}
            width={containerWidth}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".panel-drag-handle"
            resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']}
            compactType={null}
            preventCollision
            isBounded
          >
            {panels.map((panel) => (
              <div
                key={panel.id}
                className="pointer-events-auto flex min-h-0 min-w-0"
              >
                {panel.content}
              </div>
            ))}
          </GridLayout>
        )}
    </div>
  )
}
