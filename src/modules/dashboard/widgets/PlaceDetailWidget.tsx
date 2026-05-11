import { MapPin, X, Tag } from "lucide-react"
import type { Item } from "@real-life-stack/data-interface"
import { useChannel } from "../../../components/SelectionContext"

/**
 * PlaceDetailWidget — zeigt den aktuell selektierten Pin/Place aus dem
 * "place"-Channel.
 */
export function PlaceDetailWidget() {
  const { selected, select } = useChannel<Item>("place")

  if (!selected) {
    return (
      <div className="h-full w-full bg-card border rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <MapPin className="h-6 w-6 opacity-40" />
        <p>Pin-Detail</p>
        <p className="text-[10px]">
          Klick auf einen Pin im Orte-Widget — er erscheint hier.
        </p>
      </div>
    )
  }

  const data = selected.data as Record<string, unknown>
  const title = String(data.title ?? "(ohne Titel)")
  const description = typeof data.markdownBody === "string" ? data.markdownBody : ""
  const location = data.location as { address?: string } | undefined
  const hashtags = (data.hashtags as string[] | undefined) ?? []

  return (
    <div className="h-full w-full bg-card border rounded-xl flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} />
        <span className="text-sm font-semibold truncate flex-1">{title}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto text-xs">
        {location?.address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{location.address}</span>
          </div>
        )}

        {description && (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        )}

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                <Tag className="h-2 w-2" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
