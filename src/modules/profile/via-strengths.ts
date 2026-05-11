import type { TreeBereichId } from "../gamification"

/**
 * VIA Character Strengths (Phase F6, 11.05.2026).
 *
 * Die 24 Charakter-Staerken in 6 Tugenden nach Peterson & Seligman
 * ("Character Strengths and Virtues", 2004). Wissenschaftlich validiert,
 * kultur-uebergreifend stabil.
 *
 * In RLN dient das VIA-Quiz dem Onboarding: ein neuer User beantwortet
 * 24 Fragen (eine pro Staerke, Skala 1..5) und das System verteilt
 * Anfangs-XP auf die universellen Skills, die mit den Staerken am
 * naechsten verwandt sind. Aus dem Quiz fallen die 5 hoechsten Werte
 * als **Signature Strengths** ins Profil — sichtbar, ehrenvoll.
 *
 * Recherche-Grundlage:
 *   skilltree-vertiefung/04-alter-lebensphasen.md (Block G, K)
 *   skilltree-vertiefung/01-skill-universum.md (Block A.3 — VIA-24)
 */

export type ViaVirtue =
  | "weisheit"
  | "mut"
  | "menschlichkeit"
  | "gerechtigkeit"
  | "maessigung"
  | "transzendenz"

export interface ViaStrength {
  /** ID, snake-case */
  id: string
  /** Anzeigename Deutsch */
  label: string
  /** Tugend, in die diese Staerke gehoert */
  virtue: ViaVirtue
  /** Frage fuer das Onboarding-Quiz (Ich-Form, 1..5-Skala) */
  question: string
  /** Universeller Skill, der bei hohem Wert XP bekommt */
  skillId: string
  /** Primaerer Bereich (faellt zurueck auf den Bereich des Skills) */
  bereichId: TreeBereichId
}

