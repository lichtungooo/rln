/**
 * Seed-Daten — Mentoren-Achse (Querschnitt, Stand 14.05.2026).
 *
 * 20 atomare Mentor-Skills in vier Stufen, parallel zur Fach-Achse.
 * Vier Schwellen: Mit-Lerner -> Quest-Geber -> Mentor -> Meister-Mentor.
 *
 * Wissenschaftlich getragen:
 *   - Big Brothers Big Sisters RCT 2022 (1300 Jugendliche, 18-Monats-Effekt)
 *   - AEVO als formaler Anker fuer Meister-Mentor-Schwelle
 *   - OECD Learning Compass 2030 Teaching Compass
 *   - Vygotsky Zone of Proximal Development
 */

import type { SkillV2 } from "./skill-system"

const ME = "mentor:"

// ============================================================
// Stufe 1 — Grundlagen
// ============================================================

export const MENTOR_GRUNDLAGEN: SkillV2[] = [
  {
    id: ME + "sicherheits-einweisung",
    name: "Sicherheits-Einweisung",
    beschreibung: "Andere sicher mit Werkzeug und Maschine vertraut machen.",
    potenzialfelder: ["mensch-verbindung", "system-logik"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: ME + "vormachen",
    name: "Vormachen",
    beschreibung: "Eine Bewegung, ein Handgriff, ein Werk-Schritt klar zeigen.",
    potenzialfelder: ["mensch-verbindung", "koerper-bewegung"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: ME + "erklaeren",
    name: "Erklaeren mit einfachen Worten",
    beschreibung: "Komplexes in Bilder bringen, ohne zu vereinfachen.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: ME + "aktives-zuhoeren",
    name: "Aktives Zuhoeren",
    beschreibung: "Wirklich hoeren, was der andere meint — nicht nur, was er sagt.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
    innereLinie: ["stille", "selbsterkenntnis"],
  },
  {
    id: ME + "wuerde-wahrung",
    name: "Wuerde-Wahrung",
    beschreibung: "Der andere bleibt Subjekt — keine Belehrung, keine Beschaemung.",
    potenzialfelder: ["mensch-verbindung"],
    tier: "probiert",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["meister"],
    innereLinie: ["frieden", "selbsterkenntnis"],
  },
]

// ============================================================
// Stufe 2 — Begleitung
// ============================================================

export const MENTOR_BEGLEITUNG: SkillV2[] = [
  {
    id: ME + "beobachten",
    name: "Beobachten",
    beschreibung: "Schauen ohne zu bewerten — den Lernenden in seiner Spur sehen.",
    potenzialfelder: ["mensch-verbindung", "welt-wachstum"],
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: ME + "aktives-zuhoeren", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["stille"],
  },
  {
    id: ME + "offene-fragen",
    name: "Offene Fragen stellen",
    beschreibung: "Sokratisch fragen — der Lernende findet selbst.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: ME + "aktives-zuhoeren", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "korrektur-gefahr",
    name: "Korrektur bei Gefahr",
    beschreibung: "Eingreifen, wenn Verletzung droht — sonst die Spur respektieren.",
    potenzialfelder: ["system-logik", "mensch-verbindung"],
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: ME + "sicherheits-einweisung", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "loben-verhalten",
    name: "Loben am Verhalten",
    beschreibung: "Was du tust ist gut — nicht: du bist gut. Verhaltens-bezogenes Anerkennen.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: ME + "wuerde-wahrung", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "reflexionsgespraech",
    name: "Reflexionsgespraech fuehren",
    beschreibung: "Nach dem Werk: Was war? Was hat getragen? Was war schwer?",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    tier: "kann",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: ME + "offene-fragen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis"],
  },
]

// ============================================================
// Stufe 3 — Vertiefung
// ============================================================

export const MENTOR_VERTIEFUNG: SkillV2[] = [
  {
    id: ME + "lernsituation-gestalten",
    name: "Lernsituation gestalten",
    beschreibung: "Den Raum, das Material, die Zeit so legen, dass Lernen geschieht.",
    potenzialfelder: ["raum-bau", "mensch-verbindung", "initiative-werk"],
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "reflexionsgespraech", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "gruppendynamik",
    name: "Gruppendynamik halten",
    beschreibung: "In der Gruppe Spannung tragen, ohne sie zu loeschen.",
    potenzialfelder: ["mensch-verbindung"],
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "beobachten", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "fehlerkultur",
    name: "Fehlerkultur leben",
    beschreibung: "Fehler als Lerngold. Eigene Fehler zeigen, fremde Fehler wuerdigen.",
    potenzialfelder: ["mensch-verbindung", "system-logik"],
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "wuerde-wahrung", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: ME + "motivation-halten",
    name: "Motivation halten",
    beschreibung: "Den Funken am Leben — eigene Begeisterung als Geschenk.",
    potenzialfelder: ["mensch-verbindung", "initiative-werk"],
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "loben-verhalten", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: ME + "konflikt-moderieren",
    name: "Konflikt moderieren",
    beschreibung: "Standpunkte hoeren, gemeinsame Wahrheit suchen, Wuerde halten.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    tier: "kann-lehren",
    dqrNiveau: 5,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "aktives-zuhoeren", typ: "pflicht" },
      { to: ME + "wuerde-wahrung", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["frieden"],
  },
]

// ============================================================
// Stufe 4 — Meisterschaft
// ============================================================

export const MENTOR_MEISTERSCHAFT: SkillV2[] = [
  {
    id: ME + "co-kreativitaet",
    name: "Co-Kreativitaet",
    beschreibung: "Mit dem Lernenden zusammen etwas Neues schaffen, das vorher nicht war.",
    potenzialfelder: ["mensch-verbindung", "stoff-form", "initiative-werk"],
    tier: "meistert",
    dqrNiveau: 6,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "lernsituation-gestalten", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["selbsterkenntnis", "rueckverbindung"],
  },
  {
    id: ME + "subjekt-subjekt",
    name: "Subjekt-Subjekt-Haltung",
    beschreibung: "Der andere ist Subjekt, nie Objekt — Begegnung auf Augenhoehe.",
    potenzialfelder: ["mensch-verbindung"],
    tier: "meistert",
    dqrNiveau: 6,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "wuerde-wahrung", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["frieden", "selbsterkenntnis"],
  },
  {
    id: ME + "mentoren-ausbilden",
    name: "Mentoren ausbilden",
    beschreibung: "AEVO-Schein-Niveau — andere zu Mentoren machen.",
    potenzialfelder: ["mensch-verbindung", "initiative-werk", "wort-wirkung"],
    tier: "meistert",
    dqrNiveau: 6,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "fehlerkultur", typ: "pflicht" },
      { to: ME + "gruppendynamik", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
    externalAnchors: [{ framework: "kmk", code: "AEVO" }],
  },
  {
    id: ME + "quest-design",
    name: "Quest-Design",
    beschreibung: "Eigene Quests entwerfen, die lernen, fordern, freuen.",
    potenzialfelder: ["initiative-werk", "stoff-form", "wort-wirkung"],
    tier: "meistert",
    dqrNiveau: 6,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "lernsituation-gestalten", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: ME + "lebens-begleitung",
    name: "Lebens-Begleitung",
    beschreibung: "Ueber Jahre da sein — der Mensch waechst, der Mentor traegt mit.",
    potenzialfelder: ["mensch-verbindung"],
    tier: "gibt-weiter",
    dqrNiveau: 6,
    altersFreigabe: "volljaehrig",
    voraussetzungen: [
      { to: ME + "subjekt-subjekt", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["rueckverbindung", "frieden", "selbsterkenntnis"],
  },
]

// ============================================================
// Vier Schwellen — Mit-Lerner / Quest-Geber / Mentor / Meister-Mentor
// ============================================================

export interface MentorSchwelle {
  id: "mit-lerner" | "quest-geber" | "mentor" | "meister-mentor"
  name: string
  beschreibung: string
  bedingung: string
  darfTun: string
}

export const MENTOR_SCHWELLEN: MentorSchwelle[] = [
  {
    id: "mit-lerner",
    name: "Mit-Lerner",
    beschreibung: "Wer eigene Erfahrung hat, kann andere mitnehmen.",
    bedingung: "3 abgeschlossene Quests im Gebiet",
    darfTun: "Anderen helfen, die selbst gemachten Quests zu gehen.",
  },
  {
    id: "quest-geber",
    name: "Quest-Geber",
    beschreibung: "Wer Mit-Lerner war, darf eigene Quests anbieten.",
    bedingung: "5 Mit-Lerner-Erfahrungen + 3 Peer-Attestations + Sicherheits-Einweisung Stufe 1",
    darfTun: "Eigene Quests anbieten und Lerner durchfuehren.",
  },
  {
    id: "mentor",
    name: "Mentor",
    beschreibung: "Wer ueber 20 Quest-Begleitungen mit positiver Resonanz traegt.",
    bedingung: "20 Quest-Begleitungen mit ueberwiegend positiven Attestations",
    darfTun: "Offizielle Mentor-Rolle, Workshop-Leiter, Festival-Coach.",
  },
  {
    id: "meister-mentor",
    name: "Meister-Mentor",
    beschreibung: "AEVO-Anker plus Lebens-Erfahrung. Andere zu Mentoren machen.",
    bedingung: "AEVO-Schein oder Meisterbrief + 50 Mentor-Attestations + 3 Mentor-zu-Mentor-Attestations",
    darfTun: "Andere zu Mentoren ausbilden, Mentor-Quests entwerfen.",
  },
]

export const MENTOREN_SKILLS: SkillV2[] = [
  ...MENTOR_GRUNDLAGEN,
  ...MENTOR_BEGLEITUNG,
  ...MENTOR_VERTIEFUNG,
  ...MENTOR_MEISTERSCHAFT,
]
