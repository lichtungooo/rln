import { useMemo, useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, Plus, X, SlidersHorizontal, ZoomIn, ZoomOut } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { useItems, useCreateItem, useCurrentUser, Button, AdaptivePanel } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import { QuickCreateForm } from "./QuickCreateForm"
import { renderPinIcon, renderPinHtml, type PinStyle } from "./pin-styles"
import { EmptyMapBanner } from "../../demo/EmptyMapBanner"
import { MapCalendarWidget } from "./MapCalendarWidget"
import { getSpacePathSegment } from "../../spaces/space-data"

// ============================================================
// Default-Pin-Konfiguration pro Item-Typ
// ============================================================

export const DEFAULT_PIN_STYLES: Record<string, { color: string; shape: PinStyle["shape"]; label: string }> = {
  place: { color: "#E8751A", shape: "drop", label: "Werkstaetten" },
  event: { color: "#3b82f6", shape: "drop", label: "Events" },
  // Marktplatz: ein Pin-Familie (Kreis), aber unterschiedliche Farben nach
  // kind/priceType. Das Sub-Mapping passiert in effectivePinKey().
  offer: { color: "#10b981", shape: "circle", label: "Marktplatz" },
  "offer:sell": { color: "#10b981", shape: "circle", label: "Verkaufen" },
  "offer:gift": { color: "#A855F7", shape: "circle", label: "Verschenken" },
  "offer:lend": { color: "#F59E0B", shape: "circle", label: "Verleihen" },
  "offer:exchange": { color: "#3B82F6", shape: "circle", label: "Tauschen" },
  "offer:need": { color: "#EF4444", shape: "circle", label: "Suche" },
  // need bleibt als Legacy-Eintrag fuer Konfigs aus der Vor-M1-Zeit
  need: { color: "#EF4444", shape: "circle", label: "Suche" },
  quest: { color: "#a855f7", shape: "hexagon", label: "Quests" },
  profile: { color: "#ec4899", shape: "circle", label: "Macher" },
}

/**
 * Marktplatz-Items haben einen sub-type — z.B. "offer:lend" fuer Verleih.
 * Andere Item-Typen behalten ihren Type unveraendert.
 */
export function effectivePinKey(item: { type: string; data: Record<string, unknown> }): string {
  if (item.type !== "offer") return item.type
  const kind = item.data.kind
  if (kind === "need") return "offer:need"
  const priceType = item.data.priceType
  if (priceType === "sell" || priceType === "gift" || priceType === "lend" || priceType === "exchange") {
    return `offer:${priceType}`
  }
  return "offer"
}

// ============================================================
// Modul-Konfig
// ============================================================

export interface MapModuleConfig {
  /** Welche Item-Typen werden als Pins angezeigt? */
  pinTypes?: string[]
  /** Tile-Layer-URL. */
  tileUrl?: string
  /** Tile-Provider-Name (fuer UI-Auswahl). */
  tileProvider?: "osm-de" | "osm" | "topo" | "satellite"
  /** Default-Center wenn keine Pins. */
  defaultCenter?: [number, number]
  /** Default-Zoom wenn keine Pins. */
  defaultZoom?: number
  /** Pin-Styles pro Item-Typ (Form + Farbe + Border + Glow). */
  pinStyles?: Record<string, PinStyle>
  /** Zeige Action-Button unten rechts? */
  actionButton?: {
    enabled: boolean
    /** @deprecated nur fuer Legacy-Configs — bitte `actions` nutzen. */
    label?: string
    /** @deprecated nur fuer Legacy-Configs — bitte `actions` nutzen. */
    createItemType?: string
    /**
     * Liste der Aktionen. 1 Action: direkter Klick. >1: aufklappbares Menu.
     * Bei leerer Liste + Legacy-Felder werden diese als 1-Action-Liste interpretiert.
     */
    actions?: MapActionEntry[]
  }
  /** Karten-Suche (Volltext + #hashtag + @user) als floating Suchfeld. */
  search?: {
    enabled: boolean
    placeholder?: string
  }
}

