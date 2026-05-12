import { Calendar as CalIcon, MapPin, Clock, X } from "lucide-react"
import type { Item } from "@real-life-stack/data-interface"
import { useChannel } from "../../../components/SelectionContext"

/**
 * EventDetailWidget — zeigt das aktuell selektierte Event aus dem
 * "event"-Channel. Klick im CalendarWidget setzt es.
 */
export function EventDetailWidget() {
  const { selected, select } = useChannel<Item>("event")

  if (!selected) {
    return (
      <div className="h-full w-full bg-sky-50/60 rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <CalIcon className="h-6 w-6 opacity-40" />
        <p>Termin-Detail</p>
        <p className="text-[10px]">
          Klick auf einen Termin im Kalender-Widget — er erscheint hier.
        </p>
      </div>
    )
  }

  const data = selected.data as Record<string, unknown>
  const title = String(data.title ?? "(ohne Titel)")
  const start = data.start ? new Date(String(data.start)) : null
  const end = data.end ? new Date(String(data.end)) : null
  const description = typeof data.description === "string" ? data.description : ""
  const location = data.location as { address?: string } | undefined

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="h-full w-full bg-sky-50/60 rounded-xl flex flex-col overflow-hidden">
      <div className="px-3 py-2 bg-sky-100/40 flex items-center gap-2">
        <CalIcon className="h-4 w-4 shrink-0" style={{ color: "#3B82F6" }} />
        <span className="text-sm font-semibold truncate flex-1">{title}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-sky-200/50 transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto text-xs">
        {start && (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div>
              <div className="font-medium">{fmtDate(start)}</div>
              <div className="text-muted-foreground">
                {fmtTime(start)}
                {end && ` – ${fmtTime(end)}`}
              </div>
            </div>
          </div>
        )}

        {location?.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{location.address}</span>
          </div>
        )}

        {description && (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
