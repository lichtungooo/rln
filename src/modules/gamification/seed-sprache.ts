/**
 * Seed-Daten — Sprache und Wort (Bildungs-Bereich, Stand 14.05.2026).
 *
 * Pattern: Linear-Pfad mit Verzweigung.
 *
 * Hauptkette: Lesen -> Verstehen -> Schreiben -> Vortragen -> Argumentieren
 *             -> Erzaehlen -> Dichten
 *
 * Verzweigung bei Schreiben:
 *   - Sach-Pfad: Brief -> Bericht -> Essay
 *   - Kunst-Pfad: Geschichte -> Gedicht -> Lyrik
 *
 * Synergien: mit "Auftrag annehmen", "Argumentieren" -> Debatte,
 * mit Innerer Linie "Selbsterkenntnis" -> Tagebuch.
 */

import type { SkillV2, SkillKette } from "./skill-system"

const SP = "sprache:"

export const SPRACHE_SKILLS: SkillV2[] = [
  {
    id: SP + "lesen",
    name: "Lesen",
    beschreibung: "Wort fuer Wort, Satz fuer Satz — Bedeutung waechst aus Buchstaben.",
    potenzialfelder: ["wort-wirkung"],
    bildungsBereich: "sprache",
    tier: "probiert",
    dqrNiveau: 1,
    altersFreigabe: "ab6",
    voraussetzungen: [],
    attestationModi: ["selbst", "peer"],
  },
  {
    id: SP + "verstehen",
    name: "Verstehen",
    beschreibung: "Hauptgedanken finden, Zusammenhang erfassen, Inhalt zusammenfassen.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "sprache",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: SP + "lesen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
  },
  {
    id: SP + "schreiben",
    name: "Schreiben",
    beschreibung: "Text aufbauen, formulieren, ueberarbeiten — eigene Gedanken auf Papier.",
    potenzialfelder: ["wort-wirkung"],
    bildungsBereich: "sprache",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: SP + "verstehen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: SP + "brief",
    name: "Brief schreiben",
    beschreibung: "Anrede, Anliegen, Gruss — der direkte Weg zu einem Menschen.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    bildungsBereich: "sprache",
    tier: "kann",
    dqrNiveau: 2,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: SP + "schreiben", typ: "pflicht" },
    ],
    attestationModi: ["peer"],
  },
  {
    id: SP + "bericht",
    name: "Bericht schreiben",
    beschreibung: "Was, wann, wo, wer — Information ordnen, klar weitergeben.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "sprache",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: SP + "schreiben", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: SP + "geschichte",
    name: "Geschichte erzaehlen",
    beschreibung: "Anfang, Wendung, Schluss — die Erzaehlung wird Welt.",
    potenzialfelder: ["wort-wirkung", "stoff-form"],
    bildungsBereich: "sprache",
    tier: "kann-lehren",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: SP + "schreiben", typ: "empfohlen" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["selbsterkenntnis"],
  },
  {
    id: SP + "gedicht",
    name: "Gedicht",
    beschreibung: "Rhythmus, Bild, Klang — Worte werden Musik.",
    potenzialfelder: ["wort-wirkung", "stoff-form"],
    bildungsBereich: "sprache",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab10",
    voraussetzungen: [
      { to: SP + "geschichte", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["stille", "selbsterkenntnis"],
  },
  {
    id: SP + "vortragen",
    name: "Vortragen",
    beschreibung: "Vor Menschen sprechen, ruhig stehen, klar sprechen.",
    potenzialfelder: ["wort-wirkung", "koerper-bewegung", "mensch-verbindung"],
    bildungsBereich: "sprache",
    tier: "kann",
    dqrNiveau: 3,
    altersFreigabe: "ab8",
    voraussetzungen: [
      { to: SP + "verstehen", typ: "pflicht" },
    ],
    attestationModi: ["peer", "meister"],
    innereLinie: ["koerper", "stille"],
  },
  {
    id: SP + "argumentieren",
    name: "Argumentieren",
    beschreibung: "Position, Begruendung, Beleg — die Meinung wird tragfaehig.",
    potenzialfelder: ["wort-wirkung", "system-logik"],
    bildungsBereich: "sprache",
    tier: "kann-lehren",
    dqrNiveau: 4,
    altersFreigabe: "ab12",
    voraussetzungen: [
      { to: SP + "vortragen", typ: "pflicht" },
      { to: SP + "verstehen", typ: "pflicht" },
    ],
    attestationModi: ["meister"],
  },
  {
    id: SP + "dichten",
    name: "Dichten",
    beschreibung: "Lyrik, Erzaehlung, Drama — eigene Sprache, eigene Welt.",
    potenzialfelder: ["wort-wirkung", "stoff-form"],
    bildungsBereich: "sprache",
    tier: "meistert",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: SP + "gedicht", typ: "empfohlen" },
      { to: SP + "geschichte", typ: "pflicht" },
    ],
    attestationModi: ["meister", "werk"],
    innereLinie: ["selbsterkenntnis", "stille"],
  },
  {
    id: SP + "eigenes-werk",
    name: "Eigenes Werk im Wort",
    beschreibung: "Buch, Theaterstueck, Sammelband — die Stimme wird Werk in der Welt.",
    potenzialfelder: ["wort-wirkung", "initiative-werk"],
    bildungsBereich: "sprache",
    tier: "gibt-weiter",
    dqrNiveau: 5,
    altersFreigabe: "ab14",
    voraussetzungen: [
      { to: SP + "dichten", typ: "empfohlen" },
      { to: SP + "argumentieren", typ: "empfohlen" },
    ],
    attestationModi: ["meister", "werk"],
  },
]

export const SPRACHE_HAUPTKETTE: SkillKette = {
  id: "sprache:hauptkette",
  name: "Vom Lesen zum eigenen Werk",
  bereich: "sprache",
  skillIds: [
    SP + "lesen",
    SP + "verstehen",
    SP + "schreiben",
    SP + "vortragen",
    SP + "argumentieren",
    SP + "geschichte",
    SP + "dichten",
    SP + "eigenes-werk",
  ],
  verzweigungen: [
    {
      ab: SP + "schreiben",
      aeste: [
        { name: "Sach-Pfad", skillIds: [SP + "brief", SP + "bericht"] },
        { name: "Kunst-Pfad", skillIds: [SP + "geschichte", SP + "gedicht"] },
      ],
    },
  ],
  zielTier: "gibt-weiter",
  werkstueck: "Eigenes Buch, Theaterstueck oder Sammelband",
}

export const SPRACHE_KETTEN: SkillKette[] = [SPRACHE_HAUPTKETTE]
