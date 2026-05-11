/**
 * Manifest-Registry (Phase F7, 11.05.2026).
 *
 * Zentrale Stelle, an der alle Space-Manifeste registriert sind.
 * Wer einen neuen Space anlegt, fuegt sein Manifest hier ein —
 * der Skill-Tree, der Avatar, der Seed-Mechanismus laden es dann
 * automatisch ueber den Space-Slug.
 *
 * Spaeter (F8+) werden Manifeste signiert und ueber WoT verteilt.
 * Heute ist die Registry eine Code-Konstante.
 */

import type { SpaceManifest } from "./types"
import { macherManifest } from "./macher"
import { lichtungManifest } from "./lichtung"

export type { SpaceManifest } from "./types"
export { macherManifest } from "./macher"
export { lichtungManifest } from "./lichtung"

/**
 * Alle bekannten Manifeste.
 */
export const SPACE_MANIFESTS: SpaceManifest[] = [macherManifest, lichtungManifest]

/**
 * Manifest fuer einen Space holen. Sucht nach `slug` — wenn nichts
 * gefunden, liefert undefined (Space hat keine eigene Schicht, nur
 * die Universal-Skills sind da).
 */
export function getManifestForSpace(slug: string | null | undefined): SpaceManifest | undefined {
  if (!slug) return undefined
  return SPACE_MANIFESTS.find((m) => m.slug === slug)
}
