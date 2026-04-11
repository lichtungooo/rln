import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'

// Wir patchen L.Map.initialize einmalig, sodass jede neue Map-Instanz
// ihre Referenz am eigenen Container ablegt. So können wir später
// die Map-Instanz finden, die utopia-ui intern angelegt hat.
let patched = false

export function patchLeafletForMapAccess() {
  if (patched) return
  patched = true

  const originalInitialize = L.Map.prototype.initialize
  L.Map.prototype.initialize = function (
    container: HTMLElement | string,
    options?: L.MapOptions,
  ) {
    originalInitialize.call(this, container as HTMLElement, options)
    const el =
      typeof container === 'string'
        ? document.getElementById(container)
        : container
    if (el) {
      ;(el as HTMLElement & { _leaflet_map?: LeafletMap })._leaflet_map = this
    }
    return this as unknown as L.Map
  } as typeof L.Map.prototype.initialize
}

// Die aktive Leaflet-Map finden.
export function getLeafletMap(): LeafletMap | null {
  const container = document.querySelector<HTMLElement>('.leaflet-container')
  if (!container) return null
  return (
    (container as HTMLElement & { _leaflet_map?: LeafletMap })._leaflet_map ??
    null
  )
}

// Fliegt die Karte zu einer Position.
export function flyToLocation(lat: number, lng: number, zoom = 14): boolean {
  const map = getLeafletMap()
  if (!map) return false
  map.flyTo([lat, lng], zoom, { duration: 1.2 })
  return true
}
