/**
 * Hook fuer Skill-Attestationen — Anfragen an Mentoren, Approve/Reject.
 *
 * Datenmodell:
 *   - skill-attestation-request: Anfrage von Lerner an Mentor (oder offen)
 *   - skill-attestation: bestaetigte Anerkennung (durch Mentor signiert)
 *
 * Selbst-Eintrag ist nur fuer Tier 1-2 (gespuert, probiert) erlaubt.
 * Hoehere Tiers (kann, kann-lehren, meistert, gibt-weiter) brauchen
 * Attestation durch eine andere Person mit gleichem oder hoeherem Tier.
 *
 * Hier in Phase 4b: einfache UI-Ebene ohne kryptographische Signatur.
 * Voll-Signatur ueber Antons SignedClaims-Capability kommt in spaeterer Phase.
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

/** Tag-Prefix fuer Skill-Tier in SignedClaims. */
export const SKILL_CLAIM_TAG = "skill-attestation"
export const SKILL_TIER_TAG_PREFIX = "tier:"

/** Baut Tag-Array fuer einen Skill-Claim. */
function buildSkillClaimTags(tier: Tier): string[] {
  return [SKILL_CLAIM_TAG, `${SKILL_TIER_TAG_PREFIX}${tier}`]
}

/** Liest Tier aus Claim-Tags. */
export function tierFromClaimTags(tags?: string[]): Tier | null {
  if (!tags) return null
  const tierTag = tags.find((t) => t.startsWith(SKILL_TIER_TAG_PREFIX))
  if (!tierTag) return null
  const tier = tierTag.slice(SKILL_TIER_TAG_PREFIX.length) as Tier
  return tier
}

export const SKILL_ATTESTATION_REQUEST_TYPE = "skill-attestation-request"
export const SKILL_ATTESTATION_TYPE = "skill-attestation"

export type AttestationStatus = "pending" | "approved" | "rejected" | "withdrawn"

export interface SkillAttestationRequestData {
  skillId: string
  /** Optional: spezifischer Mentor. Wenn leer: offen fuer alle Mentoren. */
  targetMentorId?: string
  requestedTier: Tier
  status: AttestationStatus
  /** Wer hat bestaetigt (bei approved). */
  attesterId?: string
  attestedAt?: string
  /** Optional: Begruendung oder Hinweis vom Lerner. */
  notes?: string
  createdAt: string
}

export interface SkillAttestationData {
  skillId: string
  learnerId: string
  attesterId: string
  tier: Tier
  attestedAt: string
  /** Bezug zum Request, falls vorhanden. */
  requestId?: string
  /** Optional: Werk-Beleg URL oder Beschreibung. */
  werkBeleg?: string
  /** Optional: Notiz vom Attester. */
  notiz?: string
}

