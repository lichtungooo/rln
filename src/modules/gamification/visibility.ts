import type { CircleData, ShareProfileData, SkillData, TreeBereichId } from "./types"

/**
 * Skill-Sichtbarkeit (Phase F9, 11.05.2026).
 *
 * Drei Schichten bestimmen, ob ein Skill fuer einen Schauenden sichtbar ist:
 *
 *   1. **Skill-Override** (haerteste Schicht):
 *      Per-Skill-Wert "public", "network", "circle", "private". Schlaegt
 *      alle Sicht-Profile aus F8. Ungesetzt = kein Override.
 *
 *   2. **Sicht-Profil** (mittlere Schicht):
 *      Aus F8 — das Profil, dessen targetCircleIds einen Kreis des
 *      Schauenden enthaelt. Bestimmt, welche Bereiche grundsaetzlich
 *      sichtbar sind.
 *
 *   3. **Default** (unterste Schicht):
 *      Wenn weder Override noch passendes Profil greift, gilt eine
 *      Default-Sichtbarkeit. Anti-Konsum-Prinzip: privat by default.
 *
 * Recherche: skilltree-vertiefung/06-granulare-freigabe.md (Block I, J).
 */

export type SkillVisibilityLevel = "public" | "network" | "circle" | "private"

/**
 * Effektive Sichtbarkeits-Entscheidung mit Begruendung — fuer UI-Vorschau
 * gut lesbar.
 */
export interface VisibilityDecision {
  visible: boolean
  /** Warum diese Entscheidung? Quelle */
  reason: "skill-override" | "share-profile" | "default-public" | "default-private"
  /** Lesbare Begruendung */
  hint: string
}

/**
 * Wer ist der Schauende? Sammelt was die Resolver-Funktion braucht.
 */
export interface ViewerContext {
  /** DID des Schauenden */
  viewerDid: string
  /** Kreise des Profil-Besitzers, in denen der Schauende Mitglied ist */
  matchingCircleIds: string[]
  /** Sicht-Profile des Profil-Besitzers, die einen passenden Kreis treffen */
  matchingShareProfiles: Array<ShareProfileData>
}

/**
 * Berechnet den ViewerContext aus Kreisen und Sicht-Profilen.
 */
export function buildViewerContext(
  viewerDid: string,
  circles: Array<{ id: string; data: CircleData }>,
  shareProfiles: Array<{ data: ShareProfileData }>,
): ViewerContext {
  const matchingCircleIds = circles
    .filter((c) => c.data.memberIds.includes(viewerDid))
    .map((c) => c.id)

  const matchingShareProfiles = shareProfiles
    .filter((p) => (p.data.targetCircleIds ?? []).some((tc) => matchingCircleIds.includes(tc)))
    .map((p) => p.data)

  return { viewerDid, matchingCircleIds, matchingShareProfiles }
}

/**
 * Default-Sichtbarkeit, wenn keine andere Schicht greift.
 * Anti-Konsum-Prinzip: privat by default, kein "ups, jetzt sehen alle".
 */
const DEFAULT_PUBLIC = false

/**
 * Entscheide, ob ein Skill fuer einen Schauenden sichtbar ist.
 *
 * @param skill            - Skill-Definition (fuer bereichId)
 * @param override         - Per-Skill-Sichtbarkeit (aus profile.skillVisibility)
 * @param viewer           - Schauenden-Kontext
 * @param isOwner          - Bin ich selber der Schauende? Dann immer sichtbar.
 */
export function resolveSkillVisibility(
  skill: SkillData,
  override: SkillVisibilityLevel | undefined,
  viewer: ViewerContext | null,
  isOwner: boolean,
): VisibilityDecision {
  // Owner sieht alles
  if (isOwner) {
    return {
      visible: true,
      reason: "skill-override",
      hint: "Du siehst dein eigenes Profil",
    }
  }

  // 1. Skill-Override
  if (override === "private") {
    return { visible: false, reason: "skill-override", hint: "Skill ist als privat markiert" }
  }
  if (override === "public") {
    return { visible: true, reason: "skill-override", hint: "Skill ist oeffentlich markiert" }
  }
  if (override === "network") {
    const inAnyCircle = viewer ? viewer.matchingCircleIds.length > 0 : false
    return {
      visible: inAnyCircle,
      reason: "skill-override",
      hint: inAnyCircle
        ? "Skill ist fuer dein Netzwerk sichtbar"
        : "Skill ist fuer Netzwerk markiert — du bist in keinem Kreis",
    }
  }
  if (override === "circle") {
    const inAnyCircle = viewer ? viewer.matchingCircleIds.length > 0 : false
    return {
      visible: inAnyCircle,
      reason: "skill-override",
      hint: inAnyCircle
        ? "Skill ist fuer deine Kreise sichtbar"
        : "Skill ist nur fuer Kreis-Mitglieder",
    }
  }

  // 2. Sicht-Profil (aus F8)
  if (viewer && viewer.matchingShareProfiles.length > 0) {
    const profile = viewer.matchingShareProfiles[0]
    const bereichSichtbar = profile.visibleBereiche.includes(skill.bereichId as TreeBereichId)
    if (bereichSichtbar) {
      const skillHiddenById = (profile.hiddenSkillIds ?? []).length > 0
      return {
        visible: !skillHiddenById,
        reason: "share-profile",
        hint: `Sichtbar durch Profil "${profile.name}"`,
      }
    }
    return {
      visible: false,
      reason: "share-profile",
      hint: `Bereich ${skill.bereichId} ist im Profil "${profile.name}" verborgen`,
    }
  }

  // 3. Default
  return {
    visible: DEFAULT_PUBLIC,
    reason: DEFAULT_PUBLIC ? "default-public" : "default-private",
    hint: DEFAULT_PUBLIC
      ? "Default: oeffentlich"
      : "Default: privat (kein Kreis trifft, kein Override gesetzt)",
  }
}
