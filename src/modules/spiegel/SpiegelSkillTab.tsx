import { useMemo, useState, useEffect, useRef } from "react"
import {
  X,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Sparkles,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useItems } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import {
  TREE_BEREICHE,
  progressInLevel,
  useUserProgress,
  useGamificationSeed,
  useSkillVisibility,
  UNIVERSAL_SKILLS,
  GAMIFICATION_ITEM_TYPES,
  type SkillData,
  type SkillVisibilityLevel,
  type TreeBereich,
  type TreeBereichId,
} from "../gamification"

/**
 * SpiegelSkillTab — Skill-Tree im Spiegel.
 *
 * Aufbau aus Timos AC-Skizze:
 *   - Pfeile MITTIG, links und rechts der Panels (nicht unten)
 *   - Skill-Kreise kleiner, immer mittig ausgerichtet
 *   - Fenster fix in Hoehe, kein Scrollen-Erlebnis
 *   - Keine Erklaerungstexte unter den Panels
 *   - Synergien + Aelteste sind schon im SpiegelHeader
 *
 * Zwei Panels nebeneinander zeigen Bereiche bzw. Skill-Detail.
 * Klick links → Detail rechts. Klick rechts → Detail links.
 * X auf Detail-Panel → zurueck zur Bereich-Sicht.
 */

interface RenderSkill {
  id: string
  data: SkillData
  isUniversal: boolean
}

type PanelState =
  | { kind: "bereich"; bereichIdx: number }
  /** bereichIdx = Bereich, zu dem der Skill gehoert.
   *  returnBereichIdx = Bereich, der vor dem Skill-Klick in DIESEM Panel war. */
  | { kind: "skill"; bereichIdx: number; skillId: string; returnBereichIdx: number }

export interface SpiegelSkillTabProps extends ModuleViewProps {
  /** Optional callback fuer Pfeil-Navigation, damit die Buttons ausserhalb des Tabs leben */
  onNavReady?: (api: { prev: () => void; next: () => void; canPrev: boolean; canNext: boolean }) => void
}