export function useSkillAttestations() {
  const { data: requests } = useItems({ type: SKILL_ATTESTATION_REQUEST_TYPE })
  const { data: attestations } = useItems({ type: SKILL_ATTESTATION_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { supported: claimsSupported, createClaim } = useClaims()

  /** Anfragen, die ICH gestellt habe. */
  const myRequests = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return requests.filter((r) => r.createdBy === currentUser.id)
  }, [requests, currentUser?.id])

  /** Anfragen, die an MICH gerichtet sind oder offen (kein Target). */
  const incomingRequests = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return requests.filter((r) => {
      if (r.createdBy === currentUser.id) return false
      const data = r.data as Partial<SkillAttestationRequestData>
      if (data.status !== "pending") return false
      const target = data.targetMentorId
      // Anfrage an mich oder offene Anfrage
      return !target || target === currentUser.id
    })
  }, [requests, currentUser?.id])

  /** Attestationen, die ich erhalten habe. */
  const myAttestations = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return attestations.filter((a) => {
      const d = a.data as Partial<SkillAttestationData>
      return d.learnerId === currentUser.id
    })
  }, [attestations, currentUser?.id])

  /** Attestationen, die ich ausgesprochen habe. */
  const myGivenAttestations = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return attestations.filter((a) => {
      const d = a.data as Partial<SkillAttestationData>
      return d.attesterId === currentUser.id
    })
  }, [attestations, currentUser?.id])

  /** Neue Anfrage stellen. */
  const requestAttestation = useCallback(
    async (skillId: string, requestedTier: Tier, options?: { targetMentorId?: string; notes?: string }) => {
      if (!currentUser?.id) {
        throw new Error("Bitte erst anmelden, um eine Bestaetigung anzufragen.")
      }
      const data: SkillAttestationRequestData = {
        skillId,
        requestedTier,
        status: "pending",
        targetMentorId: options?.targetMentorId,
        notes: options?.notes,
        createdAt: new Date().toISOString(),
      }
      await createItem({
        type: SKILL_ATTESTATION_REQUEST_TYPE,
        createdBy: currentUser.id,
        data,
      })
    },
    [currentUser?.id, createItem]
  )

  /** Anfrage zuruecknehmen (vom Lerner). */
  const withdrawRequest = useCallback(
    async (requestId: string) => {
      const req = requests.find((r) => r.id === requestId)
      if (!req) return
      const data = req.data as SkillAttestationRequestData
      await updateItem(requestId, {
        data: { ...data, status: "withdrawn" } satisfies SkillAttestationRequestData,
      })
    },
    [requests, updateItem]
  )

  /** Anfrage bestaetigen (vom Mentor). Erstellt Attestation + setzt Request approved. */
  const approveRequest = useCallback(
    async (requestId: string, options?: { werkBeleg?: string; notiz?: string }) => {
      if (!currentUser?.id) {
        throw new Error("Bitte erst anmelden, um eine Bestaetigung auszusprechen.")
      }
      const req = requests.find((r) => r.id === requestId)
      if (!req) throw new Error("Anfrage nicht gefunden.")
      const reqData = req.data as SkillAttestationRequestData
      const now = new Date().toISOString()

      // Plus: SignedClaim via Antons WoT-Storage anlegen — kryptographisch
      // signiert, automatisch zum Lerner synced. Das ist der eigentliche
      // Vertrauens-Anker. Item dient nur als Inbox-Spiegel.
      if (claimsSupported) {
        try {
          await createClaim(
            req.createdBy,
            reqData.skillId,
            buildSkillClaimTags(reqData.requestedTier)
          )
        } catch (e) {
          // Signed-Claim ist die primaere Quelle — wenn das scheitert,
          // ist die Attestation nicht echt. Werfen, damit der Anwender
          // weiss, dass nichts gespeichert wurde.
          throw new Error(
            `Bestaetigung konnte nicht kryptographisch signiert werden: ${e instanceof Error ? e.message : String(e)}`
          )
        }
      }

      // Attestation-Item anlegen (Spiegel fuer Inbox-UI)
      const attestationData: SkillAttestationData = {
        skillId: reqData.skillId,
        learnerId: req.createdBy,
        attesterId: currentUser.id,
        tier: reqData.requestedTier,
        attestedAt: now,
        requestId: req.id,
        werkBeleg: options?.werkBeleg,
        notiz: options?.notiz,
      }
      await createItem({
        type: SKILL_ATTESTATION_TYPE,
        createdBy: currentUser.id,
        data: attestationData,
      })

      // Request als approved markieren
      await updateItem(requestId, {
        data: {
          ...reqData,
          status: "approved",
          attesterId: currentUser.id,
          attestedAt: now,
        } satisfies SkillAttestationRequestData,
      })
    },
    [currentUser?.id, requests, createItem, updateItem]
  )

  /** Anfrage ablehnen. */
  const rejectRequest = useCallback(
    async (requestId: string, notes?: string) => {
      const req = requests.find((r) => r.id === requestId)
      if (!req) return
      const data = req.data as SkillAttestationRequestData
      await updateItem(requestId, {
        data: { ...data, status: "rejected", notes: notes ?? data.notes } satisfies SkillAttestationRequestData,
      })
    },
    [requests, updateItem]
  )

  return {
    myRequests,
    incomingRequests,
    myAttestations,
    myGivenAttestations,
    requestAttestation,
    withdrawRequest,
    approveRequest,
    rejectRequest,
  }
}
