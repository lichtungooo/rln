/**
 * Hook fuer den eigenen Skill-Tier-Fortschritt im neuen Skill-System.
 *
 * Speicherung: Item vom Typ "skill-v2-progress", eines pro User
 * (identifiziert ueber createdBy === currentUser.id).
 *
 * Selbst-Eintrag der ersten zwei Tier-Stufen (gespuert, probiert) ist erlaubt.
 * Hoehere Stufen (kann, kann-lehren, meistert, gibt-weiter) brauchen
 * Attestationen — kommt in Phase 4 (Attestation-Flow).
 *
 * Stand 14.05.2026.
 */

import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
  useClaims,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { Tier } from "./skill-system"
import { TIER_BY_ID, tierStufe } from "./skill-system"
import {
  SKILL_ATTESTATION_TYPE,
  SKILL_CLAIM_TAG,
  tierFromClaimTags,
  type SkillAttestationData,
} from "./use-skill-attestation"

export const SKILL_V2_PROGRESS_TYPE = "skill-v2-progress"

export interface SkillV2ProgressData {
  /** Map von skillId zu erreichter Tier-Stufe. */
  skills: Record<string, Tier>
  updatedAt: string
}

const EMPTY: SkillV2ProgressData = {
  skills: {},
  updatedAt: new Date(0).toISOString(),
}

export function useSkillV2Progress() {
  const { data: items } = useItems({ type: SKILL_V2_PROGRESS_TYPE })
  const { data: attestations } = useItems({ type: SKILL_ATTESTATION_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { attestations: signedAttestations } = useClaims()

  const myItem = useMemo<Item | null>(() => {
    if (!currentUser?.id) return null
    return items.find((it) => it.createdBy === currentUser.id) ?? null
  }, [items, currentUser?.id])

  const data = useMemo<SkillV2ProgressData>(() => {
    if (!myItem) return EMPTY
    const d = myItem.data as Partial<SkillV2ProgressData>
    return {
      skills: d.skills ?? {},
      updatedAt: d.updatedAt ?? new Date(0).toISOString(),
    }
  }, [myItem])

  /** Attestationen, die fuer mich ausgestellt wurden — Tier 3+. */
  const attestedSkills = useMemo<Record<string, Tier>>(() => {
    if (!currentUser?.id) return {}
    const out: Record<string, Tier> = {}

    // Quelle 1: Spiegel-Items (UI-Inbox)
    for (const a of attestations) {
      const d = a.data as Partial<SkillAttestationData>
      if (d.learnerId !== currentUser.id) continue
      if (!d.skillId || !d.tier) continue
      const current = out[d.skillId]
      if (!current || tierStufe(d.tier) > tierStufe(current)) {
        out[d.skillId] = d.tier
      }
    }

    // Quelle 2: SignedClaims aus Antons WoT-Storage — kryptographisch
    // signierte Attestationen sind die echte Wahrheit.
    for (const claim of signedAttestations) {
      if (!claim.tags?.includes(SKILL_CLAIM_TAG)) continue
      if (claim.to !== currentUser.id) continue
      const tier = tierFromClaimTags(claim.tags)
      if (!tier) continue
      const skillId = claim.claim
      const current = out[skillId]
      if (!current || tierStufe(tier) > tierStufe(current)) {
        out[skillId] = tier
      }
    }
    return out
  }, [attestations, signedAttestations, currentUser?.id])

  /** Effektiver Stand: Maximum aus Selbst-Eintrag und Attestationen. */
  const effectiveSkills = useMemo<Record<string, Tier>>(() => {
    const out: Record<string, Tier> = { ...data.skills }
    for (const [skillId, tier] of Object.entries(attestedSkills)) {
      const current = out[skillId]
      if (!current || tierStufe(tier) > tierStufe(current)) {
        out[skillId] = tier
      }
    }
    return out
  }, [data.skills, attestedSkills])

  const getTier = useCallback(
    (skillId: string): Tier | null => effectiveSkills[skillId] ?? null,
    [effectiveSkills]
  )

  const hasReached = useCallback(
    (skillId: string, minimum: Tier): boolean => {
      const current = effectiveSkills[skillId]
      if (!current) return false
      return tierStufe(current) >= tierStufe(minimum)
    },
    [effectiveSkills]
  )

  const setTier = useCallback(
    async (skillId: string, tier: Tier) => {
      if (!currentUser?.id) {
        throw new Error("Bitte erst anmelden, um den eigenen Fortschritt zu tragen.")
      }
      // Selbst-Eintrag nur fuer Tier 1-2 (Bloom: gespuert, probiert)
      const stufe = tierStufe(tier)
      if (stufe > 2) {
        throw new Error(
          `Tier "${TIER_BY_ID[tier].name}" braucht Attestation — Selbst-Eintrag waechst bis "probiert".`
        )
      }

      const nextSkills = { ...data.skills, [skillId]: tier }
      const nextData: SkillV2ProgressData = {
        skills: nextSkills,
        updatedAt: new Date().toISOString(),
      }

      if (myItem) {
        await updateItem(myItem.id, { data: nextData })
      } else {
        await createItem({
          type: SKILL_V2_PROGRESS_TYPE,
          createdBy: currentUser.id,
          data: nextData,
        })
      }
    },
    [currentUser?.id, data.skills, myItem, createItem, updateItem]
  )

  const clearTier = useCallback(
    async (skillId: string) => {
      if (!myItem) return
      const nextSkills = { ...data.skills }
      delete nextSkills[skillId]
      await updateItem(myItem.id, {
        data: {
          skills: nextSkills,
          updatedAt: new Date().toISOString(),
        },
      })
    },
    [myItem, data.skills, updateItem]
  )

  return {
    /** Selbst-Eintrag-Daten. */
    progress: data,
    /** Tier-Stufen aus Attestationen (Tier 3+). */
    attestedSkills,
    /** Effektiver Stand: Maximum aus Selbst und Attestation. Wird in UI genutzt. */
    effectiveSkills,
    getTier,
    hasReached,
    setTier,
    clearTier,
    /** Anzahl der Skills im effektiven Stand. */
    count: Object.keys(effectiveSkills).length,
  }
}
