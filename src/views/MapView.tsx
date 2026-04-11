import { UtopiaMap, Layer } from 'utopia-ui'
import { demoOrte, demoVeranstaltungen } from '@/data/demo'

export function MapView() {
  return (
    <div className="h-[calc(100dvh-8rem)] w-full overflow-hidden rounded-xl border bg-card shadow-sm">
      <UtopiaMap
        center={[50.11, 8.68]}
        zoom={12}
        height="100%"
        width="100%"
      >
        <Layer
          name="Orte"
          data={demoOrte}
          markerIcon="point"
          markerShape="circle"
          markerDefaultColor="#0369a1"
          menuIcon="point"
          menuText="Orte"
          menuColor="#0369a1"
        />
        <Layer
          name="Veranstaltungen"
          data={demoVeranstaltungen}
          markerIcon="calendar"
          markerShape="square"
          markerDefaultColor="#ea580c"
          menuIcon="calendar"
          menuText="Veranstaltungen"
          menuColor="#ea580c"
        />
      </UtopiaMap>
    </div>
  )
}
