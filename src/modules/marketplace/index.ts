import { ShoppingBag } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { marketplaceSchema } from "./marketplace-schema"
import { MarketplaceView } from "./MarketplaceView"

/**
 * Marktplatz-Modul.
 *
 * Schema lebt in marketplace-schema.ts (Wahrheits-Quelle, Modul-Schmiede-
 * tauglich). Render-Komponente ist eigen (MarketplaceView), weil die
 * Kleinanzeigen-Optik mit Bildern, Preis-Badges und Hashtag-Pillen reicher
 * ist als der generische Schema-Renderer.
 */
export const marketplaceModule: ModuleDefinition = {
  id: "marketplace",
  label: "Marktplatz",
  icon: ShoppingBag,
  View: MarketplaceView,
  itemTypes: [marketplaceSchema.itemType],
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
