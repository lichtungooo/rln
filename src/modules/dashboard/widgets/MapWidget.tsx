import { useMemo } from "react"
import { MapPin } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import { useNavigate } from "react-router-dom"
import { useItems } from "@real-life-stack/toolkit"
import { useChannel, useChannelSync } from "../../../components/SelectionContext"

/**
 * MapWidget — kompakte Karte mit Pins fuer das Dashboard.
 *
 * Klick-Routing: Klick auf Pin setzt ihn im "place"-Channel — ein
 * PlaceDetailWidget zeigt das Detail. Pfeile blaettern durch alle
 * Pins (selected wandert mit, Map fliegt zur Position).
 *
 * Vereinfachte Variante des Map-Moduls — nur Pins, keine Quick-Create,
 * keine Settings. Volle Karte bleibt unter /macher/map.
 */
export function MapWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { data: places } = useItems({ type: "place" })

  // Nur Pins mit gueltigen Koordinaten
  const validPlaces = useMemo(() => {
    return places.filter((p) => {
      const loc = p.data.location as { lat?: number; lng?: number } | undefined
      return typeof loc?.lat === "number" && typeof loc?.lng === "number"
    })
  }, [places])

  useChannelSync("place", validPlaces)
  const { selectedId, select } = useChannel("place")

  // Center: ausgewaehlter Place > erster Place > Deutschland-Mitte
  const center = useMemo<[number, number]>(() => {
    const sel = validPlaces.find((p) => p.id === selectedId)
    const ref = sel ?? validPlaces[0]
    if (ref) {
      const loc = ref.data.location as { lat: number; lng: number }
      return [loc.lat, loc.lng]
    }
    return [51.0, 10.0]
  }, [validPlaces, selectedId])

  const goMap = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/map`)
  }

  void goMap

  if (validPlaces.length === 0) {
    return (
      <div className="h-full w-full bg-emerald-50/60 rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <MapPin className="h-6 w-6 opacity-40" />
        <p>Karte</p>
        <p className="text-[10px]">
          Noch keine Pins. Trage einen auf der vollen Karte ein.
        </p>
      </div>
    )
  }

  return (
    <div
      className="h-full w-full bg-emerald-50/60 rounded-xl overflow-hidden relative"
      style={{ isolation: "isolate" }}
    >
      <MapContainer
        center={center}
        zoom={validPlaces.length === 1 ? 13 : 5}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFlyToSelected places={validPlaces} selectedId={selectedId} />
        {validPlaces.map((p) => {
          const loc = p.data.location as { lat: number; lng: number }
          const isSelected = p.id === selectedId
          return (
            <Marker
              key={p.id}
              position={[loc.lat, loc.lng]}
              eventHandlers={{
                click: () => select(p.id),
              }}
              icon={L.divIcon({
                className: "rln-map-widget-pin",
                iconSize: [22, 22],
                iconAnchor: [11, 11],
                html: `<div style="
                  width: 22px; height: 22px; border-radius: 50%;
                  background: ${isSelected ? "#E8751A" : "#10B981"};
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  ${isSelected ? "transform: scale(1.2);" : ""}
                "></div>`,
              })}
            />
          )
        })}
      </MapContainer>

      {/* Header overlay */}
      <div className="absolute top-2 left-2 z-[400] flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm">
        <MapPin className="h-3.5 w-3.5" style={{ color: "#10B981" }} />
        <span className="text-xs font-semibold">{validPlaces.length} Pins</span>
      </div>
    </div>
  )
}

// Helper: Karte fliegt zum selektierten Pin
function MapFlyToSelected({
  places,
  selectedId,
}: {
  places: ReturnType<typeof useItems>["data"]
  selectedId: string | null
}) {
  const map = useMap()
  const sel = places.find((p) => p.id === selectedId)
  const loc = sel?.data.location as { lat?: number; lng?: number } | undefined
  useMemo(() => {
    if (loc?.lat && loc?.lng) {
      map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 12), { duration: 0.8 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])
  return null
}
