import { useMemo, useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
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
  INNERE_BEREICHE,
  SYNERGIES,
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
 * SkillTreeView — Karussell mit Two-Panel-Drill (AC-Odyssey-Style).
 *
 * Stand: 11.05.2026 (Polish-3 nach Timo-Feedback).
 *
 * Zwei Panels nebeneinander zeigen entweder:
 *   - **Bereich** (Header kompakt + Skills als Kreis-Grid)
 *   - **Skill-Detail** (Beschreibung, Level, Voraussetzungen, Sichtbarkeit)
 *
 * Klick auf Skill in LINKEM Panel → Skill-Detail erscheint im RECHTEN.
 * Klick auf Skill in RECHTEM Panel → Skill-Detail erscheint im LINKEN.
 * X auf einem Panel → es geht zurueck zu seinem Bereich-Zustand.
 *
 * Karussell-Pfeile rotieren beide Panels gemeinsam, wenn beide
 * Bereiche zeigen.
 *
 * Mobile: nur ein Panel sichtbar, immer das aktive (Detail bevorzugt).
 */

// ============================================================
// Hilfstypen
// ============================================================

interface RenderSkill {
  id: string
  data: SkillData
  isUniversal: boolean
}

type PanelState =
  | { kind: "bereich"; bereichIdx: number }
  | { kind: "skill"; bereichIdx: number; skillId: string }

// ============================================================
// Haupt-Component
// ============================================================

export function SkillTreeView({ activeGroup }: ModuleViewProps) {
  const spaceSlug = (activeGroup?.data as { slug?: string } | undefined)?.slug
  const { data, bereichXp, bereichProgress, skillXp, skillProgress, isUnlocked } = useUserProgress()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { seed, busy: seeding, status: seedStatus } = useGamificationSeed(spaceSlug)
  const { get: getVisibility, set: setVisibility } = useSkillVisibility()

  // Skills nach Bereich gruppieren
  const skillsByBereich = useMemo(() => {
    const map: Record<TreeBereichId, RenderSkill[]> = {} as Record<TreeBereichId, RenderSkill[]>
    for (const bereich of TREE_BEREICHE) map[bereich.id] = []

    for (const u of UNIVERSAL_SKILLS) {
      if (map[u.bereichId]) {
        const { id, ...data } = u
        map[u.bereichId].push({ id, data, isUniversal: true })
      }
    }
    for (const item of skillItems) {
      const sd = item.data as SkillData
      if (map[sd.bereichId]) {
        map[sd.bereichId].push({ id: item.id, data: sd, isUniversal: false })
      }
    }
    for (const bId of Object.keys(map) as TreeBereichId[]) {
      map[bId].sort((a, b) => {
        if (a.isUniversal !== b.isUniversal) return a.isUniversal ? -1 : 1
        return (a.data.order ?? 999) - (b.data.order ?? 999)
      })
    }
    return map
  }, [skillItems])

  // Header-Werte
  const totalXp = useMemo(
    () => Object.values(data.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [data.bereichXp]
  )
  const totalLevel = useMemo(() => progressInLevel(totalXp).level, [totalXp])

  const activeSynergies = useMemo(
    () => SYNERGIES.filter((syn) => syn.bereiche.every((b) => (data.bereichXp[b] ?? 0) > 0)),
    [data.bereichXp]
  )

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

  // Sind beide Panels im Bereich-Modus? Dann ist das Karussell aktiv.
  const carouselActive = leftPanel.kind === "bereich" && rightPanel.kind === "bereich"

  const handleSelectSkill = (side: "left" | "right", skillId: string, bereichIdx: number) => {
    // Klick links → Detail rechts; Klick rechts → Detail links
    const detail: PanelState = { kind: "skill", bereichIdx, skillId }
    if (side === "left") {
      setRightPanel(detail)
    } else {
      setLeftPanel(detail)
    }
  }

  const handleCloseSkill = (side: "left" | "right") => {
    // X auf Skill-Detail: Panel zurueck zu seinem Bereich
    if (side === "left" && leftPanel.kind === "skill") {
      setLeftPanel({ kind: "bereich", bereichIdx: leftPanel.bereichIdx })
    } else if (side === "right" && rightPanel.kind === "skill") {
      setRightPanel({ kind: "bereich", bereichIdx: rightPanel.bereichIdx })
    }
  }

  // Karussell-Navigation (nur wenn beide Panels Bereiche zeigen)
  const goPrev = () => {
    if (!carouselActive) return
    if (leftPanel.kind !== "bereich" || rightPanel.kind !== "bereich") return
    const newLeft = (leftPanel.bereichIdx - 2 + TREE_BEREICHE.length) % TREE_BEREICHE.length
    const newRight = (newLeft + 1) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: newLeft })
    setRightPanel({ kind: "bereich", bereichIdx: newRight })
  }
  const goNext = () => {
    if (!carouselActive) return
    if (leftPanel.kind !== "bereich" || rightPanel.kind !== "bereich") return
    const newLeft = (leftPanel.bereichIdx + 2) % TREE_BEREICHE.length
    const newRight = (newLeft + 1) % TREE_BEREICHE.length
    setLeftPanel({ kind: "bereich", bereichIdx: newLeft })
    setRightPanel({ kind: "bereich", bereichIdx: newRight })
  }

  // Mobile: nur ein Panel sichtbar — Detail-Panel hat Vorrang, sonst linkes
  const mobilePanel = isMobile
    ? leftPanel.kind === "skill"
      ? leftPanel
      : rightPanel.kind === "skill"
      ? rightPanel
      : leftPanel
    : null
  const mobileSide: "left" | "right" =
    mobilePanel === leftPanel ? "left" : "right"

  // Mobile-Karussell-Nav: schaltet leftPanel durch (rightPanel folgt)
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

  // Touch-Swipe-Geste fuer Karussell
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50 // px
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselActive) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    // Nur horizontal akzeptieren (groesser als vertikal)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx > 0) {
      // Wischen nach rechts → vorheriger Bereich
      isMobile ? mobilePrev() : goPrev()
    } else {
      // Wischen nach links → naechster Bereich
      isMobile ? mobileNext() : goNext()
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-3 space-y-3">
      {/* Kompakter Header */}
      <div className="flex items-center gap-3 flex-wrap px-2">
        <div
          className="w-10 h-10 rounded-full grid place-items-center text-sm font-bold text-white shadow"
          style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
        >
          {totalLevel}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">
            Level {totalLevel} ·{" "}
            <span className="text-muted-foreground font-normal">
              {totalXp.toLocaleString("de-DE")} XP
            </span>
          </div>
          {activeSynergies.length > 0 && (
            <div
              className="text-[10px] flex items-center gap-1 mt-0.5"
              title={activeSynergies.map((s) => s.name).join(", ")}
            >
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-purple-700 font-medium">
                {activeSynergies.length === 1
                  ? activeSynergies[0].name
                  : `${activeSynergies.length} Synergien aktiv`}
              </span>
            </div>
          )}
        </div>
        {seedStatus.skillsTodo > 0 && (
          <button
            type="button"
            onClick={seed}
            disabled={seeding}
            className="text-xs px-2 py-1 rounded border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {seeding ? "..." : `+${seedStatus.skillsTodo} ${seedStatus.manifestName}`}
          </button>
        )}
      </div>

      {/* Panel-Layout */}
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {isMobile && mobilePanel ? (
        // Mobile: ein Panel
        <Panel
          state={mobilePanel}
          side={mobileSide}
          skillsByBereich={skillsByBereich}
          bereichXp={bereichXp}
          bereichProgress={bereichProgress}
          skillXp={skillXp}
          skillProgress={skillProgress}
          isUnlocked={isUnlocked}
          getVisibility={getVisibility}
          setVisibility={setVisibility}
          onSelectSkill={(skillId, bereichIdx) =>
            handleSelectSkill(mobileSide, skillId, bereichIdx)
          }
          onClose={() => handleCloseSkill(mobileSide)}
        />
      ) : (
        // Desktop: zwei Panels nebeneinander
        <div className="grid grid-cols-2 gap-3">
          <Panel
            state={leftPanel}
            side="left"
            skillsByBereich={skillsByBereich}
            bereichXp={bereichXp}
            bereichProgress={bereichProgress}
            skillXp={skillXp}
            skillProgress={skillProgress}
            isUnlocked={isUnlocked}
            getVisibility={getVisibility}
            setVisibility={setVisibility}
            onSelectSkill={(skillId, bereichIdx) =>
              handleSelectSkill("left", skillId, bereichIdx)
            }
            onClose={() => handleCloseSkill("left")}
          />
          <Panel
            state={rightPanel}
            side="right"
            skillsByBereich={skillsByBereich}
            bereichXp={bereichXp}
            bereichProgress={bereichProgress}
            skillXp={skillXp}
            skillProgress={skillProgress}
            isUnlocked={isUnlocked}
            getVisibility={getVisibility}
            setVisibility={setVisibility}
            onSelectSkill={(skillId, bereichIdx) =>
              handleSelectSkill("right", skillId, bereichIdx)
            }
            onClose={() => handleCloseSkill("right")}
          />
        </div>
      )}
      </div>

      {/* Karussell-Navigation */}
      {carouselActive && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={isMobile ? mobilePrev : goPrev}
            className="h-9 w-9 rounded-full grid place-items-center border hover:bg-muted transition-colors"
            aria-label="Zurueck"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {TREE_BEREICHE.map((_, i) => {
              const leftIdx = leftPanel.kind === "bereich" ? leftPanel.bereichIdx : -1
              const rightIdx = rightPanel.kind === "bereich" ? rightPanel.bereichIdx : -1
              const active = i === leftIdx || (!isMobile && i === rightIdx)
              return (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    active ? "w-5 bg-primary" : "w-1.5 bg-muted"
                  }`}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={isMobile ? mobileNext : goNext}
            className="h-9 w-9 rounded-full grid place-items-center border hover:bg-muted transition-colors"
            aria-label="Weiter"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Panel — zeigt entweder Bereich oder Skill-Detail
// ============================================================

interface PanelProps {
  state: PanelState
  side: "left" | "right"
  skillsByBereich: Record<TreeBereichId, RenderSkill[]>
  bereichXp: (id: TreeBereichId) => number
  bereichProgress: (id: TreeBereichId) => ReturnType<typeof progressInLevel>
  skillXp: (id: string) => number
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  isUnlocked: (id: string) => { unlocked: boolean; missing: string[] }
  getVisibility: (id: string) => SkillVisibilityLevel | undefined
  setVisibility: (id: string, level: SkillVisibilityLevel | undefined) => Promise<void>
  onSelectSkill: (skillId: string, bereichIdx: number) => void
  onClose: () => void
}

function Panel({
  state,
  side,
  skillsByBereich,
  bereichXp,
  bereichProgress,
  skillXp,
  skillProgress,
  isUnlocked,
  getVisibility,
  setVisibility,
  onSelectSkill,
  onClose,
}: PanelProps) {
  const bereich = TREE_BEREICHE[state.bereichIdx]
  const Icon = bereich.icon as LucideIcon
  const skills = skillsByBereich[bereich.id]
  const isInner = INNERE_BEREICHE.includes(bereich.id)

  if (state.kind === "bereich") {
    return (
      <div
        className="rounded-xl border bg-card overflow-hidden flex flex-col"
        style={{ borderLeftWidth: 3, borderLeftColor: bereich.color }}
      >
        {/* Mini-Header — schlicht, kein XP, kein Level */}
        <div className="px-3 py-2 border-b flex items-center gap-2 bg-muted/20">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${bereich.color}18` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: bereich.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold truncate">{bereich.label}</h3>
              {isInner && (
                <span
                  className="text-[8px] uppercase tracking-wider text-purple-700"
                  title="Innerer Kreis — Teil des Inneren Dreiklangs"
                >
                  innen
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Skill-Kreis-Grid */}
        <div className="p-3 flex-1 overflow-y-auto">
          {skills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">
              Keine Skills in diesem Bereich.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {skills.map((skill) => (
                <SkillCircle
                  key={skill.id}
                  skill={skill}
                  bereichColor={bereich.color}
                  xp={skillXp(skill.id)}
                  progress={skillProgress(skill.id)}
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
  if (!skill) {
    return (
      <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground italic">
        Skill nicht gefunden
      </div>
    )
  }

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
// SkillCircle — Skill als kleiner Kreis im Bereich-Grid
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

/**
 * Mastery-Stufen — drei Schwellen, ob Skill "Anfang" (Lv 1-9),
 * "Geuebt" (Lv 10-49) oder "Meister" (Lv 50+).
 */
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
  onClick,
}: {
  skill: RenderSkill
  bereichColor: string
  xp: number
  progress: ReturnType<typeof progressInLevel>
  locked: boolean
  onClick: () => void
}) {
  const color = skill.data.color ?? bereichColor
  const activated = xp > 0
  const dots = masteryDots(progress.level)

  return (
    <button
      type="button"
      onClick={onClick}
      title={skill.data.description ?? skill.data.name}
      className="group flex flex-col items-center gap-1 transition-all"
    >
      <div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:shadow-md ${
          locked ? "opacity-50" : ""
        }`}
        style={{
          background: activated ? `${color}15` : "rgba(148,163,184,0.05)",
          borderColor: activated ? color : "rgba(148,163,184,0.3)",
          boxShadow: activated ? `0 0 10px ${color}30` : undefined,
        }}
      >
        {locked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : skill.data.icon ? (
          <DynamicIcon name={skill.data.icon} className="h-4 w-4 sm:h-5 sm:w-5" color={activated ? color : "#94A3B8"} />
        ) : (
          <Sparkles className="h-4 w-4" style={{ color: activated ? color : "#94A3B8" }} />
        )}
      </div>
      {/* AC-Style: drei Mastery-Punkte unter dem Kreis */}
      <div className="flex items-center gap-0.5 mt-0.5" aria-label={`Stufe ${dots} von 3`}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full transition-colors"
            style={{
              background: i <= dots ? color : "rgba(148,163,184,0.25)",
            }}
          />
        ))}
      </div>
      <div className="text-[9px] sm:text-[10px] font-medium text-center leading-tight max-w-[64px] truncate">
        {skill.data.name}
      </div>
    </button>
  )
}

// ============================================================
// SkillDetail — Skill-Detail-Panel
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
      className="rounded-xl border bg-card overflow-hidden flex flex-col"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      {/* Mini-Header mit X */}
      <div className="px-3 py-2 border-b flex items-center gap-2 bg-muted/20">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
          style={{
            background: `${color}18`,
            borderColor: color,
          }}
        >
          {unlock.unlocked ? (
            skill.data.icon ? (
              <DynamicIcon name={skill.data.icon} className="h-4 w-4" color={color} />
            ) : (
              <Sparkles className="h-4 w-4" style={{ color }} />
            )
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold truncate">{skill.data.name}</h3>
            {skill.isUniversal && (
              <span
                className="text-[8px] uppercase font-semibold tracking-wider px-1 py-0 rounded"
                style={{ background: "rgba(100,116,139,0.12)", color: "#475569" }}
              >
                universal
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground italic truncate">
            {bereich.label}
          </p>
        </div>
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
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Inhalt */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {skill.data.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {skill.data.description}
          </p>
        )}

        {/* Level + XP */}
        {unlock.unlocked ? (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{xp.toLocaleString("de-DE")} XP</span>
              <span>{progress.xpInLevel} / {progress.xpNeeded} zur naechsten</span>
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

        {/* Sichtbarkeit */}
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
