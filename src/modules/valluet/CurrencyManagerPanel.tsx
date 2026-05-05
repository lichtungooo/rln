/**
 * CurrencyManagerPanel — Verwaltung der Wertformen eines Spaces.
 *
 * Auflistung Default-Waehrungen (z.B. Dank — schreibgeschuetzt) plus
 * eigene Wertformen, die als Items vom Typ "currency-meta" im WoT
 * leben. Anlegen, Bearbeiten, Loeschen — pro Wertform Symbol, Farbe,
 * Stueckelung, Gueltigkeit.
 */

import { useState } from 'react'
import { Button } from '@real-life-stack/toolkit'
import { Plus, Pencil, Trash2, X, Save, Sparkles, Lock } from 'lucide-react'
import { useCurrencies, type CurrencyEntity } from './use-currencies'
import {
  STUECKELUNGEN_FALLBACK,
  GUELTIGKEIT_FALLBACK,
  type CurrencyMeta,
} from './types'

interface CurrencyManagerPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VORSCHLAG_SYMBOLE = ['✦', '✺', '✿', '❋', '◈', '◉', '⚒', '⚙', '☘', '☼', '♥', '✓']
const VORSCHLAG_FARBEN = [
  '#E8B547', // Sonnengold (Dank)
  '#E8751A', // Macher-Orange
  '#10B981', // Smaragd
  '#3B82F6', // Wasserblau
  '#A855F7', // Amethyst
  '#EC4899', // Rosenholz
  '#0E7C66', // Tuerkis
  '#7C5C3F', // Erdbraun
]

export function CurrencyManagerPanel({
  open,
  onOpenChange,
}: CurrencyManagerPanelProps) {
  const { list, createCurrency, updateCurrency, removeCurrency } = useCurrencies()
  const [editing, setEditing] = useState<CurrencyEntity | null>(null)
  const [creating, setCreating] = useState(false)

  if (!open) return null

  const handleClose = () => {
    setEditing(null)
    setCreating(false)
    onOpenChange(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kopf */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">
              Wertformen verwalten
            </h2>
          </div>
          <Button size="icon-sm" variant="ghost" onClick={handleClose} title="Schliessen">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Inhalt */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {creating || editing ? (
            <CurrencyForm
              initial={editing?.meta}
              onCancel={() => {
                setCreating(false)
                setEditing(null)
              }}
              onSave={async (meta) => {
                if (editing && editing.itemId) {
                  await updateCurrency(editing.itemId, meta)
                } else {
                  await createCurrency(meta)
                }
                setCreating(false)
                setEditing(null)
              }}
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Jeder Kreis schoepft seine eigene Wertform — Werkstatt-Coin,
                Lichtschein, Hofgulden, Kreis-Token. Symbol, Farbe und
                Stueckelung waehlst du frei.
              </p>
              <ul className="space-y-2">
                {list.map((c) => (
                  <CurrencyRow
                    key={c.id}
                    entry={c}
                    onEdit={() => setEditing(c)}
                    onDelete={async () => {
                      if (!c.itemId) return
                      const ok = window.confirm(
                        `"${c.meta.label}" wirklich loeschen? Bestehende Vouchers bleiben erhalten.`,
                      )
                      if (ok) await removeCurrency(c.itemId)
                    }}
                  />
                ))}
              </ul>
              <Button
                onClick={() => setCreating(true)}
                className="mt-4 w-full gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Neue Wertform schoepfen
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CurrencyRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: CurrencyEntity
  onEdit: () => void
  onDelete: () => void
}) {
  const m = entry.meta
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg font-bold"
        style={{ backgroundColor: m.bg, color: m.color }}
      >
        {m.symbol}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {m.label}
          </p>
          {entry.isDefault && (
            <span
              title="Default-Wertform — geschuetzt"
              className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              <Lock className="h-2.5 w-2.5" />
              Default
            </span>
          )}
        </div>
        {m.beschreibung && (
          <p className="truncate text-[11px] text-muted-foreground">
            {m.beschreibung}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!entry.isDefault && (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onEdit}
              title="Bearbeiten"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onDelete}
              title="Loeschen"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

function CurrencyForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: CurrencyMeta
  onCancel: () => void
  onSave: (meta: Omit<CurrencyMeta, 'id'> & { id?: string }) => Promise<void>
}) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [symbol, setSymbol] = useState(initial?.symbol ?? '✦')
  const [color, setColor] = useState(initial?.color ?? VORSCHLAG_FARBEN[0])
  const [beschreibung, setBeschreibung] = useState(initial?.beschreibung ?? '')
  const [stueckelungenStr, setStueckelungenStr] = useState(
    (initial?.stueckelungen ?? STUECKELUNGEN_FALLBACK).join(', '),
  )
  const [gueltigkeitJahre, setGueltigkeitJahre] = useState<number>(
    initial?.gueltigkeitJahre ?? GUELTIGKEIT_FALLBACK,
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!label.trim() || !symbol.trim()) return
    setSaving(true)
    try {
      const stueckelungen = stueckelungenStr
        .split(/[,\s]+/)
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      const bgRgba = hexToRgba(color, 0.12)
      await onSave({
        id: initial?.id,
        label: label.trim(),
        symbol: symbol.trim(),
        color,
        bg: bgRgba,
        beschreibung: beschreibung.trim(),
        stueckelungen: stueckelungen.length ? stueckelungen : undefined,
        gueltigkeitJahre,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        {initial ? 'Wertform bearbeiten' : 'Neue Wertform schoepfen'}
      </h3>

      {/* Vorschau */}
      <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md text-xl font-bold"
          style={{ backgroundColor: hexToRgba(color, 0.12), color }}
        >
          {symbol || '◇'}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {label || 'Name der Wertform'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {beschreibung || 'kurze Beschreibung'}
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Name
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="z.B. Werkstatt-Coin, Lichtschein, Hofgulden"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
          autoFocus
        />
      </div>

      {/* Symbol */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Symbol
        </label>
        <div className="flex items-center gap-2">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.slice(0, 3))}
            className="w-16 rounded-md border border-border/60 bg-background px-3 py-1.5 text-center text-base focus:border-primary focus:outline-none"
            maxLength={3}
          />
          <div className="flex flex-wrap gap-1">
            {VORSCHLAG_SYMBOLE.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymbol(s)}
                className={`flex h-7 w-7 items-center justify-center rounded border text-base transition ${
                  symbol === s
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Farbe */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Farbe
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-border/60"
          />
          <div className="flex flex-wrap gap-1">
            {VORSCHLAG_FARBEN.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded border-2 transition ${
                  color === c ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Beschreibung */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Beschreibung
        </label>
        <input
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          placeholder="z.B. Hilfe in der Werkstatt"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Stueckelung */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Stueckelung
        </label>
        <input
          value={stueckelungenStr}
          onChange={(e) => setStueckelungenStr(e.target.value)}
          placeholder="z.B. 1, 5, 10, 50, 100"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Vorschlaege beim Schoepfen — Komma- oder Leerzeichen-getrennt
        </p>
      </div>

      {/* Gueltigkeit */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Gueltigkeit (Jahre)
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={gueltigkeitJahre}
          onChange={(e) => setGueltigkeitJahre(Math.max(1, Number(e.target.value)))}
          className="w-32 rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Aktionen */}
      <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSave}
          disabled={!label.trim() || !symbol.trim() || saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Speichere...' : initial ? 'Speichern' : 'Schoepfen'}
        </Button>
      </div>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace('#', ''))
  if (!m) return `rgba(136, 136, 136, ${alpha})`
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
