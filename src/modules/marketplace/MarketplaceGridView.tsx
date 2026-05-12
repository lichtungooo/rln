import { useMemo, useState } from "react"
import {
  ShoppingBag,
  Search as SearchIcon,
  Package,
  HandHeart,
  Lightbulb,
  MapPin,
  Sparkles,
  Wrench,
  Box,
  Apple,
  BookOpen,
  Hammer,
  Briefcase,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { useItems } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import {
  PageGrid,
  type GridPage,
  type AvailableWidget,
} from "../../components/PageGrid"
import {
  SelectionProvider,
  useChannel,
  useChannelSync,
} from "../../components/SelectionContext"
import {
  marketplaceSchema,
  PRICE_TYPE_LABEL,
  PRICE_TYPE_COLOR,
  CATEGORY_LABEL,
  type MarketplaceData,
  type MarketplaceKind,
  type PriceType,
  type MarketplaceCategory,
} from "./marketplace-schema"

/**
 * MarketplaceGridView — Marktplatz im Kleinanzeigen-Layout.
 *
 * Aufbau (Modul-Doktrin):
 *   - PageGrid mit lockPages, mobileDrilldown
 *   - 2 Slots: Kategorien-Sidebar (colSpan 2) · Inserate-Liste (colSpan 4)
 *   - Klick-Routing ueber Channel "marketplace-filter"
 *
 * Vorbild: kleinanzeigen.de — klare Kategorien links, dichtes Karten-Grid
 * rechts. Anders bei uns: drei Welten (Sachen / Begabungen / Suche) statt
 * eine Welt mit "Verkaufen/Suchen"-Toggle.
 */

const ITEM_TYPE = marketplaceSchema.itemType

// ============================================================
// Welten + Filter-Definitionen
// ============================================================

type WorldId = "all" | "things" | "talents" | "needs"

interface WorldDef {
  id: WorldId
  label: string
  hint: string
  icon: LucideIcon
  matches: (item: ListItem) => boolean
}

const WORLDS: WorldDef[] = [
  {
    id: "all",
    label: "Alle Inserate",
    hint: "Sachen, Begabungen, Gesuche",
    icon: ShoppingBag,
    matches: () => true,
  },
  {
    id: "things",
    label: "Sachen",
    hint: "Verkaufen, Verschenken, Verleihen, Tauschen",
    icon: Package,
    matches: (item) =>
      item.data.kind === "offer" && item.data.category !== "knowledge" && item.data.category !== "service",
  },
  {
    id: "talents",
    label: "Begabungen",
    hint: "Wissen, Werkstatt-Zeit, Dienstleistungen",
    icon: HandHeart,
    matches: (item) =>
      item.data.kind === "offer" &&
      (item.data.category === "knowledge" ||
        item.data.category === "service" ||
        item.data.category === "workspace"),
  },
  {
    id: "needs",
    label: "Suche",
    hint: "Was gerade gebraucht wird",
    icon: Lightbulb,
    matches: (item) => item.data.kind === "need",
  },
]

// Kategorien-Icons
const CATEGORY_ICON_MAP: Record<MarketplaceCategory, LucideIcon> = {
  tool: Wrench,
  material: Box,
  produce: Apple,
  knowledge: BookOpen,
  workspace: Hammer,
  service: Briefcase,
  other: Sparkles,
}

const ALL_PRICE_TYPES: PriceType[] = ["sell", "gift", "lend", "exchange"]
const ALL_CATEGORIES: MarketplaceCategory[] = [
  "tool",
  "material",
  "produce",
  "knowledge",
  "workspace",
  "service",
  "other",
]

interface ListItem {
  id: string
  data: MarketplaceData
  createdAt: string
}

// ============================================================
// Container
// ============================================================

export function MarketplaceGridView(props: ModuleViewProps) {
  const { spaceId, activeGroup } = props
  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte ein Netzwerk waehlen, um den Marktplatz zu oeffnen.
        </p>
      </div>
    )
  }

  const spaceKey = spaceId ?? "default"
  return (
    <SelectionProvider storageKey={`rln-marketplace-v2-${spaceKey}`}>
      <MarketplaceContent spaceId={spaceId} />
    </SelectionProvider>
  )
}

function MarketplaceContent({ spaceId }: { spaceId: string | null }) {
  const spaceKey = spaceId ?? "default"
  const { data: items } = useItems({ type: ITEM_TYPE })

  const listItems: ListItem[] = useMemo(() => {
    return (items as Item[])
      .map((item) => ({
        id: item.id,
        data: item.data as MarketplaceData,
        createdAt: item.createdAt,
      }))
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  }, [items])

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "marketplace-sidebar":
        return <CategoriesSidebar items={listItems} />
      case "marketplace-listings":
        return <ListingsGrid items={listItems} />
      default:
        return null
    }
  }

  const pages: GridPage[] = [
    {
      id: "main",
      name: "Marktplatz",
      slots: [
        { id: "s1", widget: "marketplace-sidebar", colSpan: 2, rowSpan: 4 },
        { id: "s2", widget: "marketplace-listings", colSpan: 4, rowSpan: 4 },
      ],
    },
  ]

  const widgets: AvailableWidget[] = [
    { id: "marketplace-sidebar", label: "Kategorien", defaultColSpan: 2, defaultRowSpan: 4 },
    { id: "marketplace-listings", label: "Inserate", defaultColSpan: 4, defaultRowSpan: 4 },
  ]

  return (
    <PageGrid
      storageKey={`rln-marketplace-v2-pages-${spaceKey}`}
      defaultPages={pages}
      availableWidgets={widgets}
      renderWidget={renderWidget}
      lockPages
      mobileDrilldown
    />
  )
}

// ============================================================
// Kategorien-Sidebar (Slot 1)
// ============================================================

