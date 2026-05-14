/**
 * Seed-Daten — Mathematik (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Tier-basiert mit Bruner-Spirale.
 *   "Messen" kehrt auf Tier 1 (Strecke) und Tier 5 (Vektorraum) wieder —
 *   gleicher Skill, tiefere Form.
 *
 * Hauptkette: Strecke messen -> Flaeche -> Volumen -> Bruch -> Algebra
 *             -> Geometrie -> Statistik -> Funktionen
 *
 * Synergien:
 *   - Holz "Saegen" + "Strecke messen" -> Praezision am Werkstueck
 *   - Bauen "Mauern" + "Flaeche" -> Material-Mengen rechnen
 *   - Elektronik "Stromkreis" + "Algebra" -> Ohmsches Gesetz
 */

import type { SkillV2, SkillKette } from "./skill-system"

const MA = "mathematik:"

export const MATHEMATIK_SKILLS: SkillV2[] = [
  {
    id: MA + "strecke-messen",
    name: "Strecke messen",
    beschreibung: "Lineal, Zollstock, Bandmass — wie lang ist die Welt?",
    potenzialfelder: ["system-logik", "raum-bau"],
    bildungsBereich: "mathematik",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    externalAnchors: [{ framework: "kmk", code: "Mathematik-Klasse-5-Groessen" }],
  },
  {
    id: MA + "rechnen-grundlagen",
    name: "Rechnen",
    beschreibung: "Plus, Minus, Mal, Geteilt — die vier Grundrichtungen der Zahl.",
    potenzialfelder: ["system-logik"],
    bildungsBereich: "mathematik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: MA + "flaeche",
    name: "Flaeche berechnen",
    beschreibung: "Lange mal Breite — der Boden wird Zahl.",
    potenzialfelder: ["system-logik", "raum-bau"],
    bildungsBereich: "mathematik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: MA + "strecke-messen", typ: "pflicht" },
      { to: MA + "rechnen-grundlagen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: MA + "volumen",
    name: "Volumen berechnen",
    beschreibung: "Lange mal Breite mal Hoehe — der Raum wird Zahl.",
    potenzialfelder: ["system-logik", "raum-bau"],
    bildungsBereich: "mathematik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: MA + "flaeche", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: MA + "bruch",
    name: "Bruch verstehen",
    beschreibung: "Halb, Drittel, Viertel — das Ganze wird teilbar.",
    potenzialfelder: ["system-logik"],
    bildungsBereich: "mathematik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: MA + "rechnen-grundlagen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: MA + "algebra",
    name: "Algebra",
    beschreibung: "X als Platzhalter, Gleichung loesen — die Zahl wird Buchstabe.",
    potenzialfelder: ["system-logik", "wort-wirkung"],
    bildungsBereich: "mathematik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: MA + "bruch", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: MA + "geometrie",
    name: "Geometrie",
    beschreibung: "Winkel, Kreis, Dreieck — die Form wird Wissen.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    bildungsBereich: "mathematik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: MA + "flaeche", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: MA + "statistik",
    name: "Statistik",
    beschreibung: "Mittelwert, Streuung, Diagramm — Daten erzaehlen Geschichten.",
    potenzialfelder: ["system-logik", "wort-wirkung"],
    bildungsBereich: "mathematik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: MA + "bruch", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: MA + "funktionen",
    name: "Funktionen",
    beschreibung: "F(x) — eine Maschine, die Zahlen verwandelt.",
    potenzialfelder: ["system-logik"],
    bildungsBereich: "mathematik",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: MA + "algebra", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: MA + "vektorraum",
    name: "Vektorraum",
    beschreibung: "Messen in vielen Richtungen zugleich — Bruner-Spirale schliesst sich.",
    potenzialfelder: ["system-logik", "raum-bau"],
    bildungsBereich: "mathematik",
    tier: "gibt-weiter",
    dqrNiveau: 6,
    altersFreigabe: "ab16",
    voraussetzungen: [
      { to: MA + "funktionen", typ: "pflicht" },
      { to: MA + "geometrie", typ: "pflicht" },
      { to: MA + "strecke-messen", typ: "synergie", begruendung: "Spirale schliesst sich — Messen tiefer." },
    ],
    attestationModi: ["meister", "pruefung"],
  },
]

export const MATHEMATIK_HAUPTKETTE: SkillKette = {
  id: "mathematik:hauptkette",
  name: "Vom Lineal zum Vektorraum",
  bereich: "mathematik",
  skillIds: [
    MA + "strecke-messen",
    MA + "rechnen-grundlagen",
    MA + "flaeche",
    MA + "volumen",
    MA + "bruch",
    MA + "algebra",
    MA + "geometrie",
    MA + "statistik",
    MA + "funktionen",
    MA + "vektorraum",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigene Konstruktion mit Mass, Flaeche, Volumen, Statik — z.B. Hochbeet, Bank, Verleih-Tabelle",
}

export const MATHEMATIK_KETTEN: SkillKette[] = [MATHEMATIK_HAUPTKETTE]
