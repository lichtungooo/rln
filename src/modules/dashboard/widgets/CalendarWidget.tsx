import { useMemo } from "react"
import { Calendar as CalIcon, ArrowRight, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useItems } from "@real-life-stack/toolkit"

/**
 * CalendarWidget — die naechsten 3 Termine.
 */
export function CalendarWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { data: events } = useItems({ type: "event" })

  const upcoming = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => {
        const start = e.data.start as string | undefined
        if (!start) return false
        return new Date(start).getTime() >= now
      })
      .sort((a, b) => {
        const aTime = new Date(String(a.data.start)).getTime()
        const bTime = new Date(String(b.data.start)).getTime()
        return aTime - bTime
      })
      .slice(0, 3)
  }, [events])

  const goCalendar = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/calendar`)
  }

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      <button
        type="button"
        onClick={goCalendar}
        disabled={!spaceSlug}
        className="flex items-center justify-between mb-3 text-left group disabled:cursor-default"
      >
        <div className="flex items-center gap-2">
          <CalIcon className="h-5 w-5" style={{ color: "#3B82F6" }} />
          <div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Kalender
            </div>
            <div className="text-base font-bold leading-tight">{upcoming.length} Termin{upcoming.length === 1 ? "" : "e"}</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {upcoming.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4">
            Keine Termine in der Zukunft.
          </div>
        ) : (
          upcoming.map((event) => {
            const start = new Date(String(event.data.start))
            const title = String(event.data.title ?? "(ohne Titel)")
            const loc = event.data.location as { address?: string } | undefined
            return (
              <button
                key={event.id}
                type="button"
                onClick={goCalendar}
                className="w-full text-left p-2 rounded-md border hover:bg-muted/30 transition-colors flex items-start gap-2"
              >
                <div className="w-10 text-center shrink-0">
                  <div className="text-[9px] uppercase font-semibold text-muted-foreground">
                    {start.toLocaleDateString("de-DE", { month: "short" }).replace(".", "")}
                  </div>
                  <div className="text-base font-bold leading-tight" style={{ color: "#3B82F6" }}>
                    {start.getDate()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight line-clamp-2">{title}</div>
                  {loc?.address && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{loc.address}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
