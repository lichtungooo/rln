import { ShoppingBag } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { marketplaceSchema } from "./marketplace-schema"
import { MarketplaceGridView } from "./MarketplaceGridView"

/**
 * Marktplatz-Modul.
 *
 * Schema lebt in marketplace-schema.ts (Wahrheits-Quelle, Modul-Schmiede-
 * tauglich). Render-Komponente ist eigen (MarketplaceGridView): Kleinanzeigen-
 * Layout mit Kategorien-Sidebar links + Inserate-Grid rechts.
 *
 * Alte MarketplaceView.tsx bleibt im Code (Backup, kann spaeter entfernt
 * werden — enthielt drei Welten als Pages mit 1-Slot-Layout).
 */
export const marketplaceModule: ModuleDefinition = {
  id: "marketplace",
  label: "Marktplatz",
  icon: ShoppingBag,
  fullWidth: true,
  View: MarketplaceGridView,
  itemTypes: [marketplaceSchema.itemType, "marketplace-booking"],
  requiredCapabilities: ["ItemWriter"],
}

export { marketplaceSchema } from "./marketplace-schema"
export type {
  MarketplaceData,
  MarketplaceKind,
  PriceType,
  ItemCondition,
  MarketplaceCategory,
} from "./marketplace-schema"
