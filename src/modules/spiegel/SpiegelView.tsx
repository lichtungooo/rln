import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  User,
  Trophy,
  Network,
  ShieldCheck,
  Crown,
  Sparkles,
} from "lucide-react"
import type { ModuleViewProps } from "../registry"
import {
  useUserProgress,
  useReputation,
  SYNERGIES,
  progressInLevel,
  trustLabel,
} from "../gamification"
import { useElderStatus } from "../profile/use-elder-status"
import { SpiegelAvatarTab } from "./SpiegelAvatarTab"
import { SpiegelQuestTab } from "./SpiegelQuestTab"
import { SpiegelSkillTab } from "./SpiegelSkillTab"

/**
 * SpiegelView — drei Linsen auf den Menschen in einem Modul.
 *
 * Layout nach Timo-Skizze:
 *   Top-Hero: [Avatar][Quest][Skill]  |  XP-Balken  |  Trust-Balken
 *   Container: gleiche Groesse fuer alle drei Tabs
 *   Pfeile bei Skill: AUSSERHALB des Containers, links und rechts mittig
 */

export type SpiegelTab = "avatar" | "quest" | "skill"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { config } = props
  const [tab, setTab] = useState<SpiegelTab>(config?.defaultTab ?? "skill")

  // Bridge-State: SkillTab kommuniziert ueber callbacks
  const [skillNavApi, setSkillNavApi] = useState<{ prev: () => void; next: () => void; canPrev: boolean; canNext: boolean } | null>(null)

  return (
    <div className="flex flex-col h-full">
      <SpiegelHero tab={tab} onTabChange={setTab} />

      {/* Container-Wrapper mit Pfeilen aussen */}
      <div className="flex-1 flex items-stretch min-h-0 px-2 sm:px-4 py-3 gap-2 sm:gap-3">
        {/* Pfeil links — nur bei Skill */}
        <div className="flex items-center shrink-0">
          {tab === "skill" && skillNavApi ? (
            <button
              type="button"
              onClick={skillNavApi.prev}
              disabled={!skillNavApi.canPrev}
              className="h-12 w-12 rounded-full grid place-items-center border bg-card hover:bg-muted disabled:opacity-30 transition-colors shadow-md"
              aria-label="Zurueck"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-12 hidden sm:block" />
          )}
        </div>

        {/* Inhalts-Container — gleiche Hoehe und Breite fuer alle Tabs */}
        <div className="flex-1 flex flex-col min-w-0">
          {tab === "avatar" && <SpiegelAvatarTab {...props} />}
          {tab === "quest" && <SpiegelQuestTab {...props} />}
          {tab === "skill" && (
            <SpiegelSkillTab {...props} onNavReady={setSkillNavApi} />
          )}
        </div>

        {/* Pfeil rechts — nur bei Skill */}
        <div className="flex items-center shrink-0">
          {tab === "skill" && skillNavApi ? (
            <button
              type="button"
              onClick={skillNavApi.next}
              disabled={!skillNavApi.canNext}
              className="h-12 w-12 rounded-full grid place-items-center border bg-card hover:bg-muted disabled:opacity-30 transition-colors shadow-md"
              aria-label="Weiter"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-12 hidden sm:block" />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SpiegelHero — Tab-Buttons + XP + Trust in einer Zeile
// ============================================================

function SpiegelHero({
  tab,
  onTabChange,
}: {
  tab: SpiegelTab
  onTabChange: (t: SpiegelTab) => void
}) {
  const { data: progress } = useUserProgress()
  const reputation = useReputation()
  const elder = useElderStatus()

  const totalXp = useMemo(
    () => Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [progress.bereichXp]
  )
  const totalProgress = useMemo(() => progressInLevel(totalXp), [totalXp])

  const activeSynergyCount = useMemo(
    () =>
      SYNERGIES.filter((syn) =>
        syn.bereiche.every((b) => (progress.bereichXp[b] ?? 0) > 0)
      ).length,
    [progress.bereichXp]
  )

  return (
    <div
      className="border-b px-3 sm:px-4 py-2 flex items-center gap-3 flex-wrap"
      style={{
        background:
          "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(251,191,36,0.04) 50%, rgba(168,85,247,0.04) 100%)",
      }}
    >
      {/* Tab-Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <TabButton icon={User} label="Avatar" active={tab === "avatar"} onClick={() => onTabChange("avatar")} />
        <TabButton icon={Trophy} label="Quest" active={tab === "quest"} onClick={() => onTabChange("quest")} />
        <TabButton icon={Network} label="Skill" active={tab === "skill"} onClick={() => onTabChange("skill")} />
      </div>

      <div className="flex-1" />

      {/* XP-Balken kompakt */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div
          className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white shadow shrink-0"
          style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
        >
          {totalProgress.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, totalProgress.ratio * 100)}%`,
                background: "linear-gradient(90deg, #E8751A, #FBBF24)",
              }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">
            {totalXp.toLocaleString("de-DE")} XP
          </div>
        </div>
      </div>

      {/* Trust-Balken kompakt */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (reputation.trustScore / 30) * 100)}%`,
                background: "linear-gradient(90deg, #A855F7, #C084FC)",
              }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">
            {trustLabel(reputation.trustScore)} {reputation.trustScore}
          </div>
        </div>
      </div>

      {/* Marker rechts */}
      <div className="flex items-center gap-1 shrink-0">
        {elder.isElder && <Crown className="h-4 w-4 text-amber-500" aria-label="Aelteste" />}
        {activeSynergyCount > 0 && (
          <div className="flex items-center gap-0.5" title={`${activeSynergyCount} Synergien aktiv`}>
            <Sparkles className="h-4 w-4 text-purple-500" />
            {activeSynergyCount > 1 && (
              <span className="text-[10px] font-bold text-purple-500">
                {activeSynergyCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof User
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md transition-colors ${
        active
          ? "bg-foreground text-background font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