export interface MapActionEntry {
  /** Stabile ID (fuer Reihenfolge + React-Keys). */
  id: string
  /** Beschriftung im Menu. */
  label: string
  /** Welcher Item-Typ wird beim Klick angelegt. */
  createItemType: string
}

export const TILE_PROVIDERS: Record<NonNullable<MapModuleConfig["tileProvider"]>, { url: string; label: string }> = {
  "osm-de": {
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    label: "OpenStreetMap (DE)",
  },
  "osm": {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    label: "OpenStreetMap",
  },
  "topo": {
    url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    label: "OpenTopoMap",
  },
  "satellite": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    label: "Satellit",
  },
}

/**
 * Default-Konfig — "alles an" (Demo-First / Subtraction-Design).
 *
 * Ein frisch erstellter Space zeigt die Karte mit voller Funktionspalette.
 * Admins schalten ueber das Inline-Zahnrad ab, was sie nicht brauchen —
 * statt sich aus einer leeren Karte alles zusammenzukonfigurieren.
 */
export const mapDefaultConfig: MapModuleConfig = {
  pinTypes: ["place", "event", "offer", "need", "quest", "profile"],
  tileProvider: "osm-de",
  defaultCenter: [50.0, 10.0],
  defaultZoom: 6,
  actionButton: {
    enabled: true,
    actions: [
      { id: "place", label: "Werkstatt eintragen", createItemType: "place" },
      { id: "event", label: "Event anlegen", createItemType: "event" },
      { id: "quest", label: "Quest setzen", createItemType: "quest" },
      { id: "offer", label: "Angebot teilen", createItemType: "offer" },
    ],
  },
  search: { enabled: true, placeholder: "Suche... #hashtag @user" },
}

/**
 * Liest die effektive Actions-Liste aus der Konfig.
 * Migriert Legacy (createItemType + label) automatisch.
 */
export function resolveMapActions(cfg: MapModuleConfig): MapActionEntry[] {
  const ab = cfg.actionButton
  if (!ab?.enabled) return []
  if (ab.actions && ab.actions.length > 0) return ab.actions
  if (ab.createItemType) {
    return [{
      id: "legacy",
      label: ab.label?.trim() || "Neu",
      createItemType: ab.createItemType,
    }]
  }
  return []
}

// ============================================================
// Karten-Suche: Tokenizer (#hashtag, @user, Freitext)
// ============================================================

export interface ParsedSearch {
  hashtags: string[]
  users: string[]
  text: string[]
}

export function parseSearchQuery(query: string): ParsedSearch {
  const hashtags: string[] = []
  const users: string[] = []
  const text: string[] = []
  query
    .trim()
    .split(/\s+/)
    .forEach((token) => {
      if (!token) return
      if (token.startsWith("#") && token.length > 1) {
        hashtags.push(token.slice(1).toLowerCase())
      } else if (token.startsWith("@") && token.length > 1) {
        users.push(token.slice(1).toLowerCase())
      } else {
        text.push(token.toLowerCase())
      }
    })
  return { hashtags, users, text }
}

