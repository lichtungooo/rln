/**
 * Seed-Daten — Holz-Werkstatt (Pilot-Bereich, Stand 14.05.2026).
 *
 * Erste Anwendung der neuen Skill-System-Typen (skill-system.ts).
 * Holz ist der natuerliche Erst-Pilot: Hornbach-Sortiment, Festival-Anker,
 * kindgerecht ab 6 (Schleifen), wachsende Tiefe bis Drechseln und Moebel.
 *
 * Hauptkette: Holz spueren -> Schleifen -> Mass nehmen -> Saegen -> Bohren
 *             -> Schrauben -> Hobeln -> Zinken -> Drechseln -> eigene Bank
 *
 * Verzweigung bei Hobeln:
 *   - Moebel-Pfad: Leimen -> Furnieren -> eigenes Moebel
 *   - Kunst-Pfad: Schnitzen -> Intarsie -> Skulptur
 *
 * Sicherheits-Schwellen (DGUV):
 *   - Tischkreissaege ab 16 (eigene Quest, nicht in der Hauptkette)
 *   - Drechselbank ab 14
 */

import type { SkillV2, SkillKette } from "./skill-system"

const HOLZ_PREFIX = "holz:"

export const HOLZ_SKILLS: SkillV2[] = [
  {
    id: HOLZ_PREFIX + "spueren",
    name: "Holz spueren",
    beschreibung: "Holz in die Hand nehmen, riechen, fuehlen. Die Maserung lesen.",
    potenzialfelder: ["welt-wachstum", "stoff-form"],
    handwerksBereich: "holz",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["natur", "stille"],
  },
  {
    id: HOLZ_PREFIX + "schleifen",
    name: "Schleifen",
    beschreibung: "Mit Schleifpapier glaette das Werkstueck — von grob nach fein.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    handwerksBereich: "holz",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "spueren", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
    innereLinie: ["koerper"],
    probeAufgabe: {
      titel: "Glatter Holzklotz",
      beschreibung: "Schleife einen rauen Holzklotz so glatt, dass kein Splitter mehr stoert.",
      zeitMinuten: 20,
      materialBenoetigt: ["Holzklotz", "Schleifpapier 80", "Schleifpapier 120", "Schleifpapier 240"],
    },
  },
  {
    id: HOLZ_PREFIX + "mass-nehmen",
    name: "Mass nehmen",
    beschreibung: "Zollstock, Anschlagwinkel, Bleistift. Anreissen lernen.",
    potenzialfelder: ["raum-bau", "system-logik"],
    handwerksBereich: "holz",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    externalAnchors: [{ framework: "esco", code: "S3.2.1" }],
  },
  {
    id: HOLZ_PREFIX + "saegen",
    name: "Saegen",
    beschreibung: "Mit der Handsaege gerade durch das Brett. Stand und Atem.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    handwerksBereich: "holz",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "mass-nehmen", typ: "pflicht", begruendung: "Erst Mass, dann Schnitt." },
      { to: HOLZ_PREFIX + "schleifen", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer", "meister"],
    innereLinie: ["koerper", "stille"],
    probeAufgabe: {
      titel: "Brett gerade saegen",
      beschreibung: "Saege ein Brett auf 30 cm — die Schnittkante traegt kein Fasern-Ausriss.",
      zeitMinuten: 15,
      materialBenoetigt: ["Brett 50 cm", "Handsaege", "Anschlagwinkel", "Schraubzwinge"],
    },
  },
  {
    id: HOLZ_PREFIX + "bohren",
    name: "Bohren",
    beschreibung: "Akkubohrer oder Saeulenbohrer — Loch an markierter Stelle.",
    potenzialfelder: ["raum-bau", "system-logik"],
    handwerksBereich: "holz",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "mass-nehmen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: HOLZ_PREFIX + "schrauben",
    name: "Schrauben",
    beschreibung: "Akkuschrauber, Bits, Drehmoment. Vorbohren, dann fest.",
    potenzialfelder: ["raum-bau"],
    handwerksBereich: "holz",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "bohren", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: HOLZ_PREFIX + "hobeln",
    name: "Hobeln",
    beschreibung: "Mit dem Handhobel — gleichmaessige Spaene, glatte Flaeche.",
    potenzialfelder: ["raum-bau", "stoff-form", "koerper-bewegung"],
    handwerksBereich: "holz",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "schleifen", typ: "empfohlen" },
      { to: HOLZ_PREFIX + "mass-nehmen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: HOLZ_PREFIX + "leimen",
    name: "Leimen",
    beschreibung: "Holzleim, Zwingen, Anzugszeit. Zwei Teile werden eins.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    handwerksBereich: "holz",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "hobeln", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: HOLZ_PREFIX + "furnieren",
    name: "Furnieren",
    beschreibung: "Duennes Furnier auf Tragholz aufkaschieren.",
    potenzialfelder: ["stoff-form"],
    handwerksBereich: "holz",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "leimen", typ: "pflicht" },
      { to: HOLZ_PREFIX + "schleifen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: HOLZ_PREFIX + "schnitzen",
    name: "Schnitzen",
    beschreibung: "Schnitzmesser, Klueppel — Form aus dem Holz holen.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    handwerksBereich: "holz",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "schleifen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["stille", "selbsterkenntnis"],
  },
  {
    id: HOLZ_PREFIX + "intarsie",
    name: "Intarsie",
    beschreibung: "Verschiedene Hoelzer als Bild zusammenlegen.",
    potenzialfelder: ["stoff-form"],
    handwerksBereich: "holz",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "schnitzen", typ: "empfohlen" },
      { to: HOLZ_PREFIX + "leimen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: HOLZ_PREFIX + "zinken",
    name: "Zinken sticheln",
    beschreibung: "Schwalbenschwanz-Verbindung — die Koenigin der Holzverbindungen.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    handwerksBereich: "holz",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "saegen", typ: "pflicht" },
      { to: HOLZ_PREFIX + "mass-nehmen", typ: "pflicht" },
      { to: HOLZ_PREFIX + "hobeln", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: HOLZ_PREFIX + "drechseln",
    name: "Drechseln",
    beschreibung: "An der Drechselbank — runde Form aus dem Rohling.",
    potenzialfelder: ["stoff-form", "raum-bau", "koerper-bewegung"],
    handwerksBereich: "holz",
    tier: "meistert",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "mass-nehmen", typ: "pflicht" },
      { to: HOLZ_PREFIX + "schleifen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["koerper", "stille"],
    probeAufgabe: {
      titel: "Gedrechselter Loeffel",
      beschreibung: "An der Drechselbank ein Loeffel-Rohling formen, von Hand fertigschleifen.",
      zeitMinuten: 90,
      materialBenoetigt: ["Drechselbank", "Drechseleisen", "Hartholz-Rohling", "Schleifpapier"],
    },
  },
  {
    id: HOLZ_PREFIX + "eigene-bank",
    name: "Eigene Bank",
    beschreibung: "Konstruktion, Verleimung, Oberflaeche — eine Bank fuer den Garten oder die Schule.",
    potenzialfelder: ["raum-bau", "initiative-werk"],
    handwerksBereich: "holz",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: HOLZ_PREFIX + "zinken", typ: "empfohlen" },
      { to: HOLZ_PREFIX + "schrauben", typ: "pflicht" },
      { to: HOLZ_PREFIX + "leimen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const HOLZ_SKILL_BY_ID: Record<string, SkillV2> = HOLZ_SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<string, SkillV2>
)

// ============================================================
// Skill-Kette Holz — Vom Splitter zur Bank
// ============================================================

export const HOLZ_HAUPTKETTE: SkillKette = {
  id: "holz:hauptkette",
  name: "Vom Splitter zur Bank",
  bereich: "holz",
  skillIds: [
    HOLZ_PREFIX + "spueren",
    HOLZ_PREFIX + "schleifen",
    HOLZ_PREFIX + "mass-nehmen",
    HOLZ_PREFIX + "saegen",
    HOLZ_PREFIX + "bohren",
    HOLZ_PREFIX + "schrauben",
    HOLZ_PREFIX + "hobeln",
    HOLZ_PREFIX + "zinken",
    HOLZ_PREFIX + "drechseln",
    HOLZ_PREFIX + "eigene-bank",
  ],
  verzweigungen: [
    {
      ab: HOLZ_PREFIX + "hobeln",
      aeste: [
        {
          name: "Moebel-Pfad",
          skillIds: [HOLZ_PREFIX + "leimen", HOLZ_PREFIX + "furnieren"],
        },
        {
          name: "Kunst-Pfad",
          skillIds: [HOLZ_PREFIX + "schnitzen", HOLZ_PREFIX + "intarsie"],
        },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Bank fuer den Garten oder die Schule",
}

export const HOLZ_KETTEN: SkillKette[] = [HOLZ_HAUPTKETTE]
