/**
 * QuerschnittView — Drei Haende und Mentoren-Achse.
 *
 * Zeigt die beiden Querschnitte des Skill-Systems sichtbar:
 *   - Drei Haende (Wurzel-Skills, Sicherheits-Lizenz)
 *   - Mentoren-Achse (parallel, vier Schwellen, 20 Skills)
 *
 * Stand 14.05.2026.
 */

import { useState, useMemo } from "react"
import { Hand, GraduationCap } from "lucide-react"
import {
  DREI_HAENDE_FULL,
  DREI_HAENDE_SKILLS,
  MENTOREN_SKILLS,
  MENTOR_SCHWELLEN,
  TIER_BY_ID,
  useSkillV2Progress,
  tierStufe,
  type SkillV2,
  type Tier,
} from "../gamification"

function SkillEintragZeile({
  skill,
  userTier,
  onSetTier,
  onClearTier,
  accent,
}: {
  skill: SkillV2
  userTier: Tier | null
  onSetTier: (tier: Tier) => void
  onClearTier: () => void
  accent: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 py-1 px-2 rounded bg-white/70">
      <span className="text-[11px] font-semibold text-foreground flex-1 min-w-[100px]">
        {skill.name}
      </span>
      <button
        onClick={() => onSetTier("gespuert")}
        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
          userTier === "gespuert" ? "text-white font-semibold" : "text-foreground hover:opacity-80"
        }`}
        style={
          userTier === "gespuert" ? { backgroundColor: accent } : { backgroundColor: `${accent}30` }
        }
      >
        gespuert
      </button>
      <button
        onClick={() => onSetTier("probiert")}
        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
          userTier === "probiert" ? "text-white font-semibold" : "text-foreground hover:opacity-80"
        }`}
        style={
          userTier === "probiert" ? { backgroundColor: accent } : { backgroundColor: `${accent}30` }
        }
      >
        probiert
      </button>
      {userTier && (
        <button
          onClick={() => onClearTier()}
          className="text-[10px] px-1 py-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Zuruecksetzen"
        >
          ×
        </button>
      )}
    </div>
  )
}

function DreiHaendeKarte() {
  const { progress, setTier, clearTier } = useSkillV2Progress()

  const handStatus = useMemo(() => {
    return DREI_HAENDE_FULL.map((hand) => {
      const skills = hand.buendel
        .map((name) => DREI_HAENDE_SKILLS.find((s) => s.name === name))
        .filter(Boolean) as SkillV2[]
      const erreichtCount = skills.filter((s) => {
        const t = progress.skills[s.id]
        if (!t) return false
        return tierStufe(t) >= tierStufe(hand.schwellenTier)
      }).length
      return { hand, skills, erreichtCount, voll: erreichtCount === skills.length }
    })
  }, [progress.skills])

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col bg-amber-50/60">
      <div className="p-3 flex items-center gap-2 bg-amber-100/60">
        <Hand className="w-5 h-5 shrink-0 text-amber-700" />
        <h3 className="font-bold text-sm flex-1">Drei Haende — Sicherheits-Lizenz</h3>
      </div>
      <div className="p-3 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground leading-snug">
          Wurzel-Skills, die unter allen Handwerks-Bereichen liegen. Drei Haende
          auf Tier "probiert" sind die Eingangsschwelle in jeden Handwerks-Bereich.
        </p>
        <div className="flex flex-col gap-2">
          {handStatus.map(({ hand, skills, erreichtCount, voll }) => (
            <div key={hand.id} className="rounded-lg p-2 bg-white/40">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xs font-semibold text-foreground flex-1">{hand.name}</div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    voll
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-amber-200 text-amber-900"
                  }`}
                >
                  {voll ? "✓ " : ""}
                  {erreichtCount} / {skills.length}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mb-2">{hand.beschreibung}</div>
              <div className="flex flex-col gap-1">
                {skills.map((s) => (
                  <SkillEintragZeile
                    key={s.id}
                    skill={s}
                    userTier={progress.skills[s.id] ?? null}
                    onSetTier={(t) => setTier(s.id, t)}
                    onClearTier={() => clearTier(s.id)}
                    accent="#92400E"
                  />
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Ab Alter {hand.alterAb} · Schwelle: Tier {TIER_BY_ID[hand.schwellenTier].name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MentorenSchwellenKarte() {
  const [expanded, setExpanded] = useState(false)
  const { progress, setTier, clearTier } = useSkillV2Progress()

  const erreichteCount = useMemo(
    () => MENTOREN_SKILLS.filter((s) => progress.skills[s.id]).length,
    [progress.skills]
  )

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col bg-violet-50/60">
      <div className="p-3 flex items-center gap-2 bg-violet-100/60">
        <GraduationCap className="w-5 h-5 shrink-0 text-violet-700" />
        <h3 className="font-bold text-sm flex-1">Mentoren-Achse — vier Schwellen</h3>
        {erreichteCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-semibold">
            {erreichteCount} / {MENTOREN_SKILLS.length}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground leading-snug">
          20 Mentor-Skills in vier Stufen, parallel zur Fach-Achse. Wer kann lehren,
          waechst weiter durch Begleitung. Wissenschaftlich getragen durch
          BBBS-RCT 2022 und AEVO als formaler Anker.
        </p>
        <div className="flex flex-col gap-2">
          {MENTOR_SCHWELLEN.map((s, idx) => (
            <div key={s.id} className="rounded-lg p-2 bg-white/70">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-violet-700">{idx + 1}.</span>
                <span className="text-xs font-semibold text-foreground">{s.name}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mb-1">{s.beschreibung}</div>
              <div className="text-[10px] text-violet-900">
                <span className="font-semibold">Bedingung:</span> {s.bedingung}
              </div>
              <div className="text-[10px] text-violet-900">
                <span className="font-semibold">Darf:</span> {s.darfTun}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-violet-700 hover:text-violet-900 font-semibold text-left"
        >
          {expanded
            ? "Skills schliessen"
            : `${MENTOREN_SKILLS.length} Mentor-Skills oeffnen`}
        </button>
        {expanded && (
          <div className="flex flex-col gap-1">
            {MENTOREN_SKILLS.map((skill) => (
              <SkillEintragZeile
                key={skill.id}
                skill={skill}
                userTier={progress.skills[skill.id] ?? null}
                onSetTier={(t) => setTier(skill.id, t)}
                onClearTier={() => clearTier(skill.id)}
                accent="#6B21A8"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function QuerschnittView() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card">
        <h2 className="text-lg font-bold mb-1">Querschnitte</h2>
        <p className="text-sm text-muted-foreground">
          Drei Haende als Sicherheits-Lizenz, Mentoren-Achse als parallele
          Wachstums-Spur. Beide wirken durch alle 18 Bereiche.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DreiHaendeKarte />
        <MentorenSchwellenKarte />
      </div>
    </div>
  )
}
