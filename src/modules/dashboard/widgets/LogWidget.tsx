import { useMemo } from "react"
import { ScrollText, Star, Heart, RotateCw, MessageSquare, Sparkles } from "lucide-react"
import { useLog } from "../../gamification"
import type { LogEntryData } from "../../gamification"
import { useChannel, useChannelSync } from "../../../components/SelectionContext"

/**
 * LogWidget — die letzten Log-Eintraege als kompakte Liste.
 *
 * Klick-Routing: Klick auf Eintrag setzt ihn im "log"-Channel — ein
 * LogDetailWidget zeigt die volle Reflexion (Marks + Kommentar +
 * Sichtbarkeit). Pfeile blaettern durch alle Eintraege.
 */
export function LogWidget() {
  const { entries } = useLog()
  const items = useMemo(() => entries.slice(0, 30), [entries])
  const preview = useMemo(() => entries.slice(0, 6), [entries])

  useChannelSync("log", items)
  const { selectedId, select } = useChannel("log")

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" style={{ color: "#A855F7" }} />
          <div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Log
            </div>
            <div className="text-base font-bold leading-tight">Spiegel der Reise</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{entries.length}</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {preview.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4 leading-relaxed">
            Noch leer.<br />
            Quests abschliessen, Events besuchen — alles landet hier.
          </div>
        ) : (
          preview.map((entry) => {
            const d = entry.data as LogEntryData
            const isSynergy = d.type === "level_up" && d.payload?.synergyBonus
            const isSelected = selectedId === entry.id
            const marks = new Set(d.marks ?? [])
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => select(entry.id)}
                className={`w-full text-left p-2 rounded-md border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent hover:bg-muted/30"
                }`}
                style={{ borderLeftWidth: 2, borderLeftColor: "#A855F7" }}
              >
                <div className="flex items-start gap-2">
                  {isSynergy && (
                    <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight">{d.summary}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>
                        {new Date(d.timestamp).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{d.sourceModule}</span>
                      {marks.size > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            {marks.has("wichtig") && <Star className="h-2.5 w-2.5 text-amber-500" />}
                            {marks.has("schoen") && <Heart className="h-2.5 w-2.5 text-pink-500" />}
                            {marks.has("wiederholen") && (
                              <RotateCw className="h-2.5 w-2.5 text-blue-500" />
                            )}
                          </span>
                        </>
                      )}
                      {d.comment && (
                        <>
                          <span>·</span>
                          <MessageSquare className="h-2.5 w-2.5" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
        {items.length > preview.length && (
          <div className="text-[10px] text-muted-foreground italic text-center pt-1">
            +{items.length - preview.length} weitere — mit Pfeilen durchblaettern
          </div>
        )}
      </div>
    </div>
  )
}
