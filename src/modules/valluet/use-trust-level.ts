/**
 * useTrustLevel — Trust-Distanz zu einem Voucher-Schoepfer.
 *
 * Liest Antons WoT-Kontaktliste und prueft, ob der Schoepfer
 *   - ich selbst bin
 *   - direkt verifiziert (mutual via QR-Begegnung)
 *   - im Kontakt-Netz (Kontakt, aber noch keine gegenseitige Verifikation)
 *   - unbekannt (nicht im Netz)
 *
 * Erweiterungen kommen spaeter — Pfad-Berechnung im Trust-Graph
 * (Distanz 2+) braucht Antons noch nicht oeffentliche API.
 */

import { useMemo } from 'react'
import { useContacts, useCurrentUser } from '@real-life-stack/toolkit'

export type TrustLevel = 'self' | 'verified' | 'contact' | 'pending' | 'unknown'

export interface TrustResult {
  level: TrustLevel
  contactName?: string
  verifiedAt?: string
}

/**
 * Trust-Stufe zum Voucher-Schoepfer.
 *
 * @param creatorDid — WoT-DID des Schoepfers (aus dem Voucher).
 * @param creatorPublicKey — Valluet-Public-Key (Fallback-Match).
 */
export function useTrustLevel(
  creatorDid: string | undefined,
  creatorPublicKey?: string,
): TrustResult {
  const { data: currentUser } = useCurrentUser()
  const { contacts } = useContacts()

  return useMemo(() => {
    if (!creatorDid && !creatorPublicKey) return { level: 'unknown' }

    // Selbst-Schoepfung
    if (creatorDid && currentUser?.id === creatorDid) {
      return { level: 'self' }
    }

    // Im Kontakt-Netz suchen — DID-Match oder Public-Key-Match
    const match = contacts?.find((c) => {
      if (creatorDid && c.id === creatorDid) return true
      if (creatorPublicKey && c.publicKey && c.publicKey === creatorPublicKey)
        return true
      return false
    })

    if (!match) return { level: 'unknown' }

    if (match.status === 'pending') {
      return { level: 'pending', contactName: match.name }
    }

    if (match.verifiedAt) {
      return {
        level: 'verified',
        contactName: match.name,
        verifiedAt: match.verifiedAt,
      }
    }

    return { level: 'contact', contactName: match.name }
  }, [creatorDid, creatorPublicKey, currentUser, contacts])
}

/**
 * Anzeige-Beschreibung der Trust-Stufe.
 */
export function describeTrustLevel(result: TrustResult): {
  label: string
  beschreibung: string
  color: string
  bg: string
} {
  switch (result.level) {
    case 'self':
      return {
        label: 'Du selbst',
        beschreibung: 'Diesen Wert hast du selbst geschoepft.',
        color: '#6366f1',
        bg: 'rgba(99, 102, 241, 0.12)',
      }
    case 'verified':
      return {
        label: result.contactName
          ? `${result.contactName} — verifiziert`
          : 'Verifizierter Kontakt',
        beschreibung:
          'Direkt verifiziert durch eine echte Begegnung. Hoechstes Vertrauen.',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
      }
    case 'contact':
      return {
        label: result.contactName
          ? `${result.contactName} — im Kontakt-Netz`
          : 'Im Kontakt-Netz',
        beschreibung: 'Kontakt aus deinem Netz, ohne mutual Verifikation.',
        color: '#0ea5e9',
        bg: 'rgba(14, 165, 233, 0.12)',
      }
    case 'pending':
      return {
        label: 'Anstehend',
        beschreibung: 'Kontakt wartet noch auf Aktivierung.',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
      }
    case 'unknown':
    default:
      return {
        label: 'Ausserhalb deines Netzes',
        beschreibung:
          'Schoepfer ist (noch) kein Kontakt von dir. Vertrauen waechst durch Begegnung.',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
      }
  }
}