function CategoriesSidebar({ items }: { items: ListItem[] }) {
  const channel = useChannel("marketplace-filter")
  const selectedId = channel.selectedId ?? "world:all"

  // Filter-Optionen registrieren
  const allFilterIds = useMemo(
    () => [
      ...WORLDS.map((w) => ({ id: `world:${w.id}` })),
      ...ALL_PRICE_TYPES.map((pt) => ({ id: `price:${pt}` })),
      ...ALL_CATEGORIES.map((c) => ({ id: `cat:${c}` })),
    ],
    []
  )
  useChannelSync("marketplace-filter", allFilterIds)

  const countWorld = (world: WorldDef) =>
    items.filter((item) => world.matches(item)).length
  const countPrice = (pt: PriceType) =>
    items.filter((i) => i.data.kind === "offer" && i.data.priceType === pt).length
  const countCategory = (c: MarketplaceCategory) =>
    items.filter((i) => i.data.category === c).length

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <ShoppingBag className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Kategorien</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Welten */}
        <div className="px-2 py-2 border-b">
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground px-1 pb-1">
            Welten
          </div>
          <ul className="space-y-0.5">
            {WORLDS.map((w) => {
              const Icon = w.icon
              const fid = `world:${w.id}`
              const isActive = selectedId === fid
              const count = countWorld(w)
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => channel.select(fid)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">{w.label}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Preistypen */}
        <div className="px-2 py-2 border-b">
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground px-1 pb-1">
            Preis
          </div>
          <ul className="space-y-0.5">
            {ALL_PRICE_TYPES.map((pt) => {
              const fid = `price:${pt}`
              const isActive = selectedId === fid
              const count = countPrice(pt)
              return (
                <li key={pt}>
                  <button
                    type="button"
                    onClick={() => channel.select(fid)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 border"
                      style={{ background: PRICE_TYPE_COLOR[pt] }}
                    />
                    <span className="flex-1 truncate">{PRICE_TYPE_LABEL[pt]}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Kategorien */}
        <div className="px-2 py-2">
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground px-1 pb-1">
            Kategorien
          </div>
          <ul className="space-y-0.5">
            {ALL_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON_MAP[c]
              const fid = `cat:${c}`
              const isActive = selectedId === fid
              const count = countCategory(c)
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => channel.select(fid)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">{CATEGORY_LABEL[c]}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Inserate-Grid (Slot 2)
// ============================================================

function ListingsGrid({ items }: { items: ListItem[] }) {
  const channel = useChannel("marketplace-filter")
  const filterId = channel.selectedId ?? "world:all"
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let result = items
    // Filter anwenden
    if (filterId.startsWith("world:")) {
      const worldId = filterId.slice("world:".length) as WorldId
      const world = WORLDS.find((w) => w.id === worldId)
      if (world) result = result.filter(world.matches)
    } else if (filterId.startsWith("price:")) {
      const pt = filterId.slice("price:".length) as PriceType
      result = result.filter(
        (i) => i.data.kind === "offer" && i.data.priceType === pt
      )
    } else if (filterId.startsWith("cat:")) {
      const c = filterId.slice("cat:".length) as MarketplaceCategory
      result = result.filter((i) => i.data.category === c)
    }
    // Suche
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter((i) => {
        const title = i.data.title?.toLowerCase() ?? ""
        const desc = i.data.description?.toLowerCase() ?? ""
        const tags = (i.data.hashtags ?? []).join(" ").toLowerCase()
        const address = i.data.location?.address?.toLowerCase() ?? ""
        return (
          title.includes(q) ||
          desc.includes(q) ||
          tags.includes(q) ||
          address.includes(q)
        )
      })
    }
    return result
  }, [items, filterId, query])

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      {/* Header: Suche + Aktionen */}
      <div className="px-3 py-2 border-b shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Was suchst du?"
              className="w-full h-8 pl-7 pr-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {filtered.length} / {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Umkreis-Filter folgt — bald hier Pin + Schieberegler</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground italic">
            {items.length === 0
              ? "Noch keine Inserate. Lege das erste an."
              : "Kein Inserat passt zu Filter + Suche."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Inserat-Card
// ============================================================

function ListingCard({ item }: { item: ListItem }) {
  const data = item.data
  const isNeed = data.kind === "need"
  const priceType = data.priceType
  const firstImage = data.images?.[0]
  const CatIcon = data.category ? CATEGORY_ICON_MAP[data.category] : Sparkles

  const itemChannel = useChannel("marketplace-item")
  const isSelected = itemChannel.selectedId === item.id

  return (
    <button
      type="button"
      onClick={() => itemChannel.select(item.id)}
      className={`group text-left bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] hover:border-primary/40 ${
        isSelected ? "border-primary ring-2 ring-primary/30" : ""
      }`}
    >
      {/* Bild */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/40 to-muted/80 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CatIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {isNeed && (
          <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white shadow">
            SUCHE
          </div>
        )}
        {!isNeed && priceType && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full text-white shadow"
            style={{ background: PRICE_TYPE_COLOR[priceType] }}
          >
            {data.priceType === "sell" && data.priceAmount !== undefined
              ? `${data.priceAmount} EUR`
              : PRICE_TYPE_LABEL[priceType]}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-2.5 space-y-1">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
          {data.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {data.category && (
            <span className="inline-flex items-center gap-1">
              <CatIcon className="h-2.5 w-2.5" />
              {CATEGORY_LABEL[data.category]}
            </span>
          )}
          {data.location?.address && (
            <>
              <span>·</span>
              <span className="truncate">{data.location.address}</span>
            </>
          )}
        </div>
        {data.hashtags && data.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {data.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] text-primary/70">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

// Reference fuer MarketplaceKind import — sonst unused-warning
export type { MarketplaceKind }
