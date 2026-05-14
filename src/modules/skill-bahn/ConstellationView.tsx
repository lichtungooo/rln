/**
 * ConstellationView — die acht Potenzialfelder als grosse Karte.
 *
 * Pattern: Constellation (Skyrim-Pattern).
 * Jedes Potenzialfeld ist ein Cluster mit:
 *   - Name + Icon + Beschreibung
 *   - Vier Anker-Skills
 *   - Liste der Handwerks- und Bildungs-Bereiche, die es speisen
 *
 * Klick auf einen Bereich navigiert zur Bahn-Sicht.
 *
 * Stand 14.05.2026.
 */

import {
  POTENZIALFELDER,
  HANDWERKS_BEREICHE,
  BILDUNGS_BEREICHE,
  type Potenzialfeld,
  type HandwerksBereich,
  type BildungsBereich,
  type Tier,
  type SkillV2,
} from "../gamification/skill-system"

interface ConstellationViewProps {
  onBereichSelect?: (bereichId: string) => void
  selectedBereichId?: string | null
  userTiers?: Record<string, Tier>
  allSkills?: SkillV2[]
}

interface BereicheForFeld {
  handwerk: HandwerksBereich[]
  bildung: BildungsBereich[]
}

function getBereicheForFeld(feld: Potenzialfeld): BereicheForFeld {
  return {
    handwerk: HANDWERKS_BEREICHE.filter((b) => b.potenzialfelder.includes(feld.id)),
    bildung: BILDUNGS_BEREICHE.filter((b) => b.potenzialfelder.includes(feld.id)),
  }
}

function getFortschrittForFeld(
  feld: Potenzialfeld,
  allSkills: SkillV2[],
  userTiers: Record<string, Tier>
): { gesamt: number; erreicht: number } {
  const feldSkills = allSkills.filter((s) => s.potenzialfelder.includes(feld.id))
  const erreicht = feldSkills.filter((s) => userTiers[s.id]).length
  return { gesamt: feldSkills.length, erreicht }
}

export function ConstellationView({
  onBereichSelect,
  selectedBereichId,
  userTiers,
  allSkills,
}: ConstellationViewProps) {
  const hatProgress = userTiers && allSkills && Object.keys(userTiers).length > 0

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card">
        <h2 className="text-lg font-bold mb-1">Acht Potenzialfelder</h2>
        <p className="text-sm text-muted-foreground">
          Universelle Schicht ueber allen Bereichen. Jeder Skill speist ein bis drei
          Felder. Klick auf einen Bereich oeffnet seine Bahn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {POTENZIALFELDER.map((feld) => {
          const bereiche = getBereicheForFeld(feld)
          const Icon = feld.icon
          const fortschritt = hatProgress
            ? getFortschrittForFeld(feld, allSkills!, userTiers!)
            : null
          return (
            <div
              key={feld.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: `${feld.color}15` }}
            >
              {/* Header */}
              <div
                className="p-3 flex items-center gap-2"
                style={{ backgroundColor: `${feld.color}30` }}
              >
                <Icon className="w-5 h-5 shrink-0" style={{ color: feld.color }} />
                <h3 className="font-bold text-sm leading-tight flex-1">{feld.name}</h3>
                {fortschritt && fortschritt.erreicht > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: feld.color }}
                    title={`Erreicht: ${fortschritt.erreicht} von ${fortschritt.gesamt}`}
                  >
                    {fortschritt.erreicht} / {fortschritt.gesamt}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-3 flex-1 flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-snug">
                  {feld.beschreibung}
                </p>

                {/* Anker-Skills */}
                <div>
                  <div className="text-[10px] font-semibold text-foreground/70 mb-1">
                    Anker-Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {feld.ankerSkills.map((anker) => (
                      <span
                        key={anker}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/80"
                      >
                        {anker}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verbundene Handwerks-Bereiche */}
                {bereiche.handwerk.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-foreground/70 mb-1">
                      Handwerk
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bereiche.handwerk.map((b) => {
                        const isSelected = selectedBereichId === b.id
                        return (
                          <button
                            key={b.id}
                            onClick={() => onBereichSelect?.(b.id)}
                            className={`
                              text-[10px] px-2 py-1 rounded-md transition-colors
                              ${isSelected ? "text-white font-semibold" : "text-foreground hover:opacity-80"}
                            `}
                            style={
                              isSelected
                                ? { backgroundColor: b.color }
                                : { backgroundColor: `${b.color}40` }
                            }
                          >
                            {b.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Verbundene Bildungs-Bereiche */}
                {bereiche.bildung.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-foreground/70 mb-1">
                      Bildung
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bereiche.bildung.map((b) => {
                        const isSelected = selectedBereichId === b.id
                        return (
                          <button
                            key={b.id}
                            onClick={() => onBereichSelect?.(b.id)}
                            className={`
                              text-[10px] px-2 py-1 rounded-md transition-colors
                              ${isSelected ? "text-white font-semibold" : "text-foreground hover:opacity-80"}
                            `}
                            style={
                              isSelected
                                ? { backgroundColor: b.color }
                                : { backgroundColor: `${b.color}40` }
                            }
                          >
                            {b.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
