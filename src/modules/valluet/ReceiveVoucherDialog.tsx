/**
 * Empfangs-Dialog — Voucher vom QR-Code (oder Klartext) annehmen.
 *
 * Zwei Modi:
 *   - "scan" — Kamera, BarcodeDetector-API (Chromium)
 *   - "paste" — Klartext-JSON einfuegen (Fallback, immer verfuegbar)
 *
 * Validation:
 *   - Format pruefen (valluet-voucher v1)
 *   - Doppel-Empfang verhindern (originalId schon in eigener Wallet?)
 *
 * Bei Annahme wird ein neues Item vom Typ "voucher" angelegt:
 *   - createdBy: currentUser.id (technischer Speicher)
 *   - data.originalCreator: urspruenglicher Schoepfer
 *   - data.originalId: Item-ID beim Schoepfer
 *   - data.status: "empfangen"
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  useCreateItem,
  useCurrentUser,
  useItems,
} from '@real-life-stack/toolkit'
import {
  Camera,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ShieldCheck,
  ShieldAlert,
  Users,
} from 'lucide-react'
import {
  getCurrencyMeta,
  isVoucherSharePayload,
  type VoucherSharePayload,
  type VoucherData,
} from './types'
import { verifyVoucherCore, shortenKey, type VoucherCore } from './signing'
import { useTrustLevel, describeTrustLevel } from './use-trust-level'
import { useCurrencies } from './use-currencies'

interface ReceiveVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Mode = 'scan' | 'paste'
type ParseError =
  | 'format'
  | 'signature'
  | 'duplicate'
  | 'self'
  | 'expired'
  | null

interface ValidatedPayload {
  payload: VoucherSharePayload
  signatureValid: boolean
}

declare global {
  // BarcodeDetector ist in moderneren Chromium-Browsern nativ verfuegbar
  // — TypeScript kennt den Typ noch nicht standardmaessig.
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (
        source: HTMLVideoElement | ImageBitmap | ImageData,
      ) => Promise<{ rawValue: string }[]>
    }
  }
}

export function ReceiveVoucherDialog({
  open,
  onOpenChange,
}: ReceiveVoucherDialogProps) {
  const [mode, setMode] = useState<Mode>(
    typeof window !== 'undefined' && window.BarcodeDetector ? 'scan' : 'paste',
  )
  const [pasteText, setPasteText] = useState('')
  const [validated, setValidated] = useState<ValidatedPayload | null>(null)
  const [parseError, setParseError] = useState<ParseError>(null)
  const [isReceiving, setIsReceiving] = useState(false)
  const [received, setReceived] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const scanLoopRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { mutate: createItem } = useCreateItem()
  const { data: currentUser } = useCurrentUser()
  const { data: alleVouchers } = useItems({ type: 'voucher' })

  const isSupported =
    typeof window !== 'undefined' && !!window.BarcodeDetector

  // Reset wenn Dialog schliesst
  useEffect(() => {
    if (!open) {
      setPasteText('')
      setValidated(null)
      setParseError(null)
      setIsReceiving(false)
      setReceived(false)
      setScanError(null)
    }
  }, [open])

  const stopScan = useCallback(() => {
    if (scanLoopRef.current !== null) {
      cancelAnimationFrame(scanLoopRef.current)
      scanLoopRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Validation: pruefe Payload, verifiziere Signatur
  const validate = useCallback(
    async (raw: unknown): Promise<ValidatedPayload | null> => {
      if (!isVoucherSharePayload(raw)) {
        setParseError('format')
        return null
      }
      // Doppel-Empfang verhindern
      const schon = alleVouchers.some((v) => {
        const data = v.data as Partial<VoucherData>
        return data.originalId === raw.voucher.voucherId
      })
      if (schon) {
        setParseError('duplicate')
        return null
      }
      // Verfall pruefen
      if (raw.voucher.validUntil) {
        const verfall = new Date(raw.voucher.validUntil).getTime()
        if (verfall < Date.now()) {
          setParseError('expired')
          return null
        }
      }
      // Signatur verifizieren — auch creatorDid muss in der Canonicalization
      // beruecksichtigt werden (signiert wird der gesamte Voucher-Kern)
      const core: VoucherCore = {
        voucherId: raw.voucher.voucherId,
        currency: raw.voucher.currency,
        amount: raw.voucher.amount,
        note: raw.voucher.note,
        validFrom: raw.voucher.validFrom,
        validUntil: raw.voucher.validUntil,
        creator: raw.voucher.creator,
        creatorDid: raw.voucher.creatorDid,
        createdAt: raw.voucher.createdAt,
      }
      const signatureValid = await verifyVoucherCore(
        core,
        raw.signature,
        raw.voucher.creator,
      )
      if (!signatureValid) {
        setParseError('signature')
        return null
      }
      setParseError(null)
      return { payload: raw, signatureValid }
    },
    [alleVouchers],
  )

  // Scan-Loop starten
  useEffect(() => {
    if (!open || mode !== 'scan' || !isSupported || validated) return

    let cancelled = false
    setScanError(null)

    const detector = new window.BarcodeDetector!({ formats: ['qr_code'] })

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        const tick = async () => {
          if (cancelled || !video.videoWidth) {
            scanLoopRef.current = requestAnimationFrame(tick)
            return
          }
          try {
            const codes = await detector.detect(video)
            if (codes.length > 0) {
              const text = codes[0].rawValue
              try {
                const parsed = JSON.parse(text)
                const result = await validate(parsed)
                if (result) {
                  setValidated(result)
                  stopScan()
                  return
                }
              } catch {
                setParseError('format')
              }
            }
          } catch {
            // ignore single-frame errors
          }
          scanLoopRef.current = requestAnimationFrame(tick)
        }
        scanLoopRef.current = requestAnimationFrame(tick)
      } catch (err) {
        console.error('Kamera-Zugriff fehlgeschlagen:', err)
        setScanError(
          'Kamera-Zugriff fehlgeschlagen. Wechsle zum Einfuegen-Modus.',
        )
      }
    }
    start()

    return () => {
      cancelled = true
      stopScan()
    }
  }, [open, mode, isSupported, validated, validate, stopScan])

  const handlePaste = async () => {
    setParseError(null)
    try {
      const parsed = JSON.parse(pasteText.trim())
      const result = await validate(parsed)
      if (result) setValidated(result)
    } catch {
      setParseError('format')
    }
  }

  const handleEmpfangen = async () => {
    if (!validated) return
    setIsReceiving(true)
    try {
      const { payload } = validated
      await createItem({
        type: 'voucher',
        createdBy: currentUser?.id ?? 'self',
        data: {
          // Voucher-Kern (kopiert vom Schoepfer)
          voucherId: payload.voucher.voucherId,
          currency: payload.voucher.currency,
          amount: payload.voucher.amount,
          note: payload.voucher.note,
          validFrom: payload.voucher.validFrom,
          validUntil: payload.voucher.validUntil,
          creator: payload.voucher.creator,
          creatorDid: payload.voucher.creatorDid,
          createdAt: payload.voucher.createdAt,
          signature: payload.signature,

          // Empfangs-Felder
          status: 'empfangen',
          originalId: payload.voucher.voucherId,
          originalCreator: payload.voucher.creatorDid ?? payload.voucher.creator,
          originalCreatedAt: payload.voucher.createdAt,
          receivedFrom: payload.sharedBy,
          receivedAt: new Date().toISOString(),
          signatureValid: validated.signatureValid,
        },
      })
      setReceived(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      console.error('Empfang fehlgeschlagen:', err)
      setIsReceiving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5 text-amber-500" />
            Wert empfangen
          </DialogTitle>
          <DialogDescription>
            Scanne den QR-Code des Senders, oder fuege den Werte-Text ein.
          </DialogDescription>
        </DialogHeader>

        {received ? (
          <ReceivedSuccess payload={validated?.payload ?? null} />
        ) : validated ? (
          <PreviewAndConfirm
            validated={validated}
            onCancel={() => setValidated(null)}
            onConfirm={handleEmpfangen}
            isReceiving={isReceiving}
          />
        ) : (
          <div className="space-y-4">
            {/* Modus-Wechsel */}
            <div className="flex gap-1 rounded-full border border-border/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode('scan')}
                disabled={!isSupported}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  mode === 'scan'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } ${!isSupported ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Scannen</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('paste')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  mode === 'paste'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Einfuegen</span>
              </button>
            </div>

            {mode === 'scan' && (
              <div>
                {!isSupported ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-50/40 p-4 text-sm dark:bg-amber-950/20">
                    Dein Browser unterstuetzt keinen QR-Scanner. Wechsle zum
                    Einfuegen-Modus.
                  </div>
                ) : scanError ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-50/40 p-4 text-sm dark:bg-red-950/20">
                    {scanError}
                  </div>
                ) : (
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-2/3 w-2/3 rounded-2xl border-2 border-amber-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'paste' && (
              <div className="space-y-2">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
                  placeholder='Fuege hier den Werte-Text ein (beginnt mit {"type":"valluet-voucher",...})'
                />
                <Button
                  onClick={handlePaste}
                  disabled={!pasteText.trim()}
                  className="w-full"
                >
                  Pruefen
                </Button>
              </div>
            )}

            {parseError && <ErrorHint error={parseError} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ErrorHint({ error }: { error: ParseError }) {
  if (!error) return null
  const messages: Record<NonNullable<ParseError>, string> = {
    format:
      'Das ist kein gueltiger Valluet-Wert. Pruefe den Code oder den Text.',
    signature:
      'Die Signatur stimmt nicht mit dem Schoepfer ueberein. Der Wert wurde manipuliert oder kommt aus einer alten Version.',
    duplicate:
      'Diesen Wert hast du schon empfangen. Schau in deine Dankbank.',
    self: 'Dieser Wert kommt von dir selbst. Du kannst ihn nicht zweimal halten.',
    expired:
      'Dieser Wert ist abgelaufen. Bitte den Sender, einen neuen zu schoepfen.',
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-50/40 p-3 text-sm dark:bg-red-950/20">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <span className="text-red-700 dark:text-red-400">{messages[error]}</span>
    </div>
  )
}

function PreviewAndConfirm({
  validated,
  onCancel,
  onConfirm,
  isReceiving,
}: {
  validated: ValidatedPayload
  onCancel: () => void
  onConfirm: () => void
  isReceiving: boolean
}) {
  const { payload, signatureValid } = validated
  const { map: currencyMap } = useCurrencies()
  const meta = getCurrencyMeta(payload.voucher.currency, currencyMap)
  const validUntil = new Date(payload.voucher.validUntil)
  const creatorShort = shortenKey(payload.voucher.creator, 12)
  const trust = useTrustLevel(
    payload.voucher.creatorDid,
    payload.voucher.creator,
  )
  const trustDesc = describeTrustLevel(trust)

  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3 rounded-xl border border-border/40 p-4"
        style={{ backgroundColor: meta.bg }}
      >
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-background/70">
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: meta.color }}
          >
            {payload.voucher.amount}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">
            {payload.voucher.amount} {meta.label}
          </p>
          {payload.voucher.note && (
            <p className="mt-0.5 text-sm text-foreground/80">
              {payload.voucher.note}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            geschoepft von <span className="font-mono">{creatorShort}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            gueltig bis{' '}
            {validUntil.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Signatur-Status */}
      {signatureValid ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50/40 p-3 text-xs dark:bg-emerald-950/20">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              Signatur gueltig
            </p>
            <p className="mt-0.5 text-emerald-700/80 dark:text-emerald-400/80">
              Der Wert wurde unveraendert vom Schoepfer signiert.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50/40 p-3 text-xs dark:bg-amber-950/20">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Signatur fehlt oder ungueltig
            </p>
            <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
              Du kannst den Wert annehmen, aber er traegt keinen sicheren
              Schoepfer-Beweis.
            </p>
          </div>
        </div>
      )}

      {/* Trust-Distanz aus dem Web of Trust */}
      <div
        className="flex items-start gap-2 rounded-lg border p-3 text-xs"
        style={{
          backgroundColor: trustDesc.bg,
          borderColor: trustDesc.color + '4d',
        }}
      >
        <Users className="mt-0.5 h-4 w-4 shrink-0" style={{ color: trustDesc.color }} />
        <div>
          <p className="font-semibold" style={{ color: trustDesc.color }}>
            {trustDesc.label}
          </p>
          <p className="mt-0.5 opacity-80" style={{ color: trustDesc.color }}>
            {trustDesc.beschreibung}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isReceiving}>
          <X className="mr-1 h-4 w-4" />
          Abbrechen
        </Button>
        <Button onClick={onConfirm} disabled={isReceiving}>
          {isReceiving ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Empfange...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              In meine Dankbank
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ReceivedSuccess({
  payload,
}: {
  payload: VoucherSharePayload | null
}) {
  const { map: currencyMap } = useCurrencies()
  if (!payload) return null
  const meta = getCurrencyMeta(payload.voucher.currency, currencyMap)
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.bg }}
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          {payload.voucher.amount} {meta.label} empfangen
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Liegt jetzt in deiner Dankbank.
        </p>
      </div>
    </div>
  )
}
