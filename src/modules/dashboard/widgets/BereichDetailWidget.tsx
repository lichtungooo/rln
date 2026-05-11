import { useMemo } from "react"
import { Network, Sparkles, X } from "lucide-react"
import { useChannel } from "../../../components/SelectionContext"
import {
  TREE_BEREICHE,
  BEREICH_BY_ID,
  UNIVERSAL_SKILLS,
  useUserProgress,
  type TreeBereich,
  type TreeBereichId,
} from "../../gamification"

/**
 * BereichDetailWidget — zeigt den aktuell selektierten Bereich aus dem
 * "bereich"-Channel. Zeigt Lv + XP + Top-Skills im Bereich.
 */
export function BereichDetailWidget() {
  const { selected, select } = useChannel<TreeBereich>("bereich")
  const { bereichXp, bereichProgress, skillXp, skillProgress } = useUserProgress()

  const bereichInfo = useMemo(() => {
    if (!selected) return null
    return BEREICH_BY_ID[selected.id as TreeBereichId] ?? null
  }, [selected])

  const topSkills = useMemo(() => {
    if (!selected) return []
    return UNIVERSAL_SKILLS.filter((s) => s.bereichId === selected.id)
      .map((s) => ({
        skill: s,
        xp: skillXp(s.id),
        prog: skillProgress(s.id),
      }))
      .filter((row) => row.xp > 0)
      .sort((a, b) => b.prog.level - a.prog.level)
      .slice(0, 5)
  }, [selected, skillXp, skillProgress])

  if (!selected || !bereichInfo) {
    return (
      <div className="h-full w-full bg-card border rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <Network className="h-6 w-6 opacity-40" />
        <p>Bereich-Detail</p>
        <p className="text-[10px]">
          Klick auf einen Bereich im Faehigkeitenbaum — er erscheint hier.
        </p>
      </div>
    )
  }

  const xp = bereichXp(selected.id as TreeBereichId)
  const prog = bereichProgress(selected.id as TreeBereichId)
  const Icon = bereichInfo.icon

  return (
    <div className="h-full w-full bg-card border rounded-xl flex flex-col overflow-hidden">
      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{ background: `${bereichInfo.color}10` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: bereichInfo.color }} />
        <span className="text-sm font-semibold truncate flex-1">{bereichInfo.label}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: `${bereichInfo.color}20`, color: bereichInfo.color }}
        >
          Lv {prog.level}
        </span>
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
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>{xp.toLocaleString("de-DE")} XP</span>
            <span>
              {prog.xpInLevel} / {prog.xpNeeded} zum naechsten
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, prog.ratio * 100)}%`,
                background: bereichInfo.color,
              }}
            />
          </div>
        </div>

        {topSkills.length > 0 ? (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              Top-Skills
            </div>
            <div className="space-y-1.5">
              {topSkills.map((row) => (
                <div key={row.skill.id} className="flex items-center gap-2 text-xs">
                  <Sparkles
                    className="h-3 w-3 shrink-0"
                    style={{ color: bereichInfo.color }}
                  />
                  <span className="flex-1 truncate">{row.skill.name}</span>
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: bereichInfo.color }}
                  >
                    Lv {row.prog.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Noch keine aktivierten Skills in {bereichInfo.label}.
          </p>
        )}
      </div>
    </div>
  )
}

// Wir brauchen TREE_BEREICHE als Channel-Items in TreeWidget — Re-export
// fuer einfacheren Import dort. Optional.
export { TREE_BEREICHE }
