/**
 * Seed-Daten — Fremdsprachen (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Linear-Pfad (Duolingo-Pattern, ohne Streak).
 * Eine Hauptkette pro Sprache. Beispiel hier: generisch.
 *
 * KMK Bildungsstandards Erste Fremdsprache 2023 + GER (Gemeinsamer Europ. Referenzrahmen).
 */

import type { SkillV2, SkillKette } from "./skill-system"

const F = "fremdsprache:"

export const FREMDSPRACHEN_SKILLS: SkillV2[] = [
  {
    id: F + "begruessen",
    name: "Begruessen",
    beschreibung: "Hallo, danke, bitte — die ersten Worte in der fremden Sprache.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "fremdsprachen",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: F + "vorstellen",
    name: "Sich vorstellen",
    beschreibung: "Name, Alter, Herkunft — wer bin ich auf der neuen Zunge?",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "fremdsprachen",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: F + "begruessen", typ: "pflicht" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: F + "einkaufen",
    name: "Einkaufen",
    beschreibung: "Bitte, danke, wieviel kostet das? — Alltag in der Sprache.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "fremdsprachen",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: F + "vorstellen", typ: "empfohlen" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: F + "erzaehlen",
    name: "Erzaehlen",
    beschreibung: "Vom Wochenende sprechen, Geschichten erzaehlen, beschreiben.",
    potenzialfelder: ["wort-wirkung"],
    bildungsBereich: "fremdsprachen",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: F + "einkaufen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: F + "lesen",
    name: "Lesen (Fremdsprache)",
    beschreibung: "Zeitung, Buch, Kurzgeschichte — Welt aus fremden Worten.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "fremdsprachen",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: F + "vorstellen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: F + "schreiben",
    name: "Schreiben (Fremdsprache)",
    beschreibung: "Brief, Email, kurzer Aufsatz — eigene Worte fluessig.",
    potenzialfelder: ["wort-wirkung"],
    bildungsBereich: "fremdsprachen",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: F + "erzaehlen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: F + "diskutieren",
    name: "Diskutieren",
    beschreibung: "Position vertreten, Argument hoeren — Gespraech in der Fremdsprache.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "fremdsprachen",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: F + "schreiben", typ: "pflicht" },
      { to: F + "lesen", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: F + "fliessend",
    name: "Fliessend sprechen",
    beschreibung: "Denken in der fremden Sprache — Zunge und Geist werden zwei.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "fremdsprachen",
    tier: "gibt-weiter",
    dqrNiveau: 6,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: F + "diskutieren", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
]

export const FREMDSPRACHEN_HAUPTKETTE: SkillKette = {
  id: "fremdsprachen:hauptkette",
  name: "Vom Hallo zur fluessigen Sprache",
  bereich: "fremdsprachen",
  skillIds: [
    F + "begruessen",
    F + "vorstellen",
    F + "einkaufen",
    F + "erzaehlen",
    F + "lesen",
    F + "schreiben",
    F + "diskutieren",
    F + "fliessend",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Fliessende Beherrschung einer Fremdsprache — frei sprechen, lesen, schreiben",
}

export const FREMDSPRACHEN_KETTEN: SkillKette[] = [FREMDSPRACHEN_HAUPTKETTE]
