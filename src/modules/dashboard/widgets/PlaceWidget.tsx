import { useMemo } from "react"
import { MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useItems } from "@real-life-stack/toolkit"
import { useChannel, useChannelSync } from "../../../components/SelectionContext"

/**
 * PlaceWidget — Pins/Werkstaetten im aktuellen Space als kompakte Liste.
 *
 * Klick-Routing: Klick auf einen Pin setzt ihn im "place"-Channel — ein
 * PlaceDetailWidget zeigt das Detail. Pfeile blaettern durch alle Pins.
 */
export function PlaceWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { data: places } = useItems({ type: "place" })

  const items = useMemo(() => places.slice(0, 30), [places])
  const preview = useMemo(() => places.slice(0, 5), [places])

  useChannelSync("place", items)
  const { selectedId, select } = useChannel("place")

  const goMap = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/map`)
  }

  void goMap

  return (
    <div className="bg-emerald-50/60 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-5 w-5" style={{ color: "#10B981" }} />
        <div>
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Orte
          </div>
          <div className="text-base font-bold leading-tight">
            {places.length} Pin{places.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {preview.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4">
            Noch keine Pins. Trage einen auf der Karte ein.
          </div>
        ) : (
          preview.map((place) => {
            const data = place.data as Record<string, unknown>
            const title = String(data.title ?? "(ohne Titel)")
            const address = (data.location as { address?: string } | undefined)?.address
            const isSelected = selectedId === place.id
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => select(place.id)}
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  isSelected
                    ? "bg-emerald-100 shadow-sm"
                    : "hover:bg-emerald-100/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#10B981" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">{title}</div>
                    {address && (
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {address}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
