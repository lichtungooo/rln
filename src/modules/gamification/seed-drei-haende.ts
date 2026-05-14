/**
 * Seed-Daten — Drei Haende (Wurzel-Skills, Stand 14.05.2026).
 *
 * Querschnitt unter allen Handwerks- und Bildungs-Bereichen.
 *
 * Sicherheits-Lizenz: Drei Haende auf Tier "probiert" (Stufe 2) sind die
 * Eingangsschwelle in alle Handwerks-Bereiche. Ohne sie kein Eintritt.
 *
 * Aus DGUV-Regeln, JArbSchG, IHK-Vorbildungs-Standards.
 */

import type { SkillV2, DreiHand } from "./skill-system"

const H = "hand:"

// ============================================================
// Hand des Vermessers
// ============================================================

export const VERMESSER_SKILLS: SkillV2[] = [
  {
    id: H + "messen",
    name: "Messen",
    beschreibung: "Zollstock, Bandmass, Anschlagwinkel, Wasserwaage — die Welt wird Zahl.",
    potenzialfelder: ["raum-bau", "system-logik"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    externalAnchors: [{ framework: "esco", code: "S3.2.1" }],
  },
  {
    id: H + "skizze-lesen",
    name: "Skizze lesen",
    beschreibung: "Riss, Schnitt, Aufriss, Bemassung — der Plan wird Werk.",
    potenzialfelder: ["raum-bau", "stoff-form", "wort-wirkung"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: H + "material-erkennen",
    name: "Material erkennen",
    beschreibung: "Hand-Probe, Geruch, Klang, Tabelle — was haelt das Material aus?",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
]

// ============================================================
// Hand der Sicherheit
// ============================================================

export const SICHERHEIT_SKILLS: SkillV2[] = [
  {
    id: H + "psa-waehlen",
    name: "PSA waehlen",
    beschreibung: "Augen, Ohren, Hand, Atem — Schutz vor jeder Maschine.",
    potenzialfelder: ["welt-wachstum", "mensch-verbindung"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: H + "erste-hilfe",
    name: "Erste Hilfe",
    beschreibung: "Schnitt, Splitter, Verbrennung, Augenspuelung, Notruf.",
    potenzialfelder: ["mensch-verbindung", "system-logik"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister", "pruefung"],
    innereLinie: ["frieden"],
  },
  {
    id: H + "werkzeug-pflegen",
    name: "Werkzeug pflegen",
    beschreibung: "Schaerfen, oelen, trocken halten, lagern — das Werkzeug bleibt scharf.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
]

// ============================================================
// Hand der Werkstatt
// ============================================================

export const WERKSTATT_SKILLS: SkillV2[] = [
  {
    id: H + "arbeitsplatz-halten",
    name: "Arbeitsplatz halten",
    beschreibung: "Vorbereiten, aufraeumen, Werkzeug an seinen Platz — sauber, klar, sicher.",
    potenzialfelder: ["raum-bau", "mensch-verbindung"],
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
    innereLinie: ["stille"],
  },
  {
    id: H + "stille-halten",
    name: "Stille halten",
    beschreibung: "Drei Atemzuege vor dem ersten Schnitt — die Hand wird ruhig.",
    potenzialfelder: ["koerper-bewegung", "mensch-verbindung"],
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst"],
    innereLinie: ["stille", "koerper", "frieden", "selbsterkenntnis"],
  },
  {
    id: H + "auftrag-annehmen",
    name: "Auftrag annehmen",
    beschreibung: "Zuhoeren, Notizen, Wiederholen, Termin, Uebergabe — der Auftrag traegt.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung", "initiative-werk"],
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
]

// ============================================================
// Drei-Haende-Definitionen (mit Skill-Buendel)
// ============================================================

export const HAND_VERMESSER: DreiHand = {
  id: "vermesser",
  name: "Hand des Vermessers",
  beschreibung: "Mass nehmen, Skizze lesen, Material erkennen.",
  buendel: [H + "messen", H + "skizze-lesen", H + "material-erkennen"],
  alterAb: 8,
  schwellenTier: "probiert",
}

export const HAND_SICHERHEIT: DreiHand = {
  id: "sicherheit",
  name: "Hand der Sicherheit",
  beschreibung: "PSA waehlen, Erste Hilfe, Werkzeug pflegen.",
  buendel: [H + "psa-waehlen", H + "erste-hilfe", H + "werkzeug-pflegen"],
  alterAb: 8,
  schwellenTier: "probiert",
}

export const HAND_WERKSTATT: DreiHand = {
  id: "werkstatt",
  name: "Hand der Werkstatt",
  beschreibung: "Arbeitsplatz halten, Stille halten, Auftrag annehmen.",
  buendel: [H + "arbeitsplatz-halten", H + "stille-halten", H + "auftrag-annehmen"],
  alterAb: 6,
  schwellenTier: "probiert",
}

export const DREI_HAENDE_FULL: DreiHand[] = [HAND_VERMESSER, HAND_SICHERHEIT, HAND_WERKSTATT]

export const DREI_HAENDE_SKILLS: SkillV2[] = [
  ...VERMESSER_SKILLS,
  ...SICHERHEIT_SKILLS,
  ...WERKSTATT_SKILLS,
]
