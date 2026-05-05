/**
 * Schoepfungs-Dialog — neuen Voucher anlegen.
 *
 * Aktuell nur die Waehrung "Dank". Spaeter kommen weitere Wertformen
 * (Werkstatt-Coin, Lichtschein, Hofgulden, eigene Kreis-Tokens).
 */

import { useState } from 'react'
import { Button, useCreateItem, useCurrentUser } from '@real-life-stack/toolkit'
import { X, Sparkles } from 'lucide-react'
import {
  CURRENCY_META,
  DEFAULT_CURRENCY,
  STUECKELUNGEN,
  GUELTIGKEIT_JAHRE,
  getCurrencyMeta,
} from './types'
import {
  getOrCreateValluetKeyPair,
  signVoucherCore,
  generateVoucherId,
  type VoucherCore,
} from './signing'

interface CreateVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVoucherDialog({
  open,
  onOpenChange,
}: CreateVoucherDialogProps) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [amount, setAmount] = useState<number>(15)
  const [note, setNote] = useState('')
  const [isSchoepfend, setIsSchoepfend] = useState(false)
  const { mutate: createItem } = useCreateItem()
  const { data: currentUser } = useCurrentUser()

  const reset = () => {
    setCurrency(DEFAULT_CURRENCY)
    setAmount(15)
    setNote('')
    setIsSchoepfend(false)
  }

  const handleClose = () => {
    if (!isSchoepfend) {
      reset()
      onOpenChange(false)
    }
  }

  const handleSchoepfen = async () => {
    if (amount <= 0) return
    setIsSchoepfend(true)
    try {
      const jetzt = new Date()
      const verfall = new Date(jetzt)
      verfall.setFullYear(verfall.getFullYear() + GUELTIGKEIT_JAHRE)

      // Schluessel laden (oder beim ersten Mal erzeugen)
      const keyPair = await getOrCreateValluetKeyPair()

      // Voucher-Kern aufbauen — das ist, was signiert wird.
      // creatorDid traegt die WoT-Identitaet, damit der Empfaenger Trust-Distanz
      // im Kontakt-Netz berechnen kann.
      const core: VoucherCore = {
        voucherId: generateVoucherId(),
        currency,
        amount,
        note: note.trim() || undefined,
        validFrom: jetzt.toISOString(),
        validUntil: verfall.toISOString(),
        creator: keyPair.publicKey,
        creatorDid: currentUser?.id,
        createdAt: jetzt.toISOString(),
      }

      // Signatur erzeugen
      const signature = await signVoucherCore(core, keyPair.privateKey)

      await createItem({
        type: 'voucher',
        createdBy: currentUser?.id ?? 'self',
        data: {
          ...core,
          signature,
          status: 'neu',
        },
      })
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error('Fehler beim Schoepfen:', err)
      setIsSchoepfend(false)
    }
  }

  if (!open) return null

  const optionen = Object.values(CURRENCY_META)
  const gewaehlt = getCurrencyMeta(currency)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kopf */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">
              Wert schoepfen
            </h2>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleClose}
            title="Schliessen"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          {/* Wertform */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Wertform
            </label>
            <div className="flex flex-wrap gap-2">
              {optionen.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCurrency(opt.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    currency === opt.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                      : 'border-border/60 text-muted-foreground hover:border-border'
                  }`}
                >
                  <span className="text-base">{opt.symbol}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {gewaehlt.beschreibung}
            </p>
          </div>

          {/* Anzahl */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Anzahl
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {STUECKELUNGEN.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAmount(s)}
                  className={`min-w-[3rem] rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                    amount === s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 text-foreground hover:border-border'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              placeholder="oder eigene Anzahl"
            />
          </div>

          {/* Notiz */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notiz <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Wofuer? An wen denkst du? Was war der Moment?"
            />
          </div>

          {/* Vorschau */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/40 p-3 dark:bg-amber-950/20">
            <p className="text-xs text-muted-foreground">Du schoepfst gerade:</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {amount} {gewaehlt.label}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gueltig {GUELTIGKEIT_JAHRE} Jahre — bis{' '}
              {new Date(
                new Date().setFullYear(
                  new Date().getFullYear() + GUELTIGKEIT_JAHRE,
                ),
              ).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>

        {/* Aktionen */}
        <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3">
          <Button variant="ghost" onClick={handleClose} disabled={isSchoepfend}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSchoepfen}
            disabled={amount <= 0 || isSchoepfend}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isSchoepfend ? 'Schoepfe...' : 'Schoepfen'}
          </Button>
        </div>
      </div>
    </div>
  )
}
