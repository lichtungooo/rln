import { ScrollText, ArrowRight } from "lucide-react"
import { useLog } from "../../gamification"
import type { LogEntryData } from "../../gamification"

/**
 * LogWidget — die letzten 5 Log-Eintraege chronologisch.
 *
 * Phase C3: nur lesbar, kein Filter / Markieren / Kommentieren —
 * das kommt mit dem vollen Log-Modul in Phase E.
 */
export function LogWidget() {
  const { entries } = useLog()
  const recent = entries.slice(0, 5)

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
        {recent.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4 leading-relaxed">
            Noch leer.<br />
            Quests abschliessen, Events besuchen — alles landet hier.
          </div>
        ) : (
          recent.map((entry) => {
            const d = entry.data as LogEntryData
            const date = new Date(d.timestamp)
            return (
              <div key={entry.id} className="p-2 rounded-md border-l-2 hover:bg-muted/30 transition-colors" style={{ borderColor: "#A855F7" }}>
                <div className="text-sm font-medium leading-tight">{d.summary}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span>{date.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</span>
                  <span>·</span>
                  <span className="capitalize">{d.sourceModule}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
