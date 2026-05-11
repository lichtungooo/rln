import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  X,
  Trash2,
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
}: PageGridProps) {
  const [pages, setPages] = useState<GridPage[]>(() => loadPages(storageKey, defaultPages))
  const [activeIdx, setActiveIdx] = useState(0)
  const [configOpen, setConfigOpen] = useState(false)

  // Bei storageKey-Wechsel (z.B. anderer Space) neu laden
  useEffect(() => {
    setPages(loadPages(storageKey, defaultPages))
    setActiveIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Bei Aenderung persistieren
  useEffect(() => {
    savePages(storageKey, pages)
  }, [storageKey, pages])

  const activePage = pages[activeIdx] ?? pages[0]
  const canPrev = activeIdx > 0
  const canNext = activeIdx < pages.length - 1

  const goPrev = () => setActiveIdx((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIdx((i) => Math.min(pages.length - 1, i + 1))

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
    <div className="flex flex-col h-full w-full">
      {/* Header: Seiten-Tabs + Zahnrad */}
      <div
        className="border-b px-3 sm:px-4 py-2 flex items-center gap-2 flex-wrap shrink-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(168,85,247,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                idx === activeIdx
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            onClick={addPage}
            className="ml-0.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Seite hinzufuegen"
            title="Seite hinzufuegen"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1" />

        {headerRight}

        <button
          type="button"
          onClick={() => setConfigOpen(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Seite konfigurieren"
          title="Widgets dieser Seite konfigurieren"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Wrapper mit Pfeilen aussen */}
      <div className="flex-1 flex items-stretch min-h-0 px-0 py-1.5 gap-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          aria-label="Vorige Seite"
        >
          <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
        </button>

        <div className="flex-1 min-w-0 min-h-0 p-2">
          <PageGridLayout page={activePage} renderWidget={renderWidget} />
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          aria-label="Naechste Seite"
        >
          <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
        </button>
      </div>

      {/* Indikator-Punkte */}
      {pages.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-2 shrink-0">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === activeIdx ? "w-4 bg-primary" : "w-1 bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      {configOpen && (
        <PageConfigModal
          page={activePage}
          availableWidgets={availableWidgets}
          onClose={() => setConfigOpen(false)}
          onChange={updatePage}
          onRemovePage={
            pages.length > 1
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
}: {
  page: GridPage
  renderWidget: (widgetId: string) => ReactNode
}) {
  if (page.slots.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground italic border border-dashed rounded-xl">
        Leere Seite. Zahnrad rechts oben → Widgets hinzufuegen.
      </div>
    )
  }

  return (
    <div
      className="h-full w-full grid gap-2"
      style={{
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gridAutoRows: "minmax(0, 1fr)",
      }}
    >
      {page.slots.map((slot) => (
        <div
          key={slot.id}
          className="min-w-0 min-h-0 overflow-hidden"
          style={{
            gridColumn: `span ${slot.colSpan} / span ${slot.colSpan}`,
            gridRow: `span ${slot.rowSpan} / span ${slot.rowSpan}`,
          }}
        >
          {renderWidget(slot.widget)}
        </div>
      ))}
    </div>
  )
}

function PageConfigModal({
  page,
  availableWidgets,
  onClose,
  onChange,
  onRemovePage,
}: {
  page: GridPage
  availableWidgets: AvailableWidget[]
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
          <input
            type="text"
            value={page.name}
            onChange={(e) => rename(e.target.value)}
            className="flex-1 text-base font-semibold bg-transparent border-b border-transparent focus:border-primary outline-none px-1"
            placeholder="Seitenname"
          />
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
