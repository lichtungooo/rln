import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  X,
  Trash2,
  GripVertical,
} from "lucide-react"

/**
 * PageGrid — wiederverwendbares konfigurierbares Widget-Grid.
 *
 * Pattern aus dem Dashboard, gehoben in eine geteilte Komponente damit
 * Profil und andere Module dasselbe System nutzen koennen.
 *
 * Aufbau:
 *   - Mehrere Seiten als Carousel mit Pfeilen aussen
 *   - Pro Seite ein 6-spaltiges Grid
 *   - Slots: colSpan 1|2|3|6, rowSpan 1|2|3|4
 *   - Zahnrad → Modal mit Widget-Liste, Groessen-Picker, Hinzu/Entfernen
 *   - Persistenz: localStorage pro storageKey
 *   - Nicht scrollbar global — Widgets scrollen intern
 *
 * Widget-Rendering ist generisch: der Konsument liefert eine renderWidget-
 * Funktion und eine Liste verfuegbarer Widgets mit Labels + Default-Groessen.
 */

export type ColSpan = 1 | 2 | 3 | 6
export type RowSpan = 1 | 2 | 3 | 4

export interface PageSlot {
  id: string
  widget: string
  colSpan: ColSpan
  rowSpan: RowSpan
}

export interface GridPage {
  id: string
  name: string
  slots: PageSlot[]
}

export interface AvailableWidget {
  id: string
  label: string
  defaultColSpan?: ColSpan
  defaultRowSpan?: RowSpan
}

export interface PageGridNavApi {
  prev: () => void
  next: () => void
  canPrev: boolean
  canNext: boolean
}

export interface PageGridProps {
  /** Eindeutiger Storage-Key (z.B. "rln-dashboard-<spaceId>") */
  storageKey: string
  /** Default-Pages wenn nichts gespeichert ist */
  defaultPages: GridPage[]
  /** Welche Widgets sind in dieser Instanz waehlbar */
  availableWidgets: AvailableWidget[]
  /** Widget-Inhalt rendern */
  renderWidget: (widgetId: string) => ReactNode
  /** Optionaler Inhalt rechts im Header (z.B. XP/Trust-Badge) */
  headerRight?: ReactNode
  /**
   * Optional: Pfeile aussen wirken auf diese API (Klick-Routing).
   * Wenn nicht passed: keine Pfeile sichtbar. Pages werden nur via
   * Tab-Klick gewechselt.
   */
  navApi?: PageGridNavApi
  /**
   * Wenn true: Pages sind fest — kein "+" Button zum Hinzufuegen,
   * kein Loeschen, kein Umbenennen im Zahnrad-Modal.
   * Slots innerhalb einer Page bleiben konfigurierbar.
   * Verwendung: Funktions-Module wie Profil (Avatar/Quest/Skill).
   */
  lockPages?: boolean
  /**
   * Optional: Wird bei Page-Wechsel aufgerufen. Konsument kann den
   * Outer-State synchronisieren (z.B. activeWorld in Marketplace).
   */
  onActivePageChange?: (pageId: string) => void
  /**
   * Optional: Controlled-Mode. Wenn gesetzt, kontrolliert der Outer-State
   * welche Page aktiv ist. Bei Klick auf Tab wird nur onActivePageChange
   * aufgerufen — Outer setzt activePageId.
   * Wenn nicht gesetzt: uncontrolled (interner State + localStorage).
   */
  activePageId?: string
  /**
   * Mobile-Verhalten bei mehreren Slots:
   *   - false (Default): single-column-Stack, Slots untereinander, scrollbar
   *   - true (Drilldown): ein Slot zur Zeit sichtbar, Swipe ←→ wechselt,
   *     Tastatur ←→ wechselt. Slot-Indikator "1 / 3" oben.
   * Klick-Routing-Doktrin siehe `feedback_klick_routing_doktrin.md`.
   */
  mobileDrilldown?: boolean
}

const COL_SPANS: ColSpan[] = [1, 2, 3, 6]
const ROW_SPANS: RowSpan[] = [1, 2, 3, 4]

function loadPages(storageKey: string, defaultPages: GridPage[]): GridPage[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as GridPage[]
    }
  } catch {
    // egal — Default
  }
  return JSON.parse(JSON.stringify(defaultPages))
}

function savePages(storageKey: string, pages: GridPage[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(pages))
  } catch {
    // egal
  }
}

