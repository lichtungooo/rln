import { useState } from "react"
import { MapPin, Crosshair, X } from "lucide-react"

/**
 * RadiusFilter — wiederverwendbares Umkreis-Filter-Widget.
 *
 * Aufbau:
 *   - Toggle "Umkreis aktivieren"
 *   - Adress-Input (Label-Anzeige + manuelle Eingabe)
 *   - Geolocation-Knopf ("Mein Standort")
 *   - Schieberegler 1-500 km
 *
 * Verwendung: Marktplatz, Karten-Suche, Events, Date-App, Begegnungen —
 * ueberall wo "im Umkreis von X" eine Filterung ergibt.
 *
 * Datenmodell:
 *   center: { lat, lng, label? } — der Mittelpunkt
 *   radiusKm: Radius in Kilometern
 *   enabled: ob der Filter wirkt
 *
 * Distanz wird ueber distanceKm() (Haversine) berechnet.
 */

export interface RadiusCenter {
  lat: number
  lng: number
  label?: string
}

export interface RadiusValue {
  enabled: boolean
  center: RadiusCenter | null
  radiusKm: number
}

export const DEFAULT_RADIUS_VALUE: RadiusValue = {
  enabled: false,
  center: null,
  radiusKm: 50,
}

export interface RadiusFilterProps {
  value: RadiusValue
  onChange: (next: RadiusValue) => void
  /** Kompakte Variante — eine Zeile, fuer dichte UIs */
  compact?: boolean
  /** Min/Max-Radius in km — Default 1..500 */
  min?: number
  max?: number
}

export function RadiusFilter({
  value,
  onChange,
  compact,
  min = 1,
  max = 500,
}: RadiusFilterProps) {
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
          ...value,
          enabled: true,
          center: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: "Mein Standort",
          },
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

  const clearCenter = () => {
    onChange({ ...value, center: null, enabled: false })
  }

  const updateLabel = (label: string) => {
    if (!value.center) return
    onChange({ ...value, center: { ...value.center, label } })
  }

  const updateRadius = (km: number) => {
    onChange({ ...value, radiusKm: km })
  }

  const containerClass = compact
    ? "flex items-center gap-2 flex-wrap"
    : "space-y-2"

  return (
    <div className={containerClass}>
      <label className="flex items-center gap-2 text-sm shrink-0">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Umkreis</span>
      </label>

      {value.enabled && (
        <>
          <div className={compact ? "flex items-center gap-1.5 flex-1" : "flex items-center gap-1.5"}>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={geoBusy}
              className="h-7 px-2 rounded border text-xs inline-flex items-center gap-1 hover:bg-muted/50 disabled:opacity-50 shrink-0"
              title="Geolocation nutzen"
            >
              <Crosshair className="h-3 w-3" />
              {geoBusy ? "..." : "Mein Standort"}
            </button>
            <input
              type="text"
              value={value.center?.label ?? ""}
              onChange={(e) => updateLabel(e.target.value)}
              placeholder="Adresse oder Ort"
              disabled={!value.center}
              className="h-7 px-2 rounded border bg-background text-xs flex-1 min-w-0 disabled:bg-muted/30 disabled:text-muted-foreground"
            />
            {value.center && (
              <button
                type="button"
                onClick={clearCenter}
                className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center shrink-0"
                aria-label="Standort entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className={compact ? "flex items-center gap-2 w-full" : "flex items-center gap-2"}>
            <input
              type="range"
              min={min}
              max={max}
              value={value.radiusKm}
              onChange={(e) => updateRadius(parseInt(e.target.value, 10))}
              className="flex-1 accent-primary"
              disabled={!value.center}
            />
            <span className="text-xs font-mono tabular-nums shrink-0 w-12 text-right">
              {value.radiusKm} km
            </span>
          </div>

          {geoError && (
            <p className="text-[10px] text-destructive">{geoError}</p>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Haversine — Distanz zwischen zwei Geo-Punkten in Kilometern.
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371 // Erd-Radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const aH =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(aH), Math.sqrt(1 - aH))
}

/**
 * Hilfsfunktion: prueft ob ein Item innerhalb des Radius liegt.
 * Items ohne location liegen NICHT im Radius (wuerden also ausgefiltert).
 */
export function isInRadius(
  itemLocation: { lat?: number; lng?: number } | null | undefined,
  radius: RadiusValue
): boolean {
  if (!radius.enabled) return true
  if (!radius.center) return true
  if (!itemLocation || typeof itemLocation.lat !== "number" || typeof itemLocation.lng !== "number") {
    return false
  }
  const d = distanceKm(
    { lat: itemLocation.lat, lng: itemLocation.lng },
    { lat: radius.center.lat, lng: radius.center.lng }
  )
  return d <= radius.radiusKm
}
