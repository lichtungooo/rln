import { useCallback, useMemo, useState } from "react"
import {
  useItems,
  useCreateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import { GAMIFICATION_ITEM_TYPES } from "./types"
import { getManifestForSpace, type SpaceManifest } from "./manifests"

/**
 * Seed der Skills + Avatar-Items fuer einen Space — manifest-basiert
 * (Phase F7, 11.05.2026).
 *
 * Idempotent: prueft, ob ein Skill mit demselben Namen schon existiert,
 * legt nur die fehlenden an. Pro Space-Slug wird das passende Manifest
 * aus der Registry gezogen.
 *
 * Wenn fuer den Slug kein Manifest existiert, faellt der Mechanismus
 * auf das Macher-Manifest zurueck (Backward Compatibility — frueher
 * gab es nur die Macher-Skills).
 *
 * @param spaceSlug - aktiver Space-Slug aus group.data.slug, oder undefined
 */
export function useGamificationSeed(spaceSlug?: string | null) {
  const { data: existingSkills } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { data: existingAvatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.avatarItem })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const [busy, setBusy] = useState(false)

  /**
   * Manifest fuer den aktiven Space. Faellt auf Macher zurueck, wenn
   * fuer den Slug nichts registriert ist.
   */
  const manifest = useMemo<SpaceManifest>(() => {
    const found = getManifestForSpace(spaceSlug)
    if (found) return found
    // Fallback: Macher
    return getManifestForSpace("macher")!
  }, [spaceSlug])

  const status = useMemo(() => {
    const existingSkillNames = new Set(
      existingSkills.map((it) => (it.data as { name: string }).name)
    )
    const existingItemNames = new Set(
      existingAvatarItems.map((it) => (it.data as { name: string }).name)
    )
    const skillsTodo = manifest.skills.filter((s) => !existingSkillNames.has(s.name))
    const itemsTodo = manifest.avatarItems.filter((i) => !existingItemNames.has(i.name))
    return {
      manifestName: manifest.name,
      skillsExisting: existingSkills.length,
      skillsTodo: skillsTodo.length,
      itemsExisting: existingAvatarItems.length,
      itemsTodo: itemsTodo.length,
      complete: skillsTodo.length === 0 && itemsTodo.length === 0,
    }
  }, [existingSkills, existingAvatarItems, manifest])

  const seed = useCallback(async () => {
    if (!currentUser?.id) return
    setBusy(true)
    try {
      const existingSkillNames = new Set(
        existingSkills.map((it) => (it.data as { name: string }).name)
      )
      const existingItemNames = new Set(
        existingAvatarItems.map((it) => (it.data as { name: string }).name)
      )

      for (const skill of manifest.skills) {
        if (existingSkillNames.has(skill.name)) continue
        const { id: _, ...skillData } = skill
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.skill,
          createdBy: currentUser.id,
          data: skillData,
        })
      }
      for (const item of manifest.avatarItems) {
        if (existingItemNames.has(item.name)) continue
        const { id: _, ...itemData } = item
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.avatarItem,
          createdBy: currentUser.id,
          data: itemData,
        })
      }
    } finally {
      setBusy(false)
    }
  }, [currentUser?.id, existingSkills, existingAvatarItems, createItem, manifest])

  return { seed, busy, status, manifest }
}
