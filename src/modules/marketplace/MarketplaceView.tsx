import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import * as LucideIcons from "lucide-react"
import {
  Plus,
  ChevronLeft,
  MapPin,
  ShoppingBag,
  Search as SearchIcon,
  Trash2,
  X,
  Hash,
  Filter as FilterIcon,
  Package,
  Lightbulb,
  HandHeart,
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
  useMembers,
} from "@real-life-stack/toolkit"
import type { User } from "@real-life-stack/data-interface"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import { TagInput } from "../profile/TagInput"
import { ImageGalleryInput } from "./ImageGalleryInput"
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
import { LendCalendar } from "./LendCalendar"

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

type WorldId = "things" | "talents" | "needs"

const WORLDS: Array<{
  id: WorldId
  label: string
  shortLabel: string
  icon: LucideIcon
  hint: string
  emptyHint: string
  color: string
}> = [
  {
    id: "things",
    label: "Sachen",
    shortLabel: "Sachen",
    icon: Package,
    hint: "Werkzeug, Material, Ernte, Werkstatt-Zeit",
    emptyHint: "Noch keine Sachen — Werkzeug, Material oder Ernte gehoert hierher.",
    color: "#E8751A",
  },
  {
    id: "talents",
    label: "Begabungen",
    shortLabel: "Begabungen",
    icon: Lightbulb,
    hint: "Wissen, Dienstleistungen, Faehigkeiten",
    emptyHint: "Noch keine Begabungen — was kannst du, das andere brauchen?",
    color: "#A855F7",
  },
  {
    id: "needs",
    label: "Beduerfnisse",
    shortLabel: "Beduerfnisse",
    icon: HandHeart,
    hint: "Was wird gesucht — Material, Hilfe, Begleitung",
    emptyHint: "Noch keine Beduerfnisse — was suchst du oder die Gemeinschaft?",
    color: "#3B82F6",
  },
]

/**
 * Sachen vs Begabungen unterscheidet sich an der Kategorie:
 *   Sachen:     tool, material, produce, workspace, other
 *   Begabungen: knowledge, service
 * Beduerfnisse: alles wo kind === "need" (egal Kategorie)
 */
function worldOf(data: MarketplaceData): WorldId {
  if (data.kind === "need") return "needs"
  const cat = data.category
  if (cat === "knowledge" || cat === "service") return "talents"
  return "things"
}

/**
 * Liste-Eintrag: entweder echtes Item oder virtuell aus Profile-Extension.
 * Virtuelle Items sind read-only, klick fuehrt zum Profil-Inhaber.
 */
type ListEntry =
  | { kind: "real"; id: string; createdBy: string; createdAt: string; data: MarketplaceData; item: Item }
  | {
      kind: "virtual"
      id: string
      createdBy: string
      createdAt: string
      data: MarketplaceData
      sourceProfileId: string
      ownerName: string
    }

/**
 * Wandelt eine Profile-Extension in 0..N virtuelle Marketplace-Items um.
 * skills + offers landen als Begabungen (kind=offer + category=knowledge/service),
 * needs als Beduerfnisse (kind=need).
 */
function profileToVirtualEntries(profile: Item, members: User[]): ListEntry[] {
  const data = profile.data as Record<string, unknown>
  const owner = members.find((m) => m.id === profile.createdBy)
  const ownerName =
    (typeof data.name === "string" && data.name.trim()) ||
    owner?.displayName ||
    profile.createdBy.slice(0, 8)
  const location = (data.location as MarketplaceData["location"]) ?? undefined
  const baseHashtags = Array.isArray(data.hashtags) ? (data.hashtags as string[]) : []
  const result: ListEntry[] = []

  const make = (
    suffix: string,
    title: string,
    role: "skill" | "offer" | "need",
  ): ListEntry => {
    const isNeed = role === "need"
    const category: MarketplaceCategory = role === "offer" ? "service" : "knowledge"
    const description =
      role === "skill"
        ? `Faehigkeit aus dem Profil von ${ownerName}.`
        : role === "offer"
        ? `Angebot aus dem Profil von ${ownerName}.`
        : `Aus dem Profil von ${ownerName} — ${ownerName} sucht das in der Gemeinschaft.`
    return {
      kind: "virtual",
      id: `profile:${profile.id}:${suffix}`,
      createdBy: profile.createdBy,
      createdAt: profile.createdAt,
      sourceProfileId: profile.id,
      ownerName,
      data: {
        kind: isNeed ? "need" : "offer",
        title,
        description,
        category,
        hashtags: baseHashtags.length > 0 ? baseHashtags : undefined,
        location,
      },
    }
  }

  const skills = Array.isArray(data.skills) ? (data.skills as string[]) : []
  for (const s of skills) {
    if (s && s.trim()) result.push(make(`skill-${s}`, s.trim(), "skill"))
  }

  const offers = Array.isArray(data.offers) ? (data.offers as string[]) : []
  for (const o of offers) {
    if (o && o.trim()) result.push(make(`offer-${o}`, o.trim(), "offer"))
  }

  const needs = Array.isArray(data.needs) ? (data.needs as string[]) : []
  for (const n of needs) {
    if (n && n.trim()) result.push(make(`need-${n}`, n.trim(), "need"))
  }

  return result
}

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

