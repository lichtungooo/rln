import { useCallback, useMemo, useState } from "react"
import {
  useItems,
  useCreateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import { MACHER_DEFAULT_SKILLS, MACHER_DEFAULT_AVATAR_ITEMS } from "./macher-skills"
import { GAMIFICATION_ITEM_TYPES } from "./types"

/**
 * Seed der Default-Skills + Avatar-Items fuer einen Space.
 *
 * Idempotent: prueft ob ein Skill mit demselben Namen schon existiert,
 * legt nur die fehlenden an. Kann jederzeit erneut aufgerufen werden.
 *
 * Aktuell ist nur das Macher-Set hinterlegt. Spaeter pro Space-Slug
 * unterschiedliche Default-Sets (Lichtung anders als Macher).
 */
export function useGamificationSeed() {
  const { data: existingSkills } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { data: existingAvatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.avatarItem })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const [busy, setBusy] = useState(false)

  const status = useMemo(() => {
    const existingSkillNames = new Set(
      existingSkills.map((it) => (it.data as { name: string }).name)
    )
    const existingItemNames = new Set(
      existingAvatarItems.map((it) => (it.data as { name: string }).name)
    )
    const skillsTodo = MACHER_DEFAULT_SKILLS.filter((s) => !existingSkillNames.has(s.name))
    const itemsTodo = MACHER_DEFAULT_AVATAR_ITEMS.filter((i) => !existingItemNames.has(i.name))
    return {
      skillsExisting: existingSkills.length,
      skillsTodo: skillsTodo.length,
      itemsExisting: existingAvatarItems.length,
      itemsTodo: itemsTodo.length,
      complete: skillsTodo.length === 0 && itemsTodo.length === 0,
    }
  }, [existingSkills, existingAvatarItems])

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

      for (const skill of MACHER_DEFAULT_SKILLS) {
        if (existingSkillNames.has(skill.name)) continue
        const { id: _, ...skillData } = skill
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.skill,
          createdBy: currentUser.id,
          data: skillData,
        })
      }
      for (const item of MACHER_DEFAULT_AVATAR_ITEMS) {
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
  }, [currentUser?.id, existingSkills, existingAvatarItems, createItem])

  return { seed, busy, status }
}
