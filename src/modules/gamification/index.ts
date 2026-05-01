/**
 * Gamification-Modul — Daten-Fundament + Hooks.
 *
 * Phase A (01.05.2026): nur Daten + Hooks, kein UI noch.
 *
 * Naechste Phasen:
 *   B  — Quest-Loop (Erstellung, QR-Verifikation, XP-Engine)
 *   C  — Sichtbarkeit (Dashboard-Widgets, HUD, Skill-Tree-View)
 *   D  — Avatar-Modul (Symbol-System, Inventar, Drag-Drop)
 *   E  — Tiefe (Synergie-Bonus, Item-Seltenheiten, Titel, Quest-Reihen)
 */

export {
  TREE_BEREICHE,
  BEREICH_BY_ID,
  INNERE_BEREICHE,
  xpToLevel,
  xpForLevel,
  progressInLevel,
  type TreeBereich,
  type TreeBereichId,
} from "./tree"

export {
  GAMIFICATION_ITEM_TYPES,
  type SkillData,
  type UserProgressData,
  type LogEntryData,
  type LogEntryType,
  type LogEntryVisibility,
  type QuestGamificationFields,
  type AvatarItemData,
  type AvatarItemRarity,
  type UserAvatarData,
} from "./types"

export { useUserProgress } from "./use-progress"
export { useLog } from "./use-log"
export { useUserAvatar } from "./use-avatar"
export { useGamificationSeed } from "./use-seed"
export { useReputation, useReputationMap, trustLabel, type ReputationStats } from "./use-reputation"

export { MACHER_DEFAULT_SKILLS, MACHER_DEFAULT_AVATAR_ITEMS } from "./macher-skills"

export { ARCHETYPES, getArchetype, type Archetype, type ArchetypeId } from "./archetypes"
