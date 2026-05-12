import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Circle,
  X,
  Trophy,
  Sparkles,
  MapPin,
  Layers,
  Clock,
  History,
} from "lucide-react"
import { Button, useItems } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import {
  GAMIFICATION_ITEM_TYPES,
  BEREICH_BY_ID,
  useLog,
  type SkillData,
  type LogEntryData,
  type TreeBereichId,
} from "../gamification"
import { useQuests } from "../quest/use-quests"
import { useChannel, useChannelSync } from "../../components/SelectionContext"
import type { QuestData } from "../quest/quest-engine"

/**
 * SpiegelQuestTab — Quests als Two-Panel.
 *
 * Links: offene Quests, gruppiert nach Quest-Reihe + Singles.
 * Rechts: Standard Log (chronologisch, was du gemacht hast).
 *
 * Klick auf eine Quest links → rechts wandert das Detail (Two-Panel-
 * Pattern wie Skill-Tree). X schliesst zurueck zum Log.
 *
 * Mobile: gestapelt — Liste oben, Detail/Log darunter.
 */

export interface SpiegelQuestTabProps extends ModuleViewProps {}

type QuestFilter = "open" | "all" | "done"

export function SpiegelQuestTab(_props: SpiegelQuestTabProps) {
  const { quests, isCompleted, complete, uncomplete } = useQuests()
  const { data: skills } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { entries: logEntries } = useLog()

  const questChannel = useChannel("quest")
  const selectedQuestId = questChannel.selectedId
  const setSelectedQuestId = (id: string | null) => questChannel.select(id)
  const [filter, setFilter] = useState<QuestFilter>("open")

  const filteredQuests = useMemo(() => {
    if (filter === "all") return quests
    if (filter === "done") return quests.filter((q) => isCompleted(q.id))
    return quests.filter((q) => !isCompleted(q.id))
  }, [quests, filter, isCompleted])
  const openQuests = filteredQuests // alte Variable beibehalten fuer minimale Aenderung

  // Quest-Items im Channel registrieren — damit die navApi-Pfeile von
  // PageGrid rechts/links durch die gefilterten Quests blaettern (Klick-
  // Routing-Doktrin, feedback_klick_routing_doktrin.md).
  useChannelSync("quest", filteredQuests)

  // Gruppiere nach Series + Singles
  const grouped = useMemo(() => {
    const seriesMap = new Map<string, Item[]>()
    const singles: Item[] = []
    for (const q of openQuests) {
      const sid = (q.data as QuestData).questSeriesId
      if (sid) {
        if (!seriesMap.has(sid)) seriesMap.set(sid, [])
        seriesMap.get(sid)!.push(q)
      } else {
        singles.push(q)
      }
    }
    for (const [, items] of seriesMap) {
      items.sort((a, b) => {
        const aPos = (a.data as QuestData).questSeriesPosition ?? 999
        const bPos = (b.data as QuestData).questSeriesPosition ?? 999
        return aPos - bPos
      })
    }
    return {
      series: Array.from(seriesMap.entries()).map(([id, items]) => ({ id, items })),
      singles,
    }
  }, [openQuests])

  // Log filtern auf Quest-bezogene Eintraege, neueste zuerst
  const questLog = useMemo(() => {
    return logEntries
      .filter(
        (e) =>
          e.type === "quest_completed" ||
          e.type === "item_earned" ||
          e.type === "level_up",
      )
      .slice(0, 30)
  }, [logEntries])

  const selectedQuest = useMemo(() => {
    if (!selectedQuestId) return null
    return quests.find((q) => q.id === selectedQuestId) ?? null
  }, [selectedQuestId, quests])

  const completedOfSelected = selectedQuest ? isCompleted(selectedQuest.id) : false

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
      {/* Links: Offene Quests */}
      <div className="rounded-xl bg-orange-50/60 overflow-hidden flex flex-col h-full min-h-0">
        <div className="px-3 py-2 bg-orange-100/40 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary shrink-0" />
          {(["open", "done", "all"] as QuestFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                filter === f
                  ? "border-transparent bg-foreground text-background font-semibold"
                  : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {f === "open" ? "Offen" : f === "done" ? "Erledigt" : "Alle"}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {filteredQuests.length}
          </span>
        </div>

        <div className="p-2 space-y-2 overflow-y-auto flex-1">
          {openQuests.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              Keine offenen Quests. Im Quest-Modul welche anlegen.
            </div>
          ) : (
            <>
              {/* Series gruppiert */}
              {grouped.series.map((s) => (
                <SeriesBlock
                  key={s.id}
                  items={s.items}
                  skills={skills}
                  selectedId={selectedQuestId}
                  isCompleted={isCompleted}
                  onSelect={setSelectedQuestId}
                />
              ))}
              {/* Singles */}
              {grouped.singles.length > 0 && (
                <div className="space-y-0.5">
                  {grouped.series.length > 0 && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pt-1">
                      Einzeln
                    </p>
                  )}
                  {grouped.singles.map((q) => (
                    <QuestRow
                      key={q.id}
                      quest={q}
                      skills={skills}
                      active={selectedQuestId === q.id}
                      completed={isCompleted(q.id)}
                      onClick={() => setSelectedQuestId(q.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rechts: Log oder Quest-Detail */}
      <div className="rounded-xl bg-violet-50/60 overflow-hidden flex flex-col h-full min-h-0">
        {selectedQuest ? (
          <QuestDetailPanel
            quest={selectedQuest}
            skills={skills}
            completed={completedOfSelected}
            onComplete={() => complete(selectedQuest, "self")}
            onUncomplete={() => uncomplete(selectedQuest.id)}
            onClose={() => setSelectedQuestId(null)}
          />
        ) : (
          <LogPanel entries={questLog} />
        )}
      </div>
    </div>
  )
}

// ============================================================
// SeriesBlock — Quest-Reihe mit Header und Liste
// ============================================================

function SeriesBlock({
  items,
  skills,
  selectedId,
  isCompleted,
  onSelect,
}: {
  items: Item[]
  skills: Item[]
  selectedId: string | null
  isCompleted: (id: string) => boolean
  onSelect: (id: string) => void
}) {
  const seriesId = (items[0]?.data as QuestData).questSeriesId
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Layers className="h-3 w-3 text-purple-600" />
        <span className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">
          Reihe {seriesId?.slice(0, 8) ?? ""}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {items.length} {items.length === 1 ? "Schritt" : "Schritte"}
        </span>
      </div>
      <div className="space-y-0.5 pl-2 border-l-2" style={{ borderColor: "rgba(168,85,247,0.3)" }}>
        {items.map((q, idx) => (
          <QuestRow
            key={q.id}
            quest={q}
            skills={skills}
            active={selectedId === q.id}
            completed={isCompleted(q.id)}
            seriesIndex={idx + 1}
            onClick={() => onSelect(q.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// QuestRow — kompakte Quest-Zeile
// ============================================================

function QuestRow({
  quest,
  skills,
  active,
  completed,
  seriesIndex,
  onClick,
}: {
  quest: Item
  skills: Item[]
  active: boolean
  completed: boolean
  seriesIndex?: number
  onClick: () => void
}) {
  const data = quest.data as QuestData
  const skillXp = data.skillXp ?? {}
  const bereichXp = data.bereichXp ?? {}
  const totalXp =
    Object.values(skillXp).reduce((a, b) => a + b, 0) +
    Object.values(bereichXp).reduce((a, b) => a + (b ?? 0), 0)

  // Bereich-Farben aus den Skill-Belohnungen ableiten
  const colors = useMemo(() => {
    const set = new Set<string>()
    for (const skillId of Object.keys(skillXp)) {
      const skill = skills.find((s) => s.id === skillId)
      const sd = skill?.data as SkillData | undefined
      if (sd) {
        const bereich = BEREICH_BY_ID[sd.bereichId]
        if (bereich) set.add(bereich.color)
      }
    }
    for (const bId of Object.keys(bereichXp)) {
      const b = BEREICH_BY_ID[bId as TreeBereichId]
      if (b) set.add(b.color)
    }
    return Array.from(set).slice(0, 3)
  }, [skillXp, bereichXp, skills])

  return (
    <button
      type="button"
      onClick={onClick}
      title={data.description ?? data.title}
      className={`w-full text-left px-2 py-1 rounded-md border transition-all ${
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-transparent hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {completed ? (
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {seriesIndex !== undefined && (
            <span className="text-[9px] font-bold px-1 rounded bg-purple-100 text-purple-700 shrink-0">
              #{seriesIndex}
            </span>
          )}
          <span className="text-sm font-medium truncate flex-1">{data.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {totalXp > 0 && (
            <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              {totalXp}
            </span>
          )}
          {colors.length > 0 && (
            <div className="flex gap-0.5">
              {colors.map((c, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ============================================================
// QuestDetailPanel — rechts wenn eine Quest ausgewaehlt ist
// ============================================================

function QuestDetailPanel({
  quest,
  skills,
  completed,
  onComplete,
  onUncomplete,
  onClose,
}: {
  quest: Item
  skills: Item[]
  completed: boolean
  onComplete: () => Promise<unknown> | void
  onUncomplete: () => Promise<unknown> | void
  onClose: () => void
}) {
  const data = quest.data as QuestData
  const [busy, setBusy] = useState(false)

  const skillXp = data.skillXp ?? {}
  const bereichXp = data.bereichXp ?? {}
  const totalXp =
    Object.values(skillXp).reduce((a, b) => a + b, 0) +
    Object.values(bereichXp).reduce((a, b) => a + (b ?? 0), 0)

  const skillRows = useMemo(() => {
    return Object.entries(skillXp).map(([skillId, xp]) => {
      const skill = skills.find((s) => s.id === skillId)
      const sd = skill?.data as SkillData | undefined
      const bereich = sd ? BEREICH_BY_ID[sd.bereichId] : null
      return {
        label: sd?.name ?? skillId,
        xp,
        color: sd?.color ?? bereich?.color ?? "#888",
      }
    })
  }, [skillXp, skills])

  const bereichRows = useMemo(() => {
    return Object.entries(bereichXp).map(([bId, xp]) => {
      const b = BEREICH_BY_ID[bId as TreeBereichId]
      return {
        label: b?.label ?? bId,
        xp: xp ?? 0,
        color: b?.color ?? "#888",
      }
    })
  }, [bereichXp])

  const handleToggle = async () => {
    setBusy(true)
    try {
      if (completed) await onUncomplete()
      else await onComplete()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        {completed ? (
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-semibold truncate flex-1">{data.title}</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Zurueck zum Log"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
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

        {/* Belohnungen */}
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
          {busy
            ? "..."
            : completed
            ? "Abschluss zuruecknehmen"
            : "Erledigt — XP einsammeln"}
        </Button>
      </div>
    </>
  )
}

// ============================================================
// LogPanel — Log-Eintraege wenn keine Quest ausgewaehlt
// ============================================================

function LogPanel({ entries }: { entries: Array<{ id: string; data: LogEntryData }> }) {
  return (
    <>
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        <History className="h-4 w-4 text-primary shrink-0" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex-1">
          Log
        </span>
        <span className="text-[10px] text-muted-foreground">
          {entries.length} {entries.length === 1 ? "Eintrag" : "Eintraege"}
        </span>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        {entries.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground italic">
            Noch keine Eintraege. Quests abschliessen — sie wandern hierher.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <LogRow key={e.id} entry={e.data} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function LogRow({ entry }: { entry: LogEntryData }) {
  const date = new Date(entry.timestamp)
  const time =
    date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    }) +
    " · " +
    date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const Icon =
    entry.type === "quest_completed"
      ? CheckCircle2
      : entry.type === "item_earned"
      ? Trophy
      : entry.type === "level_up"
      ? Sparkles
      : Clock

  const iconColor =
    entry.type === "quest_completed"
      ? "#10B981"
      : entry.type === "item_earned"
      ? "#FBBF24"
      : entry.type === "level_up"
      ? "#A855F7"
      : "#94A3B8"

  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: iconColor }} />
      <div className="flex-1 min-w-0">
        <div className="font-medium leading-snug">{entry.summary}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{time}</div>
      </div>
    </div>
  )
}
