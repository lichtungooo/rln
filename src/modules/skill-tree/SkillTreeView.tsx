import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Sparkles, TrendingUp, type LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  useItems,
} from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import {
  TREE_BEREICHE,
  INNERE_BEREICHE,
  progressInLevel,
  useUserProgress,
  useGamificationSeed,
  UNIVERSAL_SKILLS,
  GAMIFICATION_ITEM_TYPES,
  type SkillData,
  type TreeBereich,
  type TreeBereichId,
} from "../gamification"

/**
 * Eine Skill-Anzeige fuer den Tree — vereinheitlicht zwischen
 * universellen Code-Skills und space-spezifischen WoT-Items.
 */
interface RenderSkill {
  id: string
  data: SkillData
  isUniversal: boolean
}

/**
 * SkillTreeView — der Faehigkeitenbaum sichtbar.
 *
 * Hier wird der ganze Status des Charakters lesbar:
 *   - oben: Total-Level + XP + ggf. Synergie-Bonus
 *   - 7 Bereich-Cards mit Level, XP-Balken, Skills aufklappbar
 *   - jeder Skill mit eigenem Level + Progress
 *
 * Das ist das Schaufenster fuer den Hornbach-Pitch: ein User klickt sich
 * durch und sieht "ich bin Holz Level 3, Schweissen Level 1, mein
 * Bereich Handwerk ist auf Stufe 4".
 */

export function SkillTreeView(_props: ModuleViewProps) {
  const { data, bereichXp, bereichProgress, skillXp, skillProgress } = useUserProgress()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { seed, busy: seeding, status: seedStatus } = useGamificationSeed()

  // Skills nach Bereich gruppieren — Universal-Skills aus Code +
  // space-spezifische Items aus WoT zusammen rendern.
  // Universal kommen zuerst, dann space-Skills, jeweils nach order sortiert.
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

    // Universal zuerst, dann nach order
    for (const bId of Object.keys(map) as TreeBereichId[]) {
      map[bId].sort((a, b) => {
        if (a.isUniversal !== b.isUniversal) return a.isUniversal ? -1 : 1
        return (a.data.order ?? 999) - (b.data.order ?? 999)
      })
    }
    return map
  }, [skillItems])

  const totalXp = useMemo(() => Object.values(data.bereichXp).reduce((a, b) => a + (b ?? 0), 0), [data.bereichXp])
  const totalLevel = useMemo(() => progressInLevel(totalXp).level, [totalXp])

  // Synergie-Bonus aktiv? Drei innere Bereiche haben alle XP
  const synergyActive = useMemo(() => {
    return INNERE_BEREICHE.every((b) => (data.bereichXp[b] ?? 0) > 0)
  }, [data.bereichXp])

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      {/* Header: Total-Level + Total-XP */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6 flex-wrap">
          <div className="flex-shrink-0 w-20 h-20 rounded-full grid place-items-center text-2xl font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}>
            {totalLevel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Faehigkeitenbaum
            </div>
            <h2 className="text-2xl font-bold mt-1">Level {totalLevel}</h2>
            <p className="text-sm text-muted-foreground">
              {totalXp.toLocaleString("de-DE")} XP gesamt — verteilt auf 8 Bereiche
            </p>
            {skillItems.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
                onClick={seed}
                disabled={seeding}
              >
                {seeding ? "Lade..." : `${seedStatus.skillsTodo} Macher-Skills zusaetzlich anlegen`}
              </Button>
            )}
          </div>
          {synergyActive && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2" style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>
              <Sparkles className="h-4 w-4" />
              Synergie aktiv
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synergie-Hinweis */}
      {synergyActive && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-md p-3 text-xs text-purple-900 leading-relaxed">
          <strong>Synergie-Bonus aktiv.</strong> Seele, Geist und Bewusstsein wachsen gleichzeitig — wenn die drei eins werden, oeffnet sich etwas, das mehr ist als die Summe.
        </div>
      )}

      {/* 7 Bereich-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TREE_BEREICHE.map((bereich) => (
          <BereichCard
            key={bereich.id}
            bereich={bereich}
            xp={bereichXp(bereich.id)}
            progress={bereichProgress(bereich.id)}
            skills={skillsByBereich[bereich.id]}
            skillXp={skillXp}
            skillProgress={skillProgress}
            isInner={INNERE_BEREICHE.includes(bereich.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// BereichCard — eine Bereich-Card mit Skills aufklappbar
// ============================================================

interface BereichCardProps {
  bereich: TreeBereich
  xp: number
  progress: ReturnType<typeof progressInLevel>
  skills: RenderSkill[]
  skillXp: (id: string) => number
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  isInner: boolean
}

function BereichCard({ bereich, xp, progress, skills, skillXp, skillProgress, isInner }: BereichCardProps) {
  const [open, setOpen] = useState(false)
  const Icon = bereich.icon as LucideIcon

  return (
    <Card className="overflow-hidden transition-all" style={{ borderLeft: `4px solid ${bereich.color}` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${bereich.color}15` }}>
            <Icon className="h-6 w-6" style={{ color: bereich.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <CardTitle className="text-base">{bereich.label}</CardTitle>
              {isInner && (
                <span className="text-[9px] uppercase font-semibold tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  innerer Kreis
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground italic">{bereich.spirit}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold" style={{ color: bereich.color }}>
              {progress.level}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {xp.toLocaleString("de-DE")} XP
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 space-y-3">
        {/* XP-Balken */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Level {progress.level}</span>
            <span>{progress.xpInLevel} / {progress.xpNeeded} XP zum naechsten</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, progress.ratio * 100)}%`,
                background: bereich.color,
              }}
            />
          </div>
        </div>

        {/* Skills aufklappbar */}
        {skills.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{skills.length} Skill{skills.length === 1 ? "" : "s"}</span>
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>

            {open && (
              <div className="mt-2 space-y-1.5">
                {skills.map((skill) => {
                  const sXp = skillXp(skill.id)
                  const sProg = skillProgress(skill.id)
                  return (
                    <div
                      key={skill.id}
                      className="p-2 rounded border bg-card hover:bg-muted/30 transition-colors"
                      title={skill.data.description ?? ""}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: skill.data.color ?? bereich.color }}
                          />
                          <span className="text-sm font-medium">{skill.data.name}</span>
                          {skill.isUniversal && (
                            <span
                              className="text-[9px] uppercase font-semibold tracking-wider px-1 py-0 rounded"
                              style={{ background: "rgba(100,116,139,0.12)", color: "#475569" }}
                              title="Universeller Skill — in jedem Space gleich"
                            >
                              universal
                            </span>
                          )}
                          {sProg.level > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0 rounded" style={{ background: `${bereich.color}20`, color: bereich.color }}>
                              Lv {sProg.level}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {sXp} XP
                        </span>
                      </div>
                      {sXp > 0 && (
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, sProg.ratio * 100)}%`,
                              background: skill.data.color ?? bereich.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Wenn noch kein XP: Hinweis */}
        {xp === 0 && skills.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground italic">
            <TrendingUp className="h-3 w-3" />
            Quests abschliessen, um zu wachsen.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
