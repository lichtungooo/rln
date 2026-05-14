/**
 * SkillBahnView — Modul-View fuer das neue Skill-System.
 *
 * Zeigt:
 *   - Tabs fuer die sechs Handwerks-Bereiche + Mathematik + Sport + Sprache + NW
 *   - Bahn-Visualisierung der Hauptkette des aktiven Bereichs
 *   - Skill-Detail-Panel rechts/unten bei Klick
 *
 * Stand 14.05.2026.
 */

import { useState, useMemo } from "react"
import type { ModuleViewProps } from "../registry"
import {
  HANDWERKS_BEREICH_BY_ID,
  BILDUNGS_BEREICH_BY_ID,
  TIER_BY_ID,
  useSkillV2Progress,
  useSkillAttestations,
  DREI_HAENDE_FULL,
  DREI_HAENDE_SKILLS,
  tierStufe,
  type SkillV2,
  type SkillKette,
  type Tier,
  HOLZ_SKILLS, HOLZ_HAUPTKETTE,
  METALL_SKILLS, METALL_HAUPTKETTE,
  GARTEN_SKILLS, GARTEN_HAUPTKETTE,
  ELEKTRONIK_SKILLS, ELEKTRONIK_HAUPTKETTE,
  BAU_SKILLS, BAU_HAUPTKETTE,
  REPARIEREN_SKILLS, REPARIEREN_HUB_KETTE,
  MATHEMATIK_SKILLS, MATHEMATIK_HAUPTKETTE,
  SPORT_SKILLS, SPORT_HAUPTKETTE,
  SPRACHE_SKILLS, SPRACHE_HAUPTKETTE,
  NATURWISSENSCHAFTEN_SKILLS, NATURWISSENSCHAFTEN_HUB_KETTE,
  KUNST_SKILLS, KUNST_HAUPTKETTE,
  MUSIK_SKILLS, MUSIK_HAUPTKETTE,
  HAUSWIRTSCHAFT_SKILLS, HAUSWIRTSCHAFT_HAUPTKETTE,
  LERNEN_LERNEN_SKILLS, LERNEN_LERNEN_HAUPTKETTE,
  FREMDSPRACHEN_SKILLS, FREMDSPRACHEN_HAUPTKETTE,
  GESELLSCHAFT_SKILLS, GESELLSCHAFT_HAUPTKETTE,
  RELIGION_ETHIK_SKILLS, RELIGION_ETHIK_HAUPTKETTE,
  BERUFSORIENTIERUNG_SKILLS, BERUFSORIENTIERUNG_HAUPTKETTE,
} from "../gamification"
import { SkillKettenBahn } from "./SkillKettenBahn"
import { ConstellationView } from "./ConstellationView"
import { QuerschnittView } from "./QuerschnittView"
import { AttestationInbox } from "./AttestationInbox"

interface BereichDaten {
  id: string
  name: string
  color: string
  art: "handwerk" | "bildung"
  skills: SkillV2[]
  kette: SkillKette
}

