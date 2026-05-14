/**
 * Seed-Daten — Musik (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Tier-basiert mit Verzweigung bei Instrument.
 *
 * Hauptkette: Hoeren -> Rhythmus -> Singen -> Instrument waehlen -> Spielen
 *             -> Noten lesen -> Komponieren -> eigene Band
 *
 * Verzweigung bei Instrument: Saite / Tasten / Blas / Schlag.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const MU = "musik:"

export const MUSIK_SKILLS: SkillV2[] = [
  {
    id: MU + "hoeren",
    name: "Hoeren",
    beschreibung: "Stille, Klang, Pause — Musik beginnt im Ohr.",
    potenzialfelder: ["stoff-form", "mensch-verbindung"],
    bildungsBereich: "musik",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille"],
  },
  {
    id: MU + "rhythmus",
    name: "Rhythmus klatschen",
    beschreibung: "Takt, Schlag, Pause — der Koerper wird Trommel.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "musik",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: MU + "hoeren", typ: "empfohlen" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: MU + "singen",
    name: "Singen",
    beschreibung: "Stimme, Atem, Hoehe, Tiefe — die eigene Klangfarbe finden.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "musik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: MU + "hoeren", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "selbsterkenntnis"],
  },
  {
    id: MU + "instrument-saite",
    name: "Saiten-Instrument",
    beschreibung: "Gitarre, Bass, Geige — Saite und Hand werden Klang.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "musik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: MU + "rhythmus", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: MU + "instrument-tasten",
    name: "Tasten-Instrument",
    beschreibung: "Klavier, Keyboard, Akkordeon — beide Haende spielen mit.",
    potenzialfelder: ["stoff-form", "koerper-bewegung", "system-logik"],
    bildungsBereich: "musik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: MU + "rhythmus", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: MU + "instrument-blas",
    name: "Blas-Instrument",
    beschreibung: "Floete, Saxophon, Trompete — Atem wird Ton.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "musik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: MU + "singen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["koerper"],
  },
  {
    id: MU + "instrument-schlag",
    name: "Schlag-Instrument",
    beschreibung: "Trommel, Cajon, Drumset — der Puls der Musik.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "musik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: MU + "rhythmus", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: MU + "noten",
    name: "Noten lesen",
    beschreibung: "Liniensystem, Noten, Pausen — Musik auf Papier.",
    potenzialfelder: ["stoff-form", "system-logik", "wort-wirkung"],
    bildungsBereich: "musik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: MU + "komponieren",
    name: "Komponieren",
    beschreibung: "Eigene Melodie, eigener Rhythmus — die Musik wird Werk.",
    potenzialfelder: ["stoff-form", "initiative-werk"],
    bildungsBereich: "musik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: MU + "noten", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: MU + "band",
    name: "Eigene Band",
    beschreibung: "Mit anderen zusammen Musik machen — der Klang wird Gemeinschaft.",
    potenzialfelder: ["stoff-form", "mensch-verbindung", "initiative-werk"],
    bildungsBereich: "musik",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: MU + "komponieren", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const MUSIK_HAUPTKETTE: SkillKette = {
  id: "musik:hauptkette",
  name: "Vom Hoeren zur eigenen Band",
  bereich: "musik",
  skillIds: [
    MU + "hoeren",
    MU + "rhythmus",
    MU + "singen",
    MU + "noten",
    MU + "komponieren",
    MU + "band",
  ],
  verzweigungen: [
    {
      ab: MU + "singen",
      aeste: [
        { name: "Saite", skillIds: [MU + "instrument-saite"] },
        { name: "Tasten", skillIds: [MU + "instrument-tasten"] },
        { name: "Blas", skillIds: [MU + "instrument-blas"] },
        { name: "Schlag", skillIds: [MU + "instrument-schlag"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Band, eigene Lieder, erstes Konzert",
}

export const MUSIK_KETTEN: SkillKette[] = [MUSIK_HAUPTKETTE]
