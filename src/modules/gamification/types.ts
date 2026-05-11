import type { TreeBereichId } from "./tree"

/**
 * Datenmodell fuer das Gamification-Modul.
 *
 * Alle Daten leben als Items im WoT-Doc:
 *   - `skill`              — Skill-Definition (pro Space)
 *   - `user-progress`      — User-XP pro Space (eines pro User pro Space)
 *   - `log-entry`          — generischer Log-Eintrag (cross-Modul)
 *   - `avatar-item`        — Item-Definition (Belohnung), pro Space oder global
 *   - `user-avatar`        — Avatar-Zustand des Users (eines pro User)
 *
 * Quest-Items (`type: "quest"`) existieren bereits im Calendar-Modul; hier
 * werden sie um Gamification-Felder erweitert.
 */

// ============================================================
// Skill-Definition (im Space)
// ============================================================

/**
 * Voraussetzungs-Modell fuer Skills (Phase F3, 11.05.2026).
 *
 * Ein Skill kann gesperrt sein, bis bestimmte andere Skills wachsen.
 * Drei Wege, die kombinierbar sind:
 *   - `all` : alle Skills aus der Liste muessen mindestens Level 1 haben
 *   - `any` : einer aus der Liste reicht (Level >= 1)
 *   - `minLevel` : bestimmter Skill auf bestimmtem Level
 *
 * Wenn mehrere Wege gesetzt sind, muessen alle erfuellt sein (AND ueber
 * die drei Felder, OR innerhalb von `any`).
 *
 * Die referenzierten Skill-IDs koennen Universal (Praefix `u-`) oder
 * space-spezifisch (WoT-Item-ID) sein. Cross-Space-Voraussetzungen
 * funktionieren ueber Universal-Skills.
 */
export interface SkillPrerequisites {
  /** Alle Skills aus der Liste mindestens Level 1 */
  all?: string[]
  /** Einer aus der Liste reicht (Level >= 1) */
  any?: string[]
  /** Skill mit Mindest-Level */
  minLevel?: { skillId: string; level: number }[]
}

/**
 * Item: `type: "skill"`
 *
 * Beispiel im Macher-Space:
 *   { name: "Holz", bereichId: "handwerk", icon: "trees", description: "..." }
 */
export interface SkillData {
  /** Anzeigename, z.B. "Holz", "3D-Druck", "Meditation" */
  name: string
  /** Welcher der 8 universellen Bereiche traegt diesen Skill primaer? */
  bereichId: TreeBereichId
  /** Lucide-Icon-Name (optional, faellt sonst auf Bereich-Icon zurueck) */
  icon?: string
  /** Kurzbeschreibung */
  description?: string
  /** Pin-/Theme-Farbe (optional, sonst Bereich-Farbe) */
  color?: string
  /** Sortier-Reihenfolge im Tree */
  order?: number
  /** Voraussetzungs-Skills, die wachsen muessen, bevor dieser hier sich oeffnet. */
  prerequisites?: SkillPrerequisites
}

// ============================================================
// User-Progress (XP-Status)
// ============================================================

/**
 * Item: `type: "user-progress"`, eines pro User pro Space.
 * `createdBy` = User-ID.
 *
 * Speichert XP pro Skill (granular) und pro Bereich (aggregiert beim
 * Schreiben — Cache fuer schnelles Lesen).
 */
export interface UserProgressData {
  /** XP pro Skill-ID */
  skillXp: Record<string, number>
  /** XP pro Bereich (aggregiert) */
  bereichXp: Partial<Record<TreeBereichId, number>>
  /** Letzte Aktualisierung — fuer Synergie-Fenster */
  updatedAt: string
}

// ============================================================
// Log-Eintrag (generisch, cross-Modul)
// ============================================================

export type LogEntryType =
  | "quest_completed"
  | "level_up"
  | "skill_unlocked"
  | "item_earned"
  | "title_earned"
  | "event_attended"
  | "place_visited"
  | "trust_verified"
  | "value_given"
  | "value_received"
  | "reflection"
  /** Wendepunkt im Leben — selbst gesetzt, mit Phasen-Kontext.
   *  payload kann z.B. tragen: { lifePhaseIndex, ageAtTime, description } */
  | "life_milestone"

