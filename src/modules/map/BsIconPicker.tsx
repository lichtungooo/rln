import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import * as BsIcons from "react-icons/bs"
import { renderToStaticMarkup } from "react-dom/server.browser"
import type { IconType } from "react-icons"

/**
 * BsIconPicker — Vollbild-Picker fuer den Bootstrap-Icons-Pack
 * (react-icons/bs). Wird via React.lazy nur geladen wenn der User
 * den Picker oeffnet. Damit bleibt das Hauptbundle schlank.
 *
 * Bei Auswahl extrahieren wir den inneren SVG-Inhalt des Icons und
 * geben ihn als String zurueck — fertig fuer PinStyle.iconSvg.
 * Wir wrappen das 16x16-bs-Icon in <g transform="..."> sodass es
 * in den 32x32-Pin-Bereich passt und die iconColor uebernimmt.
 */

interface BsIconPickerProps {
  onPick: (svgContent: string, name: string) => void
  onClose: () => void
  previewColor?: string
}

interface IconEntry {
  name: string
  Component: IconType
  searchKey: string
}

const ALL_ICONS: IconEntry[] = Object.entries(BsIcons)
  .filter(([key]) => key.startsWith("Bs"))
  .map(([name, Component]) => ({
    name,
    Component: Component as IconType,
    searchKey: humanize(name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

function humanize(name: string): string {
  return name
    .replace(/^Bs/, "")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase()
}

function extractInnerSvg(Component: IconType): string {
  const html = renderToStaticMarkup(<Component />)
  const match = html.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  const inner = match?.[1] ?? ""
  // bs-Icons haben viewBox 0 0 16 16. Pin-Renderer arbeitet in 32x32 +
  // setzt color am Eltern-<g>. Wir wrappen das Icon: zentriert auf (16,16),
  // Skalierung 0.75 → 12 px. fill+stroke=currentColor damit es die
  // iconColor-Faerbung des Pins uebernimmt.
  return `<g transform="translate(10 10) scale(0.75)" fill="currentColor" stroke="currentColor">${inner}</g>`
}

export default function BsIconPicker({ onPick, onClose, previewColor = "#1f2937" }: BsIconPickerProps) {
  const [query, setQuery] = useState("")

  // ESC schliesst
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_ICONS
    return ALL_ICONS.filter((icon) => icon.searchKey.includes(q))
  }, [query])

  const handlePick = (entry: IconEntry) => {
    const inner = extractInnerSvg(entry.Component)
    onPick(inner, entry.name)
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-amber-50/95 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Suche */}
        <div className="flex items-center gap-2 p-3 bg-amber-100/60 shrink-0">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Icon suchen — 'house', 'car', 'star', 'tools'..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {filtered.length} / {ALL_ICONS.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-black/10"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-3">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6 italic">
              Kein Icon zu "{query}" gefunden.
            </p>
          ) : (
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}
            >
              {filtered.map((entry) => (
                <IconCell
                  key={entry.name}
                  entry={entry}
                  color={previewColor}
                  onPick={handlePick}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-2 text-[10px] text-muted-foreground text-center bg-amber-100/40 shrink-0">
          Klick aufs Icon — es landet als SVG im Pin. {ALL_ICONS.length} Icons aus Bootstrap.
        </div>
      </div>
    </div>
  )
}

function IconCell({
  entry,
  color,
  onPick,
}: {
  entry: IconEntry
  color: string
  onPick: (entry: IconEntry) => void
}) {
  const { Component } = entry
  return (
    <button
      type="button"
      onClick={() => onPick(entry)}
      className="aspect-square rounded hover:bg-amber-200/70 transition-colors flex items-center justify-center"
      title={entry.searchKey}
      style={{ contentVisibility: "auto", containIntrinsicSize: "44px 44px" }}
    >
      <Component size={20} color={color} />
    </button>
  )
}
