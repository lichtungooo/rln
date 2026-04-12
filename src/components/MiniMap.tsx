import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MiniMapProps {
  lat: number
  lng: number
  zoom?: number
  className?: string
}

export function MiniMap({ lat, lng, zoom = 14, className }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Map erstellen
    const map = L.map(el, {
      center: [lat, lng],
      zoom,
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Marker setzen
    const icon = L.divIcon({
      className: 'mini-map-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: oklch(0.63 0.16 55);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    L.marker([lat, lng], { icon }).addTo(map)

    mapRef.current = map

    // Resize-Observer, damit die Map sich korrekt rendert
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, zoom])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-auto ${className ?? ''}`}
      style={{ minHeight: '120px' }}
    />
  )
}
