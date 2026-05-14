/**
 * Seed-Daten — Gesellschaft (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Constellation. Acht Themen lose verbunden, jedes atmet fuer sich.
 *
 * Faecher: Geschichte, Geographie, Politik, Wirtschaft (NRW-Gesellschaftslehre).
 */

import type { SkillV2, SkillKette } from "./skill-system"

const G = "gesellschaft:"

export const GESELLSCHAFT_SKILLS: SkillV2[] = [
  {
    id: G + "familie",
    name: "Familie verstehen",
    beschreibung: "Generationen, Rollen, Verantwortung — die kleinste Gesellschaft.",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "gesellschaft",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
  },
  {
    id: G + "nachbarschaft",
    name: "Nachbarschaft",
    beschreibung: "Die Menschen um uns — wer wohnt da, wer macht was?",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "gesellschaft",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: G + "stadt",
    name: "Stadt verstehen",
    beschreibung: "Verwaltung, Vereine, Stadtrat — wie die Stadt sich selbst traegt.",
    potenzialfelder: ["mensch-verbindung", "initiative-werk"],
    bildungsBereich: "gesellschaft",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: G + "geschichte",
    name: "Geschichte",
    beschreibung: "Quelle lesen, Zeit-Achsen verstehen, historisch urteilen.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "gesellschaft",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: G + "geographie",
    name: "Geographie",
    beschreibung: "Karte lesen, Raum verstehen, oekologisch denken.",
    potenzialfelder: ["raum-bau", "welt-wachstum"],
    bildungsBereich: "gesellschaft",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: G + "politik",
    name: "Politik verstehen",
    beschreibung: "Wahl, Demokratie, Verfahren — wer entscheidet, wie wird entschieden?",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung", "initiative-werk"],
    bildungsBereich: "gesellschaft",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: G + "stadt", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: G + "wirtschaft",
    name: "Wirtschaft verstehen",
    beschreibung: "Markt, Konsum, Unternehmen, Geld — wie der Wert sich bewegt.",
    potenzialfelder: ["system-logik", "initiative-werk"],
    bildungsBereich: "gesellschaft",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["meister"],
  },
  {
    id: G + "recht",
    name: "Recht verstehen",
    beschreibung: "Gesetz, Vertrag, Vereinbarung — wie Gesellschaft sich Regeln gibt.",
    potenzialfelder: ["mensch-verbindung", "system-logik"],
    bildungsBereich: "gesellschaft",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: G + "politik", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: G + "welt",
    name: "Welt verstehen",
    beschreibung: "Global denken, lokal handeln — die Verbindung der Kontinente.",
    potenzialfelder: ["welt-wachstum", "mensch-verbindung"],
    bildungsBereich: "gesellschaft",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: G + "geographie", typ: "pflicht" },
      { to: G + "geschichte", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["rueckverbindung"],
  },
]

export const GESELLSCHAFT_HAUPTKETTE: SkillKette = {
  id: "gesellschaft:hauptkette",
  name: "Von der Familie zur Welt",
  bereich: "gesellschaft",
  skillIds: [
    G + "familie",
    G + "nachbarschaft",
    G + "stadt",
    G + "geschichte",
    G + "geographie",
    G + "politik",
    G + "wirtschaft",
    G + "recht",
    G + "welt",
  ],
  zielTier: "meistert",
  werkstueck: "Verstaendnis der Gesellschaft auf allen Ebenen — Familie bis Welt",
}

export const GESELLSCHAFT_KETTEN: SkillKette[] = [GESELLSCHAFT_HAUPTKETTE]
