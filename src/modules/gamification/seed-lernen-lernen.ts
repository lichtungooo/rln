/**
 * Seed-Daten — Lernen lernen (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Linear-Pfad, universell. Faerbt alle anderen Bereiche.
 *
 * KMK-Lernkompetenz, quer durch alle Faecher.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const L = "lernen:"

export const LERNEN_LERNEN_SKILLS: SkillV2[] = [
  {
    id: L + "aufmerksamkeit",
    name: "Aufmerksamkeit",
    beschreibung: "Bei der Sache bleiben — die Hand am Werk, der Geist beim Werk.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    bildungsBereich: "lernen-lernen",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille", "koerper"],
  },
  {
    id: L + "notiz",
    name: "Notiz machen",
    beschreibung: "Wichtiges aufschreiben — die Hand schreibt, das Hirn merkt.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "lernen-lernen",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: L + "aufmerksamkeit", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: L + "frage-stellen",
    name: "Frage stellen",
    beschreibung: "Wer fragt, lernt — wer schweigt, bleibt im Dunkeln.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "lernen-lernen",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: L + "recherche",
    name: "Recherche",
    beschreibung: "Quelle finden, pruefen, einordnen — Wissen aus dem Strom holen.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "lernen-lernen",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: L + "frage-stellen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: L + "praesentieren",
    name: "Praesentieren",
    beschreibung: "Was du gelernt hast, anderen zeigen — Klarheit durch Weitergabe.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "lernen-lernen",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: L + "notiz", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: L + "reflektieren",
    name: "Reflektieren",
    beschreibung: "Was war? Was hat getragen? Was war schwer? — die eigene Spur lesen.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "lernen-lernen",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: L + "frage-stellen", typ: "pflicht" },
    ],
    attestationModi: ["selbst", "meister"],
    innereLinie: ["selbsterkenntnis", "stille"],
  },
  {
    id: L + "lernpartner",
    name: "Lernpartner",
    beschreibung: "Mit jemandem zusammen lernen — der andere ist Spiegel.",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "lernen-lernen",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: L + "selbst-pfad",
    name: "Selbst-Pfad",
    beschreibung: "Eigene Lern-Spur finden, eigene Methode tragen, eigenen Rhythmus achten.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung"],
    bildungsBereich: "lernen-lernen",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: L + "reflektieren", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["selbsterkenntnis"],
  },
]

export const LERNEN_LERNEN_HAUPTKETTE: SkillKette = {
  id: "lernen-lernen:hauptkette",
  name: "Von der Aufmerksamkeit zum Selbst-Pfad",
  bereich: "lernen-lernen",
  skillIds: [
    L + "aufmerksamkeit",
    L + "notiz",
    L + "frage-stellen",
    L + "recherche",
    L + "praesentieren",
    L + "lernpartner",
    L + "reflektieren",
    L + "selbst-pfad",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Lern-Methode, die ueber alle Bereiche traegt",
}

export const LERNEN_LERNEN_KETTEN: SkillKette[] = [LERNEN_LERNEN_HAUPTKETTE]
