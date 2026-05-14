/**
 * Skill-System — neues Konzept-Fundament (Stand 14.05.2026).
 *
 * Drei Schichten:
 *   1. Acht Potenzialfelder (Constellation)
 *   2. Sechs Handwerks-Bereiche + zwoelf Bildungs-Bereiche (Hub-and-Spoke)
 *   3. Skill-Ketten innerhalb der Aeste (Linear mit Verzweigung)
 *
 * Drei Querschnitte:
 *   - Drei Haende (Wurzel-Skills als Sicherheits-Lizenz)
 *   - Mentoren-Achse (parallel, 20 Skills, vier Schwellen)
 *   - Innere Linie (sieben Stimmen quer durch alles)
 *
 * Konzept-Quelle: rln/Konzepte/SKILL-TREE-NEUBAU.md (Commit 1e8127e).
 *
 * Diese Datei lebt parallel zu tree.ts. Migration der Konsumenten in Folge-Pushes.
 */

import {
  Ruler, Palette, Cog, Sprout, Heart, MessageSquare, Rocket, Activity,
  Hammer, Flame, Leaf, Zap, Construction, Wrench,
  type LucideIcon,
} from "lucide-react"

// ============================================================
// Schicht 1 — Acht Potenzialfelder
// ============================================================

export type PotenzialfeldId =
  | "raum-bau"
  | "stoff-form"
  | "system-logik"
  | "welt-wachstum"
  | "mensch-verbindung"
  | "wort-wirkung"
  | "initiative-werk"
  | "koerper-bewegung"

export interface Potenzialfeld {
  id: PotenzialfeldId
  name: string
  beschreibung: string
  /** Vier Anker-Skills pro Feld (universell, bereichs-uebergreifend). */
  ankerSkills: string[]
  color: string
  icon: LucideIcon
}

export const POTENZIALFELDER: Potenzialfeld[] = [
  {
    id: "raum-bau",
    name: "Raum und Bau",
    beschreibung: "Raeumlich-konstruktiv — Mathe, Statik, Holz, Metall, Bauen.",
    ankerSkills: ["Messen", "Planen", "Bauen", "Pruefen"],
    color: "#F59E0B",
    icon: Ruler,
  },
  {
    id: "stoff-form",
    name: "Stoff und Form",
    beschreibung: "Gestalterisch-aesthetisch — Kunst, Musik, Design, Schmuck.",
    ankerSkills: ["Sehen", "Formen", "Faerben", "Komponieren"],
    color: "#A855F7",
    icon: Palette,
  },
  {
    id: "system-logik",
    name: "System und Logik",
    beschreibung: "Analytisch-systemisch — Physik, Chemie, Informatik, Elektronik.",
    ankerSkills: ["Beobachten", "Pruefen", "Programmieren", "Schaltung bauen"],
    color: "#3B82F6",
    icon: Cog,
  },
  {
    id: "welt-wachstum",
    name: "Welt und Wachstum",
    beschreibung: "Forschend, oekologisch — Biologie, Geographie, Garten, Permakultur.",
    ankerSkills: ["Beobachten", "Bestimmen", "Pflegen", "Verstehen"],
    color: "#10B981",
    icon: Sprout,
  },
  {
    id: "mensch-verbindung",
    name: "Mensch und Verbindung",
    beschreibung: "Sozial-koordinativ — Sozialkunde, Religion, Pflege, Mentor.",
    ankerSkills: ["Zuhoeren", "Begegnen", "Begleiten", "Sorgen"],
    color: "#EC4899",
    icon: Heart,
  },
  {
    id: "wort-wirkung",
    name: "Wort und Wirkung",
    beschreibung: "Kommunikativ-sprachlich — Deutsch, Fremdsprachen, Rhetorik.",
    ankerSkills: ["Lesen", "Schreiben", "Erzaehlen", "Argumentieren"],
    color: "#EAB308",
    icon: MessageSquare,
  },
  {
    id: "initiative-werk",
    name: "Initiative und Werk",
    beschreibung: "Unternehmerisch-handelnd — Wirtschaft, Politik, Werkstatt-Gruendung.",
    ankerSkills: ["Vorhaben fassen", "Auftrag annehmen", "Werk fuehren", "Wert schoepfen"],
    color: "#E8751A",
    icon: Rocket,
  },
  {
    id: "koerper-bewegung",
    name: "Koerper und Bewegung",
    beschreibung: "Koerperlich-kinaesthetisch — Sport, Tanz, Schmieden, Bauarbeit.",
    ankerSkills: ["Stand", "Atem", "Kraft", "Geschicklichkeit"],
    color: "#06B6D4",
    icon: Activity,
  },
]

