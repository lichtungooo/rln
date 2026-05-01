import { useMemo, useState } from "react"
import * as LucideIcons from "lucide-react"
import {
  Plus,
  ChevronLeft,
  MapPin,
  ShoppingBag,
  Search as SearchIcon,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useItems,
  useCurrentUser,
  useCreateItem,
  useDeleteItem,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import { TagInput } from "../profile/TagInput"
import {
  marketplaceSchema,
  PRICE_TYPE_LABEL,
  PRICE_TYPE_COLOR,
  CATEGORY_LABEL,
  CATEGORY_ICON,
  CONDITION_LABEL,
  type MarketplaceData,
  type MarketplaceKind,
  type PriceType,
  type ItemCondition,
  type MarketplaceCategory,
} from "./marketplace-schema"

/**
 * MarketplaceView — Marktplatz mit Kleinanzeigen-Optik.
 *
 * Drei Modi:
 *   - Liste: Cards mit Bild-Platzhalter, Preis-Badge, Kategorie-Chip, Hashtags
 *   - Detail: Volle Sicht mit Beschreibung, Standort, Hashtag-Pillen, Aktionen
 *   - Form: Anlegen mit "Anbieten/Suchen"-Toggle, Preis-Typ, Bedingungen
 *
 * Phase M1: Schema + Cards. Hashtag-Suche kommt in M2, Drei-Welten-Tabs in M3,
 * Verleih-Kalender in M4.
 */

const MARKETPLACE_ITEM_TYPE = marketplaceSchema.itemType

function CategoryIcon({
  category,
  className,
}: {
  category: MarketplaceCategory | undefined
  className?: string
}) {
  if (!category) return null
  const iconKey = CATEGORY_ICON[category] ?? "Package"
  const Icon = ((LucideIcons as unknown as Record<string, LucideIcon>)[iconKey] ??
    LucideIcons.Package) as LucideIcon
  return <Icon className={className} />
}

export function MarketplaceView({ spaceId: _spaceId }: ModuleViewProps) {
  const { data: items } = useItems({ type: MARKETPLACE_ITEM_TYPE })
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const activeItem = useMemo(() => {
    if (!activeId) return null
    return items.find((it) => it.id === activeId) ?? null
  }, [items, activeId])

  // Sortiert nach createdAt desc
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [items])

  // Detail-Modus
  if (activeItem) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveId(null)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurueck zur Liste
        </Button>
        <MarketplaceDetail
          item={activeItem}
          isOwner={activeItem.createdBy === currentUser?.id}
          onDelete={async () => {
            if (!confirm("Wirklich loeschen?")) return
            await deleteItem(activeItem.id)
            setActiveId(null)
          }}
        />
      </div>
    )
  }

  // Form-Modus
  if (creating) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreating(false)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurueck zur Liste
        </Button>
        <MarketplaceForm
          onCreated={(id) => {
            setCreating(false)
            setActiveId(id)
          }}
          onCancel={() => setCreating(false)}
          createItem={async (data) => {
            if (!currentUser?.id) return null
            const created = await createItem({
              type: MARKETPLACE_ITEM_TYPE,
              createdBy: currentUser.id,
              data: data as unknown as Record<string, unknown>,
            })
            return created ?? null
          }}
        />
      </div>
    )
  }

  // Liste-Modus
  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">Marktplatz</h1>
          <p className="text-sm text-muted-foreground">
            Werkzeug, Material, Ernte, Wissen — anbieten, suchen, verleihen, verschenken.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Neues Inserat
        </Button>
      </div>

      {sortedItems.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm">Noch nichts hier. Lege das erste Inserat an mit "+ Neues Inserat".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map((it) => (
            <MarketplaceCard
              key={it.id}
              item={it}
              onClick={() => setActiveId(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MarketplaceCard — Kleinanzeigen-Stil mit Bild-Slot, Preis-Badge
// ============================================================

function MarketplaceCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const data = item.data as MarketplaceData
  const isNeed = data.kind === "need"
  const priceType = data.priceType
  const firstImage = data.images?.[0]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] hover:border-primary/40"
    >
      {/* Bild-Slot */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/40 to-muted/80 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon
              category={data.category}
              className="h-14 w-14 text-muted-foreground/40 group-hover:scale-110 transition-transform"
            />
          </div>
        )}

        {/* Need-Marker */}
        {isNeed && (
          <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500 text-white shadow-md">
            <SearchIcon className="h-2.5 w-2.5 inline mr-1" />
            SUCHE
          </div>
        )}

        {/* Preis-Badge in der Ecke */}
        {!isNeed && priceType && (
          <PriceBadge priceType={priceType} priceAmount={data.priceAmount} className="absolute top-2 right-2" />
        )}
      </div>

      {/* Text */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{data.title}</h3>

        {/* Kategorie + Zustand */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {data.category && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              <CategoryIcon category={data.category} className="h-2.5 w-2.5" />
              {CATEGORY_LABEL[data.category]}
            </span>
          )}
          {data.condition && !isNeed && (
            <span className="text-muted-foreground/70">· {CONDITION_LABEL[data.condition]}</span>
          )}
        </div>

        {/* Hashtags max 3 */}
        {data.hashtags && data.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-primary/80">
                #{tag}
              </span>
            ))}
            {data.hashtags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{data.hashtags.length - 3}</span>
            )}
          </div>
        )}

        {/* Standort */}
        {data.location?.address && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
            <MapPin className="h-2.5 w-2.5" />
            <span className="truncate">{data.location.address}</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ============================================================
// PriceBadge — farbige Preis-Anzeige
// ============================================================

function PriceBadge({
  priceType,
  priceAmount,
  className = "",
}: {
  priceType: PriceType
  priceAmount?: number
  className?: string
}) {
  const color = PRICE_TYPE_COLOR[priceType]
  const label =
    priceType === "sell" && priceAmount !== undefined
      ? `${priceAmount} EUR`
      : PRICE_TYPE_LABEL[priceType]
  return (
    <span
      className={`px-2 py-1 text-[11px] font-bold rounded-md text-white shadow-md ${className}`}
      style={{ background: color }}
    >
      {label}
    </span>
  )
}

// ============================================================
// MarketplaceDetail — Volle Sicht
// ============================================================

function MarketplaceDetail({
  item,
  isOwner,
  onDelete,
}: {
  item: Item
  isOwner: boolean
  onDelete: () => Promise<void>
}) {
  const data = item.data as MarketplaceData
  const isNeed = data.kind === "need"
  const priceType = data.priceType

  return (
    <Card>
      {/* Bild-Sektion */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-muted/40 to-muted/80 overflow-hidden rounded-t-xl">
        {data.images?.[0] ? (
          <img src={data.images[0]} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon category={data.category} className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}

        {isNeed && (
          <div className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white shadow-lg">
            <SearchIcon className="h-3 w-3 inline mr-1" />
            GESUCHT
          </div>
        )}

        {!isNeed && priceType && (
          <PriceBadge
            priceType={priceType}
            priceAmount={data.priceAmount}
            className="absolute top-3 right-3 !text-base !px-3 !py-1.5"
          />
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-2xl leading-tight">{data.title}</CardTitle>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {data.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
              <CategoryIcon category={data.category} className="h-3 w-3" />
              {CATEGORY_LABEL[data.category]}
            </span>
          )}
          {data.condition && !isNeed && (
            <span className="px-2 py-0.5 rounded-full bg-muted">{CONDITION_LABEL[data.condition]}</span>
          )}
          {data.priceText && (
            <span className="text-muted-foreground italic">{data.priceText}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {data.description && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.description}</p>
        )}

        {data.hashtags && data.hashtags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
              Hashtags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.location?.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{data.location.address}</span>
          </div>
        )}
      </CardContent>

      {isOwner && (
        <div className="border-t p-3 flex justify-end gap-2 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Loeschen
          </Button>
        </div>
      )}
    </Card>
  )
}

// ============================================================
// MarketplaceForm — Anlegen mit Kleinanzeigen-Maske
// ============================================================

function MarketplaceForm({
  onCreated,
  onCancel,
  createItem,
}: {
  onCreated: (id: string) => void
  onCancel: () => void
  createItem: (data: MarketplaceData) => Promise<Item | null>
}) {
  const [kind, setKind] = useState<MarketplaceKind>("offer")
  const [priceType, setPriceType] = useState<PriceType>("sell")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<MarketplaceCategory | "">("")
  const [condition, setCondition] = useState<ItemCondition | "">("")
  const [priceAmount, setPriceAmount] = useState<number | "">("")
  const [priceText, setPriceText] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [address, setAddress] = useState("")
  const [busy, setBusy] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    setBusy(true)
    try {
      const data: MarketplaceData = {
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        category: (category || undefined) as MarketplaceCategory | undefined,
        priceType: kind === "offer" ? priceType : undefined,
        priceAmount:
          kind === "offer" && priceType === "sell" && typeof priceAmount === "number"
            ? priceAmount
            : undefined,
        priceText: priceText.trim() || undefined,
        condition:
          kind === "offer" && (priceType === "sell" || priceType === "gift")
            ? ((condition || undefined) as ItemCondition | undefined)
            : undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        location: address.trim() ? { lat: 0, lng: 0, address: address.trim() } : undefined,
      }
      const created = await createItem(data)
      if (created) onCreated(created.id)
      else onCancel()
    } finally {
      setBusy(false)
    }
  }

  const showCondition =
    kind === "offer" && (priceType === "sell" || priceType === "gift")
  const showPrice = kind === "offer" && priceType === "sell"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Neues Inserat</CardTitle>
        <p className="text-xs text-muted-foreground">
          Klar und konkret: Was, wie, wo. Hashtags helfen beim Finden.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Anbieten / Suchen */}
        <div>
          <Label className="text-xs mb-1.5 block">Bietest du an oder suchst du?</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "offer", label: "Ich biete an" },
                { id: "need", label: "Ich suche" },
              ] as { id: MarketplaceKind; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setKind(opt.id)}
                className={`p-3 rounded-md border-2 text-sm font-semibold transition-all ${
                  kind === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preis-Typ — nur bei Anbieten */}
        {kind === "offer" && (
          <div>
            <Label className="text-xs mb-1.5 block">Wie?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(PRICE_TYPE_LABEL) as PriceType[]).map((pt) => {
                const isOn = priceType === pt
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPriceType(pt)}
                    className={`p-2.5 rounded-md border-2 text-xs font-semibold transition-all ${
                      isOn ? "text-white" : "bg-card hover:border-muted-foreground/40 border-border"
                    }`}
                    style={isOn ? { background: PRICE_TYPE_COLOR[pt], borderColor: PRICE_TYPE_COLOR[pt] } : undefined}
                  >
                    {PRICE_TYPE_LABEL[pt]}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Titel */}
        <div>
          <Label className="text-xs">Titel *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "offer"
                ? "z.B. 'Akkuschrauber Bosch 18V mit 2 Akkus'"
                : "z.B. 'Suche Holzspalter zum Leihen'"
            }
          />
        </div>

        {/* Beschreibung */}
        <div>
          <Label className="text-xs">Beschreibung</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mehr Details — Zustand, Zubehoer, Bedingungen, Zeitraum, Lieferung."
            className="min-h-24"
          />
        </div>

        {/* Kategorie */}
        <div>
          <Label className="text-xs">Kategorie</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MarketplaceCategory | "")}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">- waehlen -</option>
            {(Object.keys(CATEGORY_LABEL) as MarketplaceCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        {/* Zustand — nur bei sell/gift */}
        {showCondition && (
          <div>
            <Label className="text-xs">Zustand</Label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition | "")}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">- waehlen -</option>
              {(Object.keys(CONDITION_LABEL) as ItemCondition[]).map((c) => (
                <option key={c} value={c}>
                  {CONDITION_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Preis */}
        {showPrice && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Preis (EUR)</Label>
              <Input
                type="number"
                min="0"
                step="0.50"
                value={priceAmount === "" ? "" : priceAmount}
                onChange={(e) => setPriceAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="35"
              />
            </div>
            <div>
              <Label className="text-xs">Hinweis</Label>
              <Input
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="VHB / Pfand / festpreis"
              />
            </div>
          </div>
        )}

        {/* Tausch-Text */}
        {kind === "offer" && priceType === "exchange" && (
          <div>
            <Label className="text-xs">Tausch gegen</Label>
            <Input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="z.B. 'Holz, Hilfe beim Umzug, ein Honigglas'"
            />
          </div>
        )}

        {/* Hashtags */}
        <div>
          <Label className="text-xs">Hashtags</Label>
          <TagInput
            value={hashtags}
            onChange={(next) => setHashtags(next as string[])}
            placeholder="z.B. holz, berlin, verleih"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Ohne #-Zeichen — erscheinen automatisch als Pillen.
          </p>
        </div>

        {/* Standort */}
        <div>
          <Label className="text-xs">Standort (Adresse)</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="z.B. 'Berlin-Kreuzberg' oder 'Hofstrasse 12, 22301 Hamburg'"
          />
        </div>
      </CardContent>

      <div className="border-t p-4 flex justify-end gap-2 bg-muted/20">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={handleCreate} disabled={busy || !title.trim()}>
          {busy ? "Lege an..." : "Inserieren"}
        </Button>
      </div>
    </Card>
  )
}
