import { useMemo } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  TREE_BEREICHE,
  INNERE_BEREICHE,
  progressInLevel,
  useUserProgress,
  type TreeBereichId,
} from "../../gamification"

/**
 * TreeWidget — kompakte Sicht auf die 7 Bereiche.
 * Klick auf einen Bereich oder den Header springt zum Skill-Tree-Modul.
 */
export function TreeWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { data, bereichXp, bereichProgress } = useUserProgress()

  const totalXp = useMemo(
    () => Object.values(data.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [data.bereichXp]
  )
  const totalProgress = progressInLevel(totalXp)

  const synergyActive = useMemo(
    () => INNERE_BEREICHE.every((b) => (data.bereichXp[b] ?? 0) > 0),
    [data.bereichXp]
  )

  const goTree = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/skill-tree`)
  }

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      {/* Header */}
      <button
        type="button"
        onClick={goTree}
        disabled={!spaceSlug}
        className="flex items-center justify-between mb-3 text-left group disabled:cursor-default"
      >
        <div>
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Faehigkeitenbaum
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="text-lg font-bold">Level {totalProgress.level}</h3>
            {synergyActive && <Sparkles className="h-4 w-4 text-purple-500" />}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 7 Bereiche kompakt */}
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {TREE_BEREICHE.map((bereich) => {
          const xp = bereichXp(bereich.id as TreeBereichId)
          const prog = bereichProgress(bereich.id as TreeBereichId)
          const Icon = bereich.icon
          return (
            <div key={bereich.id} className="flex items-center gap-2 text-xs">
              <Icon className="h-3 w-3 shrink-0" style={{ color: bereich.color }} />
              <span className="font-medium w-20 truncate">{bereich.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, prog.ratio * 100)}%`,
                    background: bereich.color,
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold tabular-nums w-10 text-right" style={{ color: bereich.color }}>
                Lv {prog.level}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t flex justify-between">
        <span>{totalXp.toLocaleString("de-DE")} XP gesamt</span>
        <span>{totalProgress.xpInLevel} / {totalProgress.xpNeeded} zum naechsten</span>
      </div>
    </div>
  )
}
