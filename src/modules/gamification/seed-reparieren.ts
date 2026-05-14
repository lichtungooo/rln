/**
 * Seed-Daten — Reparieren und Upcycling-Werkstatt (Stand 14.05.2026).
 *
 * Sonderform: Hub-and-Spoke (Diablo-II-Pattern).
 *   Wurzel "Diagnose" mit vier Spokes (Holz, Metall, Stoff, Elektronik).
 *   Wer drei Spokes auf Tier 3 (kann) bringt -> Universal-Macher als Anker.
 *
 * Niedrige Eintrittshuerde: Fehler beobachten ab 8.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const R = "reparieren:"

export const REPARIEREN_SKILLS: SkillV2[] = [
  {
    id: R + "fehler-beobachten",
    name: "Fehler beobachten",
    beschreibung: "Schauen, hoeren, fuehlen — was stimmt nicht am Geraet?",
    potenzialfelder: ["system-logik", "mensch-verbindung"],
    handwerksBereich: "reparieren",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille"],
  },
  {
    id: R + "fehler-erzaehlen",
    name: "Fehler erzaehlen",
    beschreibung: "In Worten sagen, was nicht stimmt — ohne Schuld, mit Klarheit.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    handwerksBereich: "reparieren",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: R + "fehler-beobachten", typ: "pflicht" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: R + "schrauben-loesen",
    name: "Schrauben loesen",
    beschreibung: "Schraubendreher, Bit-Set — das Geraet aufmachen.",
    potenzialfelder: ["koerper-bewegung", "system-logik"],
    handwerksBereich: "reparieren",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: R + "reinigen",
    name: "Reinigen vor Reparatur",
    beschreibung: "Tuch, Buerste, Reiniger — vor jeder Reparatur kommt das Sauberkrigen.",
    potenzialfelder: ["welt-wachstum"],
    handwerksBereich: "reparieren",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst"],
  },
  // Spoke 1 — Holz-Reparatur
  {
    id: R + "holz-riss",
    name: "Holz-Riss leimen",
    beschreibung: "Riss reinigen, Leim einarbeiten, Zwingen.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    handwerksBereich: "reparieren",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: R + "fehler-beobachten", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  // Spoke 2 — Metall-Reparatur
  {
    id: R + "schraube-retten",
    name: "Gewinde retten",
    beschreibung: "Helicoil oder Gewinde-Reparatur-Set — das Loch lebt wieder.",
    potenzialfelder: ["system-logik", "raum-bau"],
    handwerksBereich: "reparieren",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: R + "schrauben-loesen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  // Spoke 3 — Stoff-Reparatur
  {
    id: R + "naehen-hand",
    name: "Naehen (Hand)",
    beschreibung: "Nadel, Faden, Knoten — der Riss wird zur Naht.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    handwerksBereich: "reparieren",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
    innereLinie: ["stille", "koerper"],
  },
  // Spoke 4 — Elektronik-Reparatur
  {
    id: R + "kabel-pruefen",
    name: "Kabel pruefen",
    beschreibung: "Multimeter ans Kabel — wo bricht der Strom?",
    potenzialfelder: ["system-logik"],
    handwerksBereich: "reparieren",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: R + "fehler-beobachten", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: R + "akku-tauschen",
    name: "Akku tauschen",
    beschreibung: "Akku raus, neuer rein — das Geraet lebt wieder.",
    potenzialfelder: ["system-logik"],
    handwerksBereich: "reparieren",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: R + "schrauben-loesen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  // Anker bei drei Spokes
  {
    id: R + "universal-macher",
    name: "Universal-Macher",
    beschreibung: "Wer drei Spokes auf Tier kann beherrscht — alles laesst sich reparieren.",
    potenzialfelder: ["system-logik", "initiative-werk"],
    handwerksBereich: "reparieren",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: R + "holz-riss", typ: "empfohlen" },
      { to: R + "schraube-retten", typ: "empfohlen" },
      { to: R + "naehen-hand", typ: "empfohlen" },
      { to: R + "kabel-pruefen", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: R + "reanimierte-bohrmaschine",
    name: "Bohrmaschine reanimieren",
    beschreibung: "Defekte Bohrmaschine zerlegen, Diagnose, Reparatur, Zusammenbau, Lauf.",
    potenzialfelder: ["system-logik", "raum-bau", "initiative-werk"],
    handwerksBereich: "reparieren",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: R + "universal-macher", typ: "empfohlen" },
      { to: R + "kabel-pruefen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const REPARIEREN_HUB_KETTE: SkillKette = {
  id: "reparieren:hub",
  name: "Vom Schrauben zur Bohrmaschine",
  bereich: "reparieren",
  skillIds: [
    R + "fehler-beobachten",
    R + "fehler-erzaehlen",
    R + "reinigen",
    R + "schrauben-loesen",
    R + "akku-tauschen",
    R + "universal-macher",
    R + "reanimierte-bohrmaschine",
  ],
  verzweigungen: [
    {
      ab: R + "schrauben-loesen",
      aeste: [
        { name: "Holz-Spoke", skillIds: [R + "holz-riss"] },
        { name: "Metall-Spoke", skillIds: [R + "schraube-retten"] },
        { name: "Stoff-Spoke", skillIds: [R + "naehen-hand"] },
        { name: "Elektronik-Spoke", skillIds: [R + "kabel-pruefen"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eine reanimierte Bohrmaschine, voll funktionsfaehig",
}

export const REPARIEREN_KETTEN: SkillKette[] = [REPARIEREN_HUB_KETTE]