const BEREICHE: BereichDaten[] = [
  {
    id: "holz",
    name: HANDWERKS_BEREICH_BY_ID.holz.name,
    color: HANDWERKS_BEREICH_BY_ID.holz.color,
    art: "handwerk",
    skills: HOLZ_SKILLS,
    kette: HOLZ_HAUPTKETTE,
  },
  {
    id: "metall",
    name: HANDWERKS_BEREICH_BY_ID.metall.name,
    color: HANDWERKS_BEREICH_BY_ID.metall.color,
    art: "handwerk",
    skills: METALL_SKILLS,
    kette: METALL_HAUPTKETTE,
  },
  {
    id: "garten",
    name: HANDWERKS_BEREICH_BY_ID.garten.name,
    color: HANDWERKS_BEREICH_BY_ID.garten.color,
    art: "handwerk",
    skills: GARTEN_SKILLS,
    kette: GARTEN_HAUPTKETTE,
  },
  {
    id: "elektronik",
    name: HANDWERKS_BEREICH_BY_ID.elektronik.name,
    color: HANDWERKS_BEREICH_BY_ID.elektronik.color,
    art: "handwerk",
    skills: ELEKTRONIK_SKILLS,
    kette: ELEKTRONIK_HAUPTKETTE,
  },
  {
    id: "bau",
    name: HANDWERKS_BEREICH_BY_ID.bau.name,
    color: HANDWERKS_BEREICH_BY_ID.bau.color,
    art: "handwerk",
    skills: BAU_SKILLS,
    kette: BAU_HAUPTKETTE,
  },
  {
    id: "reparieren",
    name: HANDWERKS_BEREICH_BY_ID.reparieren.name,
    color: HANDWERKS_BEREICH_BY_ID.reparieren.color,
    art: "handwerk",
    skills: REPARIEREN_SKILLS,
    kette: REPARIEREN_HUB_KETTE,
  },
  {
    id: "mathematik",
    name: BILDUNGS_BEREICH_BY_ID.mathematik.name,
    color: BILDUNGS_BEREICH_BY_ID.mathematik.color,
    art: "bildung",
    skills: MATHEMATIK_SKILLS,
    kette: MATHEMATIK_HAUPTKETTE,
  },
  {
    id: "sport",
    name: BILDUNGS_BEREICH_BY_ID.sport.name,
    color: BILDUNGS_BEREICH_BY_ID.sport.color,
    art: "bildung",
    skills: SPORT_SKILLS,
    kette: SPORT_HAUPTKETTE,
  },
  {
    id: "sprache",
    name: BILDUNGS_BEREICH_BY_ID.sprache.name,
    color: BILDUNGS_BEREICH_BY_ID.sprache.color,
    art: "bildung",
    skills: SPRACHE_SKILLS,
    kette: SPRACHE_HAUPTKETTE,
  },
  {
    id: "naturwissenschaften",
    name: BILDUNGS_BEREICH_BY_ID.naturwissenschaften.name,
    color: BILDUNGS_BEREICH_BY_ID.naturwissenschaften.color,
    art: "bildung",
    skills: NATURWISSENSCHAFTEN_SKILLS,
    kette: NATURWISSENSCHAFTEN_HUB_KETTE,
  },
  {
    id: "kunst",
    name: BILDUNGS_BEREICH_BY_ID.kunst.name,
    color: BILDUNGS_BEREICH_BY_ID.kunst.color,
    art: "bildung",
    skills: KUNST_SKILLS,
    kette: KUNST_HAUPTKETTE,
  },
  {
    id: "musik",
    name: BILDUNGS_BEREICH_BY_ID.musik.name,
    color: BILDUNGS_BEREICH_BY_ID.musik.color,
    art: "bildung",
    skills: MUSIK_SKILLS,
    kette: MUSIK_HAUPTKETTE,
  },
  {
    id: "hauswirtschaft",
    name: BILDUNGS_BEREICH_BY_ID.hauswirtschaft.name,
    color: BILDUNGS_BEREICH_BY_ID.hauswirtschaft.color,
    art: "bildung",
    skills: HAUSWIRTSCHAFT_SKILLS,
    kette: HAUSWIRTSCHAFT_HAUPTKETTE,
  },
  {
    id: "lernen-lernen",
    name: BILDUNGS_BEREICH_BY_ID["lernen-lernen"].name,
    color: BILDUNGS_BEREICH_BY_ID["lernen-lernen"].color,
    art: "bildung",
    skills: LERNEN_LERNEN_SKILLS,
    kette: LERNEN_LERNEN_HAUPTKETTE,
  },
  {
    id: "fremdsprachen",
    name: BILDUNGS_BEREICH_BY_ID.fremdsprachen.name,
    color: BILDUNGS_BEREICH_BY_ID.fremdsprachen.color,
    art: "bildung",
    skills: FREMDSPRACHEN_SKILLS,
    kette: FREMDSPRACHEN_HAUPTKETTE,
  },
  {
    id: "gesellschaft",
    name: BILDUNGS_BEREICH_BY_ID.gesellschaft.name,
    color: BILDUNGS_BEREICH_BY_ID.gesellschaft.color,
    art: "bildung",
    skills: GESELLSCHAFT_SKILLS,
    kette: GESELLSCHAFT_HAUPTKETTE,
  },
  {
    id: "religion-ethik",
    name: BILDUNGS_BEREICH_BY_ID["religion-ethik"].name,
    color: BILDUNGS_BEREICH_BY_ID["religion-ethik"].color,
    art: "bildung",
    skills: RELIGION_ETHIK_SKILLS,
    kette: RELIGION_ETHIK_HAUPTKETTE,
  },
  {
    id: "berufsorientierung",
    name: BILDUNGS_BEREICH_BY_ID.berufsorientierung.name,
    color: BILDUNGS_BEREICH_BY_ID.berufsorientierung.color,
    art: "bildung",
    skills: BERUFSORIENTIERUNG_SKILLS,
    kette: BERUFSORIENTIERUNG_HAUPTKETTE,
  },
]

