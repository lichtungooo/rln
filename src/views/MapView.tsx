import { useEffect, useMemo, useRef } from 'react'
import { UtopiaMap, Layer, type Item as UtopiaItem } from 'utopia-ui'
import { useItems } from '@real-life-stack/toolkit'
import { getLocationCoords, getLocationText } from '@/lib/event-helpers'
import { getLeafletMap } from '@/lib/map-access'

// Die Events aus unserem Connector ins Format der utopia-ui übersetzen.
function toUtopiaItem(event: import('@real-life-stack/data-interface').Item): UtopiaItem | null {
  const coords = getLocationCoords(event)
  if (!coords) return null
  return {
    id: event.id,
    name: String(event.data.title ?? 'Ohne Titel'),
    text: String(event.data.description ?? ''),
    position: {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
    },
    subname: getLocationText(event),
  } as UtopiaItem
}

interface MapViewProps {
  onMapClick?: () => void
}

export function MapView({ onMapClick }: MapViewProps) {
  const { data: events } = useItems({ type: 'event' })
  const callbackRef = useRef(onMapClick)
  callbackRef.current = onMapClick

  const eventMarkers = useMemo(() => {
    return events
      .map(toUtopiaItem)
      .filter((item): item is UtopiaItem => item !== null)
  }, [events])

  // Leaflet-Map-Klick abfangen
  useEffect(() => {
    // Kurz warten, bis die Map initialisiert ist
    const timer = setTimeout(() => {
      const map = getLeafletMap()
      if (!map) return

      const handler = () => {
        callbackRef.current?.()
      }

      map.on('click', handler)
      return () => {
        map.off('click', handler)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full w-full">
      <UtopiaMap
        center={[50.11, 8.68]}
        zoom={12}
        height="100%"
        width="100%"
        showZoomControl
        showFilterControl={false}
        showLayerControl={false}
        showGratitudeControl={false}
        showThemeControl={false}
      >
        <Layer
          name="Veranstaltungen"
          data={eventMarkers}
          markerIcon="calendar"
          markerShape="square"
          markerDefaultColor="#ea580c"
          menuIcon="calendar"
          menuText="Veranstaltungen"
          menuColor="#ea580c"
          itemType={{ name: 'event' } as never}
        />
      </UtopiaMap>
    </div>
  )
}
