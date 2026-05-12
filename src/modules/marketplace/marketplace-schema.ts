import type { ModuleSchema } from "../schema-types"

/**
 * Marktplatz — der Tausch-Raum eines Spaces.
 *
 * Items vom Typ "offer" mit Anbieten/Suchen-Modus (kind), Preis-Typ (sell /
 * gift / lend / exchange), Zustand, Kategorie, Hashtags und Standort.
 *
 * Wichtig: das Schema bleibt die Wahrheits-Quelle (Modul-Schmiede kann es
 * editieren). Die Render-Komponente (MarketplaceView) ist eigen, weil die
 * Kleinanzeigen-Optik mit Preis-Badge, Bildern, Kategorie-Chips reicher
 * ist als der generische Schema-Renderer.
 */

export type MarketplaceKind = "offer" | "need"
export type PriceType = "sell" | "gift" | "lend" | "exchange"
export type ItemCondition = "new" | "like_new" | "used" | "for_parts"
export type MarketplaceCategory =
  | "tool"
  | "material"
  | "produce"
  | "knowledge"
  | "workspace"
  | "service"
  | "other"

export interface MarketplaceData {
  kind: MarketplaceKind
  title: string
  description?: string
  category?: MarketplaceCategory
  /** Nur relevant bei kind=offer */
  priceType?: PriceType
  /** Nur relevant bei priceType=sell — Betrag in EUR */
  priceAmount?: number
  /** Frei-Text-Zusatz: "VHB", "Pfand 50 EUR", "Tausch gegen Holz" */
  priceText?: string
  /** Zustand bei sell/gift */
  condition?: ItemCondition
  /** Hashtags zum Suchen — ohne #-Zeichen */
  hashtags?: string[]
  /** Bild-URLs / data-uri (Phase: nur Anzeige, Upload kommt spaeter) */
  images?: string[]
  /** Standort */
  location?: { lat: number; lng: number; address?: string }
  /** Bei lend: Verlinkung zu einem Verleih-Kalender (kommt M4) */
  rentCalendarId?: string
  /** Demo-Marker */
  isDemo?: boolean
}

export const PRICE_TYPE_LABEL: Record<PriceType, string> = {
  sell: "Verkaufen",
  gift: "Verschenken",
  lend: "Verleihen",
  exchange: "Tauschen",
}

export const PRICE_TYPE_COLOR: Record<PriceType, string> = {
  sell: "#10B981",     // gruen
  gift: "#A855F7",     // lila
  lend: "#F59E0B",     // bernstein
  exchange: "#3B82F6", // blau
}

export const CATEGORY_LABEL: Record<MarketplaceCategory, string> = {
  tool: "Werkzeug",
  material: "Material",
  produce: "Ernte / Rohstoff",
  knowledge: "Wissen",
  workspace: "Werkstatt",
  service: "Dienstleistung",
  other: "Anderes",
}

export const CATEGORY_ICON: Record<MarketplaceCategory, string> = {
  tool: "Wrench",
  material: "Box",
  produce: "Apple",
  knowledge: "BookOpen",
  workspace: "Hammer",
  service: "Sparkles",
  other: "Package",
}

export const CONDITION_LABEL: Record<ItemCondition, string> = {
  new: "Neu",
  like_new: "Sehr gut",
  used: "Gebraucht",
  for_parts: "Defekt / fuer Bastler",
}

