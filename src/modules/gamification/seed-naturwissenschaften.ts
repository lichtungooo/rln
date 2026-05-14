/**
 * Seed-Daten — Naturwissenschaften (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Hub-and-Spoke mit drei Hubs.
 *
 * Hub 1: Stoffe (Chemie) — Mischen -> Trennen -> Reagieren
 * Hub 2: Kraefte (Physik) — Hebel -> Energie -> Magnet -> Schaltung
 * Hub 3: Leben (Biologie) — Zelle -> Pflanze -> Tier -> Mensch -> Oekosystem
 *
 * Plus eigene Linie Informatik (Algorithmus, Programm, KI-Grundlagen).
 *
 * Synergie: Wer alle drei Hubs auf Tier "kann" hat -> Forscher-Auge als Anker.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const N = "naturwissenschaften:"

export const NATURWISSENSCHAFTEN_SKILLS: SkillV2[] = [
  // Hub 1 — Stoffe (Chemie)
  {
    id: N + "mischen",
    name: "Mischen",
    beschreibung: "Zwei Stoffe zusammen, was passiert? — die Welt der Stoffe spueren.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: N + "trennen",
    name: "Trennen",
    beschreibung: "Filtern, Destillieren, Sieben — die Mischung wird wieder klar.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: N + "mischen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: N + "reagieren",
    name: "Reagieren",
    beschreibung: "Saeure trifft Base, Eisen wird Rost — der Stoff wird ein anderer.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: N + "trennen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  // Hub 2 — Kraefte (Physik)
  {
    id: N + "hebel",
    name: "Hebel",
    beschreibung: "Last, Drehpunkt, Kraft — wenig Kraft hebt viel Gewicht.",
    potenzialfelder: ["system-logik", "raum-bau"],
    bildungsBereich: "naturwissenschaften",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: N + "energie",
    name: "Energie",
    beschreibung: "Waerme, Strom, Bewegung — Energie wandelt ihre Form.",
    potenzialfelder: ["system-logik", "welt-wachstum"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: N + "hebel", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: N + "magnet",
    name: "Magnetismus",
    beschreibung: "Nord, Sued, Feldlinien — die unsichtbare Kraft im Eisen.",
    potenzialfelder: ["system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  // Hub 3 — Leben (Biologie)
  {
    id: N + "zelle",
    name: "Zelle",
    beschreibung: "Die kleinste Einheit des Lebens — Membran, Kern, Mitochondrien.",
    potenzialfelder: ["welt-wachstum"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: N + "pflanze",
    name: "Pflanze verstehen",
    beschreibung: "Wurzel, Stamm, Blatt — wie Pflanzen leben, wachsen, sich vermehren.",
    potenzialfelder: ["welt-wachstum"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer"],
    innereLinie: ["natur"],
  },
  {
    id: N + "oekosystem",
    name: "Oekosystem",
    beschreibung: "Wald, Wiese, Wasser — alles haengt mit allem zusammen.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: N + "pflanze", typ: "pflicht" },
      { to: N + "zelle", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["natur", "rueckverbindung"],
  },
  // Informatik-Linie
  {
    id: N + "algorithmus",
    name: "Algorithmus",
    beschreibung: "Schritt fuer Schritt — eine Anleitung, die ein Problem loest.",
    potenzialfelder: ["system-logik"],
    bildungsBereich: "naturwissenschaften",
    tier: "probiert",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: N + "programm",
    name: "Programmieren",
    beschreibung: "Variable, Schleife, Bedingung — die Maschine bekommt Anweisungen.",
    potenzialfelder: ["system-logik", "wort-wirkung"],
    bildungsBereich: "naturwissenschaften",
    tier: "kann",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: N + "algorithmus", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  // Anker bei drei Hubs
  {
    id: N + "forscher-auge",
    name: "Forscher-Auge",
    beschreibung: "Wer Stoffe, Kraefte und Leben begreift — sieht die Welt mit Forscher-Blick.",
    potenzialfelder: ["welt-wachstum", "system-logik", "initiative-werk"],
    bildungsBereich: "naturwissenschaften",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: N + "reagieren", typ: "empfohlen" },
      { to: N + "energie", typ: "empfohlen" },
      { to: N + "oekosystem", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: N + "eigenes-experiment",
    name: "Eigenes Experiment",
    beschreibung: "Frage stellen, Hypothese, Versuch, Daten, Erkenntnis — Wissenschaft tun.",
    potenzialfelder: ["welt-wachstum", "system-logik", "initiative-werk"],
    bildungsBereich: "naturwissenschaften",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: N + "forscher-auge", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const NATURWISSENSCHAFTEN_HUB_KETTE: SkillKette = {
  id: "naturwissenschaften:hub",
  name: "Drei Hubs zum Forscher-Auge",
  bereich: "naturwissenschaften",
  skillIds: [
    N + "mischen",
    N + "trennen",
    N + "reagieren",
    N + "hebel",
    N + "energie",
    N + "magnet",
    N + "zelle",
    N + "pflanze",
    N + "oekosystem",
    N + "forscher-auge",
    N + "eigenes-experiment",
  ],
  verzweigungen: [
    {
      ab: N + "algorithmus",
      aeste: [
        { name: "Informatik-Pfad", skillIds: [N + "programm"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigenes wissenschaftliches Experiment (Jugend forscht-tauglich)",
}

export const NATURWISSENSCHAFTEN_KETTEN: SkillKette[] = [NATURWISSENSCHAFTEN_HUB_KETTE]
