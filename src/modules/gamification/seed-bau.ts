/**
 * Seed-Daten — Bauen und Renovieren-Werkstatt (Stand 14.05.2026).
 *
 * Hauptkette: Mauerstein -> Moertel mischen -> Mauerkelle -> Mauer setzen
 *             -> Putz -> Streichen -> Beton -> Daemmung -> Garten-Bank
 *
 * Sicherheits-Schwellen (DGUV):
 *   - Geruest ab 16
 *   - Dacharbeit ab 16 mit Auffanggurt
 */

import type { SkillV2, SkillKette } from "./skill-system"

const B = "bau:"

export const BAU_SKILLS: SkillV2[] = [
  {
    id: B + "mauerstein",
    name: "Mauerstein erkennen",
    beschreibung: "Vollstein, Lochstein, Kalksandstein, Ziegel — Hand-Probe und Klang.",
    potenzialfelder: ["welt-wachstum", "raum-bau"],
    handwerksBereich: "bau",
    tier: "gespuert",
    dqrNiveau: 1,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: B + "moertel-mischen",
    name: "Moertel mischen",
    beschreibung: "Bindemittel, Sand, Wasser im Eimer — das Verhaeltnis traegt.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    handwerksBereich: "bau",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
  },
  {
    id: B + "mauerkelle",
    name: "Mauerkelle fuehren",
    beschreibung: "Moertel aufnehmen, abstreichen, verteilen — die Hand wird sicher.",
    potenzialfelder: ["koerper-bewegung", "raum-bau"],
    handwerksBereich: "bau",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "moertel-mischen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: B + "mauer-setzen",
    name: "Mauer setzen",
    beschreibung: "Steine, Moertel, Lot — Reihe fuer Reihe waechst die Wand.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    handwerksBereich: "bau",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "mauerkelle", typ: "pflicht" },
      { to: B + "mauerstein", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
    probeAufgabe: {
      titel: "Mauer-Reihe",
      beschreibung: "Acht Steine in einer Reihe setzen — gerade, im Lot, sauberer Fugenanschluss.",
      zeitMinuten: 45,
      materialBenoetigt: ["8 Mauersteine", "Moertel", "Mauerkelle", "Wasserwaage", "Schnur"],
    },
  },
  {
    id: B + "putzen",
    name: "Innenputz ziehen",
    beschreibung: "Glaettkelle, Kartaetsche — der Putz wird Wand.",
    potenzialfelder: ["stoff-form", "koerper-bewegung"],
    handwerksBereich: "bau",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "moertel-mischen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: B + "streichen",
    name: "Streichen",
    beschreibung: "Pinsel, Rolle, Wanne — die Farbe wird Schicht.",
    potenzialfelder: ["stoff-form"],
    handwerksBereich: "bau",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer"],
  },
  {
    id: B + "beton-mischen",
    name: "Beton mischen",
    beschreibung: "Zement, Sand, Kies, Wasser — das Verhaeltnis macht die Festigkeit.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    handwerksBereich: "bau",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: B + "moertel-mischen", typ: "empfohlen" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: B + "schalung",
    name: "Schalung bauen",
    beschreibung: "Bretter, Schrauben — die Form, in die der Beton fliesst.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    handwerksBereich: "bau",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [],
    attestationModi: ["meister"],
  },
  {
    id: B + "daemmen",
    name: "Daemmung einbauen",
    beschreibung: "Mineralwolle, Schnitt, Dampfbremse — die Waerme bleibt drin.",
    potenzialfelder: ["raum-bau", "welt-wachstum"],
    handwerksBereich: "bau",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [],
    attestationModi: ["meister"],
  },
  {
    id: B + "garten-bank",
    name: "Garten-Bank betonieren",
    beschreibung: "Schalung, Bewehrung, Beton — eine Bank, die ein Leben haelt.",
    potenzialfelder: ["raum-bau", "stoff-form", "initiative-werk"],
    handwerksBereich: "bau",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: B + "beton-mischen", typ: "pflicht" },
      { to: B + "schalung", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const BAU_HAUPTKETTE: SkillKette = {
  id: "bau:hauptkette",
  name: "Vom Stein zur Bank",
  bereich: "bau",
  skillIds: [
    B + "mauerstein",
    B + "moertel-mischen",
    B + "mauerkelle",
    B + "mauer-setzen",
    B + "putzen",
    B + "streichen",
    B + "beton-mischen",
    B + "schalung",
    B + "daemmen",
    B + "garten-bank",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eine betonierte Garten-Bank",
}

export const BAU_KETTEN: SkillKette[] = [BAU_HAUPTKETTE]