export function SpiegelSkillTab({ activeGroup, onNavReady }: SpiegelSkillTabProps) {
  const spaceSlug = (activeGroup?.data as { slug?: string } | undefined)?.slug
  const { skillXp, skillProgress, isUnlocked } = useUserProgress()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { seed, busy: seeding, status: seedStatus } = useGamificationSeed(spaceSlug)
  const { get: getVisibility, set: setVisibility } = useSkillVisibility()

  // Skills nach Bereich gruppieren
  const skillsByBereich = useMemo(() => {
    const map: Record<TreeBereichId, RenderSkill[]> = {} as Record<TreeBereichId, RenderSkill[]>
    for (const bereich of TREE_BEREICHE) map[bereich.id] = []

    for (const u of UNIVERSAL_SKILLS) {
      if (!map[u.bereichId]) continue
      const { id, ...data } = u
      map[u.bereichId].push({ id, data, isUniversal: true })
    }
    for (const item of skillItems) {
      const sd = item.data as SkillData
      if (!map[sd.bereichId]) continue
      map[sd.bereichId].push({ id: item.id, data: sd, isUniversal: false })
    }
    for (const bId of Object.keys(map) as TreeBereichId[]) {
      map[bId].sort((a, b) => {
        if (a.isUniversal !== b.isUniversal) return a.isUniversal ? -1 : 1
        return (a.data.order ?? 999) - (b.data.order ?? 999)
      })
    }
    return map
  }, [skillItems])

  // Two-Panel-State
  const [leftPanel, setLeftPanel] = useState<PanelState>({ kind: "bereich", bereichIdx: 0 })
  const [rightPanel, setRightPanel] = useState<PanelState>({ kind: "bereich", bereichIdx: 1 })

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const carouselActive = leftPanel.kind === "bereich" && rightPanel.kind === "bereich"

  const handleSelectSkill = (side: "left" | "right", skillId: string, bereichIdx: number) => {
    // Klick links → Detail im RECHTEN Panel. Right merkt sich seinen vorigen Bereich.
    // Wenn das Detail-Panel schon Skill-State ist, bleibt sein urspruenglicher
    // returnBereichIdx erhalten — sonst wuerde der zum Bereich des Skills mutieren
    // und X-Close zeigte denselben Bereich wie das andere Panel (doppelt).
    if (side === "left") {
      setRightPanel({
        kind: "skill",
        bereichIdx,
        skillId,
        returnBereichIdx:
          rightPanel.kind === "bereich" ? rightPanel.bereichIdx : rightPanel.returnBereichIdx,
      })
    } else {
      setLeftPanel({
        kind: "skill",
        bereichIdx,
        skillId,
        returnBereichIdx:
          leftPanel.kind === "bereich" ? leftPanel.bereichIdx : leftPanel.returnBereichIdx,
      })
    }
  }

  const handleCloseSkill = (side: "left" | "right") => {
    // Schliessen kehrt zum vorher gezeigten Bereich des SELBEN Panels zurueck,
    // nicht zum Bereich des Skills (sonst doppelt).
    if (side === "left" && leftPanel.kind === "skill") {
      setLeftPanel({ kind: "bereich", bereichIdx: leftPanel.returnBereichIdx })
    } else if (side === "right" && rightPanel.kind === "skill") {
      setRightPanel({ kind: "bereich", bereichIdx: rightPanel.returnBereichIdx })
    }
  }

  // Skill-Navigation: rotiert durch die Skills desselben Bereichs (wrap-around)
  const skillNavPanel: { state: Extract<PanelState, { kind: "skill" }>; setter: typeof setLeftPanel } | null =
    leftPanel.kind === "skill"
      ? { state: leftPanel, setter: setLeftPanel }
      : rightPanel.kind === "skill"
      ? { state: rightPanel, setter: setRightPanel }
      : null

  const skillGoPrev = () => {
    if (!skillNavPanel) return
    const skills = skillsByBereich[TREE_BEREICHE[skillNavPanel.state.bereichIdx].id]
    if (!skills || skills.length === 0) return
    const idx = skills.findIndex((s) => s.id === skillNavPanel.state.skillId)
    const next = idx <= 0 ? skills[skills.length - 1] : skills[idx - 1]
    skillNavPanel.setter({ ...skillNavPanel.state, skillId: next.id })
  }

  const skillGoNext = () => {
    if (!skillNavPanel) return
    const skills = skillsByBereich[TREE_BEREICHE[skillNavPanel.state.bereichIdx].id]
    if (!skills || skills.length === 0) return
    const idx = skills.findIndex((s) => s.id === skillNavPanel.state.skillId)
    const next = idx >= skills.length - 1 ? skills[0] : skills[idx + 1]
    skillNavPanel.setter({ ...skillNavPanel.state, skillId: next.id })
  }

  const goPrev = () => {
    if (!carouselActive) return
    if (leftPanel.kind !== "bereich" || rightPanel.kind !== "bereich") return
    const newLeft = (leftPanel.bereichIdx - 2 + TREE_BEREICHE.length) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: newLeft })
    setRightPanel({ kind: "bereich", bereichIdx: (newLeft + 1) % TREE_BEREICHE.length })
  }
  const goNext = () => {
    if (!carouselActive) return
    if (leftPanel.kind !== "bereich" || rightPanel.kind !== "bereich") return
    const newLeft = (leftPanel.bereichIdx + 2) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: newLeft })
    setRightPanel({ kind: "bereich", bereichIdx: (newLeft + 1) % TREE_BEREICHE.length })
  }

  // Mobile-Navigation
  const mobileBereichIdx = leftPanel.kind === "bereich" ? leftPanel.bereichIdx : 0
  const mobilePrev = () => {
    const next = (mobileBereichIdx - 1 + TREE_BEREICHE.length) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: next })
    setRightPanel({ kind: "bereich", bereichIdx: (next + 1) % TREE_BEREICHE.length })
  }
  const mobileNext = () => {
    const next = (mobileBereichIdx + 1) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: next })
    setRightPanel({ kind: "bereich", bereichIdx: (next + 1) % TREE_BEREICHE.length })
  }

  // Touch-Swipe
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselActive && !skillNavPanel) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (skillNavPanel) {
      if (dx > 0) skillGoPrev()
      else skillGoNext()
    } else {
      if (dx > 0) (isMobile ? mobilePrev : goPrev)()
      else (isMobile ? mobileNext : goNext)()
    }
  }

  // Mobile: ein Panel sichtbar — Detail-Panel hat Vorrang
  const mobilePanel = isMobile
    ? leftPanel.kind === "skill"
      ? leftPanel
      : rightPanel.kind === "skill"
      ? rightPanel
      : leftPanel
    : null
  const mobileSide: "left" | "right" =
    mobilePanel === leftPanel ? "left" : "right"

  // Nav-API ans Parent durchreichen (Pfeile leben dort, ausserhalb)
  // Skill offen → durch die Skills des Bereichs rotieren.
  // Sonst → durch die Bereiche carouseln.
  useEffect(() => {
    if (!onNavReady) return
    if (skillNavPanel) {
      const skills = skillsByBereich[TREE_BEREICHE[skillNavPanel.state.bereichIdx].id]
      const canCycle = (skills?.length ?? 0) > 1
      onNavReady({
        prev: skillGoPrev,
        next: skillGoNext,
        canPrev: canCycle,
        canNext: canCycle,
      })
    } else {
      onNavReady({
        prev: isMobile ? mobilePrev : goPrev,
        next: isMobile ? mobileNext : goNext,
        canPrev: carouselActive || isMobile,
        canNext: carouselActive || isMobile,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavReady, isMobile, carouselActive, leftPanel, rightPanel, skillsByBereich])

  return (
    <div className="flex flex-col h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {seedStatus.skillsTodo > 0 && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={seed}
            disabled={seeding}
            className="text-[10px] px-2 py-1 rounded border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {seeding ? "..." : `+${seedStatus.skillsTodo} ${seedStatus.manifestName}`}
          </button>
        </div>
      )}

      {/* Two-Panel-Layout — gleiche Groesse, keine Pfeile (leben im Parent) */}
      <div
        className="flex-1 grid items-stretch gap-2 min-h-0"
        style={{
          gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)",
        }}
      >
        {isMobile && mobilePanel ? (
          <Panel
            state={mobilePanel}
            side={mobileSide}
            skillsByBereich={skillsByBereich}
            skillXp={skillXp}
            skillProgress={skillProgress}
            isUnlocked={isUnlocked}
            getVisibility={getVisibility}
            setVisibility={setVisibility}
            activeSkillId={skillNavPanel?.state.skillId ?? null}
            activeSkillBereichIdx={skillNavPanel?.state.bereichIdx ?? null}
            onSelectSkill={(skillId, bereichIdx) => handleSelectSkill(mobileSide, skillId, bereichIdx)}
            onClose={() => handleCloseSkill(mobileSide)}
          />
        ) : (
          <>
            <Panel
              state={leftPanel}
              side="left"
              skillsByBereich={skillsByBereich}
              skillXp={skillXp}
              skillProgress={skillProgress}
              isUnlocked={isUnlocked}
              getVisibility={getVisibility}
              setVisibility={setVisibility}
              activeSkillId={skillNavPanel?.state.skillId ?? null}
              activeSkillBereichIdx={skillNavPanel?.state.bereichIdx ?? null}
              onSelectSkill={(skillId, bereichIdx) => handleSelectSkill("left", skillId, bereichIdx)}
              onClose={() => handleCloseSkill("left")}
            />
            <Panel
              state={rightPanel}
              side="right"
              skillsByBereich={skillsByBereich}
              skillXp={skillXp}
              skillProgress={skillProgress}
              isUnlocked={isUnlocked}
              getVisibility={getVisibility}
              setVisibility={setVisibility}
              activeSkillId={skillNavPanel?.state.skillId ?? null}
              activeSkillBereichIdx={skillNavPanel?.state.bereichIdx ?? null}
              onSelectSkill={(skillId, bereichIdx) => handleSelectSkill("right", skillId, bereichIdx)}
              onClose={() => handleCloseSkill("right")}
            />
          </>
        )}
      </div>

      {/* Indikator-Punkte unten */}
      {carouselActive && (
        <div className="flex justify-center gap-1.5 pt-2">
          {TREE_BEREICHE.map((_, i) => {
            const leftIdx = leftPanel.kind === "bereich" ? leftPanel.bereichIdx : -1
            const rightIdx = rightPanel.kind === "bereich" ? rightPanel.bereichIdx : -1
            const active = i === leftIdx || (!isMobile && i === rightIdx)
            return (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${active ? "w-4 bg-primary" : "w-1 bg-muted"}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Panel — Bereich (mit Skill-Grid) oder Skill-Detail
// ============================================================

function Panel({
  state,
  side,
  skillsByBereich,
  skillXp,
  skillProgress,
  isUnlocked,
  getVisibility,
  setVisibility,
  activeSkillId,
  activeSkillBereichIdx,
  onSelectSkill,
  onClose,
}: {
  state: PanelState
  side: "left" | "right"
  skillsByBereich: Record<TreeBereichId, RenderSkill[]>
  skillXp: (id: string) => number
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  isUnlocked: (id: string) => { unlocked: boolean; missing: string[] }
  getVisibility: (id: string) => SkillVisibilityLevel | undefined
  setVisibility: (id: string, level: SkillVisibilityLevel | undefined) => Promise<void>
  activeSkillId: string | null
  activeSkillBereichIdx: number | null
  onSelectSkill: (skillId: string, bereichIdx: number) => void
  onClose: () => void
}) {
  const bereich = TREE_BEREICHE[state.bereichIdx]
  const Icon = bereich.icon as LucideIcon
  const skills = skillsByBereich[bereich.id]

  if (state.kind === "bereich") {
    // Nur markieren, wenn der aktive Skill auch zu diesem Bereich gehoert
    const showActive = activeSkillBereichIdx === state.bereichIdx
    return (
      <div
        className="rounded-xl border bg-card overflow-hidden flex flex-col h-full"
        style={{ borderLeftWidth: 3, borderLeftColor: bereich.color }}
      >
        <div className="px-2.5 py-1.5 border-b bg-muted/20 flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${bereich.color}18` }}
          >
            <Icon className="h-3 w-3" style={{ color: bereich.color }} />
          </div>
          <span className="text-xs font-semibold truncate flex-1">{bereich.label}</span>
        </div>

        <div className="p-3 flex-1 overflow-y-auto flex items-center justify-center">
          {skills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Keine Skills im Bereich.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-full">
              {skills.map((skill) => (
                <SkillCircle
                  key={skill.id}
                  skill={skill}
                  bereichColor={bereich.color}
                  xp={skillXp(skill.id)}
                  progress={skillProgress(skill.id)}
                  isActive={showActive && activeSkillId === skill.id}
                  locked={!isUnlocked(skill.id).unlocked}
                  onClick={() => onSelectSkill(skill.id, state.bereichIdx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Skill-Detail
  const skill = skills.find((s) => s.id === state.skillId)
  if (!skill) return null

  return (
    <SkillDetail
      bereich={bereich}
      skill={skill}
      xp={skillXp(skill.id)}
      progress={skillProgress(skill.id)}
      unlock={isUnlocked(skill.id)}
      visibility={getVisibility(skill.id)}
      onVisibilityChange={(level) => setVisibility(skill.id, level)}
      onClose={onClose}
    />
  )
}

// ============================================================
// DynamicIcon + SkillCircle (kleiner Variante)
// ============================================================

function DynamicIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
  const iconKey = useMemo(() => {
    return name
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  }, [name])
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconKey] ?? Sparkles
  return <Icon className={className} style={color ? { color } : undefined} />
}

function masteryDots(level: number): 0 | 1 | 2 | 3 {
  if (level <= 0) return 0
  if (level < 10) return 1
  if (level < 50) return 2
  return 3
}

function SkillCircle({
  skill,
  bereichColor,
  xp,
  progress,
  locked,
  isActive,
  onClick,
}: {
  skill: RenderSkill
  bereichColor: string
  xp: number
  progress: ReturnType<typeof progressInLevel>
  locked: boolean
  isActive?: boolean
  onClick: () => void
}) {
  const color = skill.data.color ?? bereichColor
  const activated = xp > 0
  const level = progress.level

  // Skill-Kreise wachsen leicht mit dem Level — organisches Bild, nicht alle gleich
  const size = level >= 50 ? 52 : level >= 10 ? 46 : 40
  const stroke = 3
  const r = size / 2 - stroke / 2
  const circumference = 2 * Math.PI * r
  const progressOffset = circumference * (1 - Math.min(1, Math.max(0, progress.ratio)))

  return (
    <button
      type="button"
      onClick={onClick}
      title={skill.data.description ?? skill.data.name}
      className={`group flex flex-col items-center gap-0.5 transition-all ${
        locked ? "opacity-50" : ""
      } ${isActive ? "scale-110" : ""}`}
    >
      <div
        className="relative transition-transform group-hover:scale-110"
        style={{
          width: size,
          height: size,
          filter: isActive ? `drop-shadow(0 0 8px ${color})` : undefined,
        }}
      >
        {/* Progress-Ring + Hintergrund */}
        <svg width={size} height={size} className="absolute inset-0">
          {/* Hintergrund-Kreis */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill={activated ? `${color}15` : "rgba(148,163,184,0.05)"}
            stroke={activated ? `${color}30` : "rgba(148,163,184,0.25)"}
            strokeWidth={stroke}
          />
          {/* Fortschritts-Bogen (von oben startend) */}
          {activated && progress.ratio > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{
                filter: level >= 50 ? `drop-shadow(0 0 4px ${color})` : undefined,
              }}
            />
          )}
        </svg>

        {/* Icon zentriert */}
        <div className="absolute inset-0 flex items-center justify-center">
          {locked ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : skill.data.icon ? (
            <DynamicIcon
              name={skill.data.icon}
              className={`${size >= 50 ? "h-5 w-5" : "h-4 w-4"}`}
              color={activated ? color : "#94A3B8"}
            />
          ) : (
            <Sparkles
              className="h-4 w-4"
              style={{ color: activated ? color : "#94A3B8" }}
            />
          )}
        </div>

        {/* Level-Zahl unten in der Mitte */}
        {level > 0 && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 min-w-[16px] h-[14px] px-1 rounded text-[9px] font-bold text-white grid place-items-center shadow"
            style={{ background: color }}
          >
            {level}
          </div>
        )}
      </div>

      <div className="text-[8px] font-medium text-center leading-tight max-w-[60px] truncate mt-1">
        {skill.data.name}
      </div>
    </button>
  )
}

// ============================================================
// SkillDetail
// ============================================================

function SkillDetail({
  bereich,
  skill,
  xp,
  progress,
  unlock,
  visibility,
  onVisibilityChange,
  onClose,
}: {
  bereich: TreeBereich
  skill: RenderSkill
  xp: number
  progress: ReturnType<typeof progressInLevel>
  unlock: { unlocked: boolean; missing: string[] }
  visibility: SkillVisibilityLevel | undefined
  onVisibilityChange: (level: SkillVisibilityLevel | undefined) => Promise<void>
  onClose: () => void
}) {
  const color = skill.data.color ?? bereich.color

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden flex flex-col h-full"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="px-2.5 py-1.5 border-b bg-muted/20 flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
          style={{ background: `${color}18`, borderColor: color }}
        >
          {unlock.unlocked ? (
            skill.data.icon ? (
              <DynamicIcon name={skill.data.icon} className="h-3 w-3" color={color} />
            ) : (
              <Sparkles className="h-3 w-3" style={{ color }} />
            )
          ) : (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <span className="text-xs font-semibold truncate flex-1">{skill.data.name}</span>
        {progress.level > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: `${color}18`, color }}
          >
            Lv {progress.level}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {skill.data.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {skill.data.description}
          </p>
        )}

        {unlock.unlocked ? (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{xp.toLocaleString("de-DE")} XP</span>
              <span>{progress.xpInLevel} / {progress.xpNeeded}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, progress.ratio * 100)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-2 rounded bg-muted/40 border border-dashed text-[11px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Gesperrt</span>
            </div>
            <p className="text-muted-foreground">
              Oeffnet sich mit: <strong>{unlock.missing.join(", ")}</strong>
            </p>
          </div>
        )}

        {unlock.unlocked && (
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Sichtbarkeit
            </p>
            <div className="flex flex-wrap gap-1">
              <VisibilityChip
                label="Profil"
                active={visibility === undefined}
                icon={Eye}
                color="#94A3B8"
                onClick={() => onVisibilityChange(undefined)}
              />
              <VisibilityChip
                label="Oeffentlich"
                active={visibility === "public"}
                icon={Globe}
                color="#10B981"
                onClick={() => onVisibilityChange("public")}
              />
              <VisibilityChip
                label="Netzwerk"
                active={visibility === "network"}
                icon={UsersRound}
                color="#3B82F6"
                onClick={() => onVisibilityChange("network")}
              />
              <VisibilityChip
                label="Kreis"
                active={visibility === "circle"}
                icon={Users}
                color="#A855F7"
                onClick={() => onVisibilityChange("circle")}
              />
              <VisibilityChip
                label="Privat"
                active={visibility === "private"}
                icon={EyeOff}
                color="#94A3B8"
                onClick={() => onVisibilityChange("private")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VisibilityChip({
  label,
  active,
  icon: Icon,
  color,
  onClick,
}: {
  label: string
  active: boolean
  icon: LucideIcon
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
        active
          ? "border-transparent text-white font-semibold"
          : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
      }`}
      style={active ? { background: color } : {}}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </button>
  )
}