export const POTENZIALFELD_BY_ID: Record<PotenzialfeldId, Potenzialfeld> =
  POTENZIALFELDER.reduce(
    (acc, f) => ({ ...acc, [f.id]: f }),
    {} as Record<PotenzialfeldId, Potenzialfeld>
  )

// ============================================================
// Schicht 2a — Sechs Handwerks-Bereiche (Hornbach-Anker)
// ============================================================

export type HandwerksBereichId =
  | "holz"
  | "metall"
  | "garten"
  | "elektronik"
  | "bau"
  | "reparieren"

export interface HandwerksBereich {
  id: HandwerksBereichId
  name: string
  beschreibung: string
  /** Welche Potenzialfelder dieser Bereich speist. */
  potenzialfelder: PotenzialfeldId[]
  color: string
  icon: LucideIcon
}

export const HANDWERKS_BEREICHE: HandwerksBereich[] = [
  {
    id: "holz",
    name: "Holz",
    beschreibung: "Tischlerei, Schreinerei, Drechseln, Schnitzen.",
    potenzialfelder: ["raum-bau", "stoff-form"],
    color: "#92400E",
    icon: Hammer,
  },
  {
    id: "metall",
    name: "Metall",
    beschreibung: "Schmieden, Schweissen, Feilen, Gewinde.",
    potenzialfelder: ["raum-bau", "system-logik", "koerper-bewegung"],
    color: "#475569",
    icon: Flame,
  },
  {
    id: "garten",
    name: "Garten und Pflanzen",
    beschreibung: "Gemueseanbau, Permakultur, Imkerei, Wildkraeuter.",
    potenzialfelder: ["welt-wachstum", "mensch-verbindung"],
    color: "#65A30D",
    icon: Leaf,
  },
  {
    id: "elektronik",
    name: "Elektronik und Loeten",
    beschreibung: "Schaltungen, Arduino, Reparatur-Elektronik.",
    potenzialfelder: ["system-logik", "raum-bau"],
    color: "#0EA5E9",
    icon: Zap,
  },
  {
    id: "bau",
    name: "Bauen und Renovieren",
    beschreibung: "Mauern, Verputzen, Beton, Trockenbau, Daemmung.",
    potenzialfelder: ["raum-bau", "koerper-bewegung"],
    color: "#9A3412",
    icon: Construction,
  },
  {
    id: "reparieren",
    name: "Reparieren und Upcycling",
    beschreibung: "Diagnose, Schrauben, Naehen, Lackieren, Reanimieren.",
    potenzialfelder: ["system-logik", "stoff-form"],
    color: "#0F766E",
    icon: Wrench,
  },
]

export const HANDWERKS_BEREICH_BY_ID: Record<HandwerksBereichId, HandwerksBereich> =
  HANDWERKS_BEREICHE.reduce(
    (acc, b) => ({ ...acc, [b.id]: b }),
    {} as Record<HandwerksBereichId, HandwerksBereich>
  )

// ============================================================
// Schicht 2b — Zwoelf Bildungs-Bereiche (Schul-Anker)
// ============================================================

