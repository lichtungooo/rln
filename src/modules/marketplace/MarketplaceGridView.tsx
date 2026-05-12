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
  Plus,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  useItems,
  useCreateItem,
  useCurrentUser,
  Dialog,
  DialogContent,
  Button,
  Input,
  Label,
  Textarea,
} from "@real-life-stack/toolkit"
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
  RadiusFilter,
  DEFAULT_RADIUS_VALUE,
  isInRadius,
  type RadiusValue,
} from "../../components/RadiusFilter"
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
import { ImageGalleryInput } from "./ImageGalleryInput"
import { LocationPicker, type PickedLocation } from "../../components/LocationPicker"
import { LendCalendar } from "./LendCalendar"

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
    label: "Beduerfnisse",
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
  createdBy: string
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
  const [createOpen, setCreateOpen] = useState(false)

  const listItems: ListItem[] = useMemo(() => {
    return (items as Item[])
      .map((item) => ({
        id: item.id,
        data: item.data as MarketplaceData,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      }))
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  }, [items])

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "marketplace-sidebar":
        return <CategoriesSidebar items={listItems} />
      case "marketplace-listings":
        return (
          <ListingsGrid
            items={listItems}
            onCreateClick={() => setCreateOpen(true)}
          />
        )
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
    <>
      <PageGrid
        storageKey={`rln-marketplace-v2-pages-${spaceKey}`}
        defaultPages={pages}
        availableWidgets={widgets}
        renderWidget={renderWidget}
        lockPages
        mobileDrilldown
      />
      <ItemDetailModal items={listItems} spaceId={spaceId} />
      <ItemCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
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
    <div className="h-full w-full bg-green-50/60 rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 bg-green-100/40 flex items-center gap-2 shrink-0">
        <ShoppingBag className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Kategorien</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Welten */}
        <div className="px-2 py-2">
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
        <div className="px-2 py-2">
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

