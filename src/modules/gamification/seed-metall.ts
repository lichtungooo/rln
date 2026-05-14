/**
 * Seed-Daten — Metall-Werkstatt (Stand 14.05.2026).
 *
 * Hauptkette: Stahl erkennen -> Feilen -> Saegen -> Bohren -> Biegen
 *             -> Schmieden -> Schweissen -> eigenes Messer
 *
 * Sicherheits-Schwellen (DGUV):
 *   - Heisse Arbeiten (Esse, Hammer) ab 12 mit Aufsicht
 *   - Schweissen ab 16, Autogen ab 18
 */

import type { SkillV2, SkillKette } from "./skill-system"

const M = "metall:"

export const METALL_SKILLS: SkillV2[] = [
  {
    id: M + "stahl-erkennen",
    name: "Stahl erkennen",
    beschreibung: "Funken-Probe, Klang, Magnet — die Sorte am Material spueren.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    handwerksBereich: "metall",
    tier: "gespuert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: M + "feilen",
    name: "Feilen",
    beschreibung: "Mit Feile und Schraubstock — von grob nach fein.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    handwerksBereich: "metall",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: M + "stahl-erkennen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: M + "saegen",
    name: "Saegen (Metall)",
    beschreibung: "Buegelsaege, gespanntes Saegeblatt, gerader Schnitt.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    handwerksBereich: "metall",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: M + "bohren",
    name: "Bohren (Metall)",
    beschreibung: "Saeulenbohrer, HSS-Bohrer, Schmierung, Drehzahl beachten.",
    potenzialfelder: ["system-logik", "raum-bau"],
    handwerksBereich: "metall",
    tier: "probiert",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: M + "stahl-erkennen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: M + "biegen",
    name: "Biegen",
    beschreibung: "Material kalt formen — am Schraubstock, mit Gabelschluessel.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    handwerksBereich: "metall",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: M + "stahl-erkennen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: M + "hammer",
    name: "Hammer schwingen",
    beschreibung: "1-3 kg Hammer, fester Stand, Schlag aus der Schulter.",
    potenzialfelder: ["koerper-bewegung", "stoff-form"],
    handwerksBereich: "metall",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
    innereLinie: ["koerper"],
  },
  {
    id: M + "feuer-fuehren",
    name: "Feuer fuehren",
    beschreibung: "Esse, Blasebalg, Kohle — das Feuer wird Werkzeug.",
    potenzialfelder: ["welt-wachstum", "koerper-bewegung"],
    handwerksBereich: "metall",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["meister"],
    innereLinie: ["natur", "stille"],
  },
  {
    id: M + "schmieden",
    name: "Schmieden",
    beschreibung: "Gluehendes Eisen formen — anspitzen, breiten, stauchen.",
    potenzialfelder: ["raum-bau", "stoff-form", "koerper-bewegung"],
    handwerksBereich: "metall",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: M + "feuer-fuehren", typ: "pflicht" },
      { to: M + "hammer", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["koerper", "stille", "natur"],
    probeAufgabe: {
      titel: "Geschmiedeter Haken",
      beschreibung: "Aus einem Rundstahl-Stueck einen Haken schmieden — anspitzen, biegen, fertigen.",
      zeitMinuten: 60,
      materialBenoetigt: ["Esse", "Hammer", "Amboss", "Zange", "Rundstahl 8mm"],
    },
  },
  {
    id: M + "schweissen",
    name: "Schweissen (WIG)",
    beschreibung: "Lichtbogen, Schutzgas, Wolframelektrode — zwei Teile werden eins.",
    potenzialfelder: ["raum-bau", "system-logik"],
    handwerksBereich: "metall",
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "ab16",
    voraussetzungen: [
      { to: M + "stahl-erkennen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: M + "haerten",
    name: "Haerten",
    beschreibung: "Auf Temperatur bringen, ablöschen — Stahl bekommt seine Härte.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    handwerksBereich: "metall",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab16",
    voraussetzungen: [
      { to: M + "feuer-fuehren", typ: "pflicht" },
      { to: M + "schmieden", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: M + "eigenes-messer",
    name: "Eigenes Messer",
    beschreibung: "Klinge schmieden, haerten, schleifen, Griff — ein Messer von Anfang bis Ende.",
    potenzialfelder: ["raum-bau", "stoff-form", "initiative-werk"],
    handwerksBereich: "metall",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab16",
    voraussetzungen: [
      { to: M + "schmieden", typ: "pflicht" },
      { to: M + "haerten", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const METALL_HAUPTKETTE: SkillKette = {
  id: "metall:hauptkette",
  name: "Vom Hammer zum Messer",
  bereich: "metall",
  skillIds: [
    M + "stahl-erkennen",
    M + "feilen",
    M + "saegen",
    M + "bohren",
    M + "biegen",
    M + "hammer",
    M + "feuer-fuehren",
    M + "schmieden",
    M + "haerten",
    M + "eigenes-messer",
  ],
  verzweigungen: [
    {
      ab: M + "biegen",
      aeste: [
        {
          name: "Schmuck-Pfad",
          skillIds: [],  // Treiben, Punzen — kommt in Pilot Schmuck
        },
        {
          name: "Schweiss-Pfad",
          skillIds: [M + "schweissen"],
        },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigenes geschmiedetes Messer mit gehaertetem Klingen-Stahl",
}

export const METALL_KETTEN: SkillKette[] = [METALL_HAUPTKETTE]
