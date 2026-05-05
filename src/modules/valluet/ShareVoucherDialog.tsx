/**
 * Teilen-Dialog — einen Voucher per QR-Code uebergeben.
 *
 * Phase 1.2: Sender erzeugt QR. Empfaenger-Scan + Empfangs-Logik
 * folgen in Phase 1.3.
 *
 * QR-Inhalt ist ein signiertes (spaeter — jetzt erstmal klares) JSON-Paket:
 *   { type: "valluet-voucher", version: 1, voucher: {...}, sharedBy, sharedAt }
 *
 * Der Voucher-Status wechselt nach "geteilt", optional mit Empfaenger-Notiz.
 */

import { useEffect, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  useUpdateItem,
  useCurrentUser,
} from '@real-life-stack/toolkit'
import { QrCode, Copy, Check } from 'lucide-react'
import { getCurrencyMeta, type VoucherData } from './types'
import { useCurrencies } from './use-currencies'

interface ShareVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: Item | null
}

export function ShareVoucherDialog({
  open,
  onOpenChange,
  voucher,
}: ShareVoucherDialogProps) {
  const [recipientNote, setRecipientNote] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrPayload, setQrPayload] = useState('')
  const [copied, setCopied] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const { mutate: updateItem } = useUpdateItem()
  const { data: currentUser } = useCurrentUser()
  const { map: currencyMap } = useCurrencies()

  // QR-Code generieren wenn ein Voucher geladen ist
  useEffect(() => {
    if (!voucher || !open) return

    const data = voucher.data as Partial<VoucherData>
    if (
      !data.voucherId ||
      !data.currency ||
      !data.creator ||
      !data.signature ||
      !data.createdAt ||
      typeof data.amount !== 'number'
    ) {
      console.warn('Voucher fehlen Pflichtfelder fuer Share-Payload', data)
      setQrDataUrl(null)
      setQrPayload('')
      return
    }

    // Payload v2 mit Signatur + creatorDid (fuer Trust-Distanz)
    const payload = JSON.stringify({
      type: 'valluet-voucher',
      version: 2,
      voucher: {
        voucherId: data.voucherId,
        currency: data.currency,
        amount: data.amount,
        note: data.note,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        creator: data.creator,
        creatorDid: data.creatorDid,
        createdAt: data.createdAt,
      },
      signature: data.signature,
      sharedBy: currentUser?.id ?? voucher.createdBy,
      sharedAt: new Date().toISOString(),
    })
    setQrPayload(payload)

    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#1a1a1a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.error('QR-Code-Erzeugung fehlgeschlagen:', err)
          setQrDataUrl(null)
        })
    })
  }, [voucher, open, currentUser])

  // Reset wenn der Dialog schliesst
  useEffect(() => {
    if (!open) {
      setRecipientNote('')
      setQrDataUrl(null)
      setQrPayload('')
      setCopied(false)
      setIsMarking(false)
    }
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrPayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy fehlgeschlagen:', err)
    }
  }

  const handleMarkShared = async () => {
    if (!voucher) return
    setIsMarking(true)
    try {
      const data = voucher.data as Partial<VoucherData>
      await updateItem(voucher.id, {
        data: {
          ...data,
          status: 'ausgegeben',
          recipientNote: recipientNote.trim() || undefined,
          sharedAt: new Date().toISOString(),
        },
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Status-Update fehlgeschlagen:', err)
      setIsMarking(false)
    }
  }

  if (!voucher) return null

  const data = voucher.data as Partial<VoucherData>
  const meta = getCurrencyMeta(data.currency ?? 'dank', currencyMap)
  const amount = typeof data.amount === 'number' ? data.amount : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-500" />
            Wert teilen
          </DialogTitle>
          <DialogDescription>
            Zeige diesen Code dem Empfaenger. Sein Geraet liest den Wert ein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voucher-Vorschau */}
          <div
            className="flex items-center gap-3 rounded-lg border border-border/40 p-3"
            style={{ backgroundColor: meta.bg }}
          >
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-background/60">
              <span
                className="text-lg font-bold leading-none"
                style={{ color: meta.color }}
              >
                {amount}
              </span>
              <span
                className="text-[9px] font-semibold uppercase tracking-wide"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {amount} {meta.label}
              </p>
              {data.note && (
                <p className="truncate text-xs text-muted-foreground">
                  {data.note}
                </p>
              )}
            </div>
          </div>

          {/* QR-Code */}
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-xl border border-border/60 bg-white p-3">
                <img
                  src={qrDataUrl}
                  alt="Voucher-QR-Code"
                  className="block h-64 w-64"
                />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Daten als Text kopieren</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              QR-Code wird erzeugt...
            </div>
          )}

          {/* Empfaenger-Notiz */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              An wen geht der Wert?{' '}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <input
              type="text"
              value={recipientNote}
              onChange={(e) => setRecipientNote(e.target.value)}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              placeholder="z.B. Anton, Brigitte, Werkstatt-Kreis"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Erscheint in deinem Log als Erinnerung — der Empfaenger sieht es
              nicht.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isMarking}
          >
            Abbrechen
          </Button>
          <Button onClick={handleMarkShared} disabled={isMarking}>
            {isMarking ? 'Markiere...' : 'Als geteilt markieren'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
