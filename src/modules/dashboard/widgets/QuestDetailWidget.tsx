import { useMemo, useState } from "react"
import { Trophy, MapPin, Layers, X } from "lucide-react"
import { Button, useItems } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { useChannel } from "../../../components/SelectionContext"
import { useQuests } from "../../quest"
import type { QuestData } from "../../quest"
import {
  BEREICH_BY_ID,
  GAMIFICATION_ITEM_TYPES,
  UNIVERSAL_SKILLS,
  type SkillData,
  type TreeBereichId,
} from "../../gamification"

/**
 * QuestDetailWidget — zeigt das aktuell selektierte Quest aus dem
 * "quest"-Channel. Klick irgendwo (auch in einem anderen Widget der
 * Quests setzt) aktualisiert dieses Widget live. Pfeile aussen rotieren
 * dann durch die Quests im Channel.
 */
export function QuestDetailWidget() {
  const { selected, select } = useChannel<Item>("quest")
  const { isCompleted, complete, uncomplete } = useQuests()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
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

  // Skill-Belohnungen mit Namen + Farbe aufloesen
  const skillRows = useMemo(() => {
    if (!data?.skillXp) return []
    return Object.entries(data.skillXp).map(([skillId, xp]) => {
      const universal = UNIVERSAL_SKILLS.find((s) => s.id === skillId)
      const item = skillItems.find((s) => s.id === skillId)
      const sd = (universal ?? (item?.data as SkillData | undefined)) as
        | SkillData
        | undefined
      const bereich = sd ? BEREICH_BY_ID[sd.bereichId as TreeBereichId] : null
      return {
        label: sd?.name ?? skillId,
        xp,
        color: sd?.color ?? bereich?.color ?? "#94A3B8",
      }
    })
  }, [data, skillItems])

  // Bereich-Belohnungen (direkt auf Bereich, ohne konkretes Skill)
  const bereichRows = useMemo(() => {
    if (!data?.bereichXp) return []
    return Object.entries(data.bereichXp).map(([bId, xp]) => {
      const b = BEREICH_BY_ID[bId as TreeBereichId]
      return {
        label: b?.label ?? bId,
        xp: xp ?? 0,
        color: b?.color ?? "#94A3B8",
      }
    })
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
      <div className="h-full w-full bg-orange-50/60 rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <Trophy className="h-6 w-6 opacity-40" />
        <p>Quest-Detail</p>
        <p className="text-[10px]">
          Klick auf eine Quest in einem Quest-Widget — sie erscheint hier.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-orange-50/60 rounded-xl flex flex-col overflow-hidden">
      <div className="px-3 py-2 bg-orange-100/40 flex items-center gap-2">
        <Trophy className="h-4 w-4 shrink-0" style={{ color: "#E8751A" }} />
        <span className="text-sm font-semibold truncate flex-1">{data.title}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-orange-200/50 transition-colors"
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
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              Belohnung — {totalXp} XP
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillRows.map((row) => (
                <span
                  key={row.label}
                  className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1"
                  style={{
                    background: `${row.color}10`,
                    borderColor: `${row.color}30`,
                    color: row.color,
                  }}
                >
                  {row.label} +{row.xp}
                </span>
              ))}
              {bereichRows.map((row) => (
                <span
                  key={row.label}
                  className="text-[10px] px-2 py-0.5 rounded font-semibold text-white"
                  style={{ background: row.color }}
                >
                  {row.label} +{row.xp}
                </span>
              ))}
            </div>
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
