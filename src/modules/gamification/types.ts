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
 * Item: `type: "skill"`
 *
 * Beispiel im Macher-Space:
 *   { name: "Holz", bereichId: "handwerk", icon: "trees", description: "..." }
 */
export interface SkillData {
  /** Anzeigename, z.B. "Holz", "3D-Druck", "Meditation" */
  name: string
  /** Welcher der 7 universellen Bereiche traegt diesen Skill primaer? */
  bereichId: TreeBereichId
  /** Lucide-Icon-Name (optional, faellt sonst auf Bereich-Icon zurueck) */
  icon?: string
  /** Kurzbeschreibung */
  description?: string
  /** Pin-/Theme-Farbe (optional, sonst Bereich-Farbe) */
  color?: string
  /** Sortier-Reihenfolge im Tree */
  order?: number
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
// Item-Type-Konstanten
// ============================================================

export const GAMIFICATION_ITEM_TYPES = {
  skill: "skill",
  userProgress: "user-progress",
  logEntry: "log-entry",
  avatarItem: "avatar-item",
  userAvatar: "user-avatar",
  quest: "quest",
} as const
