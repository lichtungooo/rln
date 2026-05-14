/**
 * SkillKettenBahn — horizontale Bahn-Visualisierung einer Skill-Kette.
 *
 * Pattern: Duolingo-Linear-Pfad ohne Streak.
 * Skill-Knoten als Kreise mit Tier-Stufen-Indikator, Verbindungslinien dazwischen.
 * Verzweigungen als Abzweige nach unten.
 *
 * Mobile-tauglich: horizontal scrollbar, Touch-freundliche Knoten.
 *
 * Stand 14.05.2026.
 */

import { useMemo } from "react"
import type {
  SkillKette,
  SkillV2,
  Tier,
} from "../gamification/skill-system"
import { TIER_BY_ID, tierStufe } from "../gamification/skill-system"

interface SkillKettenBahnProps {
  kette: SkillKette
  skills: SkillV2[]
  bereichColor: string
  onSkillClick?: (skillId: string) => void
  selectedSkillId?: string | null
}

// Tier-Visualisierung — wie voll ist der Kreis
function tierFill(tier: Tier): { ringClass: string; bgClass: string; textClass: string } {
  const stufe = tierStufe(tier)
  if (stufe <= 1) return { ringClass: "ring-2", bgClass: "bg-white", textClass: "text-muted-foreground" }
  if (stufe === 2) return { ringClass: "ring-2", bgClass: "bg-white/80", textClass: "text-foreground" }
  if (stufe === 3) return { ringClass: "ring-4", bgClass: "bg-white", textClass: "text-foreground font-semibold" }
  if (stufe === 4) return { ringClass: "ring-4", bgClass: "bg-white", textClass: "text-foreground font-semibold" }
  if (stufe === 5) return { ringClass: "ring-[5px]", bgClass: "bg-white", textClass: "text-foreground font-bold" }
  return { ringClass: "ring-[6px] ring-offset-2 ring-offset-amber-300", bgClass: "bg-white", textClass: "text-foreground font-bold" }
}

export function SkillKettenBahn({
  kette,
  skills,
  bereichColor,
  onSkillClick,
  selectedSkillId,
}: SkillKettenBahnProps) {
  const skillById = useMemo(() => {
    const map = new Map<string, SkillV2>()
    skills.forEach((s) => map.set(s.id, s))
    return map
  }, [skills])

  const hauptSkills = kette.skillIds.map((id) => skillById.get(id)).filter(Boolean) as SkillV2[]

  // Verzweigungen pro Position in der Bahn
  const verzweigungenByAb = useMemo(() => {
    const map = new Map<string, Array<{ name: string; skills: SkillV2[] }>>()
    kette.verzweigungen?.forEach((v) => {
      const aeste = v.aeste.map((a) => ({
        name: a.name,
        skills: a.skillIds.map((id) => skillById.get(id)).filter(Boolean) as SkillV2[],
      }))
      map.set(v.ab, aeste)
    })
    return map
  }, [kette.verzweigungen, skillById])

  return (
    <div
      className="rounded-2xl p-4 overflow-hidden"
      style={{ backgroundColor: `${bereichColor}15` }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{kette.name}</h3>
        {kette.werkstueck && (
          <p className="text-sm text-muted-foreground mt-1">Werk am Ende: {kette.werkstueck}</p>
        )}
      </div>

      {/* Bahn */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-2 min-w-max">
          {hauptSkills.map((skill, idx) => {
            const fill = tierFill(skill.tier)
            const isSelected = selectedSkillId === skill.id
            const tierInfo = TIER_BY_ID[skill.tier]
            const verzweigungen = verzweigungenByAb.get(skill.id)
            const isLast = idx === hauptSkills.length - 1

            return (
              <div key={skill.id} className="flex flex-col items-center">
                {/* Skill-Knoten + ggf. Verzweigung */}
                <div className="flex items-center">
                  <button
                    onClick={() => onSkillClick?.(skill.id)}
                    className={`
                      flex flex-col items-center w-24 transition-all
                      ${isSelected ? "scale-110" : "hover:scale-105"}
                    `}
                    aria-label={`Skill ${skill.name}, Tier ${tierInfo.name}`}
                  >
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        ${fill.ringClass} ${fill.bgClass}
                        shadow-sm
                      `}
                      style={{ "--tw-ring-color": bereichColor } as React.CSSProperties}
                    >
                      <span className="text-xs font-bold text-foreground">{tierStufe(skill.tier)}</span>
                    </div>
                    <div className="mt-2 text-center w-full">
                      <div className={`text-xs leading-tight ${fill.textClass}`}>{skill.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{tierInfo.name}</div>
                    </div>
                  </button>

                  {/* Verbindungslinie zum nachsten Skill */}
                  {!isLast && (
                    <div
                      className="h-1 w-6 mt-8 -ml-2 mr-0 rounded-full"
                      style={{ backgroundColor: bereichColor, opacity: 0.4 }}
                    />
                  )}
                </div>

                {/* Verzweigungen (vertikal unter dem Knoten) */}
                {verzweigungen && verzweigungen.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 items-stretch">
                    {verzweigungen.map((ast) => (
                      <div
                        key={ast.name}
                        className="rounded-lg p-2"
                        style={{ backgroundColor: `${bereichColor}10` }}
                      >
                        <div className="text-[10px] font-semibold text-foreground/70 mb-2">
                          {ast.name}
                        </div>
                        <div className="flex gap-1 items-start">
                          {ast.skills.map((subSkill) => {
                            const subFill = tierFill(subSkill.tier)
                            const isSubSelected = selectedSkillId === subSkill.id
                            return (
                              <button
                                key={subSkill.id}
                                onClick={() => onSkillClick?.(subSkill.id)}
                                className={`
                                  flex flex-col items-center w-20 transition-all
                                  ${isSubSelected ? "scale-110" : "hover:scale-105"}
                                `}
                              >
                                <div
                                  className={`
                                    w-12 h-12 rounded-full flex items-center justify-center
                                    ${subFill.ringClass} ${subFill.bgClass}
                                  `}
                                  style={{ "--tw-ring-color": bereichColor } as React.CSSProperties}
                                >
                                  <span className="text-[10px] font-bold">{tierStufe(subSkill.tier)}</span>
                                </div>
                                <div className="mt-1 text-center w-full">
                                  <div className="text-[10px] leading-tight">{subSkill.name}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tier-Legende */}
      <div className="mt-4 pt-3 border-t border-foreground/10">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="font-semibold">Tier-Stufen:</span>
          {[
            { id: "gespuert" as Tier, label: "1 gespuert" },
            { id: "probiert" as Tier, label: "2 probiert" },
            { id: "kann" as Tier, label: "3 kann" },
            { id: "kann-lehren" as Tier, label: "4 kann lehren" },
            { id: "meistert" as Tier, label: "5 meistert" },
            { id: "gibt-weiter" as Tier, label: "6 gibt weiter" },
          ].map((t) => {
            const f = tierFill(t.id)
            return (
              <span key={t.id} className="flex items-center gap-1">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${f.ringClass} ${f.bgClass}`}
                  style={{ "--tw-ring-color": bereichColor } as React.CSSProperties}
                />
                {t.label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
