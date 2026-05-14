/**
 * Seed-Daten — Kunst (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Hub-and-Spoke. Wurzel "Sehen", vier Spokes (Zeichnen, Formen, Foto, Komposition).
 */

import type { SkillV2, SkillKette } from "./skill-system"

const K = "kunst:"

export const KUNST_SKILLS: SkillV2[] = [
  {
    id: K + "sehen",
    name: "Sehen",
    beschreibung: "Wahrnehmen, was da ist — Form, Licht, Farbe, Linie.",
    potenzialfelder: ["stoff-form"],
    bildungsBereich: "kunst",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille", "selbsterkenntnis"],
  },
  {
    id: K + "zeichnen",
    name: "Zeichnen",
    beschreibung: "Stift, Linie, Form — die Welt auf Papier.",
    potenzialfelder: ["stoff-form", "raum-bau"],
    bildungsBereich: "kunst",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: K + "sehen", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: K + "malen",
    name: "Malen",
    beschreibung: "Pinsel, Farbe, Wasser — der Pinselstrich wird Bild.",
    potenzialfelder: ["stoff-form"],
    bildungsBereich: "kunst",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: K + "zeichnen", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: K + "formen",
    name: "Formen",
    beschreibung: "Ton, Plastilin, Pappmache — die Hand schafft Raum.",
    potenzialfelder: ["stoff-form", "raum-bau", "koerper-bewegung"],
    bildungsBereich: "kunst",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: K + "foto",
    name: "Foto",
    beschreibung: "Bildausschnitt, Licht, Moment — die Wirklichkeit als Bild fangen.",
    potenzialfelder: ["stoff-form", "system-logik"],
    bildungsBereich: "kunst",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: K + "sehen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: K + "komposition",
    name: "Komposition",
    beschreibung: "Goldener Schnitt, Dreieck, Linie — wie das Bild zusammenhaelt.",
    potenzialfelder: ["stoff-form", "system-logik"],
    bildungsBereich: "kunst",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: K + "zeichnen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: K + "stil",
    name: "Eigenen Stil finden",
    beschreibung: "Aus vielen Versuchen waechst die eigene Handschrift.",
    potenzialfelder: ["stoff-form", "wort-wirkung"],
    bildungsBereich: "kunst",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: K + "komposition", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: K + "ausstellung",
    name: "Ausstellung",
    beschreibung: "Eigene Werke zeigen — die Kunst geht in die Welt.",
    potenzialfelder: ["stoff-form", "initiative-werk", "mensch-verbindung"],
    bildungsBereich: "kunst",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: K + "stil", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const KUNST_HAUPTKETTE: SkillKette = {
  id: "kunst:hauptkette",
  name: "Vom Sehen zur Ausstellung",
  bereich: "kunst",
  skillIds: [
    K + "sehen",
    K + "zeichnen",
    K + "malen",
    K + "foto",
    K + "komposition",
    K + "stil",
    K + "ausstellung",
  ],
  verzweigungen: [
    {
      ab: K + "zeichnen",
      aeste: [
        { name: "Plastik-Pfad", skillIds: [K + "formen"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Ausstellung — Skizzen, Bilder, Plastiken, Fotos",
}

export const KUNST_KETTEN: SkillKette[] = [KUNST_HAUPTKETTE]