export type LogEntryVisibility = "private" | "network" | "space" | "public"

/**
 * Item: `type: "log-entry"`
 *
 * Generischer Log-Eintrag — wird automatisch von Quest/Calendar/Trust/Value
 * geschrieben. Eintraege bleiben privat (Default), Nutzer kann einzelne
 * Eintraege oder ganze Kategorien fuer Profil/Netzwerk freigeben.
 */
export interface LogEntryData {
  type: LogEntryType
  timestamp: string
  /** Welches Modul hat den Eintrag erzeugt */
  sourceModule: string
  /** Frei-Text-Zusammenfassung fuer die UI */
  summary: string
  /** Strukturierte Payload — je nach type */
  payload?: Record<string, unknown>
  /** Verknuepfung zu einem anderen Item (z.B. Quest-ID) */
  relatedItemId?: string
  /** Sichtbarkeit (Default: privat) */
  visibility?: LogEntryVisibility
  /** User-Notiz / Reflexion */
  comment?: string
  /** Markierungen — wichtig, schoen, wiederholen */
  marks?: string[]
}

// ============================================================
// Quest-Erweiterung
// ============================================================

/**
 * Erweiterung des bestehenden Quest-Item-Typs (`type: "quest"`)
 * fuer Gamification-Felder. Die Calendar-spezifischen Felder
 * (start, end, location, etc.) bleiben unveraendert.
 */
export interface QuestGamificationFields {
  /** Welche Skills bekommen XP wenn die Quest abgeschlossen wird */
  skillXp?: Record<string, number>
  /** Direkt verteilte Bereich-XP (ohne ueber Skill zu gehen) */
  bereichXp?: Partial<Record<TreeBereichId, number>>
  /** Item-IDs die als Belohnung freigeschaltet werden */
  rewardItems?: string[]
  /** Verifikations-Modus */
  verification?: "qr" | "peer" | "self" | "attestation"
  /** Optionaler QR-Code-String (bei verification = "qr") */
  qrCode?: string
  /** Min-Level Bedingung (im Bereich) */
  levelRequirement?: { bereichId: TreeBereichId; level: number }
  /** Kopiert aus welcher Quest? Fuer Quest-Sharing. */
  copiedFromQuestId?: string
  /** Wie oft wurde diese Quest kopiert? Qualitaets-Signal. */
  timesCopied?: number
  /** Zugehoerigkeit zu einer Quest-Reihe */
  questSeriesId?: string
  questSeriesPosition?: number
}

// ============================================================
// Avatar
// ============================================================

export type AvatarItemRarity = "common" | "rare" | "epic" | "legendary"

/**
 * Item: `type: "avatar-item"`
 *
 * Definition eines Avatar-Symbols / Items. Soulbound — gehoert dem User
 * der es verdient hat, nicht handelbar.
 */
export interface AvatarItemData {
  name: string
  /** Lucide-Icon-Name oder SVG-Symbol-Identifier */
  symbol: string
  /** Welcher Bereich? Bestimmt Position auf Avatar. */
  bereichId?: TreeBereichId
  /** Seltenheit */
  rarity: AvatarItemRarity
  /** Wie wird das Item verdient? Beschreibung */
  condition: string
  /** Farbe (Hex) — sonst Bereich-Farbe */
  color?: string
  /** Pro Space erstellt oder global? */
  scope?: "space" | "global"
}

/**
 * Item: `type: "user-avatar"`, eines pro User.
 * Der Avatar reist mit dem User ueber Spaces.
 */
export interface UserAvatarData {
  /** IDs der gewonnenen Items (soulbound) */
  ownedItemIds: string[]
  /** IDs der aktuell auf dem Avatar sichtbaren Items (max ~5) */
  displayedItemIds: string[]
  /** Pro Space gewaehlter Titel */
  titlePerSpace?: Record<string, string>
  /** Pro Space evtl. eigene Avatar-Variante (z.B. Macher schlicht, Lichtung magisch) */
  variantPerSpace?: Record<string, "default" | "schlicht" | "magisch" | "klassisch">
  /** Pro Space gewaehlter Archetyp (oder mehrere — der Mensch traegt mehrere Wege) */
  archetypesPerSpace?: Record<string, string[]>
}

