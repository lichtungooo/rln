import { useMemo, useState } from "react"
import { Sparkles, ChevronUp, ChevronDown, Crown, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserProgress } from "./use-progress"
import { useReputation, trustLabel } from "./use-reputation"
import { useElderStatus } from "../profile/use-elder-status"
import {
  TREE_BEREICHE,
  SYNERGIES,
  progressInLevel,
  type TreeBereichId,
} from "./tree"

/**
 * HudBar — schwebender Status oben rechts.
 *
 * Zeigt Total-Level + XP-Balken zum naechsten Level. Klick aufs Level
 * springt in den Skill-Tree. Klick auf den Pfeil expandiert die Liste
 * aller 8 Bereiche mit ihren Levels und Mini-Balken.
 *
 * Aelteste tragen ein Crown-Marker im Compact-Bar (Phase F10).
 * Mehrere aktive Synergien werden mit Zahl angezeigt (Phase Polish).
 *
 * Wird in MacherApp eingebunden — als fixed Position oben rechts unter
 * der Navbar, nicht innerhalb eines Moduls. Mobile: ausgeblendet
 * (Mobile-Nutzer sehen Bereiche im Skill-Tree-Modul direkt).
 */
export interface HudBarProps {
  /** Slug des aktiven Space — fuer Navigation zum Skill-Tree */
  spaceSlug: string | null
  /** Welches Modul ist gerade offen — wenn skill-tree, blende HUD aus */
  currentModule: string
}

export function HudBar({ spaceSlug, currentModule }: HudBarProps) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const { data, bereichXp, bereichProgress } = useUserProgress()
  const reputation = useReputation()
  const elder = useElderStatus()

  const totalXp = useMemo(
    () => Object.values(data.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [data.bereichXp]
  )
  const totalProgress = progressInLevel(totalXp)

  const activeSynergyCount = useMemo(
    () =>
      SYNERGIES.filter((syn) =>
        syn.bereiche.every((b) => (data.bereichXp[b] ?? 0) > 0)
      ).length,
    [data.bereichXp]
  )

  const goToTree = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/skill-tree`)
  }

  // Wenn schon im Skill-Tree oder Spiegel → HUD ausblenden (vermeidet doppelte Info)
  if (currentModule === "skill-tree" || currentModule === "spiegel") return null

  // Wenn null XP UND null Trust — HUD ausblenden, gibt nix zu zeigen
  if (totalXp === 0 && reputation.trustScore === 0) return null

  return (
    <div className="hidden md:block fixed top-20 right-4 z-40">
      <div className="bg-background/95 backdrop-blur shadow-lg border rounded-xl overflow-hidden">
        {/* Compact-Bar */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          {/* Level-Kreis */}
          <div className="w-9 h-9 rounded-full grid place-items-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}>
            {totalProgress.level}
          </div>

          <div className="text-left min-w-[80px]">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">
              Level
            </div>
            <div className="text-sm font-bold leading-tight">
              {totalXp.toLocaleString("de-DE")} XP
            </div>
          </div>

          {elder.isElder && (
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          )}

          {activeSynergyCount > 0 && (
            <div className="flex items-center gap-0.5 shrink-0" title={`${activeSynergyCount} Synergien aktiv`}>
              <Sparkles className="h-4 w-4 text-purple-500" />
              {activeSynergyCount > 1 && (
                <span className="text-[10px] font-bold text-purple-500">
                  {activeSynergyCount}
                </span>
              )}
            </div>
          )}

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* XP-Balken + Trust-Balken nebeneinander */}
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          {/* XP */}
          <div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, totalProgress.ratio * 100)}%`,
                  background: "linear-gradient(90deg, #E8751A, #FBBF24)",
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>Lv {totalProgress.level}</span>
              <span>{totalProgress.xpInLevel} / {totalProgress.xpNeeded}</span>
            </div>
          </div>
          {/* Trust */}
          <div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (reputation.trustScore / 30) * 100)}%`,
                  background: "linear-gradient(90deg, #A855F7, #C084FC)",
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="h-2.5 w-2.5 text-purple-600" />
                {trustLabel(reputation.trustScore)}
              </span>
              <span>{reputation.trustScore}</span>
            </div>
          </div>
        </div>

        {/* Expanded: 8 Bereiche */}
        {expanded && (
          <div className="border-t bg-muted/10 p-2 space-y-1.5 max-h-80 overflow-y-auto w-64">
            {TREE_BEREICHE.map((bereich) => {
              const xp = bereichXp(bereich.id as TreeBereichId)
              const prog = bereichProgress(bereich.id as TreeBereichId)
              const Icon = bereich.icon
              return (
                <div key={bereich.id} className="px-1.5 py-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className="h-3 w-3 shrink-0" style={{ color: bereich.color }} />
                    <span className="text-xs font-medium flex-1 truncate">{bereich.label}</span>
                    <span className="text-[10px] font-semibold" style={{ color: bereich.color }}>
                      Lv {prog.level}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {xp}xp
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, prog.ratio * 100)}%`,
                        background: bereich.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={goToTree}
              disabled={!spaceSlug}
              className="w-full mt-1.5 px-3 py-1.5 text-xs font-semibold rounded text-white transition-colors disabled:opacity-50"
              style={{ background: "#E8751A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#C4620A")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#E8751A")}
            >
              Skill-Tree oeffnen →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