/** Prueft ob ein Item-Datensatz auf eine geparste Suchanfrage passt. */
export function itemMatchesSearch(
  item: { type: string; createdBy?: string; data: Record<string, unknown> },
  parsed: ParsedSearch
): boolean {
  if (parsed.hashtags.length === 0 && parsed.users.length === 0 && parsed.text.length === 0) {
    return true
  }
  // Tags / Hashtags — wir akzeptieren beide Felder + strippen optionales "#"
  if (parsed.hashtags.length > 0) {
    const raw = [
      ...((item.data.hashtags as string[] | undefined) ?? []),
      ...((item.data.tags as string[] | undefined) ?? []),
    ]
    const tags = raw.map((t) => String(t).toLowerCase().replace(/^#/, ""))
    if (!parsed.hashtags.every((h) => tags.includes(h))) return false
  }
  // User — Substring im createdBy (DID oder Name, je nachdem was im Feld steht)
  if (parsed.users.length > 0) {
    const created = String(item.createdBy ?? "").toLowerCase()
    if (!parsed.users.some((u) => created.includes(u))) return false
  }
  // Freitext — Substring in Titel/Beschreibung/Adresse
  if (parsed.text.length > 0) {
    const blob = [
      item.data.title,
      item.data.description,
      item.data.markdownBody,
      item.data.plainDescription,
      item.data.address,
      item.data.name,
      item.data.bio,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
      .join(" ")
    if (!parsed.text.every((t) => blob.includes(t))) return false
  }
  return true
}

/** Merged User-Pin-Style mit Default fuer einen Item-Typ. */
export function resolvePinStyle(type: string, cfg: MapModuleConfig): PinStyle {
  const userStyle = cfg.pinStyles?.[type]
  const defaultStyle = DEFAULT_PIN_STYLES[type] ?? { color: "#888", shape: "drop" as const }
  return {
    shape: userStyle?.shape ?? defaultStyle.shape,
    color: userStyle?.color ?? defaultStyle.color,
    borderColor: userStyle?.borderColor,
    borderWidth: userStyle?.borderWidth,
    iconColor: userStyle?.iconColor,
    glow: userStyle?.glow,
    size: userStyle?.size,
    iconSvg: userStyle?.iconSvg,
    imageUrl: userStyle?.imageUrl,
  }
}

// ============================================================
// View
// ============================================================

export interface MapViewProps extends ModuleViewProps<MapModuleConfig> {
  /** Im Preview-Modus wird kein Zahnrad angezeigt (verhindert Inception). */
  isPreview?: boolean
}

export function MapView({ spaceId, activeGroup, config, isPreview, onOpenSettings }: MapViewProps) {
  const cfg = { ...mapDefaultConfig, ...(config ?? {}) }
  const isAdmin = useIsSpaceAdmin(spaceId)
  const { mutate: createItem } = useCreateItem()
  const { data: currentUser } = useCurrentUser()
  const navigate = useNavigate()
  const spaceSegment = activeGroup ? getSpacePathSegment(activeGroup) : null

  // Quick-Create-Flow von der Karte aus
  const [creatingType, setCreatingType] = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)

  // FlyTo-Ziel (z.B. wenn ein Event aus dem Kalender-Widget angeklickt wird)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; itemId?: string } | null>(null)

  // Layer-Filter — sichtbare Item-Typen auf der Karte. Persistiert lokal.
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('macher-map-hidden-layers')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return new Set(parsed)
      }
    } catch {
      /* leer lassen */
    }
    return new Set()
  })
  useEffect(() => {
    localStorage.setItem(
      'macher-map-hidden-layers',
      JSON.stringify(Array.from(hiddenLayers)),
    )
  }, [hiddenLayers])
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  const pinTypes = cfg.pinTypes ?? mapDefaultConfig.pinTypes!
  const tileUrl = cfg.tileUrl ?? TILE_PROVIDERS[cfg.tileProvider ?? "osm-de"].url

  // Items pro Typ laden — wir nutzen useItems pro Type weil Filter im
  // useItems-Hook nicht alle Typen kombinieren kann.
  const placeItems = useItems({ type: pinTypes.includes("place") ? "place" : "__none__" }).data
  const eventItems = useItems({ type: pinTypes.includes("event") ? "event" : "__none__" }).data
  // Marktplatz: alle Items vom Typ "offer" (kind=offer und kind=need leben unter
  // diesem Typ — pinTypes "offer"/"need" werden beide hier erkannt).
  const showMarketplace = pinTypes.includes("offer") || pinTypes.includes("need")
  const offerItems = useItems({ type: showMarketplace ? "offer" : "__none__" }).data
  const questItems = useItems({ type: pinTypes.includes("quest") ? "quest" : "__none__" }).data
  // User-Pins: profile-extension-Items (eines pro User) mit data.location
  const profileExtItems = useItems({
    type: pinTypes.includes("profile") ? "profile-extension" : "__none__",
  }).data

  // Profile-Extension-Items werden fuer Marker-Logik wie type "profile" behandelt.
  const profileItems = useMemo(
    () => profileExtItems.map((it) => ({ ...it, type: "profile" })),
    [profileExtItems]
  )

  // Marktplatz-Items werden gefiltert: bei pinTypes nur "offer" (ohne "need")
  // werden Suchen ausgeblendet — und umgekehrt fuer Legacy-Configs mit nur
  // "need". Bei beiden gesetzt landen alle Marktplatz-Items hier.
  const filteredOfferItems = useMemo(() => {
    if (!showMarketplace) return []
    const wantOffer = pinTypes.includes("offer")
    const wantNeed = pinTypes.includes("need")
    return offerItems.filter((it) => {
      const kind = (it.data as Record<string, unknown>).kind
      if (kind === "need") return wantNeed
      return wantOffer
    })
  }, [offerItems, pinTypes, showMarketplace])

  const allItems = useMemo(
    () => [...placeItems, ...eventItems, ...filteredOfferItems, ...questItems, ...profileItems],
    [placeItems, eventItems, filteredOfferItems, questItems, profileItems]
  )

  // Item-Typ → Layer-ID
  const itemToLayer = useCallback((item: Item): string => {
    if (item.type === 'place') return 'orte'
    if (item.type === 'event') return 'termine'
    if (item.type === 'profile') return 'menschen'
    if (item.type === 'offer') {
      const kind = (item.data as Record<string, unknown>).kind
      return kind === 'need' ? 'gesuche' : 'angebote'
    }
    if (item.type === 'quest') return 'quests'
    return 'sonstige'
  }, [])

  // Marker erzeugen — Items mit gueltigem location-Field oder data.location
  const markers = useMemo(() => {
    return allItems
      .map((item) => {
        const loc = (item.data.location as { lat?: number; lng?: number; address?: string } | undefined) ?? null
        if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null
        if (hiddenLayers.has(itemToLayer(item))) return null
        const pinKey = effectivePinKey(item)
        const style = resolvePinStyle(pinKey, cfg)
        // User-Pins (type "profile") zeigen Name aus data.name oder data.title
        const isProfile = item.type === "profile"
        const title = isProfile
          ? String(item.data.name ?? item.data.title ?? "Macher")
          : String(item.data.title ?? "(ohne Titel)")
        const address =
          loc.address ??
          (typeof item.data.address === "string" ? item.data.address : undefined)
        const start = typeof item.data.start === "string" ? item.data.start : undefined
        const description = isProfile
          ? (typeof item.data.bio === "string" ? item.data.bio : undefined)
          : (typeof item.data.markdownBody === "string"
              ? item.data.markdownBody
              : typeof item.data.description === "string"
              ? item.data.description
              : undefined)
        // Marktplatz-Preis-Hinweis fuer den Popup
        let priceHint: string | undefined
        if (item.type === "offer") {
          const data = item.data as Record<string, unknown>
          if (data.kind === "offer") {
            const priceAmount = typeof data.priceAmount === "number" ? data.priceAmount : undefined
            const priceText = typeof data.priceText === "string" ? data.priceText : undefined
            if (data.priceType === "sell" && priceAmount !== undefined) {
              priceHint = `${priceAmount} EUR${priceText ? ` · ${priceText}` : ""}`
            } else if (priceText) {
              priceHint = priceText
            }
          }
        }

        // Detail-Link: Marktplatz-Items oeffnen die Marketplace-View, Profile-
        // Pins koennen spaeter aufs Profil verlinken (kommt mit Profil-Detail).
        let linkHref: string | undefined
        let linkLabel: string | undefined
        if (item.type === "offer" && spaceSegment) {
          linkHref = `/${spaceSegment}/marketplace?item=${item.id}`
          linkLabel = "Inserat ansehen"
        }

        // Profile-Pins: Skills/Offers/Needs als Pillen im Popup
        let profileSkills: string[] | undefined
        let profileOffers: string[] | undefined
        let profileNeeds: string[] | undefined
        if (item.type === "profile") {
          const d = item.data as Record<string, unknown>
          if (Array.isArray(d.skills)) profileSkills = d.skills as string[]
          if (Array.isArray(d.offers)) profileOffers = d.offers as string[]
          if (Array.isArray(d.needs)) profileNeeds = d.needs as string[]
        }

        return {
          item,
          lat: loc.lat,
          lng: loc.lng,
          title,
          address,
          start,
          description,
          pinKey,
          priceHint,
          linkHref,
          linkLabel,
          profileSkills,
          profileOffers,
          profileNeeds,
          icon: renderPinIcon(style),
          pinColor: style.color,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
  }, [allItems, cfg, hiddenLayers, itemToLayer])

  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((s, m) => s + m.lat, 0) / markers.length,
        markers.reduce((s, m) => s + m.lng, 0) / markers.length,
      ]
    : cfg.defaultCenter ?? [50.0, 10.0]

  const zoom = markers.length > 0 ? 11 : (cfg.defaultZoom ?? 6)

  const actions = useMemo(() => resolveMapActions(cfg), [cfg])

  const startActionCreate = useCallback((createItemType: string) => {
    setActionMenuOpen(false)
    setCreatingType(createItemType)
    setPickedLocation(null)
  }, [])

  const handleFabClick = useCallback(() => {
    if (actions.length === 0) return
    if (actions.length === 1) {
      startActionCreate(actions[0].createItemType)
    } else {
      setActionMenuOpen((open) => !open)
    }
  }, [actions, startActionCreate])

  // ESC schliesst das Aktionen-Menu
  useEffect(() => {
    if (!actionMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActionMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actionMenuOpen])

  const handleQuickCreate = useCallback(
    async (data: Record<string, unknown>) => {
      if (!creatingType) return
      await createItem({
        type: creatingType,
        createdBy: currentUser?.id ?? "anonymous",
        data,
      })
      setCreatingType(null)
      setPickedLocation(null)
    },
    [createItem, creatingType, currentUser?.id]
  )

  const handleMapClick = useCallback((latlng: L.LatLng) => {
    setPickedLocation({ lat: latlng.lat, lng: latlng.lng })
  }, [])

  return (
    <div style={{ height: isPreview ? "100%" : "calc(100dvh - 3.5rem)", isolation: "isolate", position: "relative" }}>
      {/* Settings-Zahnrad oben rechts (nur Admin, NICHT im Preview) */}
      {!isPreview && isAdmin && activeGroup && (
        <div className="absolute top-3 right-3 z-[1000]">
          <div className="bg-background/95 backdrop-blur rounded-md shadow-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenSettings?.("modules", "map")}
              title="Karte konfigurieren"
              aria-label="Karte konfigurieren"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty-State: keine Pins → Demo-Banner mit Lade-Knopf (nur fuer Admins) */}
      {!isPreview && activeGroup && (
        <EmptyMapBanner
          visible={markers.length === 0 && !creatingType}
          isAdmin={isAdmin}
        />
      )}

      {/* Kompakt-Kalender: schwebender Auszug der naechsten Termine */}
      {!isPreview && !creatingType && (
        <MapCalendarWidget
          onEventSelect={(ev) => setFlyTarget({ ...ev })}
        />
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* invalidateSize bei Container-Resize — Karte rendert auch dann
            korrekt, wenn sie initial mit display:none gemountet wurde. */}
        <MapResizeWatcher />

        {/* Map-Click-Handler — nur wenn Quick-Create aktiv */}
        {creatingType && <MapClickHandler onClick={handleMapClick} />}

        {/* FlyTo: wenn jemand im Kalender-Widget einen Termin auswaehlt */}
        <MapFlyTo target={flyTarget} />

        {/* Gepickter Standort als pulsierender Pin */}
        {pickedLocation && (
          <Marker
            position={[pickedLocation.lat, pickedLocation.lng]}
            icon={L.divIcon({
              html: `<div style="position:relative;width:32px;height:32px">
                <div style="position:absolute;inset:0;background:#E8751A;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:pulse 1.5s infinite"></div>
                <div style="position:absolute;inset:8px;background:#fff;border-radius:50%"></div>
              </div>
              <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.85}}</style>`,
              className: "",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        )}

        {markers.map((m) => (
          <Marker key={m.item.id} position={[m.lat, m.lng]} icon={m.icon}>
            <Popup>
              <PinPopupContent
                title={m.title}
                start={m.start}
                address={m.address}
                description={m.description}
                type={m.pinKey}
                priceHint={m.priceHint}
                accentColor={m.pinColor}
                profileSkills={m.profileSkills}
                profileOffers={m.profileOffers}
                profileNeeds={m.profileNeeds}
                linkHref={m.linkHref}
                linkLabel={m.linkLabel}
                onLinkClick={(href) => navigate(href)}
              />
            </Popup>
          </Marker>
        ))}

        {/* Eigene Zoom-Controls + Filter — mittig links statt oben rechts */}
        <MapSideControls
          hiddenLayers={hiddenLayers}
          onToggleLayer={(id) => {
            setHiddenLayers((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }}
          filterMenuOpen={filterMenuOpen}
          setFilterMenuOpen={setFilterMenuOpen}
        />
      </MapContainer>

      {/* Action-Button unten rechts + Multi-Action-Menu */}
      {!isPreview && actions.length > 0 && !creatingType && (
        <>
          {/* Backdrop schliesst das Menu beim Klick neben dran */}
          {actionMenuOpen && (
            <div
              className="absolute inset-0 z-[999]"
              onClick={() => setActionMenuOpen(false)}
            />
          )}

          {/* Aufgeklappte Aktions-Liste oberhalb des FAB */}
          {actionMenuOpen && actions.length > 1 && (
            <div className="absolute bottom-24 right-4 z-[1001] flex flex-col gap-2 items-end animate-in fade-in slide-in-from-bottom-2 duration-150">
              {actions.map((action) => {
                const style = resolvePinStyle(action.createItemType, cfg)
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => startActionCreate(action.createItemType)}
                    className="bg-background/95 backdrop-blur shadow-lg pl-2 pr-4 py-2 rounded-full border flex items-center gap-2 hover:bg-muted/80 hover:scale-[1.02] transition-all"
                    title={action.label}
                  >
                    <span
                      style={{ width: 24, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      dangerouslySetInnerHTML={{ __html: renderPinHtml(style, 22) }}
                    />
                    <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Eigentlicher FAB */}
          <button
            className="absolute bottom-6 right-4 z-[1001] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
            title={
              actions.length === 1
                ? actions[0].label
                : actionMenuOpen
                ? "Menu schliessen"
                : "Aktion waehlen"
            }
            onClick={handleFabClick}
            aria-expanded={actions.length > 1 ? actionMenuOpen : undefined}
          >
            {actionMenuOpen && actions.length > 1 ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        </>
      )}

      {/* Hint waehrend Picker aktiv */}
      {!isPreview && creatingType && !pickedLocation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg text-xs font-medium pointer-events-none">
          Tippe auf die Karte um Standort zu waehlen
        </div>
      )}

      {/* Quick-Create Side-Panel */}
      <AdaptivePanel
        open={creatingType !== null}
        onClose={() => {
          setCreatingType(null)
          setPickedLocation(null)
        }}
        allowedModes={["sidebar", "drawer"]}
        sidebarWidth="380px"
      >
        {creatingType && (
          <QuickCreateForm
            itemType={creatingType}
            pickedLocation={pickedLocation}
            onSubmit={handleQuickCreate}
            onCancel={() => {
              setCreatingType(null)
              setPickedLocation(null)
            }}
          />
        )}
      </AdaptivePanel>
    </div>
  )
}

// ============================================================
// PinPopupContent — strukturierter Pin-Popup-Inhalt
// ============================================================

const TYPE_LABEL: Record<string, string> = {
  place: "Werkstatt",
  event: "Event",
  offer: "Marktplatz",
  "offer:sell": "Verkaufen",
  "offer:gift": "Verschenken",
  "offer:lend": "Verleihen",
  "offer:exchange": "Tauschen",
  "offer:need": "Suche",
  need: "Suche",
  quest: "Quest",
  profile: "Macher",
  appointment: "Termin",
}

function formatPopupDate(start: string): string {
  const d = new Date(start)
  if (Number.isNaN(d.getTime())) return start
  return d.toLocaleString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function PinPopupContent({
  title,
  start,
  address,
  description,
  type,
  priceHint,
  accentColor,
  profileSkills,
  profileOffers,
  profileNeeds,
  linkHref,
  linkLabel,
  onLinkClick,
}: {
  title: string
  start?: string
  address?: string
  description?: string
  type: string
  priceHint?: string
  accentColor?: string
  profileSkills?: string[]
  profileOffers?: string[]
  profileNeeds?: string[]
  linkHref?: string
  linkLabel?: string
  onLinkClick?: (href: string) => void
}) {
  const typeLabel = TYPE_LABEL[type] ?? type
  const accent = accentColor ?? "#E8751A"
  const shortDesc = description
    ? description.length > 120
      ? description.slice(0, 117) + "..."
      : description
    : undefined

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 200, maxWidth: 280 }}>
      <div style={{
        fontSize: "0.65rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: accent,
        fontWeight: 600,
        margin: "0 0 4px",
      }}>
        {typeLabel}
        {priceHint && (
          <span style={{
            marginLeft: 8,
            padding: "1px 6px",
            background: accent,
            color: "#fff",
            borderRadius: 999,
            fontSize: "0.6rem",
            letterSpacing: 0,
          }}>
            {priceHint}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 600, fontSize: "0.95rem", margin: 0, lineHeight: 1.3 }}>
        {title}
      </div>
      {start && (
        <div style={{
          fontSize: "0.75rem",
          color: "#1A1A1A",
          margin: "6px 0 0",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span>📅</span>
          <span>{formatPopupDate(start)}</span>
        </div>
      )}
      {address && (
        <div style={{
          fontSize: "0.7rem",
          color: "#666",
          margin: "4px 0 0",
          display: "flex",
          alignItems: "flex-start",
          gap: "4px",
        }}>
          <span>📍</span>
          <span>{address}</span>
        </div>
      )}
      {shortDesc && (
        <p style={{
          fontSize: "0.75rem",
          color: "#444",
          margin: "8px 0 0",
          lineHeight: 1.45,
        }}>
          {shortDesc}
        </p>
      )}

      {/* Profile-Felder als Pillen */}
      {profileSkills && profileSkills.length > 0 && (
        <PopupPillRow label="Kann" items={profileSkills} color="#E8751A" />
      )}
      {profileOffers && profileOffers.length > 0 && (
        <PopupPillRow label="Bietet" items={profileOffers} color="#10B981" />
      )}
      {profileNeeds && profileNeeds.length > 0 && (
        <PopupPillRow label="Sucht" items={profileNeeds} color="#3B82F6" />
      )}

      {/* Detail-Link (Marktplatz-Pin) */}
      {linkHref && linkLabel && onLinkClick && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onLinkClick(linkHref)
          }}
          style={{
            display: "block",
            width: "100%",
            marginTop: 10,
            padding: "6px 10px",
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          {linkLabel} →
        </button>
      )}
    </div>
  )
}

function PopupPillRow({
  label,
  items,
  color,
}: {
  label: string
  items: string[]
  color: string
}) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#888",
        fontWeight: 600,
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {items.slice(0, 6).map((it) => (
          <span
            key={it}
            style={{
              padding: "1px 6px",
              fontSize: "0.65rem",
              borderRadius: 999,
              background: `${color}20`,
              color,
              fontWeight: 500,
            }}
          >
            {it}
          </span>
        ))}
        {items.length > 6 && (
          <span style={{ fontSize: "0.6rem", color: "#888" }}>+{items.length - 6}</span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MapClickHandler — registriert click-Listener auf der Karte
// (muss innerhalb von <MapContainer> sein, sonst ist useMapEvents kein Hook)
// ============================================================

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    },
  })
  return null
}

// ============================================================
// MapFlyTo — fliegt zu einem Ziel und zoomt rein
// (muss innerhalb von <MapContainer> sitzen wegen useMap)
// ============================================================

function MapFlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { animate: true, duration: 0.8 })
    }
  }, [target, map])
  return null
}

// ============================================================
// MapResizeWatcher — ruft invalidateSize bei Container-Resize.
// Loest das Problem, wenn die Karte initial mit display:none gemountet
// wird (Tabs-Pattern) und Leaflet keine Groesse fuer die Tiles kennt.
// ============================================================

function MapResizeWatcher() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    map.invalidateSize()
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

// ============================================================
// MapSideControls — eigene Zoom + Filter mittig am linken Rand.
// ============================================================

const LAYER_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'orte', label: 'Orte' },
  { id: 'termine', label: 'Termine' },
  { id: 'menschen', label: 'Menschen' },
  { id: 'angebote', label: 'Angebote' },
  { id: 'gesuche', label: 'Gesuche' },
  { id: 'quests', label: 'Quests' },
]

function MapSideControls({
  hiddenLayers,
  onToggleLayer,
  filterMenuOpen,
  setFilterMenuOpen,
}: {
  hiddenLayers: Set<string>
  onToggleLayer: (id: string) => void
  filterMenuOpen: boolean
  setFilterMenuOpen: (open: boolean) => void
}) {
  const map = useMap()
  return (
    <div
      className="leaflet-control absolute left-2 top-1/2 z-[1000] flex -translate-y-1/2 flex-col gap-1.5"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Filter-Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          title="Layer filtern"
          aria-label="Layer filtern"
          className={`flex h-8 w-8 items-center justify-center rounded-md border bg-background/95 shadow-md backdrop-blur transition hover:bg-muted ${
            filterMenuOpen
              ? 'border-primary/60 text-primary'
              : 'border-border/60 text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {hiddenLayers.size > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {hiddenLayers.size}
            </span>
          )}
        </button>
        {filterMenuOpen && (
          <div className="absolute left-10 top-0 z-[1001] w-44 rounded-md border border-border/60 bg-popover shadow-lg">
            <div className="border-b border-border/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Auf der Karte zeigen
            </div>
            <ul className="py-1">
              {LAYER_OPTIONS.map((layer) => {
                const visible = !hiddenLayers.has(layer.id)
                return (
                  <li key={layer.id}>
                    <button
                      type="button"
                      onClick={() => onToggleLayer(layer.id)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted/60"
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition ${
                          visible
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/60 bg-background'
                        }`}
                      >
                        {visible && (
                          <svg
                            viewBox="0 0 16 16"
                            className="h-2.5 w-2.5"
                            fill="currentColor"
                          >
                            <path d="M13.5 4L6 11.5 2.5 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-foreground">{layer.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Zoom-Controls */}
      <div className="overflow-hidden rounded-md border border-border/60 bg-background/95 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          title="Hineinzoomen"
          aria-label="Hineinzoomen"
          className="flex h-8 w-8 items-center justify-center text-foreground transition hover:bg-muted"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="h-px bg-border/40" />
        <button
          type="button"
          onClick={() => map.zoomOut()}
          title="Herauszoomen"
          aria-label="Herauszoomen"
          className="flex h-8 w-8 items-center justify-center text-foreground transition hover:bg-muted"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
