/**
 * Seed-Daten — Berufsorientierung (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Constellation. Acht Praxis-Stationen lose verbunden.
 *
 * BMBF BOP (Berufsorientierungsprogramm, bis 31.12.2026, 989 Mio. EUR kumulativ).
 * Profil-AC (Baden-Wuerttemberg + Rheinland-Pfalz).
 */

import type { SkillV2, SkillKette } from "./skill-system"

const B = "berufsorientierung:"

export const BERUFSORIENTIERUNG_SKILLS: SkillV2[] = [
  {
    id: B + "eigene-staerke",
    name: "Eigene Staerke benennen",
    beschreibung: "Was kann ich? Was tu ich gern? Was faellt mir leicht?",
    potenzialfelder: ["mensch-verbindung", "initiative-werk"],
    bildungsBereich: "berufsorientierung",
    tier: "gespuert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: B + "berufsbild",
    name: "Berufsbild erkunden",
    beschreibung: "Was machen Menschen in einem Beruf? Welche Wege gibt es?",
    potenzialfelder: ["initiative-werk", "wort-wirkung"],
    bildungsBereich: "berufsorientierung",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: B + "werkstatt-besuch",
    name: "Werkstatt-Besuch",
    beschreibung: "Echte Werkstatt sehen, riechen, anfassen — das traegt.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung", "koerper-bewegung"],
    bildungsBereich: "berufsorientierung",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: B + "schnupper-tag",
    name: "Schnupper-Tag",
    beschreibung: "Einen Tag mitarbeiten — den Beruf an einem Stueck Praxis pruefen.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung", "koerper-bewegung"],
    bildungsBereich: "berufsorientierung",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "werkstatt-besuch", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: B + "praktikum",
    name: "Praktikum",
    beschreibung: "Eine Woche oder mehr — der Beruf wird Alltag.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung", "koerper-bewegung"],
    bildungsBereich: "berufsorientierung",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "schnupper-tag", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: B + "bewerbung",
    name: "Bewerbung schreiben",
    beschreibung: "Anschreiben, Lebenslauf, eigene Werke zeigen — der erste Schritt.",
    potenzialfelder: ["wort-wirkung", "initiative-werk"],
    bildungsBereich: "berufsorientierung",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "eigene-staerke", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    externalAnchors: [{ framework: "kmk", code: "BMBF-BOP" }],
  },
  {
    id: B + "gespraech",
    name: "Vorstellungs-Gespraech",
    beschreibung: "Auge, Stimme, Haltung — sich selbst zeigen, ohne sich zu verkaufen.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "berufsorientierung",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: B + "bewerbung", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: B + "reflektion",
    name: "Reflektion",
    beschreibung: "Was hat das Praktikum mit mir gemacht? Was zieht, was stoesst ab?",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    bildungsBereich: "berufsorientierung",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "praktikum", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["selbsterkenntnis", "stille"],
  },
  {
    id: B + "eigener-weg",
    name: "Eigenen Weg planen",
    beschreibung: "Aus Erfahrung den naechsten Schritt — Lehre, Studium, Selbststaendigkeit.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung"],
    bildungsBereich: "berufsorientierung",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: B + "reflektion", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const BERUFSORIENTIERUNG_HAUPTKETTE: SkillKette = {
  id: "berufsorientierung:hauptkette",
  name: "Vom Erkunden zum eigenen Weg",
  bereich: "berufsorientierung",
  skillIds: [
    B + "eigene-staerke",
    B + "berufsbild",
    B + "werkstatt-besuch",
    B + "schnupper-tag",
    B + "praktikum",
    B + "bewerbung",
    B + "gespraech",
    B + "reflektion",
    B + "eigener-weg",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigener Berufs-Weg — Lehre, Studium oder Selbststaendigkeit, bewusst gewaehlt",
}

export const BERUFSORIENTIERUNG_KETTEN: SkillKette[] = [BERUFSORIENTIERUNG_HAUPTKETTE]
