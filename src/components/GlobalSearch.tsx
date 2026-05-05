/**
 * GlobalSearch — Suchfeld in der Top-Bar.
 *
 * Durchsucht alle Items im aktiven Space nach Titel, Beschreibung, Notiz,
 * Hashtag, Mensch. Trefferliste oeffnet sich unter dem Eingabefeld. Klick
 * auf einen Treffer springt in das Modul, in dem das Item lebt — Kalender
 * fuer Events, Karte fuer Orte, Wissensfeld fuer Fragen, Valluet fuer
 * Vouchers und so weiter.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { useItems } from '@real-life-stack/toolkit'
import type { Item } from '@real-life-stack/data-interface'
import {
  Search as SearchIcon,
  X,
  MapPin,
  Calendar,
  ShoppingBag,
  HelpCircle,
  Sparkles,
  ListChecks,
  User,
  FileText,
} from 'lucide-react'

interface GlobalSearchProps {
  onJump: (moduleId: string) => void
  className?: string
}

interface SearchHit {
  id: string
  type: string
  title: string
  snippet?: string
  moduleId: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const TYPE_TO_MODULE: Record<
  string,
  { module: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  place: { module: 'map', icon: MapPin },
  event: { module: 'calendar', icon: Calendar },
  appointment: { module: 'calendar', icon: Calendar },
  offer: { module: 'marketplace', icon: ShoppingBag },
  need: { module: 'marketplace', icon: ShoppingBag },
  frage: { module: 'wissensfeld', icon: HelpCircle },
  erkenntnis: { module: 'wissensfeld', icon: HelpCircle },
  vorschlag: { module: 'wissensfeld', icon: HelpCircle },
  voucher: { module: 'valluet', icon: Sparkles },
  quest: { module: 'quest', icon: ListChecks },
  task: { module: 'kanban', icon: ListChecks },
  post: { module: 'kanban', icon: FileText },
  profile: { module: 'profile', icon: User },
}

function getItemTitle(item: Item): string {
  const data = (item.data ?? {}) as Record<string, unknown>
  const candidates = ['title', 'name', 'frage', 'titel', 'note']
  for (const key of candidates) {
    const v = data[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return item.id.slice(0, 12)
}

function getItemSnippet(item: Item): string | undefined {
  const data = (item.data ?? {}) as Record<string, unknown>
  const candidates = ['description', 'beschreibung', 'content', 'note', 'antwort']
  for (const key of candidates) {
    const v = data[key]
    if (typeof v === 'string' && v.trim()) {
      const s = v.trim().replace(/\s+/g, ' ')
      return s.length > 100 ? s.slice(0, 100) + '…' : s
    }
  }
  return undefined
}

function matches(item: Item, q: string): boolean {
  if (!q) return false
  const lower = q.toLowerCase()
  const data = (item.data ?? {}) as Record<string, unknown>
  // Titel + Snippet
  if (getItemTitle(item).toLowerCase().includes(lower)) return true
  const snippet = getItemSnippet(item)
  if (snippet && snippet.toLowerCase().includes(lower)) return true
  // Hashtags
  const tags = data.hashtags ?? data.tags
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (typeof t === 'string' && t.toLowerCase().includes(lower)) return true
    }
  }
  // Adresse
  const location = data.location as Record<string, unknown> | undefined
  if (location && typeof location.address === 'string') {
    if (location.address.toLowerCase().includes(lower)) return true
  }
  return false
}

export function GlobalSearch({ onJump, className }: GlobalSearchProps) {
  const { data: items } = useItems({})
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Schliessen bei Aussen-Klick / Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim()
    if (!q) return []
    const result: SearchHit[] = []
    for (const item of items) {
      if (!matches(item, q)) continue
      const map = TYPE_TO_MODULE[item.type] ?? {
        module: 'dashboard',
        icon: FileText,
      }
      result.push({
        id: item.id,
        type: item.type,
        title: getItemTitle(item),
        snippet: getItemSnippet(item),
        moduleId: map.module,
        icon: map.icon,
      })
      if (result.length >= 12) break
    }
    return result
  }, [items, query])

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div
        className={`flex h-7 items-center gap-1.5 rounded-md border bg-background/60 px-2 transition focus-within:border-primary/60 focus-within:bg-background ${
          open ? 'border-primary/60' : 'border-border/50'
        }`}
      >
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Suchen — Karte, Termine, Wissen, Werte"
          className="h-full flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
            aria-label="Suche leeren"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[60vh] overflow-y-auto rounded-lg border border-border/60 bg-popover shadow-xl">
          {hits.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Nichts gefunden zu „{query}".
            </div>
          ) : (
            <ul className="py-1">
              {hits.map((hit) => {
                const Icon = hit.icon
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onJump(hit.moduleId)
                        setOpen(false)
                        setQuery('')
                      }}
                      className="flex w-full items-start gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted/60"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">
                          {hit.title}
                        </div>
                        {hit.snippet && (
                          <div className="truncate text-[11px] text-muted-foreground">
                            {hit.snippet}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        {hit.type}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
