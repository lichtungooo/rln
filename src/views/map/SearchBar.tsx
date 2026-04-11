import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { flyToLocation } from '@/lib/map-access'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
}

export function SearchBar() {
  const [value, setValue] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!value.trim() || value.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&accept-language=de`
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'RealLifeNetwork/0.1',
          },
        })
        const data = (await response.json()) as NominatimResult[]
        setResults(data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [value])

  const handleSelect = (result: NominatimResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      flyToLocation(lat, lng, 13)
    }
    setOpen(false)
    setValue('')
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-2 shadow-md backdrop-blur-md transition focus-within:bg-background">
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Ort suchen..."
          className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('')
              setResults([])
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Löschen"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-xl backdrop-blur-md">
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left transition hover:bg-muted"
                >
                  <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs text-foreground leading-tight">
                    {result.display_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
