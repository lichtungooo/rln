/**
 * Valluet — Wertboerse als Modul.
 *
 * Voucher (Item-Typ "voucher") schoepfen, anzeigen, spaeter senden und
 * empfangen. Spaeter zusaetzlich GLS-Euro-Bruecke (FairPay-aehnlich) +
 * Cashback in Hier-und-Jetzt-Projekte.
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
  View: ValluetView,
  itemTypes: ['voucher'],
  requiredCapabilities: ['ItemWriter'],
}

export type { VoucherData, CurrencyMeta } from './types'
export {
  CURRENCY_META,
  DEFAULT_CURRENCY,
  STUECKELUNGEN,
  GUELTIGKEIT_JAHRE,
  getCurrencyMeta,
} from './types'
