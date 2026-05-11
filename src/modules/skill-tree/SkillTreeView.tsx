import { useMemo, useState, useEffect } from "react"
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
import {
  Card,
  CardContent,
  Button,
  useItems,
} from "@real-life-stack/toolkit"
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
 * SkillTreeView — Karussell-Layout (Phase Polish-2, 11.05.2026).
 *
 * Drei-Ebenen-Drill-Down im Stil von Assassin's Creed Odyssey:
 *   - Ebene 1: 8 Bereiche als Kreise im Karussell (2 sichtbar Desktop, 1 Mobile)
 *   - Ebene 2: ein Bereich mit Skills als Kreise (Grid)
 *   - Ebene 3: ein Skill mit Level, Voraussetzungen, Sichtbarkeit
 *
 * Navigation: Wischen / Pfeile fuer Karussell. Klick fuer Drill-Down,
 * Zurueck-Pfeil oder X fuer Eltern-Ebene.
 *
 * Skills sind runde Kreise mit Icon. Bei XP > 0 leuchten sie heller.
 * Stufe steht als kleine Zahl darunter.
 */

// ============================================================
// Hilfstypen
// ============================================================

interface RenderSkill {
  id: string
  data: SkillData
  isUniversal: boolean
}

type View = "carousel" | "bereich" | "skill"

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

  // Navigation-State
  const [view, setView] = useState<View>("carousel")
  const [carouselOffset, setCarouselOffset] = useState(0)
  const [selectedBereichId, setSelectedBereichId] = useState<TreeBereichId | null>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Wieviele Bereiche pro Schritt sichtbar — Mobile 1, Desktop 2
  const perStep = isMobile ? 1 : 2
  const maxOffset = Math.max(0, TREE_BEREICHE.length - perStep)
  const visibleBereiche = TREE_BEREICHE.slice(carouselOffset, carouselOffset + perStep)

  const goBack = () => {
    if (view === "skill") {
      setSelectedSkillId(null)
      setView("bereich")
    } else if (view === "bereich") {
      setSelectedBereichId(null)
      setView("carousel")
    }
  }

  const openBereich = (b: TreeBereichId) => {
    setSelectedBereichId(b)
    setView("bereich")
  }

  const openSkill = (id: string) => {
    setSelectedSkillId(id)
    setView("skill")
  }

  const selectedBereich = selectedBereichId
    ? TREE_BEREICHE.find((b) => b.id === selectedBereichId)
    : undefined

  const selectedSkill: RenderSkill | undefined = useMemo(() => {
    if (!selectedBereichId || !selectedSkillId) return undefined
    return skillsByBereich[selectedBereichId].find((s) => s.id === selectedSkillId)
  }, [selectedBereichId, selectedSkillId, skillsByBereich])

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-4">
      {/* Header: Total-Level + Sticker */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full grid place-items-center text-xl font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
          >
            {totalLevel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Faehigkeitenbaum
            </div>
            <h2 className="text-lg font-bold mt-0.5">Level {totalLevel}</h2>
            <p className="text-xs text-muted-foreground">
              {totalXp.toLocaleString("de-DE")} XP — verteilt auf 8 Bereiche
            </p>
            {seedStatus.skillsTodo > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1.5 h-7 text-xs"
                onClick={seed}
                disabled={seeding}
              >
                {seeding
                  ? "Lade..."
                  : `${seedStatus.skillsTodo} ${seedStatus.manifestName}-Skills anlegen`}
              </Button>
            )}
          </div>
          {activeSynergies.length > 0 && (
            <div
              className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
              style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}
              title={activeSynergies.map((s) => s.name).join(", ")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {activeSynergies.length === 1
                ? activeSynergies[0].name
                : `${activeSynergies.length} Synergien`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breadcrumb / Zurueck */}
      {view !== "carousel" && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurueck
          </Button>
          <span className="text-xs text-muted-foreground">
            {view === "bereich" && selectedBereich && `Tree / ${selectedBereich.label}`}
            {view === "skill" && selectedBereich && selectedSkill &&
              `Tree / ${selectedBereich.label} / ${selectedSkill.data.name}`}
          </span>
        </div>
      )}

      {/* Karussell-Ebene */}
      {view === "carousel" && (
        <CarouselLevel
          visibleBereiche={visibleBereiche}
          offset={carouselOffset}
          maxOffset={maxOffset}
          perStep={perStep}
          onPrev={() => setCarouselOffset((o) => Math.max(0, o - perStep))}
          onNext={() => setCarouselOffset((o) => Math.min(maxOffset, o + perStep))}
          bereichXp={bereichXp}
          bereichProgress={bereichProgress}
          skillsByBereich={skillsByBereich}
          onSelect={openBereich}
        />
      )}

      {/* Bereich-Ebene */}
      {view === "bereich" && selectedBereich && (
        <BereichLevel
          bereich={selectedBereich}
          xp={bereichXp(selectedBereich.id)}
          progress={bereichProgress(selectedBereich.id)}
          skills={skillsByBereich[selectedBereich.id]}
          skillXp={skillXp}
          skillProgress={skillProgress}
          isUnlocked={isUnlocked}
          onSelectSkill={openSkill}
        />
      )}

      {/* Skill-Ebene */}
      {view === "skill" && selectedBereich && selectedSkill && (
        <SkillLevel
          bereich={selectedBereich}
          skill={selectedSkill}
          xp={skillXp(selectedSkill.id)}
          progress={skillProgress(selectedSkill.id)}
          unlock={isUnlocked(selectedSkill.id)}
          visibility={getVisibility(selectedSkill.id)}
          onVisibilityChange={(level) => setVisibility(selectedSkill.id, level)}
        />
      )}
    </div>
  )
}

