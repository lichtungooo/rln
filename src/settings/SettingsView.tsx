/**
 * SettingsView — schlanke Settings im reinen PageGrid-Pattern.
 *
 * Architektur folgt der Modul-Doktrin + Klick-Routing-Doktrin (siehe
 * memory/feedback_klick_routing_doktrin.md und memory/project_settings_neubau.md):
 *
 * - PageGrid mit lockPages — 5 Tabs als Pages
 * - Pro Tab eigene Slot-Konfig (1, 2 oder 3 Slots)
 * - Widgets via renderWidget(widgetId)
 * - Klick-Routing ueber SelectionContext-Channels (theme-area, theme-subitem, ...)
 * - mobileDrilldown: true — auf Mobile eine Spalte zur Zeit, Swipe + Tastatur ←→
 *
 * Datenmodell:
 *   group.data.theme            → Basis-Preset (z.B. "macher-orange")
 *   group.data.themeOverrides   → Partial<ThemeVars> (Einzel-Overrides)
 *
 * Save/Cancel auf Container-Ebene (ThemeDraftProvider) — Widgets lesen +
 * schreiben Drafts ueber Hooks, persistieren erst beim Speichern.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Home,
  Palette,
  Puzzle,
  ShieldCheck,
  Wrench,
  Sparkles,
  PanelTop,
  Image as ImageIcon,
  Moon,
  Check,
  Loader2,
  RotateCcw,
  ChevronRight,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button, useUpdateGroup } from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../modules/registry"
import { getAllModules } from "../modules/registry"
import { useIsSpaceAdmin } from "../modules/use-module-config"
import {
  PageGrid,
  type GridPage,
  type AvailableWidget,
} from "../components/PageGrid"
import {
  SelectionProvider,
  useChannel,
  useChannelSync,
} from "../components/SelectionContext"
import {
  THEMES,
  DEFAULT_THEME_ID,
  applyThemeToRoot,
  type ThemeOverrides,
  type ThemeVars,
  type DarkModeChoice,
  type BackgroundPattern,
} from "../themes/themes"
import { getSpaceMeta } from "../spaces/space-data"
import { GeneralTab, AdvancedTab } from "./SpaceSettings"
import { MembersView } from "../modules/members/MembersView"

// ============================================================
// Tab-Definitionen + Default-Pages
// ============================================================

type SettingsTabId = "general" | "theme" | "modules" | "admin" | "advanced"

interface TabDef {
  id: SettingsTabId
  label: string
  icon: LucideIcon
}

const TABS: TabDef[] = [
  { id: "general", label: "Allgemein", icon: Home },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "modules", label: "Module", icon: Puzzle },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "advanced", label: "Erweitert", icon: Wrench },
]

const DEFAULT_PAGES: GridPage[] = [
  {
    id: "general",
    name: "Allgemein",
    slots: [{ id: "g1", widget: "general-form", colSpan: 6, rowSpan: 4 }],
  },
  {
    id: "theme",
    name: "Theme",
    slots: [
      { id: "t1", widget: "theme-areas", colSpan: 2, rowSpan: 4 },
      { id: "t2", widget: "theme-subitems", colSpan: 2, rowSpan: 4 },
      { id: "t3", widget: "theme-detail", colSpan: 2, rowSpan: 4 },
    ],
  },
  {
    id: "modules",
    name: "Module",
    slots: [
      { id: "m1", widget: "module-list", colSpan: 2, rowSpan: 4 },
      { id: "m2", widget: "module-config", colSpan: 2, rowSpan: 4 },
      { id: "m3", widget: "module-preview", colSpan: 2, rowSpan: 4 },
    ],
  },
  {
    id: "admin",
    name: "Admin",
    slots: [
      { id: "a1", widget: "admin-roles", colSpan: 2, rowSpan: 4 },
      { id: "a2", widget: "admin-detail", colSpan: 4, rowSpan: 4 },
    ],
  },
  {
    id: "advanced",
    name: "Erweitert",
    slots: [{ id: "x1", widget: "advanced-actions", colSpan: 6, rowSpan: 4 }],
  },
]

const AVAILABLE_WIDGETS: AvailableWidget[] = [
  { id: "general-form", label: "Allgemein-Formular", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "theme-areas", label: "Theme-Bereiche", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "theme-subitems", label: "Theme-Sub-Items", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "theme-detail", label: "Theme-Detail", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "module-list", label: "Modul-Liste", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "module-config", label: "Modul-Konfig", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "module-preview", label: "Modul-Vorschau", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "admin-roles", label: "Admin-Rollen", defaultColSpan: 2, defaultRowSpan: 4 },
  { id: "admin-detail", label: "Admin-Detail", defaultColSpan: 4, defaultRowSpan: 4 },
  { id: "advanced-actions", label: "Aktionen", defaultColSpan: 6, defaultRowSpan: 4 },
]

// ============================================================
// Theme-Draft Context
// ============================================================

interface ThemeDraft {
  themeId: string
  overrides: ThemeOverrides
}

interface ThemeDraftContextValue {
  draft: ThemeDraft
  savedThemeId: string
  savedOverrides: ThemeOverrides
  isDirty: boolean
  isAdmin: boolean
  saving: boolean
  error: string | null
  setThemeId: (id: string) => void
  setOverride: (key: keyof ThemeOverrides, value: string) => void
  removeOverride: (key: keyof ThemeOverrides) => void
  save: () => Promise<void>
  cancel: () => void
}

const ThemeDraftContext = createContext<ThemeDraftContextValue | null>(null)

function useThemeDraft() {
  const ctx = useContext(ThemeDraftContext)
  if (!ctx) throw new Error("useThemeDraft must be used within <ThemeDraftProvider>")
  return ctx
}

function ThemeDraftProvider({
  activeGroup,
  spaceId,
  children,
}: {
  activeGroup: Group | null
  spaceId: string | null
  children: ReactNode
}) {
  const updateGroup = useUpdateGroup()
  const isAdmin = useIsSpaceAdmin(spaceId)

  const savedThemeId =
    (activeGroup?.data?.theme as string | undefined) ?? DEFAULT_THEME_ID
  const savedOverridesRaw =
    (activeGroup?.data?.themeOverrides as ThemeOverrides | undefined) ?? {}
  const savedOverridesKey = JSON.stringify(savedOverridesRaw)

  const [draftThemeId, setDraftThemeId] = useState<string>(savedThemeId)
  const [draftOverrides, setDraftOverrides] = useState<ThemeOverrides>(savedOverridesRaw)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync wenn Group sich aendert (z.B. nach Save → group-data propagiert)
  useEffect(() => {
    setDraftThemeId(savedThemeId)
    setDraftOverrides(JSON.parse(savedOverridesKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedThemeId, savedOverridesKey])

  // Live-Apply der Drafts aufs Document
  const draftOverridesKey = JSON.stringify(draftOverrides)
  useEffect(() => {
    applyThemeToRoot(draftThemeId, draftOverrides)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftThemeId, draftOverridesKey])

  const isDirty =
    draftThemeId !== savedThemeId || draftOverridesKey !== savedOverridesKey

  const setOverride = useCallback((key: keyof ThemeOverrides, value: string) => {
    setDraftOverrides((prev) => ({ ...prev, [key]: value }))
  }, [])

  const removeOverride = useCallback((key: keyof ThemeOverrides) => {
    setDraftOverrides((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const save = useCallback(async () => {
    if (!activeGroup) return
    setSaving(true)
    setError(null)
    try {
      await updateGroup(activeGroup.id, {
        data: {
          ...(activeGroup.data ?? {}),
          theme: draftThemeId,
          themeOverrides: draftOverrides,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }, [activeGroup, draftThemeId, draftOverrides, updateGroup])

  const cancel = useCallback(() => {
    setDraftThemeId(savedThemeId)
    setDraftOverrides(JSON.parse(savedOverridesKey))
    setError(null)
  }, [savedThemeId, savedOverridesKey])

  const value = useMemo<ThemeDraftContextValue>(
    () => ({
      draft: { themeId: draftThemeId, overrides: draftOverrides },
      savedThemeId,
      savedOverrides: savedOverridesRaw,
      isDirty,
      isAdmin,
      saving,
      error,
      setThemeId: setDraftThemeId,
      setOverride,
      removeOverride,
      save,
      cancel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftThemeId, draftOverridesKey, savedThemeId, savedOverridesKey, isDirty, isAdmin, saving, error, setOverride, removeOverride, save, cancel]
  )

  return <ThemeDraftContext.Provider value={value}>{children}</ThemeDraftContext.Provider>
}

// ============================================================
// SettingsView (Container)
// ============================================================

export function SettingsView({ spaceId, activeGroup }: ModuleViewProps) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initialTab = (params.get("tab") as SettingsTabId) || "general"

  const handleClose = () => {
    if (activeGroup) {
      const slug = getSpaceMeta(activeGroup).slug ?? activeGroup.id
      navigate(`/${slug}/dashboard`)
    } else {
      navigate(-1)
    }
  }

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(params)
    next.set("tab", tabId)
    setParams(next, { replace: true })
  }

  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte ein Netzwerk waehlen, um die Einstellungen zu oeffnen.
        </p>
      </div>
    )
  }

  return (
    <ThemeDraftProvider activeGroup={activeGroup} spaceId={spaceId}>
      <SelectionProvider storageKey={`rln-settings-v2-${spaceId ?? "default"}`}>
        <SettingsContent
          spaceId={spaceId}
          activeGroup={activeGroup}
          activeTab={initialTab}
          onTabChange={handleTabChange}
          onClose={handleClose}
        />
      </SelectionProvider>
    </ThemeDraftProvider>
  )
}

function SettingsContent({
  spaceId,
  activeGroup,
  activeTab,
  onTabChange,
  onClose,
}: {
  spaceId: string | null
  activeGroup: Group
  activeTab: SettingsTabId
  onTabChange: (tab: string) => void
  onClose: () => void
}) {
  const renderWidget = useCallback(
    (widgetId: string): ReactNode => {
      switch (widgetId) {
        case "general-form":
          return <GeneralFormWidget group={activeGroup} />
        case "theme-areas":
          return <ThemeAreasWidget group={activeGroup} />
        case "theme-subitems":
          return <ThemeSubItemsWidget />
        case "theme-detail":
          return <ThemeDetailWidget />
        case "module-list":
          return <ModuleListWidget group={activeGroup} />
        case "module-config":
          return <ModuleConfigWidget group={activeGroup} />
        case "module-preview":
          return <ModulePreviewWidget group={activeGroup} />
        case "admin-roles":
          return <AdminRolesWidget />
        case "admin-detail":
          return <AdminDetailWidget spaceId={spaceId} group={activeGroup} />
        case "advanced-actions":
          return <AdvancedActionsWidget group={activeGroup} />
        default:
          return <ComingSoonWidget label={widgetId} hint="Unbekanntes Widget" />
      }
    },
    [activeGroup]
  )

  return (
    <div className="h-full w-full flex flex-col">
      <PageGrid
        storageKey={`rln-settings-v2-${spaceId ?? "default"}`}
        defaultPages={DEFAULT_PAGES}
        availableWidgets={AVAILABLE_WIDGETS}
        renderWidget={renderWidget}
        lockPages
        mobileDrilldown
        activePageId={activeTab}
        onActivePageChange={onTabChange}
        headerRight={
          <div className="flex items-center gap-2">
            <SaveToolbar />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Einstellungen schliessen"
              title="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        }
      />
    </div>
  )
}

// ============================================================
// SaveToolbar — erscheint im Header wenn Drafts dirty sind
// ============================================================

function SaveToolbar() {
  const { isDirty, isAdmin, saving, error, save, cancel } = useThemeDraft()
  if (!isDirty) return null
  return (
    <div className="flex items-center gap-1.5">
      {error && (
        <span className="text-[10px] text-destructive max-w-[180px] truncate" title={error}>
          {error}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={cancel}
        disabled={saving}
        className="h-7 text-xs"
      >
        Abbrechen
      </Button>
      {isAdmin && (
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={saving}
          className="h-7 text-xs"
        >
          {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Speichern
        </Button>
      )}
    </div>
  )
}

// ============================================================
// GeneralForm — Wrap des bestehenden GeneralTab
// ============================================================

function GeneralFormWidget({ group }: { group: Group }) {
  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Allgemein</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <GeneralTab group={group} />
      </div>
    </div>
  )
}

// ============================================================
// Theme — Bereich-Definitionen
// ============================================================

type ThemeAreaId =
  | "presets"
  | "identity"
  | "topbar"
  | "background"
  | "dark"
  | `module:${string}`

interface ThemeAreaDef {
  id: ThemeAreaId
  label: string
  hint: string
  icon: LucideIcon
  ready: boolean
}

const BASE_AREAS: ThemeAreaDef[] = [
  { id: "presets", label: "Welten", hint: "5 vorgefertigte Themes", icon: Sparkles, ready: true },
  { id: "identity", label: "Identitaet", hint: "Primary, Accent, Background, Foreground", icon: Palette, ready: true },
  { id: "topbar", label: "Topbar", hint: "Hintergrund der Toolbar", icon: PanelTop, ready: true },
  { id: "background", label: "Hintergrund", hint: "Subtle Pattern auf der Seite", icon: ImageIcon, ready: true },
  { id: "dark", label: "Dark Mode", hint: "Auto / Hell / Dunkel", icon: Moon, ready: true },
]

const DARK_SUB_ITEMS: ThemeSubItem[] = [
  { id: "darkMode", label: "Modus", description: "Auto, Hell oder Dunkel" },
]

const BACKGROUND_SUB_ITEMS: ThemeSubItem[] = [
  { id: "backgroundPattern", label: "Muster", description: "Aus, Punkte oder Linien" },
]

// Topbar-Sub-Items — eine fuer den Hintergrund (Farbe oder Gradient)
const TOPBAR_SUB_ITEMS: ThemeSubItem[] = [
  { id: "topbarBackground", label: "Hintergrund", description: "Farbe oder Gradient der oberen Leiste" },
]

interface ThemeSubItem {
  id: string
  label: string
  description: string
  // Optional: ThemeVar-Key fuer Color-Picker
  themeVar?: keyof ThemeVars
}

const IDENTITY_SUB_ITEMS: ThemeSubItem[] = [
  { id: "primary", label: "Primary", description: "Buttons, Pins, Links", themeVar: "primary" },
  { id: "accent", label: "Accent", description: "Hover, Highlight", themeVar: "accent" },
  { id: "background", label: "Background", description: "Seiten-Hintergrund", themeVar: "background" },
  { id: "foreground", label: "Foreground", description: "Standard-Schrift", themeVar: "foreground" },
]

// ============================================================
// Widget — Theme-Bereiche (Source fuer Channel "theme-area")
// ============================================================

function ThemeAreasWidget({ group }: { group: Group }) {
  const allModules = useMemo(() => getAllModules(), [])
  const moduleAreas: ThemeAreaDef[] = useMemo(() => {
    const moduleIds = (group.data?.modules as string[] | undefined) ?? []
    return moduleIds
      .map((id) => allModules.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map((m) => ({
        id: `module:${m.id}` as ThemeAreaId,
        label: m.label,
        hint: `Konfiguration fuer ${m.label}`,
        icon: m.icon ?? Puzzle,
        ready: true,
      }))
  }, [group, allModules])

  const areas = useMemo(() => [...BASE_AREAS, ...moduleAreas], [moduleAreas])

  // Channel: areas als Items registrieren, beim Klick selektieren
  const channel = useChannel("theme-area")
  useChannelSync(
    "theme-area",
    useMemo(() => areas.map((a) => ({ id: a.id })), [areas])
  )

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Palette className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Bereiche</span>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y">
        {areas.map((area) => {
          const Icon = area.icon
          const isActive = channel.selectedId === area.id
          return (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => channel.select(area.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                  isActive ? "bg-muted/70" : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {area.label}
                    {!area.ready && (
                      <span className="text-[9px] uppercase font-semibold text-amber-700 bg-amber-200/60 px-1 py-0.5 rounded">
                        kommt
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {area.hint}
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================
// Widget — Theme-Sub-Items (Source fuer "theme-subitem", liest "theme-area")
// ============================================================

function ThemeSubItemsWidget() {
  const areaChannel = useChannel("theme-area")
  const areaId = areaChannel.selectedId as ThemeAreaId | null
  const { draft } = useThemeDraft()

  // Sub-Items je nach aktivem Bereich bestimmen
  const subItems: ThemeSubItem[] = useMemo(() => {
    if (areaId === "presets") {
      return THEMES.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.mood,
      }))
    }
    if (areaId === "identity") {
      return IDENTITY_SUB_ITEMS
    }
    if (areaId === "topbar") {
      return TOPBAR_SUB_ITEMS
    }
    if (areaId === "dark") {
      return DARK_SUB_ITEMS
    }
    if (areaId === "background") {
      return BACKGROUND_SUB_ITEMS
    }
    if (areaId && areaId.startsWith("module:")) {
      return [
        {
          id: "module-config",
          label: "Konfiguration",
          description: "Pin-Stile, Layout, Verhalten",
        },
      ]
    }
    return []
  }, [areaId])

  // Channel-Sync
  const subChannel = useChannel("theme-subitem")
  useChannelSync(
    "theme-subitem",
    useMemo(() => subItems.map((s) => ({ id: s.id })), [subItems])
  )

  // Auto-Select: Sobald Bereich wechselt, ersten Sub-Item selektieren
  useEffect(() => {
    if (subItems.length > 0 && !subItems.some((s) => s.id === subChannel.selectedId)) {
      subChannel.select(subItems[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, subItems.length])

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">
          {areaId
            ? BASE_AREAS.find((a) => a.id === areaId)?.label ??
              (areaId.startsWith("module:") ? "Modul" : "Sub-Items")
            : "Sub-Items"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {areaId === null && (
          <div className="p-4 text-xs text-muted-foreground text-center italic">
            Bereich links waehlen, um Sub-Items zu sehen.
          </div>
        )}
        {subItems.length === 0 && areaId !== null && (
          <div className="p-4 text-xs text-muted-foreground text-center">
            <span className="text-[9px] uppercase font-semibold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded inline-block">
              Kommt
            </span>
            <p className="mt-2">Dieser Bereich folgt in einem naechsten Push.</p>
          </div>
        )}
        {subItems.length > 0 && (
          <ul className="divide-y">
            {subItems.map((item) => {
              const isActive = subChannel.selectedId === item.id
              const isPresetActive =
                areaId === "presets" && draft.themeId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => subChannel.select(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                      isActive ? "bg-muted/70" : ""
                    }`}
                  >
                    {areaId === "presets" && (
                      <div
                        className="h-6 w-6 rounded-full shadow-sm border shrink-0"
                        style={{ background: THEMES.find((t) => t.id === item.id)?.swatch ?? "#ccc" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        {item.label}
                        {isPresetActive && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Widget — Theme-Detail (liest "theme-subitem" + "theme-area")
// ============================================================

function ThemeDetailWidget() {
  const areaChannel = useChannel("theme-area")
  const subChannel = useChannel("theme-subitem")
  const areaId = areaChannel.selectedId as ThemeAreaId | null
  const subItemId = subChannel.selectedId

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Palette className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Detail</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!areaId && (
          <div className="text-xs text-muted-foreground text-center italic">
            Bereich + Sub-Item waehlen.
          </div>
        )}
        {areaId === "presets" && subItemId && <PresetDetail themeId={subItemId} />}
        {areaId === "identity" && subItemId && (
          <IdentityDetail subItemId={subItemId as keyof ThemeVars} />
        )}
        {areaId === "topbar" && subItemId === "topbarBackground" && <TopbarDetail />}
        {areaId === "dark" && subItemId === "darkMode" && <DarkModeDetail />}
        {areaId === "background" && subItemId === "backgroundPattern" && (
          <BackgroundPatternDetail />
        )}
        {areaId &&
          areaId.startsWith("module:") &&
          subItemId === "module-config" && (
            <ModuleBridgeDetail
              moduleId={areaId.slice("module:".length)}
            />
          )}
        {areaId &&
          areaId !== "presets" &&
          areaId !== "identity" &&
          areaId !== "topbar" &&
          areaId !== "dark" &&
          areaId !== "background" &&
          !areaId.startsWith("module:") && (
            <ComingSoonInline
              label={BASE_AREAS.find((a) => a.id === areaId)?.label ?? "Bereich"}
            />
          )}
      </div>
    </div>
  )
}

function PresetDetail({ themeId }: { themeId: string }) {
  const theme = THEMES.find((t) => t.id === themeId)
  const { draft, setThemeId } = useThemeDraft()
  if (!theme) return null
  const isDraft = draft.themeId === theme.id

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-xl shadow-sm border shrink-0"
          style={{ background: theme.swatch }}
        />
        <div>
          <h2 className="text-base font-semibold">{theme.label}</h2>
          <p className="text-xs text-muted-foreground italic">{theme.mood}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {theme.description}
      </p>

      {isDraft ? (
        <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-md flex items-center gap-2">
          <Check className="h-3.5 w-3.5" />
          Diese Welt ist im Entwurf aktiv. Speichern oben uebernimmt.
        </div>
      ) : (
        <Button type="button" onClick={() => setThemeId(theme.id)} size="sm">
          Diese Welt waehlen
        </Button>
      )}
    </div>
  )
}

function IdentityDetail({ subItemId }: { subItemId: keyof ThemeVars }) {
  const item = IDENTITY_SUB_ITEMS.find((i) => i.id === subItemId)
  const { draft, setOverride, removeOverride } = useThemeDraft()
  if (!item) return null

  const overrideValue = draft.overrides[subItemId]
  const hasOverride = !!overrideValue

  const theme = THEMES.find((t) => t.id === draft.themeId) ?? THEMES[0]
  const defaultHex =
    subItemId === "primary" || subItemId === "accent"
      ? theme.swatch
      : subItemId === "background"
        ? "#FFFFFF"
        : "#1A1A1A"
  const pickerValue = hasOverride ? overrideValue! : defaultHex

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <h2 className="text-base font-semibold">{item.label}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      </div>

      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => setOverride(subItemId, e.target.value)}
          className="h-12 w-12 rounded cursor-pointer border-0 bg-transparent"
          aria-label={`${item.label} Farbe waehlen`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono">{pickerValue}</div>
          <div className="text-[10px] text-muted-foreground">
            {hasOverride ? "eigener Wert" : "Preset-Anker"}
          </div>
        </div>
        {hasOverride && (
          <button
            type="button"
            onClick={() => removeOverride(subItemId)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
            title="Override entfernen — Preset-Wert nutzen"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        Die Farbe wird live auf der ganzen App angewendet. Speichern oben
        uebernimmt sie fuer alle Mitglieder.
      </div>
    </div>
  )
}

// ============================================================
// Module-Tab — Liste · Konfig · Preview
// ============================================================

function ModuleListWidget({ group }: { group: Group }) {
  const allModules = useMemo(() => getAllModules(), [])
  const updateGroup = useUpdateGroup()
  const isAdmin = useIsSpaceAdmin(group.id)
  const enabled = (group.data?.modules as string[] | undefined) ?? []
  const [busyId, setBusyId] = useState<string | null>(null)

  const channel = useChannel("module")
  useChannelSync(
    "module",
    useMemo(() => allModules.map((m) => ({ id: m.id })), [allModules])
  )

  // Brueckenruf aus dem Theme-Tab — selektiert das Modul beim Tab-Wechsel
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ moduleId: string }>).detail
      if (detail?.moduleId) channel.select(detail.moduleId)
    }
    window.addEventListener("rln-settings-select-module", handler)
    return () => window.removeEventListener("rln-settings-select-module", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = async (modId: string) => {
    if (!isAdmin) return
    setBusyId(modId)
    try {
      const isOn = enabled.includes(modId)
      const next = isOn ? enabled.filter((x) => x !== modId) : [...enabled, modId]
      await updateGroup(group.id, {
        data: { ...(group.data ?? {}), modules: next },
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Puzzle className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Module</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {enabled.length} / {allModules.length}
        </span>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y">
        {allModules.map((m) => {
          const isOn = enabled.includes(m.id)
          const isActive = channel.selectedId === m.id
          const isBusy = busyId === m.id
          const Icon = m.icon ?? Puzzle
          return (
            <li key={m.id}>
              <div
                className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                  isActive ? "bg-muted/70" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => channel.select(m.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {isOn ? "aktiv" : "aus"}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  disabled={!isAdmin || isBusy}
                  className="shrink-0 disabled:opacity-40"
                  aria-label={`${m.label} ${isOn ? "deaktivieren" : "aktivieren"}`}
                  title={isAdmin ? undefined : "Nur Admins"}
                >
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      isOn ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                        isOn ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ModuleConfigWidget({ group }: { group: Group }) {
  const channel = useChannel("module")
  const allModules = useMemo(() => getAllModules(), [])
  const selectedMod = useMemo(
    () => (channel.selectedId ? allModules.find((m) => m.id === channel.selectedId) : null),
    [channel.selectedId, allModules]
  )
  const enabled = (group.data?.modules as string[] | undefined) ?? []
  const isOn = selectedMod ? enabled.includes(selectedMod.id) : false

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">
          {selectedMod ? selectedMod.label : "Konfig"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedMod && (
          <div className="text-xs text-muted-foreground italic text-center py-6">
            Modul links waehlen, um Details zu sehen.
          </div>
        )}
        {selectedMod && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center shrink-0">
                <selectedMod.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold leading-tight">
                  {selectedMod.label}
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">
                  id: {selectedMod.id}
                </p>
              </div>
              <span
                className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                  isOn
                    ? "text-emerald-700 bg-emerald-200/60"
                    : "text-muted-foreground bg-muted/40"
                }`}
              >
                {isOn ? "aktiv" : "aus"}
              </span>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
              Aktivierung steuerst du links per Toggle. Die feinere
              Modul-Konfiguration (Karten-Pins, Kalender-Farben, Marktplatz-Schema,
              ...) wird in einem naechsten Push pro Modul ausgebaut.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ModulePreviewWidget({ group: _group }: { group: Group }) {
  const channel = useChannel("module")
  const allModules = useMemo(() => getAllModules(), [])
  const selectedMod = useMemo(
    () => (channel.selectedId ? allModules.find((m) => m.id === channel.selectedId) : null),
    [channel.selectedId, allModules]
  )

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Vorschau</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedMod && (
          <div className="text-xs text-muted-foreground italic text-center py-6">
            Modul links waehlen, um die Vorschau zu sehen.
          </div>
        )}
        {selectedMod && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                <selectedMod.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold leading-tight">
                  {selectedMod.label}
                </h3>
                <p className="text-[10px] text-muted-foreground italic">
                  Live-Vorschau folgt
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Die Live-Vorschau zeigt in einem naechsten Push, wie sich das
              Modul mit der aktuellen Theme- und Modul-Konfig anfuehlt — ohne
              die Modul-Route zu oeffnen.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Dark-Mode-Detail — Auto / Hell / Dunkel
// ============================================================

const DARK_OPTIONS: { id: DarkModeChoice; label: string; description: string; icon: LucideIcon }[] = [
  { id: "auto", label: "Auto", description: "Folgt dem System (prefers-color-scheme)", icon: Sparkles },
  { id: "light", label: "Hell", description: "Immer hell, unabhaengig vom System", icon: Sparkles },
  { id: "dark", label: "Dunkel", description: "Immer dunkel, unabhaengig vom System", icon: Moon },
]

function DarkModeDetail() {
  const { draft, setOverride, removeOverride } = useThemeDraft()
  const current = draft.overrides.darkMode

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <h2 className="text-base font-semibold">Dark Mode</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Wann zeigt sich die App in dunklen Farben.
        </p>
      </div>

      <div className="space-y-2">
        {DARK_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isActive = current === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOverride("darkMode", opt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all hover:bg-muted/30 ${
                isActive ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {opt.description}
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          )
        })}
      </div>

      {current && (
        <button
          type="button"
          onClick={() => removeOverride("darkMode")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded border"
          title="Kein Override — Toolkit-Default"
        >
          <RotateCcw className="h-3 w-3" />
          Zuruecksetzen
        </button>
      )}

      <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        Dark Mode aktiviert die `dark`-Klasse auf <code>&lt;html&gt;</code> —
        alle Komponenten mit Tailwind-Dark-Variants ziehen mit. Speichern oben
        uebernimmt fuer alle Mitglieder.
      </div>
    </div>
  )
}

// ============================================================
// Modul-Bruecke — verweist auf den Module-Tab
// ============================================================

function ModuleBridgeDetail({ moduleId }: { moduleId: string }) {
  const allModules = useMemo(() => getAllModules(), [])
  const mod = allModules.find((m) => m.id === moduleId)
  const [, setParams] = useSearchParams()

  if (!mod) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Modul {moduleId} nicht gefunden.
      </div>
    )
  }
  const Icon = mod.icon ?? Puzzle

  const goToModuleTab = () => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("tab", "modules")
        return next
      },
      { replace: false }
    )
    // Event fuer ModuleListWidget — selektiert das Modul im Channel
    window.dispatchEvent(
      new CustomEvent("rln-settings-select-module", { detail: { moduleId } })
    )
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold">{mod.label}</h2>
          <p className="text-[10px] text-muted-foreground italic">
            Modul-Konfiguration
          </p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        Pin-Stile, Layout und das spezifische Theming fuer {mod.label} leben
        im <span className="font-semibold text-foreground">Module-Tab</span>.
        So bleibt die Modul-Konfig zentral an einem Ort — der Theme-Editor
        deckt Welten, Identitaet, Topbar, Hintergrund und Dark Mode ab.
      </div>

      <Button type="button" size="sm" onClick={goToModuleTab}>
        Zum Module-Tab — {mod.label}
        <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  )
}

// ============================================================
// Hintergrund-Muster — Aus / Punkte / Linien
// ============================================================

const PATTERN_OPTIONS: { id: BackgroundPattern; label: string; description: string }[] = [
  { id: "none", label: "Aus", description: "Reiner Hintergrund ohne Muster" },
  { id: "dots", label: "Punkte", description: "Subtle Punkte-Raster" },
  { id: "grid", label: "Linien", description: "Subtle Gitter-Linien" },
]

function PatternPreview({ pattern }: { pattern: BackgroundPattern }) {
  const url: Record<BackgroundPattern, string> = {
    none: "none",
    dots:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='2' cy='2' r='1' fill='%23000' fill-opacity='0.20'/></svg>\")",
    grid:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M20 0H0V20' fill='none' stroke='%23000' stroke-opacity='0.20'/></svg>\")",
  }
  return (
    <div
      className="h-16 w-full rounded border bg-card"
      style={{ backgroundImage: url[pattern] }}
    />
  )
}

function BackgroundPatternDetail() {
  const { draft, setOverride, removeOverride } = useThemeDraft()
  const current = draft.overrides.backgroundPattern ?? "none"

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <h2 className="text-base font-semibold">Hintergrund-Muster</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Subtle Textur auf dem Seiten-Hintergrund.
        </p>
      </div>

      <div className="space-y-2">
        {PATTERN_OPTIONS.map((opt) => {
          const isActive = current === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (opt.id === "none") {
                  removeOverride("backgroundPattern")
                } else {
                  setOverride("backgroundPattern", opt.id)
                }
              }}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:bg-muted/30 ${
                isActive ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {opt.description}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <PatternPreview pattern={opt.id} />
            </button>
          )
        })}
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        Muster liegen als SVG-Pattern hinter dem Inhalt. Sehr dezent — sie geben
        Tiefe, ohne abzulenken. Speichern oben uebernimmt fuer alle Mitglieder.
      </div>
    </div>
  )
}

// ============================================================
// Admin-Tab — Rollen-Uebersicht + Mitglieder mit Rollen-Auswahl
// ============================================================

interface RoleDef {
  id: "owner" | "admin" | "member" | "guest"
  label: string
  hint: string
  rights: string[]
}

const ROLES: RoleDef[] = [
  {
    id: "owner",
    label: "Eigner",
    hint: "Erste Person im Netzwerk",
    rights: [
      "Alles. Theme, Module, Admin",
      "Eigner-Wechsel + Netzwerk loeschen",
      "Kann nicht entzogen werden",
    ],
  },
  {
    id: "admin",
    label: "Admin",
    hint: "Verwalter neben dem Eigner",
    rights: [
      "Theme + Module aendern",
      "Mitglieder-Rollen schalten",
      "Subnetzwerke anlegen",
    ],
  },
  {
    id: "member",
    label: "Mitglied",
    hint: "Aktive Teilnehmer",
    rights: [
      "Inhalte beitragen — Pins, Termine, Quests",
      "Eigenes Profil pflegen",
      "Andere sehen + begegnen",
    ],
  },
  {
    id: "guest",
    label: "Gast",
    hint: "Nur Lesen",
    rights: ["Inhalte ansehen", "Kein Beitrag", "Kein Profil sichtbar"],
  },
]

function AdminRolesWidget() {
  const channel = useChannel("admin-role")
  useChannelSync(
    "admin-role",
    useMemo(() => ROLES.map((r) => ({ id: r.id })), [])
  )

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Rollen</span>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y">
        {ROLES.map((role) => {
          const isActive = channel.selectedId === role.id
          return (
            <li key={role.id}>
              <button
                type="button"
                onClick={() => channel.select(role.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                  isActive ? "bg-muted/70" : ""
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{role.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {role.hint}
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AdminDetailWidget({
  spaceId,
  group,
}: {
  spaceId: string | null
  group: Group
}) {
  const channel = useChannel("admin-role")
  const selectedRole = useMemo(
    () => ROLES.find((r) => r.id === channel.selectedId) ?? null,
    [channel.selectedId]
  )

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">
          {selectedRole ? `Rolle: ${selectedRole.label}` : "Mitglieder + Rollen"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedRole && (
          <div className="space-y-2 border-l-2 border-primary/30 pl-3 py-1">
            <p className="text-xs text-muted-foreground italic">
              {selectedRole.hint}
            </p>
            <ul className="space-y-1">
              {selectedRole.rights.map((r) => (
                <li key={r} className="text-xs flex items-center gap-2">
                  <Check className="h-3 w-3 shrink-0 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Mitglieder im Netzwerk
          </h3>
          <MembersView
            spaceId={spaceId}
            activeGroup={group}
            allGroups={[]}
            config={undefined}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Topbar-Detail — Farbe oder Gradient fuer die Toolbar
// ============================================================

const TOPBAR_PRESETS: { id: string; label: string; value: string }[] = [
  {
    id: "macher",
    label: "Macher-Gradient",
    value:
      "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(168,85,247,0.04) 100%)",
  },
  {
    id: "lichtung",
    label: "Lichtung-Gold",
    value: "linear-gradient(90deg, rgba(212,175,55,0.10) 0%, rgba(255,236,179,0.08) 100%)",
  },
  {
    id: "marine",
    label: "Marine",
    value: "linear-gradient(90deg, rgba(30,95,142,0.08) 0%, rgba(99,180,234,0.06) 100%)",
  },
  {
    id: "wald",
    label: "Wald",
    value: "linear-gradient(90deg, rgba(59,122,69,0.08) 0%, rgba(168,212,99,0.06) 100%)",
  },
  {
    id: "nacht",
    label: "Nacht",
    value: "linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.70) 100%)",
  },
]

function TopbarDetail() {
  const { draft, setOverride, removeOverride } = useThemeDraft()
  const overrideValue = draft.overrides.topbarBackground
  const hasOverride = !!overrideValue

  // Hex-Picker fuer Solid-Color: wenn overrideValue keinem Gradient entspricht
  const [solidHex, setSolidHex] = useState<string>(() =>
    overrideValue && overrideValue.startsWith("#") ? overrideValue : "#FAF8F5"
  )

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <h2 className="text-base font-semibold">Topbar-Hintergrund</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Die obere Leiste mit Tabs und Aktionen — Farbe oder Gradient.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase font-semibold text-muted-foreground">
          Voreingestellte Gradienten
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TOPBAR_PRESETS.map((preset) => {
            const isActive = overrideValue === preset.value
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setOverride("topbarBackground", preset.value)}
                className={`relative p-2 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                  isActive ? "border-primary" : "border-border"
                }`}
              >
                <div
                  className="h-6 w-full rounded mb-1.5 border"
                  style={{ background: preset.value }}
                />
                <div className="text-[11px] font-medium truncate">{preset.label}</div>
                {isActive && (
                  <Check className="absolute top-1.5 right-1.5 h-3 w-3 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase font-semibold text-muted-foreground">
          Eigene Farbe (Solid)
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
          <input
            type="color"
            value={solidHex}
            onChange={(e) => {
              setSolidHex(e.target.value)
              setOverride("topbarBackground", e.target.value)
            }}
            className="h-12 w-12 rounded cursor-pointer border-0 bg-transparent"
            aria-label="Topbar-Farbe waehlen"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-mono">{solidHex}</div>
            <div className="text-[10px] text-muted-foreground">
              uebernimmt sofort
            </div>
          </div>
        </div>
      </div>

      {hasOverride && (
        <button
          type="button"
          onClick={() => removeOverride("topbarBackground")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded border"
          title="Zurueck zum Default-Gradient"
        >
          <RotateCcw className="h-3 w-3" />
          Zuruecksetzen
        </button>
      )}

      <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        Die Topbar-Farbe wirkt live in der Toolbar oben — in allen Modulen.
        Speichern oben uebernimmt sie fuer alle Mitglieder.
      </div>
    </div>
  )
}

// ============================================================
// Erweitert — Wrap des bestehenden AdvancedTab
// ============================================================

function AdvancedActionsWidget({ group }: { group: Group }) {
  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Erweitert</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <AdvancedTab group={group} />
      </div>
    </div>
  )
}

// ============================================================
// "Kommt" Stub-Widget
// ============================================================

function ComingSoonWidget({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold truncate flex-1">{label}</span>
        <span className="text-[9px] uppercase font-semibold text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
          Kommt
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground text-center max-w-xs">{hint}</p>
      </div>
    </div>
  )
}

function ComingSoonInline({ label }: { label: string }) {
  return (
    <div className="text-center p-6 space-y-2">
      <div className="text-[10px] uppercase font-semibold text-amber-700 bg-amber-200/60 px-2 py-1 rounded inline-block">
        Kommt
      </div>
      <p className="text-sm text-muted-foreground">
        Der Bereich <span className="font-semibold">{label}</span> folgt in einem naechsten Push.
      </p>
    </div>
  )
}