export const VIA_STRENGTHS: ViaStrength[] = [
  // ── Weisheit und Wissen ────────────────────────────────────
  {
    id: "kreativitaet",
    label: "Kreativitaet",
    virtue: "weisheit",
    question: "Ich finde gerne neue Wege, etwas zu tun.",
    skillId: "u-geist-loesen",
    bereichId: "geist",
  },
  {
    id: "neugier",
    label: "Neugier",
    virtue: "weisheit",
    question: "Ich liebe es, Neues zu entdecken.",
    skillId: "u-geist-lernen",
    bereichId: "geist",
  },
  {
    id: "urteilskraft",
    label: "Urteilskraft",
    virtue: "weisheit",
    question: "Ich pruefe Argumente sorgfaeltig, bevor ich mich entscheide.",
    skillId: "u-geist-kritik",
    bereichId: "geist",
  },
  {
    id: "lernfreude",
    label: "Lernfreude",
    virtue: "weisheit",
    question: "Ich lerne gerne neue Themen, auch ohne Zwang.",
    skillId: "u-geist-lernen",
    bereichId: "geist",
  },
  {
    id: "perspektive",
    label: "Perspektive",
    virtue: "weisheit",
    question: "Andere fragen mich oft um Rat.",
    skillId: "u-bewusstsein-vision",
    bereichId: "bewusstsein",
  },

  // ── Mut ────────────────────────────────────────────────────
  {
    id: "tapferkeit",
    label: "Tapferkeit",
    virtue: "mut",
    question: "Ich stehe fuer das ein, was ich fuer richtig halte, auch wenn es schwer wird.",
    skillId: "u-bewusstsein-hingabe",
    bereichId: "bewusstsein",
  },
  {
    id: "ausdauer",
    label: "Ausdauer",
    virtue: "mut",
    question: "Ich bringe Dinge zu Ende, auch wenn sie schwer werden.",
    skillId: "u-koerper-ausdauer",
    bereichId: "koerper",
  },
  {
    id: "aufrichtigkeit",
    label: "Aufrichtigkeit",
    virtue: "mut",
    question: "Ich bleibe meinen Worten treu, auch wenn niemand zusieht.",
    skillId: "u-soziales-sprechen",
    bereichId: "soziales",
  },
  {
    id: "vitalitaet",
    label: "Vitalitaet",
    virtue: "mut",
    question: "Ich gehe das Leben mit Schwung und Energie an.",
    skillId: "u-koerper-bewegung",
    bereichId: "koerper",
  },

  // ── Menschlichkeit ─────────────────────────────────────────
  {
    id: "liebe",
    label: "Liebe",
    virtue: "menschlichkeit",
    question: "Ich lasse mich auf nahe Beziehungen ein, ohne mich zu verlieren.",
    skillId: "u-seele-liebe",
    bereichId: "seele",
  },
  {
    id: "guete",
    label: "Guete",
    virtue: "menschlichkeit",
    question: "Ich helfe anderen gerne, auch ohne Gegenleistung.",
    skillId: "u-soziales-empathie",
    bereichId: "soziales",
  },
  {
    id: "soziale-intelligenz",
    label: "Soziale Intelligenz",
    virtue: "menschlichkeit",
    question: "Ich spuere, was andere brauchen, bevor sie es sagen.",
    skillId: "u-soziales-empathie",
    bereichId: "soziales",
  },

  // ── Gerechtigkeit ──────────────────────────────────────────
  {
    id: "teamarbeit",
    label: "Teamarbeit",
    virtue: "gerechtigkeit",
    question: "Ich arbeite gerne mit anderen an einer gemeinsamen Sache.",
    skillId: "u-gemeinschaft-treffen",
    bereichId: "gemeinschaft",
  },
  {
    id: "fairness",
    label: "Fairness",
    virtue: "gerechtigkeit",
    question: "Ich behandle alle nach denselben Massstaeben.",
    skillId: "u-gemeinschaft-konsent",
    bereichId: "gemeinschaft",
  },
  {
    id: "fuehrung",
    label: "Fuehrung",
    virtue: "gerechtigkeit",
    question: "Ich uebernehme Verantwortung, wenn die Gruppe einen Weg braucht.",
    skillId: "u-gemeinschaft-organisation",
    bereichId: "gemeinschaft",
  },

  // ── Maessigung ─────────────────────────────────────────────
  {
    id: "vergebung",
    label: "Vergebung",
    virtue: "maessigung",
    question: "Ich kann verzeihen, auch wenn es weh tat.",
    skillId: "u-soziales-reparieren",
    bereichId: "soziales",
  },
  {
    id: "bescheidenheit",
    label: "Bescheidenheit",
    virtue: "maessigung",
    question: "Mein Werk spricht fuer sich — ich brauche keinen Applaus.",
    skillId: "u-bewusstsein-stille",
    bereichId: "bewusstsein",
  },
  {
    id: "klugheit",
    label: "Klugheit",
    virtue: "maessigung",
    question: "Ich denke an die Folgen, bevor ich handle.",
    skillId: "u-bewusstsein-werte",
    bereichId: "bewusstsein",
  },
  {
    id: "selbstregulation",
    label: "Selbstregulation",
    virtue: "maessigung",
    question: "Ich halte mich selbst auf Kurs, auch ohne Aufsicht.",
    skillId: "u-bewusstsein-praesenz",
    bereichId: "bewusstsein",
  },

  // ── Transzendenz ───────────────────────────────────────────
  {
    id: "schoenheitssinn",
    label: "Schoenheits-Sinn",
    virtue: "transzendenz",
    question: "Schoenheit beruehrt mich tief — in Kunst, Natur, im Alltag.",
    skillId: "u-seele-schoenheit",
    bereichId: "seele",
  },
  {
    id: "dankbarkeit",
    label: "Dankbarkeit",
    virtue: "transzendenz",
    question: "Ich nehme wahr und zeige, was ich geschenkt bekomme.",
    skillId: "u-seele-gefuehl",
    bereichId: "seele",
  },
  {
    id: "hoffnung",
    label: "Hoffnung",
    virtue: "transzendenz",
    question: "Ich erwarte das Gute — auch in schweren Zeiten.",
    skillId: "u-bewusstsein-vision",
    bereichId: "bewusstsein",
  },
  {
    id: "humor",
    label: "Humor",
    virtue: "transzendenz",
    question: "Ich kann lachen, auch ueber mich selbst.",
    skillId: "u-seele-ausdruck",
    bereichId: "seele",
  },
  {
    id: "spiritualitaet",
    label: "Spiritualitaet",
    virtue: "transzendenz",
    question: "Ich spuere, dass das Leben groesser ist als das Sichtbare.",
    skillId: "u-bewusstsein-meditation",
    bereichId: "bewusstsein",
  },
]

export const VIRTUE_LABELS: Record<ViaVirtue, string> = {
  weisheit: "Weisheit und Wissen",
  mut: "Mut",
  menschlichkeit: "Menschlichkeit",
  gerechtigkeit: "Gerechtigkeit",
  maessigung: "Maessigung",
  transzendenz: "Transzendenz",
}

/**
 * Antwort-Skala: 1 (gar nicht wie ich) bis 5 (ganz wie ich).
 * Ungesetzt = `undefined`.
 */
export type ViaAnswer = 1 | 2 | 3 | 4 | 5

/**
 * Mapping Antwort → XP, die diese Staerke bekommt.
 * 5 → 200, 4 → 100, 3 → 50, 2 → 25, 1 → 0.
 */
export function viaAnswerToXp(answer: ViaAnswer | undefined): number {
  if (!answer || answer <= 1) return 0
  if (answer === 2) return 25
  if (answer === 3) return 50
  if (answer === 4) return 100
  return 200 // 5
}
