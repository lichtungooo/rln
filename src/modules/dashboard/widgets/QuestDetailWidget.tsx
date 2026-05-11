import { useMemo, useState } from "react"
import { Trophy, Sparkles, MapPin, Layers, X } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { useChannel } from "../../../components/SelectionContext"
import { useQuests } from "../../quest"
import type { QuestData } from "../../quest"

/**
 * QuestDetailWidget — zeigt das aktuell selektierte Quest aus dem
 * "quest"-Channel. Klick irgendwo (auch in einem anderen Widget der
 * Quests setzt) aktualisiert dieses Widget live. Pfeile aussen rotieren
 * dann durch die Quests im Channel.
 */
export function QuestDetailWidget() {
  const { selected, select } = useChannel<Item>("quest")
  const { isCompleted, complete, uncomplete } = useQuests()
  const [busy, setBusy] = useState(false)

  const data = selected?.data as QuestData | undefined
  const completed = selected ? isCompleted(selected.id) : false

  const totalXp = useMemo(() => {
    if (!data) return 0
    return (
      Object.values(data.skillXp ?? {}).reduce((a, b) => a + b, 0) +
      Object.values(data.bereichXp ?? {}).reduce((a, b) => a + (b ?? 0), 0)
    )
  }, [data])

  const handleToggle = async () => {
    if (!selected) return
    setBusy(true)
    try {
      if (completed) await uncomplete(selected.id)
      else await complete(selected, "self")
    } finally {
      setBusy(false)
    }
  }

  if (!selected || !data) {
    return (
      <div className="h-full w-full bg-card border rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <Trophy className="h-6 w-6 opacity-40" />
        <p>Quest-Detail</p>
        <p className="text-[10px]">
          Klick auf eine Quest in einem Quest-Widget — sie erscheint hier.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-card border rounded-xl flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        <Trophy className="h-4 w-4 shrink-0" style={{ color: "#E8751A" }} />
        <span className="text-sm font-semibold truncate flex-1">{data.title}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {data.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        )}

        {data.location?.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {data.location.address}
          </div>
        )}

        {totalXp > 0 && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#E8751A" }} />
            <span className="text-xs font-semibold" style={{ color: "#E8751A" }}>
              {totalXp} XP
            </span>
          </div>
        )}

        {data.questSeriesId && (
          <div className="text-[10px] text-purple-700 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Reihe {data.questSeriesId.slice(0, 8)} · Schritt {data.questSeriesPosition ?? "?"}
          </div>
        )}

        <Button
          type="button"
          size="sm"
          onClick={handleToggle}
          disabled={busy}
          variant={completed ? "outline" : "default"}
          className="w-full"
        >
          {busy ? "..." : completed ? "Abschluss zuruecknehmen" : "Erledigt — XP einsammeln"}
        </Button>
      </div>
    </div>
  )
}
