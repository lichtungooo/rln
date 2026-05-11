import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  X,
  Trash2,
} from "lucide-react"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { TreeWidget } from "./widgets/TreeWidget"
import { QuestWidget } from "./widgets/QuestWidget"
import { LogWidget } from "./widgets/LogWidget"
import { CalendarWidget } from "./widgets/CalendarWidget"
import { AvatarWidget } from "../avatar"
import { DashboardHero } from "./DashboardHero"

/**
 * DashboardView — konfigurierbares Widget-Grid.
 *
 * Aufbau:
 *   - Mehrere Seiten als Carousel (Pfeile aussen wie im Profil)
 *   - Pro Seite ein 6-spaltiges Grid
 *   - Slots: colSpan 1|2|3|6, rowSpan 1|2|3|4
 *   - Zahnrad pro Seite → Widgets hinzu, entfernen, Groesse aendern
 *   - Persistenz: localStorage pro Space
 *   - Nicht scrollbar — Widgets scrollen intern
 */

type WidgetId = "hero" | "avatar" | "tree" | "quest" | "calendar" | "log"
type ColSpan = 1 | 2 | 3 | 6
type RowSpan = 1 | 2 | 3 | 4

interface DashboardSlot {
  id: string
  widget: WidgetId
  colSpan: ColSpan
  rowSpan: RowSpan
}

interface DashboardPage {
  id: string
  name: string
  slots: DashboardSlot[]
}

const WIDGET_LABELS: Record<WidgetId, string> = {
  hero: "Begruessung",
  avatar: "Avatar",
  tree: "Faehigkeiten",
  quest: "Quests",
  calendar: "Kalender",
  log: "Log",
}

const COL_SPANS: ColSpan[] = [1, 2, 3, 6]
const ROW_SPANS: RowSpan[] = [1, 2, 3, 4]

const DEFAULT_PAGES: DashboardPage[] = [
  {
    id: "start",
    name: "Start",
    slots: [
      { id: "s1", widget: "hero", colSpan: 6, rowSpan: 2 },
      { id: "s2", widget: "avatar", colSpan: 2, rowSpan: 2 },
      { id: "s3", widget: "tree", colSpan: 2, rowSpan: 2 },
      { id: "s4", widget: "quest", colSpan: 2, rowSpan: 2 },
    ],
  },
  {
    id: "tag",
    name: "Tag",
    slots: [
      { id: "s1", widget: "calendar", colSpan: 6, rowSpan: 2 },
      { id: "s2", widget: "log", colSpan: 3, rowSpan: 2 },
      { id: "s3", widget: "quest", colSpan: 3, rowSpan: 2 },
    ],
  },
]

const STORAGE_PREFIX = "rln-dashboard"

function loadPages(spaceKey: string): DashboardPage[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${spaceKey}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as DashboardPage[]
    }
  } catch {
    // egal — Default
  }
  return JSON.parse(JSON.stringify(DEFAULT_PAGES))
}

