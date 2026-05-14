/**
 * QuerschnittView — Drei Haende und Mentoren-Achse.
 *
 * Zeigt die beiden Querschnitte des Skill-Systems sichtbar:
 *   - Drei Haende (Wurzel-Skills, Sicherheits-Lizenz)
 *   - Mentoren-Achse (parallel, vier Schwellen, 20 Skills)
 *
 * Stand 14.05.2026.
 */

import { useState } from "react"
import { Hand, GraduationCap } from "lucide-react"
import {
  DREI_HAENDE_FULL,
  DREI_HAENDE_SKILLS,
  MENTOREN_SKILLS,
  MENTOR_SCHWELLEN,
  TIER_BY_ID,
  type SkillV2,
} from "../gamification"

function DreiHaendeKarte() {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col bg-amber-50/60">
      <div className="p-3 flex items-center gap-2 bg-amber-100/60">
        <Hand className="w-5 h-5 shrink-0 text-amber-700" />
        <h3 className="font-bold text-sm">Drei Haende — Sicherheits-Lizenz</h3>
      </div>
      <div className="p-3 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground leading-snug">
          Wurzel-Skills, die unter allen Handwerks-Bereichen liegen. Drei Haende
          auf Tier "probiert" sind die Eingangsschwelle in jeden Handwerks-Bereich.
        </p>
        <div className="flex flex-col gap-2">
          {DREI_HAENDE_FULL.map((hand) => (
            <div
              key={hand.id}
              className="rounded-lg p-2 bg-white/70"
            >
              <div className="text-xs font-semibold text-foreground mb-1">{hand.name}</div>
              <div className="text-[11px] text-muted-foreground mb-2">{hand.beschreibung}</div>
              <div className="flex flex-wrap gap-1">
                {hand.buendel.map((b) => (
                  <span
                    key={b}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900"
                  >
                    {b}
                  </span>
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

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col bg-violet-50/60">
      <div className="p-3 flex items-center gap-2 bg-violet-100/60">
        <GraduationCap className="w-5 h-5 shrink-0 text-violet-700" />
        <h3 className="font-bold text-sm">Mentoren-Achse — vier Schwellen</h3>
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
          {expanded ? "Skills schliessen" : `${MENTOREN_SKILLS.length} Mentor-Skills zeigen`}
        </button>
        {expanded && (
          <div className="flex flex-col gap-1">
            {MENTOREN_SKILLS.map((skill) => (
              <MentorSkillZeile key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MentorSkillZeile({ skill }: { skill: SkillV2 }) {
  return (
    <div className="flex items-baseline gap-2 text-[11px] py-1 px-2 rounded bg-white/50">
      <span className="font-semibold text-foreground">{skill.name}</span>
      <span className="text-muted-foreground">{TIER_BY_ID[skill.tier].name}</span>
      {skill.beschreibung && (
        <span className="text-muted-foreground truncate flex-1">{skill.beschreibung}</span>
      )}
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
