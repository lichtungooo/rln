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
  SYNERGIES,
  xpToLevel,
  xpForLevel,
  progressInLevel,
  type TreeBereich,
  type TreeBereichId,
  type Synergie,
} from "./tree"

export {
  GAMIFICATION_ITEM_TYPES,
  PAST_EXPERIENCE_XP,
  type SkillData,
  type SkillPrerequisites,
  type UserProgressData,
  type LogEntryData,
  type LogEntryType,
  type LogEntryVisibility,
  type QuestGamificationFields,
  type AvatarItemData,
  type AvatarItemRarity,
  type UserAvatarData,
  type PastExperienceData,
  type PastExperienceMastery,
  type ViaResultData,
  type CircleData,
  type ShareProfileData,
} from "./types"

export { DEFAULT_CIRCLES, DEFAULT_SHARE_PROFILES } from "./sharing-defaults"
export { useCircles } from "./use-circles"
export { useShareProfiles } from "./use-share-profiles"
export { useSkillVisibility } from "./use-skill-visibility"
export {
  resolveSkillVisibility,
  buildViewerContext,
  type SkillVisibilityLevel,
  type VisibilityDecision,
  type ViewerContext,
} from "./visibility"

export {
  isSkillUnlocked,
  makeSkillNameResolver,
  type UnlockCheck,
} from "./prerequisites"

export { useUserProgress } from "./use-progress"
export { useLog } from "./use-log"
export { useUserAvatar } from "./use-avatar"
export { useGamificationSeed } from "./use-seed"
export { useReputation, useReputationMap, trustLabel, type ReputationStats } from "./use-reputation"
export { usePastExperiences } from "./use-past-experiences"

export { MACHER_DEFAULT_SKILLS, MACHER_DEFAULT_AVATAR_ITEMS } from "./macher-skills"

export {
  SPACE_MANIFESTS,
  getManifestForSpace,
  macherManifest,
  lichtungManifest,
  type SpaceManifest,
} from "./manifests"

export {
  UNIVERSAL_SKILLS,
  UNIVERSAL_SKILL_BY_ID,
  UNIVERSAL_SKILL_PREFIX,
  isUniversalSkillId,
} from "./universal-skills"

export { ARCHETYPES, getArchetype, type Archetype, type ArchetypeId } from "./archetypes"

export { StatsBar } from "./StatsBar"

// ============================================================
// Neues Skill-System (Stand 14.05.2026) — parallel zum alten
// Konzept-Quelle: rln/Konzepte/SKILL-TREE-NEUBAU.md
// ============================================================

export {
  POTENZIALFELDER,
  POTENZIALFELD_BY_ID,
  HANDWERKS_BEREICHE,
  HANDWERKS_BEREICH_BY_ID,
  BILDUNGS_BEREICHE,
  BILDUNGS_BEREICH_BY_ID,
  TIER_STUFEN,
  TIER_BY_ID,
  tierStufe,
  DREI_HAENDE,
  DREI_HAND_BY_ID,
  INNERE_LINIEN,
  type PotenzialfeldId,
  type Potenzialfeld,
  type HandwerksBereichId,
  type HandwerksBereich,
  type BildungsBereichId,
  type BildungsBereich,
  type Tier,
  type TierInfo,
  type DreiHandId,
  type DreiHand,
  type InnereLinieId,
  type InnereLinie,
  type Altersfreigabe,
  type KantenTyp,
  type AttestationModus,
  type ExternalAnchor,
  type SkillEdge,
  type SkillV2,
  type SkillKette,
  type AttestationRef,
} from "./skill-system"

// Pilot-Seed: Holz-Werkstatt (Stand 14.05.2026)
export {
  HOLZ_SKILLS,
  HOLZ_SKILL_BY_ID,
  HOLZ_HAUPTKETTE,
  HOLZ_KETTEN,
} from "./seed-holz"
