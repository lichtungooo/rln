/**
 * Seed-Daten — Hauswirtschaft und Ernaehrung (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Hub-and-Spoke. Wurzel "Versorgen", vier Spokes
 * (Lebensmittel, Kueche, Stoff, Pflege).
 *
 * REVIS-Anker (Reform der Ernaehrungs- und Verbraucherbildung).
 */

import type { SkillV2, SkillKette } from "./skill-system"

const HW = "hauswirtschaft:"

export const HAUSWIRTSCHAFT_SKILLS: SkillV2[] = [
  {
    id: HW + "versorgen",
    name: "Versorgen",
    beschreibung: "Bedarf erkennen, planen, lagern — sich selbst und andere tragen.",
    potenzialfelder: ["mensch-verbindung", "welt-wachstum", "initiative-werk"],
    bildungsBereich: "hauswirtschaft",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
  },
  {
    id: HW + "einkaufen",
    name: "Einkaufen",
    beschreibung: "Liste, Budget, Qualitaet — bewusst was kaufen, was nicht.",
    potenzialfelder: ["initiative-werk", "system-logik"],
    bildungsBereich: "hauswirtschaft",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: HW + "versorgen", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: HW + "kochen",
    name: "Kochen",
    beschreibung: "Schneiden, garen, abschmecken — Lebensmittel werden Mahlzeit.",
    potenzialfelder: ["stoff-form", "koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "hauswirtschaft",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: HW + "versorgen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    probeAufgabe: {
      titel: "Drei-Gang-Menue",
      beschreibung: "Eine Suppe, ein Hauptgericht, ein Nachtisch fuer vier Personen — selbst geplant, eingekauft, gekocht.",
      zeitMinuten: 120,
      materialBenoetigt: ["Kueche", "Zutaten nach Plan", "Topf-Set", "Messer-Set"],
    },
  },
  {
    id: HW + "backen",
    name: "Backen",
    beschreibung: "Mehl, Hefe, Wasser — der Teig wird Brot.",
    potenzialfelder: ["stoff-form", "welt-wachstum", "system-logik"],
    bildungsBereich: "hauswirtschaft",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: HW + "konservieren",
    name: "Konservieren",
    beschreibung: "Einkochen, fermentieren, trocknen — der Sommer bleibt im Glas.",
    potenzialfelder: ["welt-wachstum", "stoff-form"],
    bildungsBereich: "hauswirtschaft",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: HW + "kochen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["natur"],
  },
  {
    id: HW + "naehen",
    name: "Naehen",
    beschreibung: "Nadel, Faden, Maschine — der Stoff wird Form.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    bildungsBereich: "hauswirtschaft",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: HW + "putzen",
    name: "Putzen mit System",
    beschreibung: "Reihenfolge, Mittel, Hygiene — die Wohnung wird Heimat.",
    potenzialfelder: ["raum-bau"],
    bildungsBereich: "hauswirtschaft",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: HW + "pflege",
    name: "Pflege",
    beschreibung: "Andere oder sich selbst pflegen — Wuerde im Detail.",
    potenzialfelder: ["mensch-verbindung", "welt-wachstum"],
    bildungsBereich: "hauswirtschaft",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["meister"],
    innereLinie: ["frieden", "rueckverbindung"],
  },
  {
    id: HW + "eigener-haushalt",
    name: "Eigener Haushalt",
    beschreibung: "Selbst versorgen, sauber halten, planen, verwalten — Wohnung als Werk.",
    potenzialfelder: ["initiative-werk", "system-logik", "mensch-verbindung"],
    bildungsBereich: "hauswirtschaft",
    tier: "gibt-weiter",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: HW + "kochen", typ: "pflicht" },
      { to: HW + "einkaufen", typ: "pflicht" },
      { to: HW + "putzen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const HAUSWIRTSCHAFT_HAUPTKETTE: SkillKette = {
  id: "hauswirtschaft:hauptkette",
  name: "Vom Versorgen zum eigenen Haushalt",
  bereich: "hauswirtschaft",
  skillIds: [
    HW + "versorgen",
    HW + "einkaufen",
    HW + "kochen",
    HW + "putzen",
    HW + "eigener-haushalt",
  ],
  verzweigungen: [
    {
      ab: HW + "kochen",
      aeste: [
        { name: "Brot-Pfad", skillIds: [HW + "backen"] },
        { name: "Saison-Pfad", skillIds: [HW + "konservieren"] },
        { name: "Stoff-Pfad", skillIds: [HW + "naehen"] },
        { name: "Sorge-Pfad", skillIds: [HW + "pflege"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Wohnung selbst fuehren — Versorgung, Pflege, Heimat",
}

export const HAUSWIRTSCHAFT_KETTEN: SkillKette[] = [HAUSWIRTSCHAFT_HAUPTKETTE]