export function PageGrid({
  storageKey,
  defaultPages,
  availableWidgets,
  renderWidget,
  headerRight,
  navApi,
  lockPages = false,
  onActivePageChange,
  activePageId,
  mobileDrilldown = false,
}: PageGridProps) {
  const [pages, setPages] = useState<GridPage[]>(() => loadPages(storageKey, defaultPages))
  const [activeIdx, setActiveIdx] = useState(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}-active`)
      const idx = raw ? parseInt(raw, 10) : 0
      return Number.isFinite(idx) && idx >= 0 ? idx : 0
    } catch {
      return 0
    }
  })
  const [configOpen, setConfigOpen] = useState(false)

  // Aktive Page persistieren (User kommt zur gleichen Page zurueck)
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}-active`, String(activeIdx))
    } catch {
      // egal
    }
  }, [storageKey, activeIdx])

  // Custom-Event: 'rln-focus-widget' — springt zur ersten Page, die das Widget enthaelt.
  // Beispiel: Klick auf XP-Balken in StatsBar dispatcht das Event fuer 'log'.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ widget: string }>).detail
      if (!detail?.widget) return
      const idx = pages.findIndex((p) =>
        p.slots.some((s) => s.widget === detail.widget || s.widget === `${detail.widget}-detail`)
      )
      if (idx >= 0) setActiveIdx(idx)
    }
    window.addEventListener("rln-focus-widget", handler)
    return () => window.removeEventListener("rln-focus-widget", handler)
  }, [pages])

  // Mobile-Erkennung via ResizeObserver auf dem Container.
  // Bei schmaler Breite: Grid wird einspaltig, Slots stapeln, Page scrollt.
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsMobile(entry.contentRect.width < 768)
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Bei storageKey-Wechsel (z.B. anderer Space) neu laden + aktive Page wiederherstellen
  useEffect(() => {
    setPages(loadPages(storageKey, defaultPages))
    try {
      const raw = localStorage.getItem(`${storageKey}-active`)
      const idx = raw ? parseInt(raw, 10) : 0
      setActiveIdx(Number.isFinite(idx) && idx >= 0 ? idx : 0)
    } catch {
      setActiveIdx(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Bei Aenderung persistieren
  useEffect(() => {
    savePages(storageKey, pages)
  }, [storageKey, pages])

  // Im Controlled-Mode: activeIdx kommt aus activePageId; sonst aus internem state.
  const safeActiveIdx = activePageId !== undefined
    ? Math.max(0, pages.findIndex((p) => p.id === activePageId))
    : Math.min(activeIdx, Math.max(0, pages.length - 1))
  const activePage = pages[safeActiveIdx] ?? pages[0]

  // onActivePageChange-Callback bei Page-Wechsel ausloesen
  useEffect(() => {
    if (onActivePageChange && activePage) {
      onActivePageChange(activePage.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage?.id])

  const updatePage = (next: GridPage) => {
    setPages((prev) => prev.map((p) => (p.id === next.id ? next : p)))
  }

  const addPage = () => {
    const id = `p-${Date.now().toString(36)}`
    setPages((prev) => [
      ...prev,
      { id, name: `Seite ${prev.length + 1}`, slots: [] },
    ])
    setActiveIdx(pages.length)
  }

  const removePage = (id: string) => {
    if (pages.length <= 1) return
    const idx = pages.findIndex((p) => p.id === id)
    setPages((prev) => prev.filter((p) => p.id !== id))
    setActiveIdx((i) => {
      const last = pages.length - 2
      if (i > idx) return Math.max(0, i - 1)
      return Math.min(last, i)
    })
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      {/* Header: Seiten-Tabs + Zahnrad. Auf Mobile horizontal scrollbar. */}
      <div
        className="border-b px-3 sm:px-4 py-2 flex items-center gap-2 shrink-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(168,85,247,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-1 min-w-0 overflow-x-auto sm:overflow-visible sm:flex-wrap">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (activePageId !== undefined) {
                  // Controlled — Outer setzt activePageId via onActivePageChange
                  onActivePageChange?.(p.id)
                } else {
                  setActiveIdx(idx)
                }
              }}
              className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                idx === safeActiveIdx
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {p.name}
            </button>
          ))}
          {!lockPages && (
            <button
              type="button"
              onClick={addPage}
              className="ml-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Seite hinzufuegen"
              title="Seite hinzufuegen"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {headerRight}

        {/* Auf Mobile: Klick-Routing-Pfeile in den Header (Container ist zu schmal fuer aussen) */}
        {isMobile && navApi && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={navApi.prev}
              disabled={!navApi.canPrev}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
              aria-label="Zurueck"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={navApi.next}
              disabled={!navApi.canNext}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
              aria-label="Weiter"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Settings-Zahnrad raus — kommt ueber globales App-Zahnrad (kontext-
            sensitiv). Slot-Konfig erfolgt aktuell ueber Drag-and-Drop und
            Resize-Ecke; das PageConfigModal wird im naechsten Iteration ueber
            den globalen Settings-Dialog angeboten. */}
      </div>

      {/* Wrapper: Pfeile aussen NUR wenn navApi gegeben — sie wirken auf
          Klick-Routing (Item-Wechsel im aktiven Widget), NICHT auf
          Page-Wechsel. Auf Mobile sind die Pfeile im Header (oben). */}
      <div className="flex-1 flex items-stretch min-h-0 px-0 py-1.5 gap-0">
        {!isMobile && navApi && (
          <button
            type="button"
            onClick={navApi.prev}
            disabled={!navApi.canPrev}
            className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Zurueck"
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
          </button>
        )}

        <div className="flex-1 min-w-0 min-h-0 p-2">
          <PageGridLayout
            page={activePage}
            renderWidget={renderWidget}
            isMobile={isMobile}
            mobileDrilldown={mobileDrilldown}
            onReorderSlots={(slots) => updatePage({ ...activePage, slots })}
          />
        </div>

        {!isMobile && navApi && (
          <button
            type="button"
            onClick={navApi.next}
            disabled={!navApi.canNext}
            className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Weiter"
          >
            <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {configOpen && (
        <PageConfigModal
          page={activePage}
          availableWidgets={availableWidgets}
          lockPages={lockPages}
          onClose={() => setConfigOpen(false)}
          onChange={updatePage}
          onRemovePage={
            !lockPages && pages.length > 1
              ? () => {
                  removePage(activePage.id)
                  setConfigOpen(false)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

function PageGridLayout({
  page,
  renderWidget,
  isMobile,
  mobileDrilldown,
  onReorderSlots,
}: {
  page: GridPage
  renderWidget: (widgetId: string) => ReactNode
  isMobile: boolean
  mobileDrilldown: boolean
  onReorderSlots: (slots: PageSlot[]) => void
}) {
  // Mobile-Drilldown: welcher Slot aktuell sichtbar (0-basiert).
  // Pro Page-Wechsel auf 0 zurueck.
  const [activeSlotIdx, setActiveSlotIdx] = useState(0)
  useEffect(() => {
    setActiveSlotIdx(0)
  }, [page.id])

  // Touch-Swipe-Handler (Mobile + drilldown only)
  const touchStartXRef = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current
    touchStartXRef.current = null
    if (start === null) return
    const delta = e.changedTouches[0].clientX - start
    const THRESHOLD = 50
    if (Math.abs(delta) < THRESHOLD) return
    setActiveSlotIdx((i) => {
      const max = page.slots.length - 1
      if (delta > 0) return Math.max(0, i - 1)
      return Math.min(max, i + 1)
    })
  }

  // Tastatur-Handler — aktiv wenn drilldown auf Mobile, sonst Standard
  useEffect(() => {
    if (!isMobile || !mobileDrilldown) return
    const onKey = (e: KeyboardEvent) => {
      // Nur reagieren wenn Fokus nicht in einem Input/Textarea ist
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return
      if (e.key === "ArrowLeft") {
        setActiveSlotIdx((i) => Math.max(0, i - 1))
        e.preventDefault()
      } else if (e.key === "ArrowRight") {
        const max = page.slots.length - 1
        setActiveSlotIdx((i) => Math.min(max, i + 1))
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isMobile, mobileDrilldown, page.slots.length])
  // Drag-and-Drop State — nur Desktop
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  // Resize-State (per Drag an der Ecke unten rechts)
  const [resizing, setResizing] = useState<{
    slotId: string
    startX: number
    startY: number
    startCols: ColSpan
    startRows: RowSpan
    cellW: number
    cellH: number
  } | null>(null)

  useEffect(() => {
    if (!resizing) return
    const VALID_COLS: ColSpan[] = [1, 2, 3, 6]
    const VALID_ROWS: RowSpan[] = [1, 2, 3, 4]
    const snap = <T extends number>(target: number, valid: readonly T[]): T =>
      valid.reduce(
        (closest, v) =>
          Math.abs(v - target) < Math.abs(closest - target) ? v : closest,
        valid[0]
      )
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX
      const dy = e.clientY - resizing.startY
      const newColsRaw = resizing.startCols + dx / resizing.cellW
      const newRowsRaw = resizing.startRows + dy / resizing.cellH
      const newCols = snap(newColsRaw, VALID_COLS)
      const newRows = snap(newRowsRaw, VALID_ROWS)
      const slot = page.slots.find((s) => s.id === resizing.slotId)
      if (!slot) return
      if (slot.colSpan === newCols && slot.rowSpan === newRows) return
      onReorderSlots(
        page.slots.map((s) =>
          s.id === resizing.slotId ? { ...s, colSpan: newCols, rowSpan: newRows } : s
        )
      )
    }
    const onUp = () => setResizing(null)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [resizing, page.slots, onReorderSlots])

  const startResize = (slotId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const slot = page.slots.find((s) => s.id === slotId)
    if (!slot) return
    const slotEl = (e.currentTarget as HTMLElement).parentElement
    if (!slotEl) return
    const rect = slotEl.getBoundingClientRect()
    setResizing({
      slotId,
      startX: e.clientX,
      startY: e.clientY,
      startCols: slot.colSpan,
      startRows: slot.rowSpan,
      cellW: rect.width / slot.colSpan,
      cellH: rect.height / slot.rowSpan,
    })
  }

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    const fromIdx = page.slots.findIndex((s) => s.id === draggingId)
    const toIdx = page.slots.findIndex((s) => s.id === targetId)
    if (fromIdx < 0 || toIdx < 0) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    // Swap positions
    const next = [...page.slots]
    ;[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]]
    onReorderSlots(next)
    setDraggingId(null)
    setDropTargetId(null)
  }

  if (page.slots.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground italic border border-dashed rounded-xl">
        Leere Seite. Zahnrad rechts oben → Widgets hinzufuegen.
      </div>
    )
  }

  // Mobile (Drilldown): ein Slot zur Zeit + Swipe + Tastatur ←→
  if (isMobile && mobileDrilldown && page.slots.length > 0) {
    const idx = Math.min(activeSlotIdx, page.slots.length - 1)
    const activeSlot = page.slots[idx]
    const total = page.slots.length
    return (
      <div
        className="h-full w-full flex flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {total > 1 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground bg-muted/30 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSlotIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
              aria-label="Vorige Spalte"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {page.slots.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-1.5 text-[10px] tabular-nums">
                {idx + 1} / {total}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSlotIdx((i) => Math.min(total - 1, i + 1))}
              disabled={idx === total - 1}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
              aria-label="Naechste Spalte"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderWidget(activeSlot.widget)}
        </div>
      </div>
    )
  }

  // Mobile (Default-Stack): single-column, Slots untereinander, scrollbar.
  if (isMobile) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <div className="flex flex-col gap-2 min-h-full">
          {page.slots.map((slot) => (
            <div
              key={slot.id}
              className="min-w-0 overflow-hidden shrink-0"
              style={{ minHeight: `${slot.rowSpan * 180}px` }}
            >
              {renderWidget(slot.widget)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Desktop: 6-Spalten-Grid mit Drag-Handles oben rechts.
  return (
    <div
      className="h-full w-full grid gap-2"
      style={{
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gridAutoRows: "minmax(0, 1fr)",
      }}
    >
      {page.slots.map((slot) => {
        const isDragging = draggingId === slot.id
        const isDropTarget = dropTargetId === slot.id && draggingId !== slot.id
        return (
          <div
            key={slot.id}
            className={`relative group min-w-0 min-h-0 overflow-hidden transition-all ${
              isDragging ? "opacity-40" : ""
            } ${isDropTarget ? "ring-2 ring-primary ring-offset-1 rounded-xl" : ""}`}
            style={{
              gridColumn: `span ${slot.colSpan} / span ${slot.colSpan}`,
              gridRow: `span ${slot.rowSpan} / span ${slot.rowSpan}`,
            }}
            onDragOver={(e) => {
              if (!draggingId) return
              e.preventDefault()
              if (dropTargetId !== slot.id) setDropTargetId(slot.id)
            }}
            onDragLeave={() => {
              if (dropTargetId === slot.id) setDropTargetId(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(slot.id)
            }}
          >
            {/* Drag-Handle — oben rechts, halbtransparent, wird sichtbar beim Hover */}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/slot-id", slot.id)
                setDraggingId(slot.id)
              }}
              onDragEnd={() => {
                setDraggingId(null)
                setDropTargetId(null)
              }}
              className="absolute top-1 right-1 z-10 p-1 rounded bg-background/60 backdrop-blur-sm text-muted-foreground opacity-0 hover:opacity-100 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
              title="Slot verschieben (Drag-and-Drop)"
              aria-label="Verschieben"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            {/* Resize-Handle — unten rechts, Drag aendert colSpan/rowSpan */}
            <div
              onMouseDown={(e) => startResize(slot.id, e)}
              className="absolute bottom-0 right-0 z-10 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity flex items-end justify-end p-0.5"
              title="Slot-Groesse aendern (Drag)"
              aria-label="Groesse aendern"
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-muted-foreground/60" />
            </div>

            <div className="h-full w-full">
              {renderWidget(slot.widget)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PageConfigModal({
  page,
  availableWidgets,
  lockPages,
  onClose,
  onChange,
  onRemovePage,
}: {
  page: GridPage
  availableWidgets: AvailableWidget[]
  lockPages: boolean
  onClose: () => void
  onChange: (next: GridPage) => void
  onRemovePage?: () => void
}) {
  const [addOpen, setAddOpen] = useState(false)

  const widgetById = useMemo(() => {
    const map = new Map<string, AvailableWidget>()
    for (const w of availableWidgets) map.set(w.id, w)
    return map
  }, [availableWidgets])

  const rename = (name: string) => onChange({ ...page, name })

  const updateSlot = (id: string, patch: Partial<PageSlot>) => {
    onChange({
      ...page,
      slots: page.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  const removeSlot = (id: string) => {
    onChange({ ...page, slots: page.slots.filter((s) => s.id !== id) })
  }

  const addSlot = (widgetId: string) => {
    const w = widgetById.get(widgetId)
    const id = `s-${Date.now().toString(36)}`
    onChange({
      ...page,
      slots: [
        ...page.slots,
        {
          id,
          widget: widgetId,
          colSpan: w?.defaultColSpan ?? 2,
          rowSpan: w?.defaultRowSpan ?? 2,
        },
      ],
    })
    setAddOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl shadow-xl border max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2">
          {lockPages ? (
            <span className="flex-1 text-base font-semibold px-1">{page.name}</span>
          ) : (
            <input
              type="text"
              value={page.name}
              onChange={(e) => rename(e.target.value)}
              className="flex-1 text-base font-semibold bg-transparent border-b border-transparent focus:border-primary outline-none px-1"
              placeholder="Seitenname"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {page.slots.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Noch keine Widgets. Unten hinzufuegen.
            </p>
          ) : (
            page.slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                label={widgetById.get(slot.widget)?.label ?? slot.widget}
                onChange={(patch) => updateSlot(slot.id, patch)}
                onRemove={() => removeSlot(slot.id)}
              />
            ))
          )}
        </div>

        <div className="border-t p-4 space-y-2">
          {addOpen ? (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Welches Widget?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {availableWidgets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => addSlot(w.id)}
                    className="text-sm px-2.5 py-1.5 rounded-md border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="w-full text-sm px-3 py-2 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Widget hinzufuegen
            </button>
          )}

          {onRemovePage && (
            <button
              type="button"
              onClick={onRemovePage}
              className="w-full text-xs px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-3 w-3" />
              Seite loeschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SlotRow({
  slot,
  label,
  onChange,
  onRemove,
}: {
  slot: PageSlot
  label: string
  onChange: (patch: Partial<PageSlot>) => void
  onRemove: () => void
}) {
  return (
    <div className="border rounded-md p-2.5 space-y-2 bg-muted/20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium flex-1">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Widget entfernen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <SpanPicker
          label="Breit"
          options={COL_SPANS}
          value={slot.colSpan}
          onChange={(v) => onChange({ colSpan: v as ColSpan })}
        />
        <SpanPicker
          label="Hoch"
          options={ROW_SPANS}
          value={slot.rowSpan}
          onChange={(v) => onChange({ rowSpan: v as RowSpan })}
        />
      </div>
    </div>
  )
}

function SpanPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly number[]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`min-w-[24px] h-6 text-[11px] font-mono rounded transition-colors ${
              value === opt
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