type ViewMode = "bahn" | "constellation" | "querschnitt" | "anfragen"

export function SkillBahnView(_props: ModuleViewProps) {
  const [aktivId, setAktivId] = useState<string>("holz")
  const [skillId, setSkillId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("constellation")
  const { progress, effectiveSkills, setTier, clearTier, count: erreichteCount } = useSkillV2Progress()
  const { myRequests, requestAttestation, withdrawRequest } = useSkillAttestations()

  const aktiv = BEREICHE.find((b) => b.id === aktivId) ?? BEREICHE[0]

  const aktivSkill = useMemo(() => {
    if (!skillId) return null
    return aktiv.skills.find((s) => s.id === skillId) ?? null
  }, [aktiv.skills, skillId])

  // Alle Skills aus allen Bereichen plus Querschnitte — fuer Constellation-Fortschritt
  const allSkills = useMemo(() => {
    return [
      ...BEREICHE.flatMap((b) => b.skills),
      ...DREI_HAENDE_SKILLS,
    ]
  }, [])

  // Drei-Haende-Sicherheits-Lizenz pruefen
  const dreiHaendeStatus = useMemo(() => {
    return DREI_HAENDE_FULL.map((hand) => {
      const erreicht = hand.buendel.every((skillName) => {
        // Wurzel-Skills tragen Namen, keine IDs in buendel — wir suchen via Skill-Name
        const skill = DREI_HAENDE_SKILLS.find((s) => s.name === skillName)
        if (!skill) return false
        const tier = progress.skills[skill.id]
        if (!tier) return false
        return tierStufe(tier) >= tierStufe(hand.schwellenTier)
      })
      return { hand, erreicht }
    })
  }, [progress.skills])

  const alleHaendeErreicht = dreiHaendeStatus.every((s) => s.erreicht)
  const istHandwerksBereich = aktiv.art === "handwerk"

  function handleSelectBereich(id: string) {
    setAktivId(id)
    setSkillId(null)
    setViewMode("bahn")
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Header + Toggle */}
      <div className="rounded-2xl p-4 bg-card">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-xl font-bold">Skill-Bahnen</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("constellation")}
              className={`
                px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                ${viewMode === "constellation" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50"}
              `}
            >
              Constellation
            </button>
            <button
              onClick={() => setViewMode("bahn")}
              className={`
                px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                ${viewMode === "bahn" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50"}
              `}
            >
              Bahn
            </button>
            <button
              onClick={() => setViewMode("querschnitt")}
              className={`
                px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                ${viewMode === "querschnitt" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50"}
              `}
            >
              Querschnitt
            </button>
            <button
              onClick={() => setViewMode("anfragen")}
              className={`
                px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                ${viewMode === "anfragen" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50"}
              `}
            >
              Anfragen
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Drei Schichten: acht Potenzialfelder als Constellation, achtzehn Bereiche
          als Hub-and-Spoke, Skill-Ketten als Bahn. Sechs Tier-Stufen — gespuert,
          probiert, kann, kann-lehren, meistert, gibt-weiter.
        </p>
      </div>

      {viewMode === "constellation" ? (
        <ConstellationView
          onBereichSelect={handleSelectBereich}
          selectedBereichId={aktivId}
          userTiers={progress.skills}
          allSkills={allSkills}
        />
      ) : viewMode === "querschnitt" ? (
        <QuerschnittView />
      ) : viewMode === "anfragen" ? (
        <AttestationInbox allSkills={allSkills} />
      ) : (
        <>
      {/* Bereich-Auswahl (Tabs) */}
      <div className="flex flex-wrap gap-2">
        {BEREICHE.map((b) => {
          const isAktiv = b.id === aktiv.id
          return (
            <button
              key={b.id}
              onClick={() => handleSelectBereich(b.id)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-semibold transition-colors
                ${isAktiv ? "text-background" : "text-muted-foreground hover:text-foreground"}
              `}
              style={
                isAktiv
                  ? { backgroundColor: b.color, color: "white" }
                  : { backgroundColor: `${b.color}20` }
              }
            >
              {b.name}
              <span className="ml-1 text-[10px] opacity-70">
                {b.art === "handwerk" ? "Handwerk" : "Bildung"}
              </span>
            </button>
          )
        })}
      </div>

      {/* Drei-Haende-Sicherheits-Lizenz vor Handwerks-Bereichen */}
      {istHandwerksBereich && !alleHaendeErreicht && (
        <div className="rounded-2xl p-4 bg-amber-50 border-l-4 border-amber-400">
          <div className="flex items-start gap-3">
            <div className="text-xl">✋</div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1">Eingangsschwelle: Drei Haende</div>
              <div className="text-xs text-muted-foreground mb-2">
                Vor jedem Handwerks-Bereich liegen die drei Wurzel-Haende.
                Wer sie auf Tier "probiert" hat, geht sicher in die Werkstatt.
              </div>
              <div className="flex flex-wrap gap-2">
                {dreiHaendeStatus.map(({ hand, erreicht }) => (
                  <span
                    key={hand.id}
                    className={`text-[11px] px-2 py-1 rounded-md ${
                      erreicht
                        ? "bg-emerald-500 text-white font-semibold"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {erreicht ? "✓ " : "○ "}
                    {hand.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bahn-Visualisierung */}
      <SkillKettenBahn
        kette={aktiv.kette}
        skills={aktiv.skills}
        bereichColor={aktiv.color}
        selectedSkillId={skillId}
        userTiers={effectiveSkills}
        onSkillClick={(id) => setSkillId(id === skillId ? null : id)}
      />

      {/* Skill-Detail-Panel */}
      {aktivSkill && (
        <div className="rounded-2xl p-4 bg-card" style={{ borderLeft: `4px solid ${aktiv.color}` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">{aktivSkill.name}</h2>
              <div className="text-sm text-muted-foreground mb-2">
                Tier {TIER_BY_ID[aktivSkill.tier].name}
                {aktivSkill.dqrNiveau ? ` · DQR ${aktivSkill.dqrNiveau}` : ""}
                {" · "}{aktivSkill.altersFreigabe}
              </div>
              {aktivSkill.beschreibung && (
                <p className="text-sm mb-3">{aktivSkill.beschreibung}</p>
              )}
            </div>
            <button
              onClick={() => setSkillId(null)}
              className="text-muted-foreground hover:text-foreground text-sm"
              aria-label="Detail schliessen"
            >
              X
            </button>
          </div>

          {aktivSkill.voraussetzungen.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-foreground mb-1">Voraussetzungen</div>
              <ul className="text-xs space-y-1">
                {aktivSkill.voraussetzungen.map((v) => {
                  const target = aktiv.skills.find((s) => s.id === v.to)
                  const farbe =
                    v.typ === "pflicht" ? "text-red-600" :
                    v.typ === "empfohlen" ? "text-amber-600" :
                    "text-emerald-600"
                  return (
                    <li key={v.to} className={farbe}>
                      {v.typ === "pflicht" ? "⚠" : v.typ === "empfohlen" ? "→" : "↔"}{" "}
                      {target?.name ?? v.to} <span className="text-muted-foreground">({v.typ})</span>
                      {v.begruendung && <span className="text-muted-foreground"> — {v.begruendung}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {aktivSkill.probeAufgabe && (
            <div
              className="mt-3 p-3 rounded-lg"
              style={{ backgroundColor: `${aktiv.color}10` }}
            >
              <div className="text-xs font-semibold mb-1">
                Probe-Aufgabe: {aktivSkill.probeAufgabe.titel}
              </div>
              <p className="text-xs mb-2">{aktivSkill.probeAufgabe.beschreibung}</p>
              <div className="text-[10px] text-muted-foreground">
                {aktivSkill.probeAufgabe.zeitMinuten} Minuten · Material:{" "}
                {aktivSkill.probeAufgabe.materialBenoetigt.join(", ")}
              </div>
            </div>
          )}

          {aktivSkill.innereLinie && aktivSkill.innereLinie.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold mb-1">Innere Linie</div>
              <div className="flex flex-wrap gap-1">
                {aktivSkill.innereLinie.map((l) => (
                  <span
                    key={l}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-900"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {aktivSkill.attestationModi.map((m) => (
              <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">
                Beleg: {m}
              </span>
            ))}
          </div>

          {/* Selbst-Eintrag der ersten zwei Tier-Stufen */}
          <div className="mt-4 pt-3 border-t border-foreground/10">
            <div className="text-xs font-semibold mb-2">Mein Fortschritt</div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">
                {effectiveSkills[aktivSkill.id]
                  ? `Aktuell: ${TIER_BY_ID[effectiveSkills[aktivSkill.id]].name}`
                  : "Noch nicht eingetragen"}
              </span>
              <button
                onClick={() => setTier(aktivSkill.id, "gespuert")}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  progress.skills[aktivSkill.id] === "gespuert"
                    ? "text-white font-semibold"
                    : "text-foreground hover:opacity-80"
                }`}
                style={
                  progress.skills[aktivSkill.id] === "gespuert"
                    ? { backgroundColor: aktiv.color }
                    : { backgroundColor: `${aktiv.color}30` }
                }
              >
                Hab ich gespuert
              </button>
              <button
                onClick={() => setTier(aktivSkill.id, "probiert")}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  progress.skills[aktivSkill.id] === "probiert"
                    ? "text-white font-semibold"
                    : "text-foreground hover:opacity-80"
                }`}
                style={
                  progress.skills[aktivSkill.id] === "probiert"
                    ? { backgroundColor: aktiv.color }
                    : { backgroundColor: `${aktiv.color}30` }
                }
              >
                Hab ich probiert
              </button>
              {progress.skills[aktivSkill.id] && (
                <button
                  onClick={() => clearTier(aktivSkill.id)}
                  className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  Zuruecksetzen
                </button>
              )}
            </div>

            {/* Attestation-Anfrage fuer Tier 3 (kann) */}
            {(() => {
              const offeneAnfrage = myRequests.find((r) => {
                const d = r.data as { skillId: string; status: string }
                return d.skillId === aktivSkill.id && d.status === "pending"
              })
              const erreichterTier = effectiveSkills[aktivSkill.id]
              const erreichtKann = erreichterTier && tierStufe(erreichterTier) >= 3

              if (erreichtKann) {
                return (
                  <div className="mt-3 text-xs text-emerald-700">
                    ✓ Bestaetigung erhalten — Tier "{TIER_BY_ID[erreichterTier!].name}".
                  </div>
                )
              }
              if (offeneAnfrage) {
                return (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-violet-700 font-semibold">
                      Anfrage offen — wartet auf Mentor.
                    </span>
                    <button
                      onClick={() => withdrawRequest(offeneAnfrage.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      zuruecknehmen
                    </button>
                  </div>
                )
              }
              return (
                <div className="mt-3">
                  <button
                    onClick={() => requestAttestation(aktivSkill.id, "kann")}
                    className="text-xs px-2 py-1 rounded-md font-semibold text-white"
                    style={{ backgroundColor: "#6B21A8" }}
                  >
                    "Kann ich" — Bestaetigung anfragen
                  </button>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Anfrage geht an alle Mentoren im Netz. Wer erkennt, dass du kannst, bestaetigt.
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {erreichteCount > 0 && (
        <div className="rounded-2xl p-3 bg-card text-xs text-muted-foreground">
          Eigener Stand: <span className="font-semibold text-foreground">{erreichteCount}</span> Skills eingetragen.
        </div>
      )}
        </>
      )}
    </div>
  )
}
