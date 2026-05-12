import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Crosshair, X } from "lucide-react"
import { Input } from "@real-life-stack/toolkit"

/**
 * LocationPicker — kleine Karte zum Pin-Setzen + optionale Adress-Beschriftung.
 *
 * Wiederverwendbar fuer:
 *   - Marktplatz-Inserate (Standort des Anbieters)
 *   - Event-Erstellung (Veranstaltungsort)
 *   - Quest-Anlegen (Standort der Quest)
 *   - Alles wo "wo ist das?" eine Antwort braucht
 *
 * UX:
 *   - Klick auf die Karte setzt den Pin (oder verschiebt ihn)
 *   - "Mein Standort"-Button nutzt Geolocation
 *   - Adress-Input ist Freitext (User kann Strasse/Ort schreiben)
 *   - X-Button entfernt den Pin
 *
 * Defaults:
 *   - Initial-Zentrum: Deutschland-Mitte (Niemegk)
 *   - Initial-Zoom: 5 (ganzes Land sichtbar)
 *   - Bei vorhandenem Pin: Zoom 13, Pin im Zentrum
 */

const DEFAULT_CENTER: [number, number] = [51.16, 10.45]
const DEFAULT_ZOOM = 5
const PIN_ZOOM = 13

const PIN_ICON = L.divIcon({
  className: "location-picker-pin",
  html: `<svg width="28" height="36" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
    <path d="M16 0 C7 0 0 7 0 16 C0 28 16 40 16 40 C16 40 32 28 32 16 C32 7 25 0 16 0 Z" fill="#E8751A" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="16" cy="14" r="4" fill="#fff"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

export interface PickedLocation {
  lat: number
  lng: number
  address?: string
}

export interface LocationPickerProps {
  value: PickedLocation | null
  onChange: (next: PickedLocation | null) => void
  height?: number
}

export function LocationPicker({
  value,
  onChange,
  height = 200,
}: LocationPickerProps) {
  const [geoBusy, setGeoBusy] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation nicht verfuegbar")
      return
    }
    setGeoBusy(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: value?.address,
        })
        setGeoBusy(false)
      },
      (err) => {
        setGeoError(err.message || "Standort nicht erlaubt")
        setGeoBusy(false)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    )
  }

  const updateAddress = (address: string) => {
    if (!value) {
      // Nur Adresse setzen ohne Pin macht keinen Sinn — User soll erst Pin setzen
      return
    }
    onChange({ ...value, address })
  }

  const clear = () => onChange(null)

  return (
    <div className="space-y-2">
      <div
        className="rounded-md border overflow-hidden relative"
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
          zoom={value ? PIN_ZOOM : DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onClick={(latlng) => onChange({ ...(value ?? {}), lat: latlng.lat, lng: latlng.lng })} />
          {value && <RecenterOnChange center={[value.lat, value.lng]} />}
          {value && <Marker position={[value.lat, value.lng]} icon={PIN_ICON} />}
        </MapContainer>

        {/* Geolocation-Button schwebt oben rechts auf der Karte */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoBusy}
          className="absolute top-2 right-2 z-[400] h-8 px-2 rounded-md border bg-background/95 backdrop-blur text-xs inline-flex items-center gap-1 hover:bg-muted shadow-md disabled:opacity-50"
          title="Mein Standort"
        >
          <Crosshair className="h-3 w-3" />
          {geoBusy ? "..." : "Mein Standort"}
        </button>

        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 left-2 z-[400] h-8 w-8 rounded-md border bg-background/95 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-muted shadow-md flex items-center justify-center"
            title="Pin entfernen"
            aria-label="Pin entfernen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {value && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              value={value.address ?? ""}
              onChange={(e) => updateAddress(e.target.value)}
              placeholder="Optionale Adresse (z.B. Kassel, Friedrich-Ebert-Str. 12)"
              className="h-7 text-xs flex-1"
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        </div>
      )}

      {!value && (
        <p className="text-[10px] text-muted-foreground italic">
          Klick auf die Karte, um den Pin zu setzen.
        </p>
      )}

      {geoError && <p className="text-[10px] text-destructive">{geoError}</p>}
    </div>
  )
}

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng),
  })
  return null
}

/** Bei Aenderung des Centers die Karte sanft dorthin bewegen */
function RecenterOnChange({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom() < PIN_ZOOM ? PIN_ZOOM : map.getZoom(), {
      animate: true,
      duration: 0.5,
    })
  }, [center, map])
  return null
}