export type BildungsBereichId =
  | "sprache"
  | "fremdsprachen"
  | "mathematik"
  | "naturwissenschaften"
  | "gesellschaft"
  | "religion-ethik"
  | "kunst"
  | "musik"
  | "sport"
  | "hauswirtschaft"
  | "lernen-lernen"
  | "berufsorientierung"

export interface BildungsBereich {
  id: BildungsBereichId
  name: string
  beschreibung: string
  potenzialfelder: PotenzialfeldId[]
  /** Pattern fuer die Skill-Anordnung im Bereich. */
  muster: "linear" | "hub-spoke" | "constellation" | "tier"
  color: string
}

export const BILDUNGS_BEREICHE: BildungsBereich[] = [
  {
    id: "sprache",
    name: "Sprache und Wort",
    beschreibung: "Lesen, Schreiben, Vortragen, Erzaehlen, Argumentieren.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    muster: "linear",
    color: "#EAB308",
  },
  {
    id: "fremdsprachen",
    name: "Fremdsprachen",
    beschreibung: "Englisch, Franzoesisch, Spanisch, Latein.",
    potenzialfelder: ["wort-wirkung", "mensch-verbindung"],
    muster: "linear",
    color: "#CA8A04",
  },
  {
    id: "mathematik",
    name: "Mathematik",
    beschreibung: "Messen, Rechnen, Algebra, Geometrie, Statistik.",
    potenzialfelder: ["system-logik", "raum-bau"],
    muster: "tier",
    color: "#1E40AF",
  },
  {
    id: "naturwissenschaften",
    name: "Naturwissenschaften",
    beschreibung: "Biologie, Chemie, Physik, Informatik.",
    potenzialfelder: ["welt-wachstum", "system-logik"],
    muster: "hub-spoke",
    color: "#0E7490",
  },
  {
    id: "gesellschaft",
    name: "Gesellschaft",
    beschreibung: "Geschichte, Geographie, Politik, Wirtschaft.",
    potenzialfelder: ["mensch-verbindung", "initiative-werk"],
    muster: "constellation",
    color: "#7C2D12",
  },
  {
    id: "religion-ethik",
    name: "Religion, Ethik, Philosophie",
    beschreibung: "Werte, Sinn, Glaube, Wahrheit als Stimmen.",
    potenzialfelder: ["mensch-verbindung", "wort-wirkung"],
    muster: "constellation",
    color: "#6B21A8",
  },
  {
    id: "kunst",
    name: "Kunst",
    beschreibung: "Zeichnen, Malen, Formen, Foto, Film.",
    potenzialfelder: ["stoff-form"],
    muster: "hub-spoke",
    color: "#BE185D",
  },
  {
    id: "musik",
    name: "Musik",
    beschreibung: "Singen, Instrument, Band, Komposition.",
    potenzialfelder: ["stoff-form", "mensch-verbindung"],
    muster: "tier",
    color: "#9D174D",
  },
  {
    id: "sport",
    name: "Koerper und Bewegung",
    beschreibung: "Leichtathletik, Mannschaft, Schwimmen, Tanz, Kampfkunst.",
    potenzialfelder: ["koerper-bewegung"],
    muster: "tier",
    color: "#0891B2",
  },
  {
    id: "hauswirtschaft",
    name: "Hauswirtschaft und Ernaehrung",
    beschreibung: "Kochen, Konservieren, Pflege, Naehen.",
    potenzialfelder: ["welt-wachstum", "stoff-form", "mensch-verbindung"],
    muster: "hub-spoke",
    color: "#15803D",
  },
  {
    id: "lernen-lernen",
    name: "Lernen lernen",
    beschreibung: "Notiz, Recherche, Praesentation, Reflektion.",
    potenzialfelder: ["system-logik", "initiative-werk"],
    muster: "linear",
    color: "#374151",
  },
  {
    id: "berufsorientierung",
    name: "Berufsorientierung",
    beschreibung: "Praktikum, Bewerbung, Werkstatt-Besuch, Berufsbild.",
    potenzialfelder: ["initiative-werk", "mensch-verbindung"],
    muster: "constellation",
    color: "#9F1239",
  },
]

