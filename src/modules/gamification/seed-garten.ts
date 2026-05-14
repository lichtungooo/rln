/**
 * Seed-Daten — Garten und Pflanzen-Werkstatt (Stand 14.05.2026).
 *
 * Hauptkette: Boden spueren -> Saen -> Pikieren -> Pflanzen -> Pflegen
 *             -> Ernten -> Kompost -> Veredeln -> Permakultur -> Kraeuter-Spirale
 *
 * Niedrigste Einstiegshuerde aller Werkstaetten: Saen ab 6 Jahren.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const G = "garten:"

export const GARTEN_SKILLS: SkillV2[] = [
  {
    id: G + "boden-spueren",
    name: "Boden spueren",
    beschreibung: "In die Hand nehmen, riechen, kruemeln — Boden ist Leben.",
    potenzialfelder: ["welt-wachstum", "koerper-bewegung"],
    handwerksBereich: "garten",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["natur", "rueckverbindung"],
  },
  {
    id: G + "saen",
    name: "Saen",
    beschreibung: "Saatkorn in die Erde, sanft druecken, giessen.",
    potenzialfelder: ["welt-wachstum"],
    handwerksBereich: "garten",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: G + "boden-spueren", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
    probeAufgabe: {
      titel: "Drei Toepfchen Kresse",
      beschreibung: "Drei kleine Toepfchen mit Kresse aussaen, taeglich giessen, nach einer Woche ernten.",
      zeitMinuten: 15,
      materialBenoetigt: ["Drei Toepfchen", "Erde", "Kresse-Samen", "Giesskanne"],
    },
  },
  {
    id: G + "pikieren",
    name: "Pikieren",
    beschreibung: "Kleine Pflaenzchen vereinzeln — jedes bekommt seinen Platz.",
    potenzialfelder: ["welt-wachstum", "koerper-bewegung"],
    handwerksBereich: "garten",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: G + "saen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: G + "pflanzen",
    name: "Pflanzen setzen",
    beschreibung: "Mit Pflanzkelle die Pflanze in den Boden bringen.",
    potenzialfelder: ["welt-wachstum"],
    handwerksBereich: "garten",
    tier: "kann",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: G + "boden-spueren", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: G + "giessen",
    name: "Giessen",
    beschreibung: "Wasser dosieren — nicht zu viel, nicht zu wenig.",
    potenzialfelder: ["welt-wachstum"],
    handwerksBereich: "garten",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
  },
  {
    id: G + "kompost",
    name: "Kompost setzen",
    beschreibung: "Schichten aus Gruen und Braun — Erde aus Resten.",
    potenzialfelder: ["welt-wachstum"],
    handwerksBereich: "garten",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: G + "boden-spueren", typ: "empfohlen" },
    ],
    attestationModi: ["peer"],
    innereLinie: ["natur"],
  },
  {
    id: G + "ernten",
    name: "Ernten",
    beschreibung: "Reif erkennen, sanft trennen, in den Korb.",
    potenzialfelder: ["welt-wachstum", "koerper-bewegung"],
    handwerksBereich: "garten",
    tier: "kann",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: G + "pflanzen", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: G + "veredeln",
    name: "Veredeln",
    beschreibung: "Zwei Pflanzen werden eine — Kambium auf Kambium.",
    potenzialfelder: ["welt-wachstum", "stoff-form"],
    handwerksBereich: "garten",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: G + "pflanzen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: G + "heilkraeuter",
    name: "Heilkraeuter erkennen",
    beschreibung: "Bestimmen, sammeln, trocknen — Heilung waechst am Wegrand.",
    potenzialfelder: ["welt-wachstum", "mensch-verbindung"],
    handwerksBereich: "garten",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["meister"],
    innereLinie: ["natur", "rueckverbindung"],
  },
  {
    id: G + "permakultur",
    name: "Permakultur bauen",
    beschreibung: "Kreislaeufe denken, Stockwerke pflanzen — Garten als System.",
    potenzialfelder: ["welt-wachstum", "system-logik", "initiative-werk"],
    handwerksBereich: "garten",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: G + "kompost", typ: "pflicht" },
      { to: G + "veredeln", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: G + "kraeuter-spirale",
    name: "Kraeuter-Spirale",
    beschreibung: "Drei Meter Spirale aus Stein — vom feuchten Tal zum trockenen Gipfel.",
    potenzialfelder: ["raum-bau", "welt-wachstum", "initiative-werk"],
    handwerksBereich: "garten",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: G + "permakultur", typ: "pflicht" },
      { to: G + "heilkraeuter", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const GARTEN_HAUPTKETTE: SkillKette = {
  id: "garten:hauptkette",
  name: "Vom Saatkorn zur Spirale",
  bereich: "garten",
  skillIds: [
    G + "boden-spueren",
    G + "giessen",
    G + "saen",
    G + "pikieren",
    G + "pflanzen",
    G + "kompost",
    G + "ernten",
    G + "veredeln",
    G + "heilkraeuter",
    G + "permakultur",
    G + "kraeuter-spirale",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eine drei Meter Kraeuter-Spirale aus Stein",
}

export const GARTEN_KETTEN: SkillKette[] = [GARTEN_HAUPTKETTE]