export function MarketplaceView({ spaceId }: ModuleViewProps) {
  const { data: items } = useItems({ type: MARKETPLACE_ITEM_TYPE })
  const { data: profileExtensions } = useItems({ type: "profile-extension" })
  const { data: members } = useMembers(spaceId)
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const { mutate: deleteItem } = useDeleteItem()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlItemId = searchParams.get("item")
  const [activeId, setActiveId] = useState<string | null>(urlItemId)
  const [creating, setCreating] = useState(false)

  // URL ↔ activeId Sync
  useEffect(() => {
    setActiveId(urlItemId)
  }, [urlItemId])

  const openItem = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("item", id)
      return next
    })
  }
  const closeItem = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("item")
      return next
    })
  }
  const [activeWorld, setActiveWorld] = useState<WorldId>("things")
  const [search, setSearch] = useState("")
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [showAllTags, setShowAllTags] = useState(false)

  // Liste-Eintraege: echte Marketplace-Items + virtuelle aus Profile-Extensions.
  // Virtuelle landen je nach Profil-Feld in Begabungen (skills/offers) oder
  // Beduerfnisse (needs) — Sachen-Welt bleibt nur fuer echte Inserate.
  const allEntries = useMemo<ListEntry[]>(() => {
    const real: ListEntry[] = items.map((it) => ({
      kind: "real",
      id: it.id,
      createdBy: it.createdBy,
      createdAt: it.createdAt,
      data: it.data as MarketplaceData,
      item: it,
    }))
    const virtual: ListEntry[] = profileExtensions.flatMap((p) =>
      profileToVirtualEntries(p, members)
    )
    return [...real, ...virtual]
  }, [items, profileExtensions, members])

  const activeEntry = useMemo<ListEntry | null>(() => {
    if (!activeId) return null
    return allEntries.find((e) => e.id === activeId) ?? null
  }, [allEntries, activeId])

  // Items pro Welt zaehlen (fuer Tab-Counter) — inklusive virtueller
  const worldCounts = useMemo(() => {
    const counts: Record<WorldId, number> = { things: 0, talents: 0, needs: 0 }
    for (const e of allEntries) counts[worldOf(e.data)]++
    return counts
  }, [allEntries])

  // Eintraege in der aktiven Welt — Basis fuer Hashtag-Aggregation und Filter
  const entriesInWorld = useMemo(
    () => allEntries.filter((e) => worldOf(e.data) === activeWorld),
    [allEntries, activeWorld]
  )

  // Alle Hashtags der aktiven Welt + ihre Haeufigkeit fuer den Filter-Bar
  const allHashtags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of entriesInWorld) {
      const tags = e.data.hashtags ?? []
      for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [entriesInWorld])

  // Gefilterte + sortierte Liste (innerhalb der aktiven Welt)
  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return entriesInWorld
      .filter((e) => {
        const data = e.data
        if (activeTags.size > 0) {
          const tags = data.hashtags ?? []
          for (const t of activeTags) {
            if (!tags.includes(t)) return false
          }
        }
        if (needle) {
          const haystack = [
            data.title,
            data.description,
            (data.hashtags ?? []).join(" "),
            data.location?.address,
            data.priceText,
            e.kind === "virtual" ? e.ownerName : "",
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          if (!haystack.includes(needle)) return false
        }
        return true
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [entriesInWorld, search, activeTags])

  const switchWorld = (w: WorldId) => {
    setActiveWorld(w)
    // Hashtag-Filter haengt an der Welt — bei Wechsel leeren, damit die alten
    // Tags nicht in einer Welt rumirren wo sie nichts finden.
    setActiveTags(new Set())
  }
  const activeWorldDef = WORLDS.find((w) => w.id === activeWorld) ?? WORLDS[0]

  const toggleTag = (tag: string) => {
    const next = new Set(activeTags)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    setActiveTags(next)
  }
  const clearFilters = () => {
    setActiveTags(new Set())
    setSearch("")
  }

  const visibleHashtags = showAllTags ? allHashtags : allHashtags.slice(0, 10)
  const hasActiveFilter = search.trim() || activeTags.size > 0

  // Detail-Modus
  if (activeEntry) {
    if (activeEntry.kind === "virtual") {
      return (
        <div className="container mx-auto max-w-3xl p-4">
          <Button variant="ghost" size="sm" onClick={closeItem} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurueck zur Liste
          </Button>
          <VirtualDetail entry={activeEntry} />
        </div>
      )
    }
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={closeItem}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurueck zur Liste
        </Button>
        <MarketplaceDetail
          item={activeEntry.item}
          spaceId={spaceId}
          isOwner={activeEntry.createdBy === currentUser?.id}
          onDelete={async () => {
            if (!confirm("Wirklich loeschen?")) return
            await deleteItem(activeEntry.item.id)
            closeItem()
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
            openItem(id)
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
            Drei Welten unter einem Dach — Sachen, Begabungen, Beduerfnisse.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Neues Inserat
        </Button>
      </div>

      {/* Welt-Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-muted">
        {WORLDS.map((w) => {
          const Icon = w.icon
          const isOn = activeWorld === w.id
          const count = worldCounts[w.id]
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => switchWorld(w.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                isOn ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              style={isOn ? { color: w.color } : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{w.label}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground -mt-2 px-1">
        {activeWorldDef.hint}
      </p>

      {/* Such- + Filter-Bar */}
      {entriesInWorld.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Volltext-Suche — Titel, Beschreibung, Hashtag, Standort..."
              className="pl-9 h-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Suche leeren"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Aktive Tags + Top-Tags */}
          {allHashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-0.5" />
              {/* Aktive Tags zuerst */}
              {Array.from(activeTags).map((tag) => (
                <button
                  key={`active-${tag}`}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary text-primary-foreground"
                >
                  <Hash className="h-2.5 w-2.5" />
                  {tag}
                  <X className="h-2.5 w-2.5 opacity-80" />
                </button>
              ))}
              {/* Vorgeschlagene Tags */}
              {visibleHashtags
                .filter(({ tag }) => !activeTags.has(tag))
                .map(({ tag, count }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Hash className="h-2.5 w-2.5" />
                    {tag}
                    <span className="text-[9px] opacity-60">{count}</span>
                  </button>
                ))}
              {allHashtags.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline ml-1"
                >
                  {showAllTags ? "weniger" : `+${allHashtags.length - 10} mehr`}
                </button>
              )}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  Filter loeschen
                </button>
              )}
            </div>
          )}

          {hasActiveFilter && (
            <div className="text-xs text-muted-foreground">
              {filteredEntries.length} {filteredEntries.length === 1 ? "Treffer" : "Treffer"}
              {filteredEntries.length === 0 && (
                <span> — versuche einen anderen Begriff oder einen anderen Hashtag</span>
              )}
            </div>
          )}
        </div>
      )}

      {allEntries.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm">Noch nichts hier. Lege das erste Inserat an mit "+ Neues Inserat".</p>
          </CardContent>
        </Card>
      ) : entriesInWorld.length === 0 ? (
        <EmptyWorld world={activeWorldDef} />
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <SearchIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm">Kein Treffer fuer deine Suche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <MarketplaceCard
              key={entry.id}
              entry={entry}
              onClick={() => openItem(entry.id)}
              onTagClick={(tag) => toggleTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// VirtualDetail — Detail-Sicht fuer Profil-Eintraege
// ============================================================

function VirtualDetail({
  entry,
}: {
  entry: Extract<ListEntry, { kind: "virtual" }>
}) {
  const data = entry.data
  const isNeed = data.kind === "need"

  return (
    <Card>
      <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-100 to-amber-50 dark:from-purple-950/30 dark:to-amber-950/20 overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon category={data.category} className="h-24 w-24 text-purple-500/40" />
        </div>
        <div className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-purple-500 text-white shadow-lg">
          aus Profil
        </div>
        {isNeed && (
          <div className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white shadow-lg">
            <SearchIcon className="h-3 w-3 inline mr-1" />
            GESUCHT
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-2xl leading-tight">{data.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {entry.ownerName} {isNeed ? "sucht das" : "bietet das an"}.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.description && (
          <p className="text-sm leading-relaxed">{data.description}</p>
        )}

        {data.hashtags && data.hashtags.length > 0 && (
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
        )}

        {data.location?.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{data.location.address}</span>
          </div>
        )}

        <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground border-l-4 border-purple-500/60">
          Dieser Eintrag stammt direkt aus dem Profil von <strong>{entry.ownerName}</strong>.
          Aenderungen passieren im Profil — nicht hier. Schreibe {entry.ownerName} an, wenn
          du in Kontakt kommen willst.
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// EmptyWorld — Hinweis pro Tab wenn die Welt leer ist
// ============================================================

function EmptyWorld({
  world,
}: {
  world: { label: string; icon: LucideIcon; emptyHint: string; color: string }
}) {
  const Icon = world.icon
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <Icon
          className="h-12 w-12 mx-auto mb-3 opacity-40"
          style={{ color: world.color }}
        />
        <p className="text-sm text-muted-foreground">{world.emptyHint}</p>
      </CardContent>
    </Card>
  )
}

// ============================================================
// MarketplaceCard — Kleinanzeigen-Stil mit Bild-Slot, Preis-Badge
// ============================================================

function MarketplaceCard({
  entry,
  onClick,
  onTagClick,
}: {
  entry: ListEntry
  onClick: () => void
  onTagClick?: (tag: string) => void
}) {
  const data = entry.data
  const isNeed = data.kind === "need"
  const priceType = data.priceType
  const firstImage = data.images?.[0]
  const isVirtual = entry.kind === "virtual"
  const ownerName = isVirtual ? entry.ownerName : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className="group cursor-pointer text-left bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] hover:border-primary/40"
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

        {/* Preis-Badge in der Ecke (nur bei echten Items) */}
        {!isNeed && priceType && !isVirtual && (
          <PriceBadge priceType={priceType} priceAmount={data.priceAmount} className="absolute top-2 right-2" />
        )}

        {/* Profil-Marker bei virtuellen Items */}
        {isVirtual && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 text-[10px] font-medium rounded-md bg-black/60 text-white backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-primary text-[8px] font-bold flex items-center justify-center shrink-0">
              {ownerName?.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">aus Profil von {ownerName}</span>
          </div>
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

        {/* Hashtags max 3 — klickbar zum Filter setzen */}
        {data.hashtags && data.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.hashtags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onTagClick?.(tag)
                }}
                className="text-[10px] text-primary/80 hover:text-primary hover:underline"
              >
                #{tag}
              </button>
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
    </div>
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
  spaceId,
  isOwner,
  onDelete,
}: {
  item: Item
  spaceId: string | null
  isOwner: boolean
  onDelete: () => Promise<void>
}) {
  const data = item.data as MarketplaceData
  const isNeed = data.kind === "need"
  const priceType = data.priceType
  const images = data.images ?? []
  const [activeImage, setActiveImage] = useState(0)
  const safeIndex = Math.min(activeImage, Math.max(0, images.length - 1))

  return (
    <Card>
      {/* Bild-Sektion */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-muted/40 to-muted/80 overflow-hidden rounded-t-xl">
        {images[safeIndex] ? (
          <img
            src={images[safeIndex]}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
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

      {/* Thumbnail-Strip wenn mehrere Bilder */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-muted/20">
          {images.map((url, idx) => (
            <button
              key={url.slice(0, 30) + idx}
              type="button"
              onClick={() => setActiveImage(idx)}
              className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                idx === safeIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

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

        {/* Verleih-Kalender bei priceType=lend */}
        {priceType === "lend" && (
          <LendCalendar itemId={item.id} ownerId={item.createdBy} spaceId={spaceId} />
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
  const [images, setImages] = useState<string[]>([])
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
        images: images.length > 0 ? images : undefined,
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

        {/* Bilder */}
        <div>
          <Label className="text-xs mb-1.5 block">Bilder</Label>
          <ImageGalleryInput value={images} onChange={setImages} />
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