function savePages(spaceKey: string, pages: DashboardPage[]) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}-${spaceKey}`, JSON.stringify(pages))
  } catch {
    // egal
  }
}

export function DashboardView({ spaceId, activeGroup }: ModuleViewProps) {
  const spaceSlug = useMemo(() => {
    if (!activeGroup) return null
    return getSpaceMeta(activeGroup).slug ?? activeGroup.id
  }, [activeGroup])

  const spaceKey = spaceId ?? "default"
  const [pages, setPages] = useState<DashboardPage[]>(() => loadPages(spaceKey))
  const [activeIdx, setActiveIdx] = useState(0)
  const [configOpen, setConfigOpen] = useState(false)

  // Bei Space-Wechsel neu laden
  useEffect(() => {
    setPages(loadPages(spaceKey))
    setActiveIdx(0)
  }, [spaceKey])

  // Bei Aenderung persistieren
  useEffect(() => {
    savePages(spaceKey, pages)
  }, [spaceKey, pages])

  const activePage = pages[activeIdx] ?? pages[0]
  const canPrev = activeIdx > 0
  const canNext = activeIdx < pages.length - 1

  const goPrev = () => setActiveIdx((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIdx((i) => Math.min(pages.length - 1, i + 1))

  const updatePage = (next: DashboardPage) => {
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

  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte einen Space waehlen, um das Dashboard zu sehen.
        </p>
      </div>
    )
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
          <DashboardGrid
            page={activePage}
            spaceSlug={spaceSlug}
            spaceId={spaceId}
          />
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

// ============================================================
// DashboardGrid — das 6-spaltige Widget-Raster
// ============================================================

function DashboardGrid({
  page,
  spaceSlug,
  spaceId,
}: {
  page: DashboardPage
  spaceSlug: string | null
  spaceId: string | null
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
          <WidgetRenderer
            widget={slot.widget}
            spaceSlug={spaceSlug}
            spaceId={spaceId}
          />
        </div>
      ))}
    </div>
  )
}

function WidgetRenderer({
  widget,
  spaceSlug,
  spaceId,
}: {
  widget: WidgetId
  spaceSlug: string | null
  spaceId: string | null
}) {
  switch (widget) {
    case "hero":
      return (
        <div className="h-full w-full overflow-auto">
          <DashboardHero spaceId={spaceId} />
        </div>
      )
    case "avatar":
      return <AvatarWidget spaceSlug={spaceSlug} spaceId={spaceId} />
    case "tree":
      return <TreeWidget spaceSlug={spaceSlug} />
    case "quest":
      return <QuestWidget spaceSlug={spaceSlug} />
    case "calendar":
      return <CalendarWidget spaceSlug={spaceSlug} />
    case "log":
      return <LogWidget />
  }
}

// ============================================================
// PageConfigModal — Zahnrad-Dialog: Widgets + Seitenname
// ============================================================

function PageConfigModal({
  page,
  onClose,
  onChange,
  onRemovePage,
}: {
  page: DashboardPage
  onClose: () => void
  onChange: (next: DashboardPage) => void
  onRemovePage?: () => void
}) {
  const [addOpen, setAddOpen] = useState(false)

  const rename = (name: string) => onChange({ ...page, name })

  const updateSlot = (id: string, patch: Partial<DashboardSlot>) => {
    onChange({
      ...page,
      slots: page.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  const removeSlot = (id: string) => {
    onChange({ ...page, slots: page.slots.filter((s) => s.id !== id) })
  }

  const addSlot = (widget: WidgetId) => {
    const id = `s-${Date.now().toString(36)}`
    const defaultSize: { colSpan: ColSpan; rowSpan: RowSpan } =
      widget === "hero"
        ? { colSpan: 6, rowSpan: 2 }
        : widget === "calendar"
        ? { colSpan: 6, rowSpan: 2 }
        : { colSpan: 2, rowSpan: 2 }
    onChange({
      ...page,
      slots: [...page.slots, { id, widget, ...defaultSize }],
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
        {/* Header */}
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

        {/* Slot-Liste */}
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
                onChange={(patch) => updateSlot(slot.id, patch)}
                onRemove={() => removeSlot(slot.id)}
              />
            ))
          )}
        </div>

        {/* Footer: Widget hinzufuegen + Seite loeschen */}
        <div className="border-t p-4 space-y-2">
          {addOpen ? (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Welches Widget?
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(WIDGET_LABELS) as WidgetId[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => addSlot(w)}
                    className="text-sm px-2.5 py-1.5 rounded-md border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    {WIDGET_LABELS[w]}
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
  onChange,
  onRemove,
}: {
  slot: DashboardSlot
  onChange: (patch: Partial<DashboardSlot>) => void
  onRemove: () => void
}) {
  return (
    <div className="border rounded-md p-2.5 space-y-2 bg-muted/20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium flex-1">{WIDGET_LABELS[slot.widget]}</span>
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
