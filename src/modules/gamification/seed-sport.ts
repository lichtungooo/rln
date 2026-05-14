/**
 * Seed-Daten — Koerper und Bewegung (Sport, Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Tier-basiert mit Verzweigung.
 *   Hauptachse koerperliche Grund-Faehigkeiten,
 *   Verzweigung bei Geschicklichkeit (Ball/Rad/Wasser/Schnee).
 *
 * Anschluss: NRW-Bewegungsfelder (9), DOSB-Sportarten, Hessisches Kerncurriculum.
 *
 * Sport speist alle Handwerks-Bereiche — Stand, Atem, Feinmotorik,
 * Kraft, Koerperhaltung als universelle Grundlage.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const S = "sport:"

export const SPORT_SKILLS: SkillV2[] = [
  {
    id: S + "stand",
    name: "Stand",
    beschreibung: "Fuesse, Becken, Wirbelsaeule — der Koerper findet seinen Halt.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: S + "atem",
    name: "Atem",
    beschreibung: "Ein, aus — bewusst durch Nase und Bauch.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille", "koerper", "frieden"],
  },
  {
    id: S + "kraft",
    name: "Kraft",
    beschreibung: "Eigenes Koerpergewicht heben, halten, fuehren.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "stand", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: S + "ausdauer",
    name: "Ausdauer",
    beschreibung: "Lange laufen, lange tragen, lange bei der Sache bleiben.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "sport",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "atem", typ: "empfohlen" },
    ],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: S + "leichtathletik",
    name: "Laufen, Springen, Werfen",
    beschreibung: "Sprint, Weitsprung, Hochsprung, Wurf — die Grunddisziplinen.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "kraft", typ: "empfohlen" },
      { to: S + "ausdauer", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: S + "schwimmen",
    name: "Schwimmen",
    beschreibung: "Brust, Kraul, Rueckenkraul — der Koerper traegt im Wasser.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: S + "atem", typ: "pflicht", begruendung: "Atem im Wasser ist Sicherheit." },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: S + "turnen",
    name: "Turnen",
    beschreibung: "Rolle, Handstand, Geraet — der Koerper findet seinen Raum.",
    potenzialfelder: ["koerper-bewegung", "raum-bau"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "kraft", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: S + "tanz",
    name: "Tanz",
    beschreibung: "Rhythmus, Choreographie, eigene Bewegung — der Koerper wird Ausdruck.",
    potenzialfelder: ["koerper-bewegung", "stoff-form"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: S + "stand", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "selbsterkenntnis"],
  },
  {
    id: S + "geschicklichkeit",
    name: "Geschicklichkeit",
    beschreibung: "Auge, Hand, Fuss — der Koerper findet seine Praezision.",
    potenzialfelder: ["koerper-bewegung", "system-logik"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "stand", typ: "pflicht" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: S + "ball-mannschaft",
    name: "Ball-Mannschaft",
    beschreibung: "Fussball, Basketball, Volleyball — Spiel im Team mit Regeln.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "sport",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "geschicklichkeit", typ: "pflicht" },
      { to: S + "ausdauer", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: S + "rad",
    name: "Rad fahren",
    beschreibung: "Balance, Bremsen, Wendung — sicher im Verkehr.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab6",
    voraussetzungen: [
      { to: S + "geschicklichkeit", typ: "empfohlen" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: S + "klettern",
    name: "Klettern",
    beschreibung: "Boulder oder Wand — die Hand findet ihren Griff.",
    potenzialfelder: ["koerper-bewegung", "raum-bau"],
    bildungsBereich: "sport",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: S + "kraft", typ: "pflicht" },
      { to: S + "geschicklichkeit", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: S + "kampfkunst",
    name: "Kampfkunst",
    beschreibung: "Judo, Karate, Aikido — der Koerper lernt Wuerde im Konflikt.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "sport",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "stand", typ: "pflicht" },
    ],
    attestationModi: ["meister", "pruefung"],
    innereLinie: ["koerper", "frieden", "stille"],
  },
  {
    id: S + "yoga",
    name: "Yoga",
    beschreibung: "Asana, Atem, Stille — Bewegung in der Tiefe.",
    potenzialfelder: ["koerper-bewegung"],
    bildungsBereich: "sport",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: S + "atem", typ: "pflicht" },
      { to: S + "stand", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["stille", "koerper", "selbsterkenntnis", "frieden"],
  },
  {
    id: S + "wettkampf",
    name: "Wettkampf",
    beschreibung: "Spiel auf Zeit, mit Anderen, mit Wuerde — der Koerper zeigt was er kann.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung", "initiative-werk"],
    bildungsBereich: "sport",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: S + "ball-mannschaft", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "pruefung"],
  },
  {
    id: S + "trainer",
    name: "Trainer fuer andere",
    beschreibung: "Junge Sportler begleiten, Uebungen anleiten, Wuerde halten.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "sport",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: S + "wettkampf", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
]

export const SPORT_HAUPTKETTE: SkillKette = {
  id: "sport:hauptkette",
  name: "Vom Stand zum Trainer",
  bereich: "sport",
  skillIds: [
    S + "stand",
    S + "atem",
    S + "kraft",
    S + "ausdauer",
    S + "geschicklichkeit",
    S + "leichtathletik",
    S + "ball-mannschaft",
    S + "wettkampf",
    S + "trainer",
  ],
  verzweigungen: [
    {
      ab: S + "geschicklichkeit",
      aeste: [
        { name: "Ball", skillIds: [S + "ball-mannschaft"] },
        { name: "Rad", skillIds: [S + "rad"] },
        { name: "Wasser", skillIds: [S + "schwimmen"] },
        { name: "Geraet", skillIds: [S + "turnen", S + "klettern"] },
        { name: "Ausdruck", skillIds: [S + "tanz"] },
        { name: "Innen", skillIds: [S + "yoga", S + "kampfkunst"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Trainer-Lizenz oder eigene Bewegungs-Gruppe leiten",
}

export const SPORT_KETTEN: SkillKette[] = [SPORT_HAUPTKETTE]