export const marketplaceSchema: ModuleSchema = {
  id: "marketplace",
  label: "Marktplatz",
  description: "Anbieten, Suchen, Verleihen, Verschenken — Werkzeug, Material, Ernte, Wissen.",
  icon: "ShoppingBag",
  itemType: "offer",
  version: "0.2.0",
  license: "MIT",
  tags: ["macher", "tausch", "leihen", "verschenken", "werkstatt"],

  fields: [
    {
      id: "kind",
      label: "Anbieten oder Suchen?",
      type: "select",
      visibility: "public",
      required: true,
      options: [
        { value: "offer", label: "Ich biete an" },
        { value: "need", label: "Ich suche" },
      ],
      order: 5,
    },
    {
      id: "priceType",
      label: "Wie?",
      type: "select",
      visibility: "public",
      options: [
        { value: "sell", label: "Verkaufen" },
        { value: "gift", label: "Verschenken" },
        { value: "lend", label: "Verleihen" },
        { value: "exchange", label: "Tauschen" },
      ],
      hint: "Nur bei 'Anbieten'",
      order: 10,
    },
    {
      id: "title",
      label: "Titel",
      type: "text",
      visibility: "public",
      required: true,
      placeholder: "z.B. 'Akkuschrauber Bosch 18V' oder 'Suche Holzspalter'",
      order: 20,
    },
    {
      id: "description",
      label: "Beschreibung",
      type: "textarea",
      visibility: "public",
      placeholder: "Mehr Details — Zustand, Bedingungen, Zeitraum, Lieferung, ...",
      maxLength: 1500,
      order: 30,
    },
    {
      id: "category",
      label: "Kategorie",
      type: "select",
      visibility: "public",
      options: [
        { value: "tool", label: "Werkzeug" },
        { value: "material", label: "Material" },
        { value: "produce", label: "Ernte / Rohstoff" },
        { value: "knowledge", label: "Wissen" },
        { value: "workspace", label: "Werkstatt-Zeit" },
        { value: "service", label: "Dienstleistung" },
        { value: "other", label: "Anderes" },
      ],
      order: 40,
    },
    {
      id: "condition",
      label: "Zustand",
      type: "select",
      visibility: "public",
      options: [
        { value: "new", label: "Neu" },
        { value: "like_new", label: "Sehr gut" },
        { value: "used", label: "Gebraucht" },
        { value: "for_parts", label: "Defekt / fuer Bastler" },
      ],
      hint: "Nur bei Sachen — bei Wissen / Service nicht relevant",
      order: 50,
    },
    {
      id: "priceAmount",
      label: "Preis (EUR)",
      type: "number",
      visibility: "public",
      placeholder: "z.B. 35",
      hint: "Nur bei 'Verkaufen'",
      order: 60,
    },
    {
      id: "priceText",
      label: "Preis-Hinweis",
      type: "text",
      visibility: "public",
      placeholder: "z.B. 'VHB', 'Pfand 50 EUR', 'Tausch gegen Holz'",
      order: 65,
    },
    {
      id: "hashtags",
      label: "Hashtags",
      type: "tags",
      visibility: "public",
      hint: "Fuer Suche und Discovery — z.B. #holz #berlin #verleih",
      placeholder: "Tippe ein Wort und Enter",
      order: 70,
    },
    {
      id: "location",
      label: "Standort",
      type: "location",
      visibility: "public",
      hint: "Pin auf der Karte (optional)",
      order: 80,
    },
  ],

  layouts: [
    {
      id: "cards",
      type: "cards",
      label: "Karten",
      icon: "LayoutGrid",
      config: {
        titleField: "title",
        descriptionField: "description",
        badgeFields: ["kind", "category"],
        imageField: "images",
      },
    },
    {
      id: "map",
      type: "map",
      label: "Karte",
      icon: "Map",
      config: {
        locationField: "location",
        titleField: "title",
        pinColor: {
          field: "kind",
          map: {
            offer: "#E8751A",
            need: "#3b82f6",
          },
        },
      },
    },
  ],
  defaultLayout: "cards",

  actions: [
    {
      id: "create",
      label: "Anbieten / Suchen",
      icon: "Plus",
      type: "create",
      placement: ["toolbar"],
    },
    {
      id: "delete",
      label: "Loeschen",
      type: "delete",
      placement: ["detail"],
      when: { ownerOnly: true },
    },
  ],

  filters: [
    { fieldId: "title", type: "search", label: "Suche" },
    { fieldId: "kind", type: "select", label: "Art" },
    { fieldId: "priceType", type: "select", label: "Wie" },
    { fieldId: "category", type: "select", label: "Kategorie" },
    { fieldId: "hashtags", type: "tags", label: "Hashtags" },
  ],

  sortOptions: [
    { id: "newest", label: "Neueste zuerst", fieldId: "createdAt", direction: "desc" },
    { id: "oldest", label: "Aelteste zuerst", fieldId: "createdAt", direction: "asc" },
  ],
  defaultSort: "newest",

  requiredCapabilities: ["ItemWriter"],
}