export const BILDUNGS_BEREICH_BY_ID: Record<BildungsBereichId, BildungsBereich> =
  BILDUNGS_BEREICHE.reduce(
    (acc, b) => ({ ...acc, [b.id]: b }),
    {} as Record<BildungsBereichId, BildungsBereich>
  )

// ============================================================
// Sechs Tier-Stufen (Bloom Mastery Learning)
// ============================================================

export type Tier =
  | "gespuert"
  | "probiert"
  | "kann"
  | "kann-lehren"
  | "meistert"
  | "gibt-weiter"

export interface TierInfo {
  id: Tier
  stufe: number
  name: string
  beschreibung: string
  beleg: string
}

export const TIER_STUFEN: TierInfo[] = [
  {
    id: "gespuert",
    stufe: 1,
    name: "gespuert",
    beschreibung: "Funke gezuendet, erstes Interesse.",
    beleg: "Selbsteintrag",
  },
  {
    id: "probiert",
    stufe: 2,
    name: "probiert",
    beschreibung: "Erste konkrete Erfahrung, Werk-Versuch.",
    beleg: "Foto oder Werkstueck",
  },
  {
    id: "kann",
    stufe: 3,
    name: "kann",
    beschreibung: "Mastery erreicht, Werk gelingt.",
    beleg: "Mentor-Attestation",
  },
  {
    id: "kann-lehren",
    stufe: 4,
    name: "kann lehren",
    beschreibung: "Faehigkeit so tief, dass anderen helfen funktioniert.",
    beleg: "Mit-Lerner-Attestationen",
  },
  {
    id: "meistert",
    stufe: 5,
    name: "meistert",
    beschreibung: "Voll beherrscht, eigenstaendig, ueberraschend.",
    beleg: "Meister-Attestation, Pruefung oder Wettbewerb",
  },
  {
    id: "gibt-weiter",
    stufe: 6,
    name: "gibt weiter",
    beschreibung: "Traegt Bewegung, schenkt der Gemeinschaft Spuren.",
    beleg: "Mentor-Quests an andere",
  },
]

export const TIER_BY_ID: Record<Tier, TierInfo> = TIER_STUFEN.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<Tier, TierInfo>
)

export function tierStufe(tier: Tier): number {
  return TIER_BY_ID[tier].stufe
}

// ============================================================
// Drei Haende — Sicherheits-Lizenz vor jedem Handwerks-Bereich
// ============================================================

export type DreiHandId = "vermesser" | "sicherheit" | "werkstatt"

export interface DreiHand {
  id: DreiHandId
  name: string
  beschreibung: string
  /** Die drei Buendel-Skills, die zusammen die Hand bilden. */
  buendel: string[]
  /** Alters-Empfehlung fuer Tier 1. */
  alterAb: number
  /** Schwellen-Tier, ab dem die Hand als Sicherheits-Lizenz zaehlt. */
  schwellenTier: Tier
}

export const DREI_HAENDE: DreiHand[] = [
  {
    id: "vermesser",
    name: "Hand des Vermessers",
    beschreibung: "Mass nehmen, Skizze lesen, Material erkennen.",
    buendel: ["Messen", "Skizze lesen", "Material erkennen"],
    alterAb: 8,
    schwellenTier: "probiert",
  },
  {
    id: "sicherheit",
    name: "Hand der Sicherheit",
    beschreibung: "PSA waehlen, Erste Hilfe, Werkzeug pflegen.",
    buendel: ["PSA waehlen", "Erste Hilfe", "Werkzeug pflegen"],
    alterAb: 8,
    schwellenTier: "probiert",
  },
  {
    id: "werkstatt",
    name: "Hand der Werkstatt",
    beschreibung: "Arbeitsplatz halten, Stille halten, Auftrag annehmen.",
    buendel: ["Arbeitsplatz halten", "Stille halten", "Auftrag annehmen"],
    alterAb: 6,
    schwellenTier: "probiert",
  },
]

