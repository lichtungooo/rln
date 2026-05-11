/**
 * Valluet — Wertboerse als Modul.
 *
 * Voucher (Item-Typ "voucher") schoepfen, anzeigen, senden, empfangen.
 * Wertformen pro Space (Item-Typ "currency-meta") — eigene Stueckelung,
 * Symbol, Farbe, Gueltigkeit. Spaeter zusaetzlich GLS-Euro-Bruecke
 * (FairPay-aehnlich) + Cashback in Hier-und-Jetzt-Projekte.
 *
 * Vertrauen kommt aus dem Web of Trust — keine Buergen-Multi-Sig.
 * Sebastian Galek's human-money-core liefert die mathematische Spec,
 * wir nutzen sie ohne Buergen-Schicht.
 *
 * Konzept: `valluet/KONZEPT.md` im Workspace-Root.
 */

import { Sparkles } from 'lucide-react'
import type { ModuleDefinition } from '../registry'
import { ValluetView } from './ValluetView'

export const valluetModule: ModuleDefinition = {
  id: 'valluet',
  label: 'Valluet',
  icon: Sparkles,
  fullWidth: true,
  View: ValluetView,
  itemTypes: ['voucher', 'currency-meta'],
  requiredCapabilities: ['ItemWriter'],
}

export type { VoucherData, CurrencyMeta } from './types'
export {
  CURRENCY_META,
  CURRENCY_META_ITEM_TYPE,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCIES,
  STUECKELUNGEN,
  STUECKELUNGEN_FALLBACK,
  GUELTIGKEIT_JAHRE,
  GUELTIGKEIT_FALLBACK,
  getCurrencyMeta,
  getStueckelungen,
  getGueltigkeitJahre,
} from './types'
export { useCurrencies, type CurrencyEntity } from './use-currencies'
