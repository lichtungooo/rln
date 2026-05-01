import { useMemo } from "react"
import { useItems, useCurrentUser } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { GAMIFICATION_ITEM_TYPES, type LogEntryData } from "./types"

/**
 * Reputation pro User — aus dem Log abgeleitet.
 *
 * Reputation ist NICHT XP. XP misst, was du selbst getan hast. Reputation
 * misst, was andere ueber dich bestaetigt haben — verdiente Anerkennung.
 *
 * Datenquelle: log-entries vom Typ "trust_verified" mit Sichtbarkeit
 * "network" oder hoeher. Ein solcher Eintrag entsteht z.B. wenn ein User
 * eine Quest fuer einen anderen attestiert (siehe Phase B2.3).
 *
 * Score-Modell (einfach gehalten):
 *   received  — wie oft wurde ich attestiert
 *   given     — wie oft habe ich andere attestiert
 *   trustScore = received * 2 + given  (geben zaehlt, aber empfangen mehr)
 *
 * Nicht: kryptografische Validierung. Das passiert spaeter ueber den
 * Web-of-Trust-Connector (signierte Items).
 */

export interface ReputationStats {
  /** Wie oft wurde dieser User attestiert? */
  received: number
  /** Wie oft hat dieser User andere attestiert? */
  given: number
  /** Vereinfachter Score zur UI-Anzeige */
  trustScore: number
  /** IDs derer, die diesen User attestiert haben (deduped) */
  attestors: string[]
  /** IDs derer, die dieser User attestiert hat (deduped) */
  attested: string[]
}

const EMPTY_STATS: ReputationStats = {
  received: 0,
  given: 0,
  trustScore: 0,
  attestors: [],
  attested: [],
}

/**
 * Reputation des aktuell eingeloggten Users (oder eines anderen, wenn userId
 * angegeben). Liefert Live-aggregierte Werte aus dem log-entry-Strom.
 */
export function useReputation(userId?: string | null): ReputationStats {
  const { data: logEntries } = useItems({ type: GAMIFICATION_ITEM_TYPES.logEntry })
  const { data: currentUser } = useCurrentUser()
  const targetId = userId ?? currentUser?.id ?? null

  return useMemo<ReputationStats>(() => {
    if (!targetId) return EMPTY_STATS

    const trustEntries = logEntries.filter((it) => {
      const d = it.data as LogEntryData
      if (d.type !== "trust_verified") return false
      const vis = d.visibility ?? "private"
      // Private Logs zaehlen nicht zur sichtbaren Reputation
      return vis !== "private"
    })

    const attestors = new Set<string>()
    const attested = new Set<string>()
    let received = 0
    let given = 0

    for (const entry of trustEntries) {
      const d = entry.data as LogEntryData
      const payload = d.payload as
        | { attestedUserId?: string; attestorId?: string }
        | undefined
      if (!payload) continue
      if (payload.attestedUserId === targetId) {
        received++
        if (payload.attestorId) attestors.add(payload.attestorId)
      }
      if (payload.attestorId === targetId) {
        given++
        if (payload.attestedUserId) attested.add(payload.attestedUserId)
      }
    }

    return {
      received,
      given,
      trustScore: received * 2 + given,
      attestors: Array.from(attestors),
      attested: Array.from(attested),
    }
  }, [logEntries, targetId])
}

/**
 * Reputation fuer mehrere User auf einmal — Performance-freundlich, weil nur
 * einmal die Log-Items gelesen werden.
 */
export function useReputationMap(userIds: string[]): Record<string, ReputationStats> {
  const { data: logEntries } = useItems({ type: GAMIFICATION_ITEM_TYPES.logEntry })

  return useMemo<Record<string, ReputationStats>>(() => {
    const map: Record<string, ReputationStats> = {}
    for (const id of userIds) {
      map[id] = { ...EMPTY_STATS, attestors: [], attested: [] }
    }

    const trustEntries = logEntries.filter((it) => {
      const d = it.data as LogEntryData
      if (d.type !== "trust_verified") return false
      const vis = d.visibility ?? "private"
      return vis !== "private"
    })

    for (const entry of trustEntries) {
      const d = entry.data as LogEntryData
      const payload = d.payload as
        | { attestedUserId?: string; attestorId?: string }
        | undefined
      if (!payload) continue
      if (payload.attestedUserId && map[payload.attestedUserId]) {
        const s = map[payload.attestedUserId]
        s.received++
        if (payload.attestorId) {
          if (!s.attestors.includes(payload.attestorId)) s.attestors.push(payload.attestorId)
        }
      }
      if (payload.attestorId && map[payload.attestorId]) {
        const s = map[payload.attestorId]
        s.given++
        if (payload.attestedUserId) {
          if (!s.attested.includes(payload.attestedUserId)) s.attested.push(payload.attestedUserId)
        }
      }
    }

    for (const id of userIds) {
      const s = map[id]
      s.trustScore = s.received * 2 + s.given
    }
    return map
  }, [logEntries, userIds])
}

/**
 * UI-Helfer: gibt einen kurzen Trust-Label zurueck.
 *  - 0       — Neuling
 *  - 1-3     — Bekannter
 *  - 4-9     — Vertraut
 *  - 10-24   — Bewaehrt
 *  - 25+     — Saeule
 */
export function trustLabel(score: number): string {
  if (score === 0) return "Neuling"
  if (score < 4) return "Bekannter"
  if (score < 10) return "Vertraut"
  if (score < 25) return "Bewaehrt"
  return "Saeule"
}
