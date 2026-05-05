/**
 * Valluet — Datenmodell.
 *
 * Voucher (Item-Typ "voucher"): ein selbst-geschoepfter Wert.
 *   currency:    Wertform — z.B. "dank", "werkstatt-coin"
 *   amount:      Anzahl
 *   note:        Notiz des Schoepfers
 *   validFrom:   ISO-Zeitstempel der Schoepfung
 *   validUntil:  ISO-Zeitstempel des Verfalls
 *   status:      "neu" | "ausgegeben" | "empfangen"
 *
 * Trust-Anker: keine Buergen-Multi-Sig.
 * Vertrauen kommt aus dem Web of Trust — Begegnungen, QR-Scans, Trust-Distanz.
 */

export interface VoucherData {
  // Voucher-Kern (Teil der Signatur):
  /** Stabile Voucher-Identitaet, unabhaengig von der WoT-Item-ID. */
  voucherId: string
  currency: string
  amount: number
  note?: string
  validFrom: string
  validUntil: string
  /** Public Key des Schoepfers (base64url, Ed25519). */
  creator: string
  /** WoT-DID des Schoepfers — fuer Trust-Distanz im Web of Trust. */
  creatorDid?: string
  /** Zeitstempel der Schoepfung — in der Signatur enthalten. */
  createdAt: string

  // Krypto:
  /** Ed25519-Signatur des Voucher-Kerns (base64url). */
  signature: string

  // Status — ausserhalb der Signatur:
  status: 'neu' | 'ausgegeben' | 'empfangen'

  // Beim Teilen vom Sender gesetzt:
  recipientNote?: string
  sharedAt?: string

  // Beim Empfangen vom Empfaenger gesetzt:
  /** Original-Item-ID beim Schoepfer — fuer Double-Receive-Pruefung */
  originalId?: string
  /** DID des urspruenglichen Schoepfers */
  originalCreator?: string
  /** Zeitstempel der urspruenglichen Schoepfung */
  originalCreatedAt?: string
  /** DID des direkten Senders (kann gleich originalCreator sein, oder Vor-Empfaenger) */
  receivedFrom?: string
  /** Zeitstempel des Empfangs */
  receivedAt?: string
  /** Verifikations-Status nach dem Empfang. */
  signatureValid?: boolean
}

/**
 * Format des QR-Code-Payloads beim Teilen eines Vouchers.
 * Version 2 (Phase 1.4): traegt Ed25519-Signatur.
 */
export interface VoucherSharePayload {
  type: 'valluet-voucher'
  version: 2
  voucher: {
    voucherId: string
    currency: string
    amount: number
    note?: string
    validFrom: string
    validUntil: string
    creator: string // Public Key des Schoepfers
    creatorDid?: string // WoT-DID des Schoepfers — fuer Trust-Distanz
    createdAt: string
  }
  signature: string
  sharedBy: string
  sharedAt: string
}

export function isVoucherSharePayload(
  raw: unknown,
): raw is VoucherSharePayload {
  if (!raw || typeof raw !== 'object') return false
  const obj = raw as Record<string, unknown>
  if (obj.type !== 'valluet-voucher') return false
  if (obj.version !== 2) return false
  if (typeof obj.signature !== 'string') return false
  if (!obj.voucher || typeof obj.voucher !== 'object') return false
  const v = obj.voucher as Record<string, unknown>
  return (
    typeof v.voucherId === 'string' &&
    typeof v.currency === 'string' &&
    typeof v.amount === 'number' &&
    typeof v.creator === 'string' &&
    typeof v.createdAt === 'string'
  )
}

export interface CurrencyMeta {
  id: string
  label: string
  symbol: string
  color: string
  bg: string
  beschreibung: string
}

export const CURRENCY_META: Record<string, CurrencyMeta> = {
  dank: {
    id: 'dank',
    label: 'Dank',
    symbol: '✦',
    color: '#E8B547',
    bg: 'rgba(232, 181, 71, 0.12)',
    beschreibung: 'persoenliche Wertschaetzung',
  },
}

export const DEFAULT_CURRENCY = 'dank'
export const STUECKELUNGEN = [1, 5, 15, 30, 60, 120]
export const GUELTIGKEIT_JAHRE = 5

export function getCurrencyMeta(currency: string): CurrencyMeta {
  return (
    CURRENCY_META[currency] ?? {
      id: currency,
      label: currency,
      symbol: '◇',
      color: '#888',
      bg: 'rgba(136, 136, 136, 0.12)',
      beschreibung: '',
    }
  )
}
