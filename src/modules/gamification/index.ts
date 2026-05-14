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

// Seed-Daten Handwerks-Bereiche (Stand 14.05.2026)
export {
  HOLZ_SKILLS,
  HOLZ_SKILL_BY_ID,
  HOLZ_HAUPTKETTE,
  HOLZ_KETTEN,
} from "./seed-holz"
export { METALL_SKILLS, METALL_HAUPTKETTE, METALL_KETTEN } from "./seed-metall"
export { GARTEN_SKILLS, GARTEN_HAUPTKETTE, GARTEN_KETTEN } from "./seed-garten"
export { ELEKTRONIK_SKILLS, ELEKTRONIK_HAUPTKETTE, ELEKTRONIK_KETTEN } from "./seed-elektronik"
export { BAU_SKILLS, BAU_HAUPTKETTE, BAU_KETTEN } from "./seed-bau"
export { REPARIEREN_SKILLS, REPARIEREN_HUB_KETTE, REPARIEREN_KETTEN } from "./seed-reparieren"

// Seed-Daten Bildungs-Bereiche
export { MATHEMATIK_SKILLS, MATHEMATIK_HAUPTKETTE, MATHEMATIK_KETTEN } from "./seed-mathematik"
export { SPORT_SKILLS, SPORT_HAUPTKETTE, SPORT_KETTEN } from "./seed-sport"
export { SPRACHE_SKILLS, SPRACHE_HAUPTKETTE, SPRACHE_KETTEN } from "./seed-sprache"
export {
  NATURWISSENSCHAFTEN_SKILLS,
  NATURWISSENSCHAFTEN_HUB_KETTE,
  NATURWISSENSCHAFTEN_KETTEN,
} from "./seed-naturwissenschaften"

// Weitere Bildungs-Bereiche
export { KUNST_SKILLS, KUNST_HAUPTKETTE, KUNST_KETTEN } from "./seed-kunst"
export { MUSIK_SKILLS, MUSIK_HAUPTKETTE, MUSIK_KETTEN } from "./seed-musik"
export {
  HAUSWIRTSCHAFT_SKILLS,
  HAUSWIRTSCHAFT_HAUPTKETTE,
  HAUSWIRTSCHAFT_KETTEN,
} from "./seed-hauswirtschaft"
export {
  LERNEN_LERNEN_SKILLS,
  LERNEN_LERNEN_HAUPTKETTE,
  LERNEN_LERNEN_KETTEN,
} from "./seed-lernen-lernen"
export {
  FREMDSPRACHEN_SKILLS,
  FREMDSPRACHEN_HAUPTKETTE,
  FREMDSPRACHEN_KETTEN,
} from "./seed-fremdsprachen"
export {
  GESELLSCHAFT_SKILLS,
  GESELLSCHAFT_HAUPTKETTE,
  GESELLSCHAFT_KETTEN,
} from "./seed-gesellschaft"
export {
  RELIGION_ETHIK_SKILLS,
  RELIGION_ETHIK_HAUPTKETTE,
  RELIGION_ETHIK_KETTEN,
} from "./seed-religion-ethik"
export {
  BERUFSORIENTIERUNG_SKILLS,
  BERUFSORIENTIERUNG_HAUPTKETTE,
  BERUFSORIENTIERUNG_KETTEN,
} from "./seed-berufsorientierung"

// Querschnitt: Drei Haende (Wurzel-Skills, Sicherheits-Lizenz)
export {
  VERMESSER_SKILLS,
  SICHERHEIT_SKILLS,
  WERKSTATT_SKILLS,
  DREI_HAENDE_SKILLS,
  HAND_VERMESSER,
  HAND_SICHERHEIT,
  HAND_WERKSTATT,
  DREI_HAENDE_FULL,
} from "./seed-drei-haende"

// Querschnitt: Mentoren-Achse (20 Skills, vier Schwellen)
export {
  MENTOR_GRUNDLAGEN,
  MENTOR_BEGLEITUNG,
  MENTOR_VERTIEFUNG,
  MENTOR_MEISTERSCHAFT,
  MENTOREN_SKILLS,
  MENTOR_SCHWELLEN,
  type MentorSchwelle,
} from "./seed-mentoren"
