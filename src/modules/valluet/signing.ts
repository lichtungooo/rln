/**
 * Valluet — Signatur und Verifikation.
 *
 * Phase 1.4 nutzt einen eigenen Valluet-Schluessel im localStorage.
 * Spaeter (1.5+) wechseln wir auf Antons Identity-Sign-API, sodass
 * der WoT-Schluessel des Menschen die Vouchers signiert.
 *
 * Mathematische Wurzel:
 *   - Ed25519 (gleich wie Antons WoT, gleich wie Sebastians human-money-core)
 *   - JSON-Canonicalization durch Schluesselsortierung — einfach gehalten,
 *     damit die gleiche Datenstruktur immer denselben Bytestrom ergibt
 *   - Base64-URL-Encoding fuer Schluessel + Signaturen (textfreundlich)
 */

import * as ed25519 from '@noble/ed25519'

const STORAGE_KEY = 'valluet-keypair-v1'

export interface ValluetKeyPair {
  publicKey: string
  privateKey: string
}

// ============================================================
// Encoding-Helpers
// ============================================================

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = norm.length % 4 ? '='.repeat(4 - (norm.length % 4)) : ''
  const binary = atob(norm + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ============================================================
// Canonicalization
// ============================================================

/**
 * Schluessel rekursiv sortieren — damit die JSON-Repraesentation
 * immer dieselbe Byte-Folge ergibt, unabhaengig von der Erzeugung.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj).sort()) {
      if (obj[k] !== undefined) out[k] = canonicalize(obj[k])
    }
    return out
  }
  return value
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

// ============================================================
// Schluessel-Verwaltung
// ============================================================

let cachedKeyPair: ValluetKeyPair | null = null

export async function getOrCreateValluetKeyPair(): Promise<ValluetKeyPair> {
  if (cachedKeyPair) return cachedKeyPair

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ValluetKeyPair
        if (parsed.publicKey && parsed.privateKey) {
          cachedKeyPair = parsed
          return parsed
        }
      } catch {
        // gefallene Datei — neuer Schluessel folgt
      }
    }
  }

  // Neuen Schluessel erzeugen
  const seed = ed25519.utils.randomSecretKey()
  const publicKeyBytes = await ed25519.getPublicKeyAsync(seed)
  const keyPair: ValluetKeyPair = {
    publicKey: bytesToBase64Url(publicKeyBytes),
    privateKey: bytesToBase64Url(seed),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keyPair))
  }
  cachedKeyPair = keyPair
  return keyPair
}

// ============================================================
// Signieren und Verifizieren
// ============================================================

/**
 * Was wird signiert: das Voucher-Core-Objekt mit den unveraenderlichen
 * Feldern. Status, recipientNote, sharedAt, receivedAt liegen ausserhalb
 * der Signatur — sie aendern sich im Lebenslauf.
 */
export interface VoucherCore {
  voucherId: string
  currency: string
  amount: number
  note?: string
  validFrom: string
  validUntil: string
  creator: string // Public Key des Schoepfers (base64url)
  creatorDid?: string // WoT-DID des Schoepfers
  createdAt: string
}

export async function signVoucherCore(
  core: VoucherCore,
  privateKeyBase64: string,
): Promise<string> {
  const message = new TextEncoder().encode(canonicalJson(core))
  const seed = base64UrlToBytes(privateKeyBase64)
  const signatureBytes = await ed25519.signAsync(message, seed)
  return bytesToBase64Url(signatureBytes)
}

export async function verifyVoucherCore(
  core: VoucherCore,
  signatureBase64: string,
  publicKeyBase64: string,
): Promise<boolean> {
  try {
    const message = new TextEncoder().encode(canonicalJson(core))
    const signatureBytes = base64UrlToBytes(signatureBase64)
    const publicKeyBytes = base64UrlToBytes(publicKeyBase64)
    return await ed25519.verifyAsync(signatureBytes, message, publicKeyBytes)
  } catch {
    return false
  }
}

/**
 * Hilfs-UUID — einfacher Identitaets-String fuer den Voucher.
 * Nutzt crypto.randomUUID, wenn verfuegbar, sonst einen Fallback.
 */
export function generateVoucherId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback fuer aeltere Umgebungen
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  )
}

/**
 * Anzeigeform eines Schluessels — gekuerzt fuer UI.
 */
export function shortenKey(key: string, length = 12): string {
  if (key.length <= length * 2) return key
  return `${key.slice(0, length)}…${key.slice(-4)}`
}
