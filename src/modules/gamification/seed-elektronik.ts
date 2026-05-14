/**
 * Seed-Daten — Elektronik und Loeten-Werkstatt (Stand 14.05.2026).
 *
 * Hauptkette: Stromkreis -> Widerstand -> Loeten -> Schaltbild -> LED
 *             -> Arduino -> Sensor -> Wetterstation -> Roboter
 *
 * Sicherheits-Schwellen:
 *   - Loeten ab 10 mit Aufsicht (Hitze, Lueftung)
 *   - 230V-Anschluss ab 18 mit Elektrofachkraft (DGUV V3)
 */

import type { SkillV2, SkillKette } from "./skill-system"

const E = "elektronik:"

export const ELEKTRONIK_SKILLS: SkillV2[] = [
  {
    id: E + "stromkreis",
    name: "Stromkreis bauen",
    beschreibung: "Batterie, Kabel, Lampe — Strom fliesst im Kreis.",
    potenzialfelder: ["system-logik"],
    handwerksBereich: "elektronik",
    tier: "gespuert",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: E + "widerstand",
    name: "Widerstand verstehen",
    beschreibung: "Code-Ring lesen, Ohm rechnen — der Strom wird gebremst.",
    potenzialfelder: ["system-logik"],
    handwerksBereich: "elektronik",
    tier: "probiert",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: E + "stromkreis", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: E + "loetkolben",
    name: "Loetkolben fuehren",
    beschreibung: "Temperatur, Stand, sichere Hand — der Kolben heizt 300 Grad.",
    potenzialfelder: ["koerper-bewegung", "system-logik"],
    handwerksBereich: "elektronik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: E + "loeten",
    name: "Loeten",
    beschreibung: "Loetzinn, Flussmittel, Pinzette — Bauteile werden verbunden.",
    potenzialfelder: ["system-logik", "koerper-bewegung"],
    handwerksBereich: "elektronik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: E + "loetkolben", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
    probeAufgabe: {
      titel: "LED-Schaltung loeten",
      beschreibung: "Auf eine kleine Platine eine LED mit Widerstand und Batterie-Anschluss loeten — sie leuchtet.",
      zeitMinuten: 30,
      materialBenoetigt: ["Loetkolben", "Loetzinn", "LED", "Widerstand 220 Ohm", "Streifenplatine", "Batterie"],
    },
  },
  {
    id: E + "schaltbild",
    name: "Schaltbild lesen",
    beschreibung: "Symbole, Linien, Knoten — die Schaltung auf Papier.",
    potenzialfelder: ["system-logik", "wort-wirkung"],
    handwerksBereich: "elektronik",
    tier: "probiert",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: E + "stromkreis", typ: "pflicht" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: E + "multimeter",
    name: "Multimeter",
    beschreibung: "Spannung, Strom, Widerstand messen — der Detektiv im Kabel.",
    potenzialfelder: ["system-logik"],
    handwerksBereich: "elektronik",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: E + "schaltbild", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: E + "led",
    name: "LED schalten",
    beschreibung: "LED, Widerstand, Batterie — das Licht wird gemacht.",
    potenzialfelder: ["system-logik", "stoff-form"],
    handwerksBereich: "elektronik",
    tier: "probiert",
    dqrNiveau: 2,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: E + "widerstand", typ: "pflicht" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: E + "arduino",
    name: "Arduino programmieren",
    beschreibung: "Mikrocontroller mit Code zum Leben bringen.",
    potenzialfelder: ["system-logik", "initiative-werk"],
    handwerksBereich: "elektronik",
    tier: "kann",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: E + "led", typ: "empfohlen" },
      { to: E + "schaltbild", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: E + "sensor",
    name: "Sensor lesen",
    beschreibung: "Temperatur, Licht, Bewegung — die Welt wird Zahl.",
    potenzialfelder: ["system-logik", "welt-wachstum"],
    handwerksBereich: "elektronik",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: E + "arduino", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: E + "wetterstation",
    name: "Wetterstation",
    beschreibung: "Temperatur, Luftfeuchte, Druck — die eigene Mess-Station mit Display.",
    potenzialfelder: ["system-logik", "welt-wachstum", "initiative-werk"],
    handwerksBereich: "elektronik",
    tier: "meistert",
    dqrNiveau: 4,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: E + "sensor", typ: "pflicht" },
      { to: E + "loeten", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
  {
    id: E + "roboter",
    name: "Roboter bauen",
    beschreibung: "Mikrocontroller, Motoren, Sensoren — eine Maschine die sich bewegt.",
    potenzialfelder: ["system-logik", "raum-bau", "initiative-werk"],
    handwerksBereich: "elektronik",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: E + "wetterstation", typ: "empfohlen" },
      { to: E + "arduino", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const ELEKTRONIK_HAUPTKETTE: SkillKette = {
  id: "elektronik:hauptkette",
  name: "Vom Stromkreis zum Roboter",
  bereich: "elektronik",
  skillIds: [
    E + "stromkreis",
    E + "widerstand",
    E + "schaltbild",
    E + "loetkolben",
    E + "loeten",
    E + "multimeter",
    E + "led",
    E + "arduino",
    E + "sensor",
    E + "wetterstation",
    E + "roboter",
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigener Roboter mit Sensor und Motor",
}

export const ELEKTRONIK_KETTEN: SkillKette[] = [ELEKTRONIK_HAUPTKETTE]