function ListingsGrid({
  items,
  onCreateClick,
}: {
  items: ListItem[]
  onCreateClick: () => void
}) {
  const channel = useChannel("marketplace-filter")
  const filterId = channel.selectedId ?? "world:all"
  const [query, setQuery] = useState("")
  const [radius, setRadius] = useState<RadiusValue>(DEFAULT_RADIUS_VALUE)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Auto-Complete: alle Hashtags + erste Wort-Tokens aus Titeln
  const suggestions = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      for (const tag of item.data.hashtags ?? []) {
        set.add(`#${tag}`)
      }
      const title = item.data.title ?? ""
      for (const word of title.split(/\s+/).slice(0, 3)) {
        const clean = word.toLowerCase().replace(/[^a-z0-9aeoeu]/g, "")
        if (clean.length >= 3) set.add(clean)
      }
    }
    return Array.from(set).sort()
  }, [items])

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q)
      .slice(0, 8)
  }, [suggestions, query])

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
    // Umkreis-Filter
    if (radius.enabled && radius.center) {
      result = result.filter((i) => isInRadius(i.data.location, radius))
    }
    return result
  }, [items, filterId, query, radius])

  return (
    <div className="h-full w-full bg-green-50/60 rounded-xl overflow-hidden flex flex-col">
      {/* Header: Suche + Umkreis + Anlegen */}
      <div className="px-3 py-2 bg-green-100/40 shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Was suchst du?"
              className="w-full h-8 pl-7 pr-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                <ul className="py-1">
                  {filteredSuggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setQuery(s.replace(/^#/, ""))
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                      >
                        <SearchIcon className="h-3 w-3 inline mr-1.5 text-muted-foreground" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onCreateClick}
            className="h-8 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Inserat
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {filtered.length} / {items.length}
          </span>
        </div>
        <RadiusFilter value={radius} onChange={setRadius} compact />
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
      className={`group text-left bg-white/80 rounded-xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] ${
        isSelected ? "ring-2 ring-primary" : ""
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
            BEDARF
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

// ============================================================
// Inserat-Detail Modal
// ============================================================

function ItemDetailModal({ items, spaceId }: { items: ListItem[]; spaceId: string | null }) {
  const channel = useChannel("marketplace-item")
  const item = items.find((i) => i.id === channel.selectedId) ?? null

  if (!item) return null

  const data = item.data
  const isNeed = data.kind === "need"
  const priceType = data.priceType
  const isLend = !isNeed && priceType === "lend"
  const CatIcon = data.category ? CATEGORY_ICON_MAP[data.category] : Sparkles
  const close = () => channel.select(null)

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) close() }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center gap-2 shrink-0">
            <CatIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold truncate">{data.title}</h2>
              <div className="text-[10px] text-muted-foreground">
                {data.category && CATEGORY_LABEL[data.category]}
                {isNeed && " · Bedarf"}
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body — scrollt */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Bilder */}
            {data.images && data.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.images.slice(0, 6).map((src, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] rounded-lg border bg-muted/40 overflow-hidden"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {(!data.images || data.images.length === 0) && (
              <div className="aspect-[4/2] rounded-lg border bg-gradient-to-br from-muted/40 to-muted/80 flex items-center justify-center">
                <CatIcon className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}

            {/* Preis */}
            {!isNeed && priceType && (
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 text-sm font-bold rounded-full text-white"
                  style={{ background: PRICE_TYPE_COLOR[priceType] }}
                >
                  {priceType === "sell" && data.priceAmount !== undefined
                    ? `${data.priceAmount} EUR`
                    : PRICE_TYPE_LABEL[priceType]}
                </span>
                {data.priceText && (
                  <span className="text-sm text-muted-foreground">
                    {data.priceText}
                  </span>
                )}
              </div>
            )}
            {isNeed && (
              <span className="inline-block px-3 py-1 text-sm font-bold rounded-full bg-blue-500 text-white">
                BEDARF
              </span>
            )}

            {/* Beschreibung */}
            {data.description && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  Beschreibung
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {data.hashtags && data.hashtags.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  Hashtags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Standort */}
            {data.location?.address && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  Standort
                </div>
                <div className="text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {data.location.address}
                </div>
              </div>
            )}

            {/* Verleih-Kalender bei priceType=lend */}
            {isLend && (
              <div className="pt-2 border-t">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
                  Verfuegbarkeit + Buchung
                </div>
                <LendCalendar
                  itemId={item.id}
                  ownerId={item.createdBy}
                  spaceId={spaceId}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Inserat-Anlegen Modal
// ============================================================

function ItemCreateModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const createItem = useCreateItem()
  const { data: currentUser } = useCurrentUser()

  const [kind, setKind] = useState<MarketplaceKind>("offer")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<MarketplaceCategory>("tool")
  const [priceType, setPriceType] = useState<PriceType>("sell")
  const [priceAmount, setPriceAmount] = useState<string>("")
  const [priceText, setPriceText] = useState<string>("")
  const [hashtagsInput, setHashtagsInput] = useState<string>("")
  const [location, setLocation] = useState<PickedLocation | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setKind("offer")
    setTitle("")
    setDescription("")
    setCategory("tool")
    setPriceType("sell")
    setPriceAmount("")
    setPriceText("")
    setHashtagsInput("")
    setLocation(null)
    setImages([])
    setError(null)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Titel fehlt")
      return
    }
    if (!currentUser?.id) {
      setError("Kein User angemeldet")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const hashtags = hashtagsInput
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").trim().toLowerCase())
        .filter(Boolean)

      const data: MarketplaceData = {
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priceType: kind === "offer" ? priceType : undefined,
        priceAmount:
          kind === "offer" && priceType === "sell" && priceAmount
            ? parseFloat(priceAmount)
            : undefined,
        priceText: priceText.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        images: images.length > 0 ? images : undefined,
        location: location
          ? { lat: location.lat, lng: location.lng, address: location.address }
          : undefined,
      }

      await createItem({
        type: ITEM_TYPE,
        createdBy: currentUser.id,
        data,
      })
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anlegen fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Neues Inserat</h2>

          <div className="flex gap-2">
            {(["offer", "need"] as MarketplaceKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 px-3 py-2 rounded-md border text-sm transition-colors ${
                  kind === k
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {k === "offer" ? "Ich biete" : "Ich brauche"}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-xs">Titel</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Akku-Bohrmaschine zu verleihen"
            />
          </div>

          <div>
            <Label className="text-xs">Beschreibung</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, Zustand, Termin..."
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Kategorie</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketplaceCategory)}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>

            {kind === "offer" && (
              <div>
                <Label className="text-xs">Preis-Typ</Label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as PriceType)}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  {ALL_PRICE_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {PRICE_TYPE_LABEL[pt]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {kind === "offer" && priceType === "sell" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Preis (EUR)</Label>
                <Input
                  type="number"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="z.B. 25"
                />
              </div>
              <div>
                <Label className="text-xs">Preis-Zusatz</Label>
                <Input
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  placeholder="z.B. VHB, Festpreis"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Hashtags</Label>
            <Input
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
              placeholder="holz, werkzeug, verleih"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Komma- oder Leerzeichen-getrennt.
            </p>
          </div>

          <div>
            <Label className="text-xs">Bilder</Label>
            <ImageGalleryInput value={images} onChange={setImages} max={5} />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Bis zu 5 Bilder. Erstes Bild wird auf der Card gezeigt.
            </p>
          </div>

          <div>
            <Label className="text-xs">Standort</Label>
            <LocationPicker value={location} onChange={setLocation} height={220} />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saving || !title.trim()}>
              {saving ? "Speichere..." : "Anlegen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Reference fuer MarketplaceKind import — sonst unused-warning
export type { MarketplaceKind }
