/**
 * Valluet — die Wertboerse als Vollbild-Tab im RLN.
 *
 * Phase 1.1: Voucher (Dank) schoepfen, eigene Dankbank anzeigen.
 * Naechste Phasen: senden, empfangen, eigene Waehrungen, GLS-Bruecke.
 */

import { useMemo, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { Button, useItems, useCurrentUser } from '@real-life-stack/toolkit'
import {
  Plus,
  Sparkles,
  Calendar,
  FileText,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  ClipboardPaste,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import type { ModuleViewProps } from '../registry'
import { StatsBar } from '../gamification'
import { CreateVoucherDialog } from './CreateVoucherDialog'
import { ShareVoucherDialog } from './ShareVoucherDialog'
import { ReceiveVoucherDialog } from './ReceiveVoucherDialog'
import { CurrencyManagerPanel } from './CurrencyManagerPanel'
import {
  DEFAULT_CURRENCY,
  getCurrencyMeta,
  type CurrencyMeta,
  type VoucherData,
} from './types'
import { useCurrencies } from './use-currencies'
import { useTrustLevel, describeTrustLevel } from './use-trust-level'

type FilterTab = 'alle' | 'neu' | 'empfangen' | 'ausgegeben'

export function ValluetView(_props: ModuleViewProps) {
  const { data: currentUser } = useCurrentUser()
  const { data: alleVouchers } = useItems({ type: 'voucher' })
  const { map: currencyMap } = useCurrencies()
  const [createOpen, setCreateOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const [shareVoucher, setShareVoucher] = useState<Item | null>(null)
  const [filter, setFilter] = useState<FilterTab>('alle')

  const meineVouchers = useMemo(() => {
    if (!currentUser) return []
    return alleVouchers
      .filter((v) => v.createdBy === currentUser.id)
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        return bTime - aTime
      })
  }, [alleVouchers, currentUser])

  const gefilterteVouchers = useMemo(() => {
    if (filter === 'alle') return meineVouchers
    return meineVouchers.filter((v) => {
      const data = v.data as Partial<VoucherData>
      return (data.status ?? 'neu') === filter
    })
  }, [meineVouchers, filter])

  const summenJeWaehrung = useMemo(() => {
    // Bei mir liegt: neu (selbst geschoepft) + empfangen. Geteilte sind raus.
    const summen: Record<string, number> = {}
    for (const v of meineVouchers) {
      const data = v.data as Partial<VoucherData>
      const status = data.status ?? 'neu'
      if (status === 'ausgegeben') continue
      const currency = data.currency ?? DEFAULT_CURRENCY
      const amount = typeof data.amount === 'number' ? data.amount : 0
      summen[currency] = (summen[currency] ?? 0) + amount
    }
    return summen
  }, [meineVouchers])

  const counts = useMemo(() => {
    let neu = 0
    let empfangen = 0
    let ausgegeben = 0
    for (const v of meineVouchers) {
      const data = v.data as Partial<VoucherData>
      const status = data.status ?? 'neu'
      if (status === 'neu') neu++
      else if (status === 'empfangen') empfangen++
      else if (status === 'ausgegeben') ausgegeben++
    }
    return { alle: meineVouchers.length, neu, empfangen, ausgegeben }
  }, [meineVouchers])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Kopf */}
      <div className="border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-xl font-semibold text-foreground">Valluet</h1>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Werte schoepfen. Werte schaetzen. Eine Wertboerse.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatsBar />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setManagerOpen(true)}
                title="Wertformen verwalten"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setReceiveOpen(true)}
                className="gap-2"
              >
                <ClipboardPaste className="h-4 w-4" />
                Empfangen
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Wert schoepfen
              </Button>
            </div>
          </div>
        </div>

        {/* Summen-Leiste pro Waehrung */}
        {Object.keys(summenJeWaehrung).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(summenJeWaehrung).map(([currency, summe]) => {
              const meta = getCurrencyMeta(currency, currencyMap)
              return (
                <div
                  key={currency}
                  className="flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                  style={{ backgroundColor: meta.bg }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: meta.color }}
                  >
                    {meta.symbol}
                  </span>
                  <span className="font-semibold text-foreground">
                    {summe} {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="flex-1 overflow-y-auto">
        {meineVouchers.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="mx-auto max-w-3xl px-6 py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Die Dankbank
              </h2>
              <FilterTabs filter={filter} onChange={setFilter} counts={counts} />
            </div>
            {gefilterteVouchers.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-background/40 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Hier sammeln sich{' '}
                  {filter === 'neu'
                    ? 'frisch geschoepfte Vouchers'
                    : 'geteilte Vouchers'}
                  . Aktuell ist es noch leer.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 rounded-xl border border-border/60 bg-background/40">
                {gefilterteVouchers.map((v) => (
                  <VoucherRow
                    key={v.id}
                    voucher={v}
                    currencyMap={currencyMap}
                    onShare={() => setShareVoucher(v)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <CreateVoucherDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ReceiveVoucherDialog open={receiveOpen} onOpenChange={setReceiveOpen} />
      <ShareVoucherDialog
        open={!!shareVoucher}
        onOpenChange={(open) => {
          if (!open) setShareVoucher(null)
        }}
        voucher={shareVoucher}
      />
      <CurrencyManagerPanel open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  )
}

function FilterTabs({
  filter,
  onChange,
  counts,
}: {
  filter: FilterTab
  onChange: (f: FilterTab) => void
  counts: { alle: number; neu: number; empfangen: number; ausgegeben: number }
}) {
  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'alle', label: 'Alle', count: counts.alle },
    { id: 'neu', label: 'Geschoepft', count: counts.neu },
    { id: 'empfangen', label: 'Empfangen', count: counts.empfangen },
    { id: 'ausgegeben', label: 'Geteilt', count: counts.ausgegeben },
  ]
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 p-0.5 text-xs">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${
            filter === t.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>{t.label}</span>
          <span className="text-[10px] opacity-70">{t.count}</span>
        </button>
      ))}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const meta = getCurrencyMeta(DEFAULT_CURRENCY)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.bg }}
      >
        <Sparkles className="h-10 w-10" style={{ color: meta.color }} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          Noch keinen Wert geschoepft
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Beginne mit einem Dank — fuer einen Menschen, eine Begegnung, einen
          Moment, der dich bewegt hat.
        </p>
      </div>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        Dank schoepfen
      </Button>
    </div>
  )
}

function VoucherRow({
  voucher,
  currencyMap,
  onShare,
}: {
  voucher: Item
  currencyMap: Record<string, CurrencyMeta>
  onShare: () => void
}) {
  const data = voucher.data as Partial<VoucherData>
  const currency = data.currency ?? DEFAULT_CURRENCY
  const amount = typeof data.amount === 'number' ? data.amount : 0
  const note = typeof data.note === 'string' ? data.note : ''
  const meta = getCurrencyMeta(currency, currencyMap)
  const status = data.status ?? 'neu'
  const isShared = status === 'ausgegeben'
  const isReceived = status === 'empfangen'

  const created = new Date(voucher.createdAt)
  const validUntil = data.validUntil ? new Date(data.validUntil) : null
  const creatorShort = data.originalCreator
    ? data.originalCreator.slice(0, 12) + '…' + data.originalCreator.slice(-4)
    : null
  const isSigned = !!data.signature
  const isVerified = isReceived ? data.signatureValid === true : isSigned

  // Trust-Stufe — nur bei empfangenen Vouchers anzeigen
  const trust = useTrustLevel(data.creatorDid, data.creator)
  const trustDesc = isReceived ? describeTrustLevel(trust) : null

  return (
    <li className={`px-4 py-3 ${isShared ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Wert-Block */}
        <div
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg"
          style={{ backgroundColor: meta.bg }}
        >
          <span
            className="text-xl font-bold leading-none"
            style={{ color: meta.color }}
          >
            {amount}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide leading-tight"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {note && (
            <div className="flex items-start gap-1.5">
              <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
              <p className="text-sm text-foreground">{note}</p>
            </div>
          )}
          {isReceived && creatorShort && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1">
                <ArrowDownLeft className="h-3 w-3 text-amber-600" />
                <span className="text-amber-700 dark:text-amber-400">
                  empfangen von{' '}
                  <span className="font-mono">{creatorShort}</span>
                </span>
              </div>
              {trustDesc && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ color: trustDesc.color, backgroundColor: trustDesc.bg }}
                  title={trustDesc.beschreibung}
                >
                  {trustDesc.label}
                </span>
              )}
            </div>
          )}
          {isShared && data.recipientNote && (
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400">
                geteilt mit {data.recipientNote}
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              <span>
                {created.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            {validUntil && (
              <span className="text-muted-foreground/60">
                gueltig bis{' '}
                {validUntil.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            )}
            {isVerified && (
              <span
                className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400"
                title="Ed25519-Signatur des Schoepfers verifiziert"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>signiert</span>
              </span>
            )}
          </div>
        </div>

        {!isShared && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onShare}
            className="gap-1.5"
            title="Diesen Wert teilen"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="text-xs">Teilen</span>
          </Button>
        )}
      </div>
    </li>
  )
}
