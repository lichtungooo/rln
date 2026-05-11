import type { SkillData, AvatarItemData } from "../types"

/**
 * Space-Manifest — die Constellation-Schicht eines Spaces (Phase F7, 11.05.2026).
 *
 * Inspiration: Skyrim Custom Skills Framework. RLN traegt das Framework
 * (8 Bereiche, Universal-Skills, XP-System). Jeder Space ist ein
 * "Constellation-Mod", der seine eigene Skill-Schicht mitbringt.
 *
 * Ein Manifest enthaelt:
 *   - die Skills, die dieser Space ueber die Universal-Schicht hinaus traegt
 *   - die Avatar-Items, die als Belohnung verdienbar sind
 *   - Metadaten (Owner, Version)
 *
 * Heute: Manifest-Module sind Code-Konstanten (TypeScript). Spaeter
 * werden sie zu signierten WoT-Items, sodass Communities ihre eigenen
 * Manifeste pflegen koennen, ohne den Core anzufassen.
 *
 * Recherche: skilltree-vertiefung/03-space-special-skills.md
 */

export interface SpaceManifest {
  /** Space-Slug — Match-Schluessel fuer getManifestForSpace */
  slug: string
  /** Anzeigename des Spaces */
  name: string
  /** Manifest-Version (semver-aehnlich) */
  version: string
  /** Wer pflegt dieses Manifest (DID oder Klar-Name, spaeter signiert) */
  owner: string
  /** Skills, die dieser Space mitbringt (Universal-Skills kommen extra) */
  skills: Array<SkillData & { id: string }>
  /** Avatar-Items, die in diesem Space verdienbar sind */
  avatarItems: Array<AvatarItemData & { id: string }>
  /** Optionale kurze Beschreibung, was dieses Manifest traegt */
  description?: string
}
