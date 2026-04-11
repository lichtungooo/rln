import type { Item } from '@real-life-stack/data-interface'

// Der Ortsname: entweder das location-Feld als String,
// oder das address-Feld als Rückfall, wenn location ein Koordinaten-Objekt ist.
export function getLocationText(event: Item): string | undefined {
  const { location, address } = event.data
  if (typeof location === 'string' && location.trim()) return location
  if (typeof address === 'string' && address.trim()) return address
  return undefined
}

// Geografische Koordinaten aus einem Event ziehen, wenn vorhanden.
export function getLocationCoords(
  event: Item,
): { lat: number; lng: number } | null {
  const loc = event.data.location
  if (
    loc &&
    typeof loc === 'object' &&
    'lat' in loc &&
    'lng' in loc &&
    typeof (loc as { lat: unknown }).lat === 'number' &&
    typeof (loc as { lng: unknown }).lng === 'number'
  ) {
    return { lat: (loc as { lat: number }).lat, lng: (loc as { lng: number }).lng }
  }
  return null
}