export const DREI_HAND_BY_ID: Record<DreiHandId, DreiHand> = DREI_HAENDE.reduce(
  (acc, h) => ({ ...acc, [h.id]: h }),
  {} as Record<DreiHandId, DreiHand>
)

// ============================================================
// Innere Linie — sieben Stimmen, Querschnitt
// ============================================================

export type InnereLinieId =
  | "stille"
  | "natur"
  | "koerper"
  | "selbsterkenntnis"
  | "geburts-wurzel"
  | "frieden"
  | "rueckverbindung"

export interface InnereLinie {
  id: InnereLinieId
  name: string
  beschreibung: string
}

export const INNERE_LINIEN: InnereLinie[] = [
  { id: "stille", name: "Stille", beschreibung: "Drei Atemzuege vor jedem Schnitt." },
  { id: "natur", name: "Natur", beschreibung: "Material als Lebewesen achten." },
  { id: "koerper", name: "Koerper", beschreibung: "Stand, Atem, Hand bewusst fuehren." },
  { id: "selbsterkenntnis", name: "Selbsterkenntnis", beschreibung: "Eigene Muster erkennen." },
  { id: "geburts-wurzel", name: "Geburts-Wurzel", beschreibung: "Fruehe Praegung als unsichtbares Erbe." },
  { id: "frieden", name: "Innerer Frieden", beschreibung: "Herz-Hirn-Kohaerenz, Polyvagal-Sicherheit." },
  { id: "rueckverbindung", name: "Rueckverbindung", beschreibung: "Mensch-Natur-Erde-Universum als Geflecht." },
]

// ============================================================
// Typen — Skill, Edge, Kette, Attestation
// ============================================================

export type Altersfreigabe =
  | "alle"
  | "ab6"
  | "ab8"
  | "ab10"
  | "ab12"
  | "ab14"
  | "ab16"
  | "volljaehrig"

export type KantenTyp = "pflicht" | "empfohlen" | "synergie"

export type AttestationModus = "selbst" | "peer" | "meister" | "pruefung" | "werk"

export interface ExternalAnchor {
  framework: "esco" | "digcomp" | "entrecomp" | "lifecomp" | "greencomp" | "hwo" | "kmk"
  code: string
  level?: number
}

export interface SkillEdge {
  to: string
  typ: KantenTyp
  begruendung?: string
}

export interface SkillV2 {
  id: string
  name: string
  beschreibung?: string
  /** Ein bis drei Potenzialfelder, die dieser Skill speist. */
  potenzialfelder: PotenzialfeldId[]
  /** Welcher Handwerks-Bereich (falls handwerklich). */
  handwerksBereich?: HandwerksBereichId
  /** Welcher Bildungs-Bereich (falls schulisch). */
  bildungsBereich?: BildungsBereichId
  tier: Tier
  dqrNiveau?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  altersFreigabe: Altersfreigabe
  voraussetzungen: SkillEdge[]
  externalAnchors?: ExternalAnchor[]
  attestationModi: AttestationModus[]
  /** Welche Linien der Inneren Linie diesen Skill durchstroemen. */
  innereLinie?: InnereLinieId[]
  probeAufgabe?: {
    titel: string
    beschreibung: string
    zeitMinuten: number
    materialBenoetigt: string[]
  }
}

export interface SkillKette {
  id: string
  name: string
  bereich: HandwerksBereichId | BildungsBereichId
  /** Geordnete Skill-IDs in der Hauptbahn. */
  skillIds: string[]
  verzweigungen?: Array<{
    ab: string
    aeste: Array<{ name: string; skillIds: string[] }>
  }>
  zielTier: Tier
  werkstueck?: string
}

export interface AttestationRef {
  attesterDid: string
  vcId: string
  achievementId?: string
  issuedAt: string
  relation?: "meister" | "kollege" | "kunde" | "lehrling" | "familie" | "mentor"
  visibility: "oeffentlich" | "kreis" | "privat"
}
