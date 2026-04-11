import { useState } from 'react'

export interface MapLayer {
  id: string
  name: string
  preview: string
}

const layers: MapLayer[] = [
  {
    id: 'standard',
    name: 'Karte',
    preview: 'linear-gradient(135deg, #d4e6d0 0%, #a8c8a0 50%, #7aa870 100%)',
  },
  {
    id: 'satellite',
    name: 'Satellit',
    preview: 'linear-gradient(135deg, #2d4a3e 0%, #5a7a5f 50%, #8db386 100%)',
  },
  {
    id: 'topo',
    name: 'Gelände',
    preview: 'linear-gradient(135deg, #d6c8a8 0%, #b8a57a 50%, #8a7550 100%)',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    preview: 'linear-gradient(135deg, #d4a8c8 0%, #b076a0 50%, #7a4870 100%)',
  },
]

export function LayerSwitcher() {
  const [active, setActive] = useState('standard')

  return (
    <div className="flex flex-col gap-2">
      {layers.map((layer) => {
        const isActive = active === layer.id
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => setActive(layer.id)}
            className={`group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 shadow-md backdrop-blur-md transition ${
              isActive
                ? 'border-primary scale-110 shadow-lg'
                : 'border-border/60 hover:border-border hover:scale-105'
            }`}
            title={layer.name}
            aria-label={layer.name}
          >
            <div className="absolute inset-0" style={{ background: layer.preview }} />
            <span className="relative z-10 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              {layer.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
