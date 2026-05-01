import { useCallback, useMemo } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"

/**
 * Verifikations-Anfragen fuer Quests (Phase B2.2 — Peer / B2.3 — Attestation).
 *
 * Workflow:
 *   1. Spieler erstellt einen Request (`type: "quest-verification-request"`)
 *      mit { questId, requesterId, verifierId, status: "pending" }.
 *   2. Verifizierer sieht den Request in seiner Inbox + drueckt approve/reject.
 *      Approve setzt status=approved und schreibt das Quest-Completion mit
 *      `forUserId = requesterId` und `verifiedBy = verifierId`.
 *   3. Beim Lesen erkennt useQuests Peer-Completions ueber `forUserId` und
 *      verteilt die XP (das passiert hier — der Verifizierer schreibt im
 *      Auftrag des Requesters).
 *
 * Hinweis: Im All-WoT-Stack setzt der Connector `createdBy` automatisch auf
 * den Verifizierer. Deshalb braucht das Completion-Item das zusaetzliche
 * `forUserId`-Feld, damit der Requester seine Quest als erledigt sieht.
 */

export const VERIFICATION_REQUEST_TYPE = "quest-verification-request"

export type VerificationStatus = "pending" | "approved" | "rejected"

export interface VerificationRequestData {
  questId: string
  requesterId: string
  verifierId: string
  status: VerificationStatus
  /** "peer" | "attestation" — der Verifikationsmodus, fuer den die Anfrage gilt. */
  mode: "peer" | "attestation"
  comment?: string
  respondedAt?: string
  respondedBy?: string
}

export function useVerificationRequests() {
  const { data: requests } = useItems({ type: VERIFICATION_REQUEST_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()

  /** Anfragen die an mich gerichtet sind und noch offen */
  const incoming = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return requests.filter((r) => {
      const d = r.data as VerificationRequestData
      return d.verifierId === currentUser.id && d.status === "pending"
    })
  }, [requests, currentUser?.id])

  /** Meine eigenen Anfragen (egal welcher Status) */
  const outgoing = useMemo<Item[]>(() => {
    if (!currentUser?.id) return []
    return requests.filter((r) => {
      const d = r.data as VerificationRequestData
      return d.requesterId === currentUser.id
    })
  }, [requests, currentUser?.id])

  /** Eine bestehende offene Anfrage fuer diese Quest finden (mein outgoing) */
  const findOpenRequestForQuest = useCallback(
    (questId: string): Item | null => {
      if (!currentUser?.id) return null
      return (
        requests.find((r) => {
          const d = r.data as VerificationRequestData
          return (
            d.requesterId === currentUser.id &&
            d.questId === questId &&
            d.status === "pending"
          )
        }) ?? null
      )
    },
    [requests, currentUser?.id]
  )

  /** Letzten Request fuer diese Quest finden (mein outgoing, beliebiger Status) */
  const findLatestRequestForQuest = useCallback(
    (questId: string): Item | null => {
      if (!currentUser?.id) return null
      const list = requests
        .filter((r) => {
          const d = r.data as VerificationRequestData
          return d.requesterId === currentUser.id && d.questId === questId
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return list[0] ?? null
    },
    [requests, currentUser?.id]
  )

  /** Erzeugt eine neue Anfrage. */
  const requestVerification = useCallback(
    async (params: {
      questId: string
      verifierId: string
      mode: "peer" | "attestation"
      comment?: string
    }) => {
      if (!currentUser?.id) throw new Error("Nicht eingeloggt")
      const data: VerificationRequestData = {
        questId: params.questId,
        requesterId: currentUser.id,
        verifierId: params.verifierId,
        status: "pending",
        mode: params.mode,
        comment: params.comment,
      }
      await createItem({
        type: VERIFICATION_REQUEST_TYPE,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
    },
    [currentUser?.id, createItem]
  )

  /** Genehmigt eine Anfrage (Verifizierer-Aktion). */
  const approve = useCallback(
    async (requestItem: Item, comment?: string) => {
      if (!currentUser?.id) throw new Error("Nicht eingeloggt")
      const data = requestItem.data as VerificationRequestData
      const next: VerificationRequestData = {
        ...data,
        status: "approved",
        respondedAt: new Date().toISOString(),
        respondedBy: currentUser.id,
        comment,
      }
      await updateItem(requestItem.id, { data: next as unknown as Record<string, unknown> })
    },
    [currentUser?.id, updateItem]
  )

  /** Lehnt eine Anfrage ab. */
  const reject = useCallback(
    async (requestItem: Item, comment?: string) => {
      if (!currentUser?.id) throw new Error("Nicht eingeloggt")
      const data = requestItem.data as VerificationRequestData
      const next: VerificationRequestData = {
        ...data,
        status: "rejected",
        respondedAt: new Date().toISOString(),
        respondedBy: currentUser.id,
        comment,
      }
      await updateItem(requestItem.id, { data: next as unknown as Record<string, unknown> })
    },
    [currentUser?.id, updateItem]
  )

  return {
    incoming,
    outgoing,
    findOpenRequestForQuest,
    findLatestRequestForQuest,
    requestVerification,
    approve,
    reject,
  }
}
