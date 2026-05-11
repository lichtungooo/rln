import { useMemo, useState } from "react"
import { Sparkles, User, Trophy, Network, ShieldCheck, Crown } from "lucide-react"
import type { ModuleViewProps } from "../registry"
import {
  useUserProgress,
  useReputation,
  SYNERGIES,
  progressInLevel,
  trustLabel,
} from "../gamification"
import { useElderStatus } from "../profile/use-elder-status"
import { AvatarView } from "../avatar/AvatarView"
import { QuestView } from "../quest/QuestView"
import { SkillTreeView } from "../skill-tree/SkillTreeView"

/**
 * SpiegelView — der Charakter-Spiegel des Real-Life-Rollenspiels.
 *
 * Vereint Avatar, Quest und Skill-Tree zu einem Modul mit drei Tabs.
 * Drei Linsen auf denselben Menschen:
 *   - **Avatar** — wer du bist (sichtbar)
 *   - **Quest** — was du tust (in Bewegung)
 *   - **Skill** — was du kannst (das Feld)
 *
 * Header oben: kompakter Status-Streifen mit Level/XP und Trust-Score.
 * Tabs darunter wie AC: Module unten klar getrennt.
 *
 * Phase: Push-1 = Skelett. Tabs delegieren erstmal an die bestehenden
 * Modul-Views. In Folge-Pushes ersetzt durch eigene Two-Panel-Layouts
 * mit mittiger Karussell-Navigation.
 */

export type SpiegelTab = "avatar" | "quest" | "skill"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

const TAB_DEFS: Array<{ id: SpiegelTab; label: string; icon: typeof User }> = [
  { id: "avatar", label: "Avatar", icon: User },
  { id: "quest", label: "Quest", icon: Trophy },
  { id: "skill", label: "Skill", icon: Network },
]

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { config } = props
  const [tab, setTab] = useState<SpiegelTab>(config?.defaultTab ?? "skill")

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
    <div className="flex flex-col h-full">
      {/* Status-Streifen oben */}
      <SpiegelHeader
        level={totalProgress.level}
        xp={totalXp}
        xpRatio={totalProgress.ratio}
        xpInLevel={totalProgress.xpInLevel}
        xpNeeded={totalProgress.xpNeeded}
        trustScore={reputation.trustScore}
        trustLabel={trustLabel(reputation.trustScore)}
        isElder={elder.isElder}
        activeSynergyCount={activeSynergyCount}
      />

      {/* Tab-Navigation */}
      <SpiegelTabs tab={tab} onChange={setTab} />

      {/* Tab-Inhalt */}
      <div className="flex-1 overflow-auto">
        {tab === "avatar" && <AvatarView {...props} />}
        {tab === "quest" && <QuestView {...(props as ModuleViewProps<unknown>)} />}
        {tab === "skill" && <SkillTreeView {...props} />}
      </div>
    </div>
  )
}

// ============================================================
// SpiegelHeader — Status-Streifen mit Level + Trust
// ============================================================

function SpiegelHeader({
  level,
  xp,
  xpRatio,
  xpInLevel,
  xpNeeded,
  trustScore,
  trustLabel: trustLabelText,
  isElder,
  activeSynergyCount,
}: {
  level: number
  xp: number
  xpRatio: number
  xpInLevel: number
  xpNeeded: number
  trustScore: number
  trustLabel: string
  isElder: boolean
  activeSynergyCount: number
}) {
  return (
    <div
      className="border-b px-4 py-2.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,117,26,0.04) 0%, rgba(251,191,36,0.04) 50%, rgba(168,85,247,0.04) 100%)",
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Level-Kreis */}
        <div
          className="w-9 h-9 rounded-full grid place-items-center text-sm font-bold text-white shadow shrink-0"
          style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
        >
          {level}
        </div>

        {/* XP-Balken */}
        <div className="flex-1 min-w-[140px] max-w-[260px]">
          <div className="flex items-baseline justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>Lv {level}</span>
            <span className="font-mono">
              {xpInLevel}/{xpNeeded}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, xpRatio * 100)}%`,
                background: "linear-gradient(90deg, #E8751A, #FBBF24)",
              }}
            />
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
          {xp.toLocaleString("de-DE")} XP
        </span>

        {/* Trenner */}
        <div className="hidden md:block h-6 w-px bg-border" />

        {/* Trust-Balken */}
        <div className="flex items-center gap-1.5 min-w-[140px]">
          <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>{trustLabelText}</span>
              <span className="font-mono">{trustScore}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (trustScore / 30) * 100)}%`,
                  background: "linear-gradient(90deg, #A855F7, #C084FC)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Marker rechts */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isElder && (
            <Crown className="h-4 w-4 text-amber-500" aria-label="Aelteste" />
          )}
          {activeSynergyCount > 0 && (
            <div
              className="flex items-center gap-0.5"
              title={`${activeSynergyCount} Synergien aktiv`}
            >
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
    </div>
  )
}

// ============================================================
// SpiegelTabs — drei Tabs zentral
// ============================================================

function SpiegelTabs({
  tab,
  onChange,
}: {
  tab: SpiegelTab
  onChange: (t: SpiegelTab) => void
}) {
  return (
    <div className="border-b px-4 flex items-center gap-1 overflow-x-auto">
      {TAB_DEFS.map((def) => {
        const Icon = def.icon
        const active = tab === def.id
        return (
          <button
            key={def.id}
            type="button"
            onClick={() => onChange(def.id)}
            className={`shrink-0 px-3 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {def.label}
          </button>
        )
      })}
    </div>
  )
}