// ============================================================
// CarouselLevel — 8 Bereiche im Karussell (2 oder 1 sichtbar)
// ============================================================

function CarouselLevel({
  visibleBereiche,
  offset,
  maxOffset,
  perStep,
  onPrev,
  onNext,
  bereichXp,
  bereichProgress,
  skillsByBereich,
  onSelect,
}: {
  visibleBereiche: TreeBereich[]
  offset: number
  maxOffset: number
  perStep: number
  onPrev: () => void
  onNext: () => void
  bereichXp: (id: TreeBereichId) => number
  bereichProgress: (id: TreeBereichId) => ReturnType<typeof progressInLevel>
  skillsByBereich: Record<TreeBereichId, RenderSkill[]>
  onSelect: (id: TreeBereichId) => void
}) {
  return (
    <div className="space-y-3">
      {/* Bereich-Kreise */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={offset === 0}
          className="shrink-0 h-12 w-8 p-0"
          aria-label="Zurueck"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className={`flex-1 grid gap-3 ${perStep === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {visibleBereiche.map((b) => (
            <BereichCircle
              key={b.id}
              bereich={b}
              xp={bereichXp(b.id)}
              progress={bereichProgress(b.id)}
              skillCount={skillsByBereich[b.id].length}
              isInner={INNERE_BEREICHE.includes(b.id)}
              onClick={() => onSelect(b.id)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={offset >= maxOffset}
          className="shrink-0 h-12 w-8 p-0"
          aria-label="Weiter"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Karussell-Indikatoren */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: Math.ceil(TREE_BEREICHE.length / perStep) }).map((_, i) => {
          const active = Math.floor(offset / perStep) === i
          return (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                active ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// BereichCircle — ein Bereich als grosser Kreis
// ============================================================

function BereichCircle({
  bereich,
  xp,
  progress,
  skillCount,
  isInner,
  onClick,
}: {
  bereich: TreeBereich
  xp: number
  progress: ReturnType<typeof progressInLevel>
  skillCount: number
  isInner: boolean
  onClick: () => void
}) {
  const Icon = bereich.icon as LucideIcon
  const activated = xp > 0
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:border-primary hover:shadow-md transition-all"
      style={activated ? { borderColor: bereich.color } : {}}
    >
      <div
        className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all ${
          activated ? "shadow-lg" : ""
        }`}
        style={{
          background: activated
            ? `radial-gradient(circle, ${bereich.color}30 0%, ${bereich.color}10 100%)`
            : "rgba(148,163,184,0.08)",
          boxShadow: activated ? `0 0 24px ${bereich.color}40` : undefined,
        }}
      >
        <Icon
          className="h-10 w-10 md:h-12 md:w-12 transition-transform group-hover:scale-110"
          style={{ color: activated ? bereich.color : "#94A3B8" }}
        />
        {/* Level-Pille */}
        {progress.level > 0 && (
          <div
            className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
            style={{ background: bereich.color }}
          >
            Lv {progress.level}
          </div>
        )}
        {/* Innerer-Kreis-Marker */}
        {isInner && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded text-[8px] uppercase font-semibold tracking-wider bg-purple-100 text-purple-700">
            innen
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="text-sm font-semibold">{bereich.label}</div>
        <div className="text-[10px] text-muted-foreground italic">{bereich.spirit}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {skillCount} Skill{skillCount === 1 ? "" : "s"}
          {xp > 0 && ` · ${xp.toLocaleString("de-DE")} XP`}
        </div>
      </div>

      {/* XP-Balken */}
      {xp > 0 && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, progress.ratio * 100)}%`,
              background: bereich.color,
            }}
          />
        </div>
      )}
    </button>
  )
}

// ============================================================
// BereichLevel — Bereich-Detail mit Skills als Kreise
// ============================================================

function BereichLevel({
  bereich,
  xp,
  progress,
  skills,
  skillXp,
  skillProgress,
  isUnlocked,
  onSelectSkill,
}: {
  bereich: TreeBereich
  xp: number
  progress: ReturnType<typeof progressInLevel>
  skills: RenderSkill[]
  skillXp: (id: string) => number
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  isUnlocked: (id: string) => { unlocked: boolean; missing: string[] }
  onSelectSkill: (id: string) => void
}) {
  const Icon = bereich.icon as LucideIcon
  return (
    <Card style={{ borderColor: bereich.color }}>
      <CardContent className="p-5 space-y-4">
        {/* Bereich-Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: `radial-gradient(circle, ${bereich.color}30 0%, ${bereich.color}10 100%)`,
            }}
          >
            <Icon className="h-7 w-7" style={{ color: bereich.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{bereich.label}</h2>
            <p className="text-xs text-muted-foreground italic">{bereich.spirit}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold" style={{ color: bereich.color }}>
              {progress.level}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {xp.toLocaleString("de-DE")} XP
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{bereich.description}</p>

        {/* XP-Balken */}
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Lv {progress.level}</span>
            <span>{progress.xpInLevel} / {progress.xpNeeded} XP</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, progress.ratio * 100)}%`,
                background: bereich.color,
              }}
            />
          </div>
        </div>

        {/* Skills als Kreis-Grid */}
        {skills.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-4">
            Noch keine Skills in diesem Bereich.
          </p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {skills.map((skill) => (
              <SkillCircle
                key={skill.id}
                skill={skill}
                bereichColor={bereich.color}
                xp={skillXp(skill.id)}
                progress={skillProgress(skill.id)}
                locked={!isUnlocked(skill.id).unlocked}
                onClick={() => onSelectSkill(skill.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// SkillCircle — ein Skill als kleiner Kreis
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

  return (
    <button
      type="button"
      onClick={onClick}
      title={skill.data.description ?? skill.data.name}
      className="group flex flex-col items-center gap-1.5 transition-all"
    >
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 ${
          locked ? "opacity-50" : ""
        }`}
        style={{
          background: activated ? `${color}15` : "rgba(148,163,184,0.05)",
          borderColor: activated ? color : "rgba(148,163,184,0.3)",
          boxShadow: activated ? `0 0 12px ${color}30` : undefined,
        }}
      >
        {locked ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : skill.data.icon ? (
          <DynamicIcon name={skill.data.icon} className="h-5 w-5 sm:h-6 sm:w-6" color={activated ? color : "#94A3B8"} />
        ) : (
          <Sparkles className="h-5 w-5" style={{ color: activated ? color : "#94A3B8" }} />
        )}
        {progress.level > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold text-white grid place-items-center"
            style={{ background: color }}
          >
            {progress.level}
          </div>
        )}
      </div>
      <div className="text-[10px] font-medium text-center leading-tight max-w-[80px] truncate">
        {skill.data.name}
      </div>
      {skill.isUniversal && (
        <div className="text-[8px] uppercase tracking-wider text-muted-foreground">universal</div>
      )}
    </button>
  )
}

// ============================================================
// SkillLevel — Skill-Detail
// ============================================================

function SkillLevel({
  bereich,
  skill,
  xp,
  progress,
  unlock,
  visibility,
  onVisibilityChange,
}: {
  bereich: TreeBereich
  skill: RenderSkill
  xp: number
  progress: ReturnType<typeof progressInLevel>
  unlock: { unlocked: boolean; missing: string[] }
  visibility: SkillVisibilityLevel | undefined
  onVisibilityChange: (level: SkillVisibilityLevel | undefined) => Promise<void>
}) {
  const color = skill.data.color ?? bereich.color

  return (
    <Card style={{ borderColor: color }}>
      <CardContent className="p-5 space-y-4">
        {/* Skill-Header */}
        <div className="flex items-start gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-2"
            style={{
              background: `radial-gradient(circle, ${color}30 0%, ${color}10 100%)`,
              borderColor: color,
              boxShadow: xp > 0 ? `0 0 24px ${color}40` : undefined,
            }}
          >
            {unlock.unlocked ? (
              skill.data.icon ? (
                <DynamicIcon name={skill.data.icon} className="h-10 w-10" color={color} />
              ) : (
                <Sparkles className="h-10 w-10" style={{ color }} />
              )
            ) : (
              <Lock className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 className="text-xl font-bold">{skill.data.name}</h2>
              {skill.isUniversal && (
                <span
                  className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(100,116,139,0.12)", color: "#475569" }}
                >
                  universal
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground italic mb-1">
              Bereich: {bereich.label}
            </p>
            {skill.data.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {skill.data.description}
              </p>
            )}
          </div>
        </div>

        {/* Level + XP */}
        {unlock.unlocked ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold" style={{ color }}>
                {progress.level}
              </div>
              <div className="text-sm text-muted-foreground">
                {xp.toLocaleString("de-DE")} XP
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Stufe {progress.level}</span>
                <span>{progress.xpInLevel} / {progress.xpNeeded} XP zur naechsten</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, progress.ratio * 100)}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-muted/40 border border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Gesperrt</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Oeffnet sich mit: <strong>{unlock.missing.join(", ")}</strong>
            </p>
          </div>
        )}

        {/* Sichtbarkeits-Toggle */}
        {unlock.unlocked && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              Sichtbarkeit
            </p>
            <div className="flex flex-wrap gap-1.5">
              <VisibilityChip
                label="Folgt Profil"
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
      </CardContent>
    </Card>
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
      className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1.5 ${
        active
          ? "border-transparent text-white font-semibold"
          : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
      }`}
      style={active ? { background: color } : {}}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  )
}