// ============================================================
// Past Experience (Phase F5, 11.05.2026)
// ============================================================

/**
 * Vergangenheits-Erfahrung — was war, bevor du auf RLN kamst.
 *
 * Eine Lehre, ein Werk, eine Reise, ein Werkzeug das du gelernt hast.
 * Wird im Profil eingetragen, gibt XP in den Bereichen, die sie traegt.
 *
 * Bis ein Peer attestiert hat (`attestedBy` leer), ist die Erfahrung
 * **vorlaeufig** — sichtbar im Profil, XP zaehlt im Tree, aber das
 * Profil zeigt deutlich "noch nicht bestaetigt". Sobald Peers
 * attestieren, faellt diese Markierung weg.
 *
 * XP-Mapping nach Reife-Stufe:
 *   - memory     →  50 XP pro Bereich   (Ich erinnere mich, ich kann es noch grob)
 *   - practiced  → 200 XP pro Bereich   (Ich habe es geuebt, ich kann es im Alltag)
 *   - mastered   → 800 XP pro Bereich   (Ich bin Meister/in, ich kann es lehren)
 *
 * Item: `type: "past-experience"`, `createdBy` = User-DID.
 */
export type PastExperienceMastery = "memory" | "practiced" | "mastered"

export interface PastExperienceData {
  /** Titel, kurz — z.B. "Tischlerlehre", "Drei Jahre Permakultur-Hof", "Studium Architektur" */
  title: string
  /** Freitext-Beschreibung, was diese Erfahrung war */
  description?: string
  /** Beginn-Jahr (optional) */
  startYear?: number
  /** Ende-Jahr (optional, fehlt bei laufendem) */
  endYear?: number
  /** Lebens-Phase-Index (0..10) wenn berechenbar aus Geburtsjahr + startYear */
  lifePhaseIndex?: number
  /** Welche Bereiche hat diese Erfahrung getraegt? Ein oder mehrere. */
  bereiche: TreeBereichId[]
  /** Wie tief reicht das, was du dabei gelernt hast? */
  mastery: PastExperienceMastery
  /** Optionales Foto (Base64 oder URL) */
  photoUrl?: string
  /** DIDs der Peers, die bestaetigt haben — leer = vorlaeufig */
  attestedBy?: string[]
}

/**
 * XP-Werte pro Reife-Stufe (pro Bereich).
 */
export const PAST_EXPERIENCE_XP: Record<PastExperienceMastery, number> = {
  memory: 50,
  practiced: 200,
  mastered: 800,
}

// ============================================================
// VIA Strengths Result (Phase F6, 11.05.2026)
// ============================================================

/**
 * Ergebnis des VIA-Onboarding-Quiz.
 *
 * 24 Antworten (eine pro Staerke), Skala 1..5. Aus den Antworten werden
 * die fuenf hoechsten Werte als **Signature Strengths** abgeleitet und
 * im Profil sichtbar gemacht.
 *
 * Pro User ein Item — beim erneuten Quiz wird es ueberschrieben.
 *
 * Item: `type: "via-result"`, `createdBy` = User-DID.
 */
export interface ViaResultData {
  /** Antworten pro Staerken-ID. Wert 1..5, undefined wenn uebersprungen. */
  answers: Record<string, number>
  /** Zeitpunkt des Quiz */
  completedAt: string
  /** Die 5 hoechsten Staerken (IDs) — fuers Profil sichtbar */
  signatureStrengthIds: string[]
}

// ============================================================
// Item-Type-Konstanten
// ============================================================

export const GAMIFICATION_ITEM_TYPES = {
  skill: "skill",
  userProgress: "user-progress",
  logEntry: "log-entry",
  avatarItem: "avatar-item",
  userAvatar: "user-avatar",
  quest: "quest",
  pastExperience: "past-experience",
  viaResult: "via-result",
} as const
