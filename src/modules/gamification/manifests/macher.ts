import { MACHER_DEFAULT_SKILLS, MACHER_DEFAULT_AVATAR_ITEMS } from "../macher-skills"
import type { SpaceManifest } from "./types"

/**
 * Macher-Space-Manifest (Phase F7, 11.05.2026).
 *
 * Erstes konkretes Constellation-Manifest. Bringt die Macher-spezifischen
 * Skills (Holz, Metall, Schweissen, ...) plus Avatar-Items als Belohnungen.
 *
 * Die Skills selber leben weiterhin in `macher-skills.ts` — das Manifest
 * ist die offizielle Verpackung, die der Seed-Mechanismus nutzt.
 */
export const macherManifest: SpaceManifest = {
  slug: "macher",
  name: "Macher",
  version: "1.0.0",
  owner: "lichtungooo",
  description:
    "Handwerk, DIY, Werkstatt — von Holz bis 3D-Druck. Macher-Map als erster Showroom.",
  skills: MACHER_DEFAULT_SKILLS,
  avatarItems: MACHER_DEFAULT_AVATAR_ITEMS,
}
