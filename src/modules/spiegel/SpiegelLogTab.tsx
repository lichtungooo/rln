import { useMemo, useState } from "react"
import {
  ScrollText,
  Search,
  Star,
  Heart,
  RotateCw,
  MessageSquare,
  Sparkles,
  Filter,
} from "lucide-react"
import { useLog } from "../gamification"
import type { LogEntryData } from "../gamification"
import { useChannel, useChannelSync } from "../../components/SelectionContext"

/**
 * SpiegelLogTab — der volle Profile-Log mit Suche.
 *
 * Im Gegensatz zum kompakten LogWidget (Dashboard) zeigt diese Tab alle
 * Log-Eintraege chronologisch mit Suche, Typ-Filter und Datumsformat.
 *
 * Klick-Routing: Klick auf einen Eintrag setzt ihn im "log"-Channel —
 * das LogDetailWidget kann ihn an anderer Stelle rendern.
 */

const TYPE_LABELS: Record<string, string> = {
  level_up: "Level-Up",
  quest_complete: "Quest",
  skill_unlock: "Skill",
  item_earn: "Item",
  event_attend: "Event",
  contact_add: "Begegnung",
  title_change: "Titel",
}

const TYPE_OPTIONS = ["alle", "quest_complete", "skill_unlock", "item_earn", "level_up", "event_attend", "contact_add"]

export function SpiegelLogTab() {
  const { entries } = useLog()
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("alle")
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((entry) => {
      const d = entry.data as LogEntryData
      if (typeFilter !== "alle" && d.type !== typeFilter) return false
      if (!q) return true
      const summary = d.summary?.toLowerCase() ?? ""
      const comment = d.comment?.toLowerCase() ?? ""
      const sourceModule = d.sourceModule?.toLowerCase() ?? ""
      return summary.includes(q) || comment.includes(q) || sourceModule.includes(q)
    })
  }, [entries, query, typeFilter])

  useChannelSync("log", filtered)
  const { selectedId, select } = useChannel("log")

  return (
    <div className="h-full w-full bg-violet-50/60 rounded-xl overflow-hidden flex flex-col">
      {/* Header: Titel + Suche + Filter */}
      <div className="shrink-0">
        <div className="px-3 py-2 flex items-center gap-2">
          <ScrollText className="h-4 w-4 shrink-0" style={{ color: "#A855F7" }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Log</div>
            <div className="text-[10px] text-muted-foreground">Spiegel der Reise</div>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {filtered.length} / {entries.length}
          </span>
        </div>
        <div className="px-3 pb-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Im Log suchen..."
              className="w-full h-8 pl-7 pr-2 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-8 px-2 rounded-md border text-xs inline-flex items-center gap-1 transition-colors ${
              typeFilter !== "alle" || filterOpen
                ? "border-primary/60 text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Typ-Filter"
            aria-label="Typ-Filter"
          >
            <Filter className="h-3 w-3" />
            {typeFilter !== "alle" && (
              <span className="text-[10px]">{TYPE_LABELS[typeFilter] ?? typeFilter}</span>
            )}
          </button>
        </div>
        {filterOpen && (
          <div className="px-3 pb-2 flex flex-wrap gap-1 border-t pt-2 bg-muted/20">
            {TYPE_OPTIONS.map((t) => {
              const isActive = typeFilter === t
              const label = t === "alle" ? "Alle" : TYPE_LABELS[t] ?? t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    isActive
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-xs text-muted-foreground italic text-center leading-relaxed">
            {entries.length === 0 ? (
              <>
                Noch leer.
                <br />
                Quests, Events, Begegnungen — alles landet hier.
              </>
            ) : (
              <>Kein Eintrag passt zur Suche.</>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((entry) => {
              const d = entry.data as LogEntryData
              const isSynergy = d.type === "level_up" && d.payload?.synergyBonus
              const isSelected = selectedId === entry.id
              const marks = new Set(d.marks ?? [])
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => select(entry.id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/40 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isSynergy && (
                        <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-tight">{d.summary}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                          <span>
                            {new Date(d.timestamp).toLocaleDateString("de-DE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>·</span>
                          <span className="text-[9px] uppercase tracking-wide bg-muted/60 px-1.5 py-0.5 rounded">
                            {TYPE_LABELS[d.type] ?? d.type}
                          </span>
                          {d.sourceModule && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{d.sourceModule}</span>
                            </>
                          )}
                          {marks.size > 0 && (
                            <span className="flex items-center gap-0.5 ml-auto">
                              {marks.has("wichtig") && <Star className="h-2.5 w-2.5 text-amber-500" />}
                              {marks.has("schoen") && <Heart className="h-2.5 w-2.5 text-pink-500" />}
                              {marks.has("wiederholen") && (
                                <RotateCw className="h-2.5 w-2.5 text-blue-500" />
                              )}
                            </span>
                          )}
                          {d.comment && <MessageSquare className="h-2.5 w-2.5" />}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
