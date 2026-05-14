/**
 * Seed-Daten — Religion, Ethik, Philosophie (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Constellation. Skills als Stimmen (Disco-Elysium-Pattern).
 *
 * Eng verzahnt mit Innerer Linie.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const RE = "religion-ethik:"

export const RELIGION_ETHIK_SKILLS: SkillV2[] = [
  {
    id: RE + "stille",
    name: "Stille",
    beschreibung: "Mit sich allein sein — die Stimme von innen hoeren.",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "religion-ethik",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille", "frieden", "selbsterkenntnis"],
  },
  {
    id: RE + "frage",
    name: "Sinn-Frage stellen",
    beschreibung: "Warum bin ich da? Was ist gut? Was traegt? — die offenen Fragen.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    bildungsBereich: "religion-ethik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: RE + "wert",
    name: "Wert erkennen",
    beschreibung: "Was ist wichtig fuer mich? Wofuer steh ich ein?",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "religion-ethik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: RE + "frage", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: RE + "religion",
    name: "Religion verstehen",
    beschreibung: "Verschiedene Glaubensformen kennen — was tragen sie?",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    bildungsBereich: "religion-ethik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: RE + "tod",
    name: "Tod und Leben",
    beschreibung: "Sterblichkeit als Lehrmeisterin — wie lebe ich, weil ich endlich bin?",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "religion-ethik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: RE + "frage", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis", "frieden"],
  },
  {
    id: RE + "liebe",
    name: "Liebe verstehen",
    beschreibung: "Wer liebt was, wie? Mitgefuehl, Naehe, Hingabe — die staerkste Kraft.",
    potenzialfelder: ["mensch-verbindung"],
    bildungsBereich: "religion-ethik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["meister"],
    innereLinie: ["frieden", "rueckverbindung"],
  },
  {
    id: RE + "ethik",
    name: "Ethisch entscheiden",
    beschreibung: "Werte gegen Werte abwaegen — was ist richtig in diesem Fall?",
    potenzialfelder: ["mensch-verbindung", "system-logik", "wort-wirkung"],
    bildungsBereich: "religion-ethik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: RE + "wert", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: RE + "sinn",
    name: "Sinn finden",
    beschreibung: "Warum tue ich, was ich tue? — das eigene Werk in den Kontext.",
    potenzialfelder: ["mensch-verbindung", "initiative-werk"],
    bildungsBereich: "religion-ethik",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: RE + "wert", typ: "pflicht" },
      { to: RE + "frage", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis", "rueckverbindung"],
  },
  {
    id: RE + "wahrheit",
    name: "Wahrheit suchen",
    beschreibung: "Was ist wirklich? Was scheint nur? — der Mut zur eigenen Klarheit.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "religion-ethik",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: RE + "ethik", typ: "empfohlen" },
      { to: RE + "sinn", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis", "frieden"],
  },
]

export const RELIGION_ETHIK_HAUPTKETTE: SkillKette = {
  id: "religion-ethik:hauptkette",
  name: "Acht Stimmen — von der Stille zur Wahrheit",
  bereich: "religion-ethik",
  skillIds: [
    RE + "stille",
    RE + "frage",
    RE + "wert",
    RE + "religion",
    RE + "ethik",
    RE + "tod",
    RE + "liebe",
    RE + "sinn",
    RE + "wahrheit",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Haltung im Leben — Werte, Sinn, Wahrheit",
}

export const RELIGION_ETHIK_KETTEN: SkillKette[] = [RELIGION_ETHIK_HAUPTKETTE]
