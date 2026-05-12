import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
  PanelTop,
  Image as ImageIcon,
  Moon,
  Puzzle,
  Check,
  Loader2,
  RotateCcw,
  type LucideIcon,
} from "lucide-react"
import { Button, useUpdateGroup } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { getAllModules } from "../registry"
import { useIsSpaceAdmin } from "../use-module-config"
import {
  THEMES,
  DEFAULT_THEME_ID,
  applyThemeToRoot,
  type ThemeOverrides,
  type ThemeVars,
} from "../../themes/themes"

/**
 * ThemeView — Theme-Editor pro Netzwerk im Drilldown-Pattern.
 *
 * Aufbau (Desktop): 3 Spalten — Bereiche · Sub-Items · Detail
 * Aufbau (Mobile): Firefox-Drilldown — Bereiche → Sub-Items → Detail
 *
 * Bereiche:
 *   - Welten        — 5 Presets (aktiv)
 *   - Identitaet    — Primary / Accent / Background / Foreground (aktiv)
 *   - Topbar        — kommt
 *   - Hintergrund   — kommt
 *   - Dark Mode     — kommt
 *   - <pro Modul>   — kommt (Karte-Pins, Kalender-Farben, ...)
 *
 * Datenmodell:
 *   group.data.theme            = "<preset-id>"     (Basis-Preset)
 *   group.data.themeOverrides   = Partial<ThemeVars> (Einzel-Overrides)
 *
 * Effektive Theme-Vars werden in applyThemeToRoot gemergt:
 *   Preset-Vars + Overrides (Overrides gewinnen).
 *
 * Live-Preview: jede Aenderung im Draft wird sofort aufs documentElement
 * geschrieben. Speichern persistiert in `group.data.themeOverrides`.
 */

type AreaId =
  | "presets"
  | "identity"
  | "topbar"
  | "background"
  | "dark"
  | `module:${string}`

interface AreaDef {
  id: AreaId
  label: string
  hint: string
  icon: LucideIcon
  ready: boolean
}

const BASE_AREAS: AreaDef[] = [
  { id: "presets", label: "Welten", hint: "5 vorgefertigte Themes", icon: Sparkles, ready: true },
  { id: "identity", label: "Identitaet", hint: "Primary, Accent, Background, Foreground", icon: Palette, ready: true },
  { id: "topbar", label: "Topbar", hint: "Farbe, Gradient, Logo", icon: PanelTop, ready: false },
  { id: "background", label: "Hintergrund", hint: "Tint, Pattern", icon: ImageIcon, ready: false },
  { id: "dark", label: "Dark Mode", hint: "Auto / Hell / Dunkel", icon: Moon, ready: false },
]

interface IdentitySubItem {
  id: keyof ThemeVars
  label: string
  description: string
}

const IDENTITY_SUB_ITEMS: IdentitySubItem[] = [
  { id: "primary", label: "Primary", description: "Buttons, Pins, Links" },
  { id: "accent", label: "Accent", description: "Hover, Highlight" },
  { id: "background", label: "Background", description: "Seiten-Hintergrund" },
  { id: "foreground", label: "Foreground", description: "Standard-Schrift" },
]

export function ThemeView({ spaceId, activeGroup }: ModuleViewProps) {
  const isAdmin = useIsSpaceAdmin(spaceId)
  const updateGroup = useUpdateGroup()
  const allModules = useMemo(() => getAllModules(), [])

  const currentThemeId =
    (activeGroup?.data?.theme as string | undefined) ?? DEFAULT_THEME_ID
  const savedOverridesRaw =
    (activeGroup?.data?.themeOverrides as ThemeOverrides | undefined) ?? {}
  // Stabilisieren via JSON-Key
  const savedOverridesKey = JSON.stringify(savedOverridesRaw)

  const [draftThemeId, setDraftThemeId] = useState<string>(currentThemeId)
  const [draftOverrides, setDraftOverrides] = useState<ThemeOverrides>(savedOverridesRaw)
  const [selectedAreaId, setSelectedAreaId] = useState<AreaId | null>(null)
  const [selectedSubItemId, setSelectedSubItemId] = useState<keyof ThemeVars | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync Drafts wenn die Group sich aendert (z.B. Save erfolgreich)
  useEffect(() => {
    setDraftThemeId(currentThemeId)
    setDraftOverrides(JSON.parse(savedOverridesKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThemeId, savedOverridesKey])

  // Live-Preview Drafts aufs Document anwenden
  const draftOverridesKey = JSON.stringify(draftOverrides)
  useEffect(() => {
    applyThemeToRoot(draftThemeId, draftOverrides)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftThemeId, draftOverridesKey])

  const isDirty =
    draftThemeId !== currentThemeId || draftOverridesKey !== savedOverridesKey

  // Module-Bereiche aus aktivierten Modulen (alle Stubs in Push 3a)
  const moduleAreas: AreaDef[] = useMemo(() => {
    const moduleIds = (activeGroup?.data?.modules as string[] | undefined) ?? []
    return moduleIds
      .map((id) => allModules.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map((m) => ({
        id: `module:${m.id}` as AreaId,
        label: m.label,
        hint: `Theme fuer ${m.label}`,
        icon: m.icon ?? Puzzle,
        ready: false,
      }))
  }, [activeGroup, allModules])

  const areas = useMemo(() => [...BASE_AREAS, ...moduleAreas], [moduleAreas])

  const handleSelectArea = (id: AreaId) => {
    setSelectedAreaId(id)
    if (id === "identity") {
      setSelectedSubItemId("primary")
    } else {
      setSelectedSubItemId(null)
    }
  }

  const handleSave = async () => {
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
  }

  const handleCancel = () => {
    setDraftThemeId(currentThemeId)
    setDraftOverrides(JSON.parse(savedOverridesKey))
  }

  if (!activeGroup) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Bitte ein Netzwerk waehlen, um das Theme anzupassen.
      </div>
    )
  }

  // Beim Drilldown-Mobile: wenn area sub-items hat (identity) und kein sub gewaehlt,
  // zeige SubItemList; sonst direkt Detail.
  const showSubItemListMobile =
    selectedAreaId === "identity" && selectedSubItemId === null
  const showDetailMobile =
    selectedAreaId !== null && !showSubItemListMobile

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar: Speichern + Abbrechen (sticky oben) */}
      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-amber-50 dark:bg-amber-900/20">
          <span className="text-xs text-muted-foreground flex-1">
            Aenderungen aktiv —{" "}
            {isAdmin
              ? "Speichern uebernimmt fuer alle Mitglieder."
              : "Nur Admins koennen speichern."}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
            className="text-xs"
          >
            Abbrechen
          </Button>
          {isAdmin && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="text-xs"
            >
              {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Speichern
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-destructive/5 border-b border-destructive/30 px-4 py-1.5">
          {error}
        </div>
      )}

      {/* Desktop: 3 Spalten */}
      <div className="hidden md:grid md:grid-cols-[220px_240px_1fr] flex-1 min-h-0">
        <AreaListColumn
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelect={handleSelectArea}
        />
        <SubItemColumn
          areaId={selectedAreaId}
          selectedSubItemId={selectedSubItemId}
          onSelectSubItem={setSelectedSubItemId}
        />
        <DetailColumn
          areaId={selectedAreaId}
          selectedSubItemId={selectedSubItemId}
          draftThemeId={draftThemeId}
          draftOverrides={draftOverrides}
          onSelectPreset={setDraftThemeId}
          onSetOverride={(key, value) =>
            setDraftOverrides((prev) => ({ ...prev, [key]: value }))
          }
          onRemoveOverride={(key) =>
            setDraftOverrides((prev) => {
              const next = { ...prev }
              delete next[key]
              return next
            })
          }
        />
      </div>

      {/* Mobile: Drilldown */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        {selectedAreaId === null && (
          <AreaListColumn
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelect={handleSelectArea}
          />
        )}
        {showSubItemListMobile && (
          <div className="flex-1 flex flex-col">
            <BackBar
              label="Bereiche"
              onBack={() => {
                setSelectedAreaId(null)
                setSelectedSubItemId(null)
              }}
            />
            <SubItemColumn
              areaId={selectedAreaId}
              selectedSubItemId={selectedSubItemId}
              onSelectSubItem={setSelectedSubItemId}
            />
          </div>
        )}
        {showDetailMobile && (
          <div className="flex-1 flex flex-col">
            <BackBar
              label={selectedAreaId === "identity" ? "Identitaet" : "Bereiche"}
              onBack={() => {
                if (selectedAreaId === "identity") {
                  setSelectedSubItemId(null)
                } else {
                  setSelectedAreaId(null)
                }
              }}
            />
            <DetailColumn
              areaId={selectedAreaId}
              selectedSubItemId={selectedSubItemId}
              draftThemeId={draftThemeId}
              draftOverrides={draftOverrides}
              onSelectPreset={setDraftThemeId}
              onSetOverride={(key, value) =>
                setDraftOverrides((prev) => ({ ...prev, [key]: value }))
              }
              onRemoveOverride={(key) =>
                setDraftOverrides((prev) => {
                  const next = { ...prev }
                  delete next[key]
                  return next
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Spalte 1 — Bereich-Liste
// ============================================================

function AreaListColumn({
  areas,
  selectedAreaId,
  onSelect,
}: {
  areas: AreaDef[]
  selectedAreaId: AreaId | null
  onSelect: (id: AreaId) => void
}) {
  return (
    <div className="md:border-r overflow-y-auto">
      <div className="px-3 py-2 border-b bg-muted/30">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bereiche
        </h3>
      </div>
      <ul className="divide-y">
        {areas.map((area) => {
          const Icon = area.icon
          const isActive = selectedAreaId === area.id
          return (
            <li key={area.id}>
              <button
                type="button"
                onClick={() => onSelect(area.id)}
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
// Spalte 2 — Sub-Items
// ============================================================

function SubItemColumn({
  areaId,
  selectedSubItemId,
  onSelectSubItem,
}: {
  areaId: AreaId | null
  selectedSubItemId: keyof ThemeVars | null
  onSelectSubItem: (id: keyof ThemeVars) => void
}) {
  if (areaId === null) {
    return (
      <div className="hidden md:flex md:border-r items-center justify-center text-xs text-muted-foreground p-4">
        Bereich waehlen
      </div>
    )
  }
  if (areaId !== "identity") {
    return (
      <div className="hidden md:flex md:border-r items-center justify-center text-xs text-muted-foreground p-4 text-center">
        Direkt im Detail
      </div>
    )
  }
  return (
    <div className="md:border-r overflow-y-auto">
      <div className="px-3 py-2 border-b bg-muted/30">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Identitaet
        </h3>
      </div>
      <ul className="divide-y">
        {IDENTITY_SUB_ITEMS.map((item) => {
          const isActive = selectedSubItemId === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectSubItem(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                  isActive ? "bg-muted/70" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
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
    </div>
  )
}

// ============================================================
// Spalte 3 — Detail
// ============================================================

function DetailColumn({
  areaId,
  selectedSubItemId,
  draftThemeId,
  draftOverrides,
  onSelectPreset,
  onSetOverride,
  onRemoveOverride,
}: {
  areaId: AreaId | null
  selectedSubItemId: keyof ThemeVars | null
  draftThemeId: string
  draftOverrides: ThemeOverrides
  onSelectPreset: (id: string) => void
  onSetOverride: (key: keyof ThemeVars, value: string) => void
  onRemoveOverride: (key: keyof ThemeVars) => void
}) {
  if (areaId === null) {
    return (
      <div className="hidden md:flex items-center justify-center text-xs text-muted-foreground p-4">
        Bereich waehlen, um Details zu sehen
      </div>
    )
  }

  if (areaId === "presets") {
    return (
      <PresetsDetail draftThemeId={draftThemeId} onSelectPreset={onSelectPreset} />
    )
  }

  if (areaId === "identity" && selectedSubItemId) {
    return (
      <IdentityDetail
        subItemId={selectedSubItemId}
        draftThemeId={draftThemeId}
        draftOverrides={draftOverrides}
        onSetOverride={onSetOverride}
        onRemoveOverride={onRemoveOverride}
      />
    )
  }

  // Stub fuer alle "kommt"-Bereiche
  return (
    <div className="flex items-center justify-center text-center p-8">
      <div className="max-w-sm space-y-2">
        <div className="text-xs uppercase font-semibold text-amber-700 bg-amber-200/60 px-2 py-1 rounded inline-block">
          Kommt
        </div>
        <p className="text-sm text-muted-foreground">
          Dieser Bereich folgt im naechsten Push.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// Detail — Presets (5 Welten)
// ============================================================

function PresetsDetail({
  draftThemeId,
  onSelectPreset,
}: {
  draftThemeId: string
  onSelectPreset: (id: string) => void
}) {
  return (
    <div className="overflow-y-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const isActive = draftThemeId === theme.id
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectPreset(theme.id)}
              className={`relative p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-7 w-7 rounded-full shadow-sm border"
                  style={{ background: theme.swatch }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {theme.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground italic truncate">
                    {theme.mood}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {theme.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Detail — Identitaet (Color-Picker pro Sub-Item)
// ============================================================

function IdentityDetail({
  subItemId,
  draftThemeId,
  draftOverrides,
  onSetOverride,
  onRemoveOverride,
}: {
  subItemId: keyof ThemeVars
  draftThemeId: string
  draftOverrides: ThemeOverrides
  onSetOverride: (key: keyof ThemeVars, value: string) => void
  onRemoveOverride: (key: keyof ThemeVars) => void
}) {
  const item = IDENTITY_SUB_ITEMS.find((i) => i.id === subItemId)
  if (!item) return null

  const overrideValue = draftOverrides[subItemId]
  const hasOverride = !!overrideValue

  // Picker-Default — bei keiner Override: Theme.swatch als Anker
  const theme = THEMES.find((t) => t.id === draftThemeId) ?? THEMES[0]
  const defaultHex =
    subItemId === "primary" || subItemId === "accent"
      ? theme.swatch
      : subItemId === "background"
        ? "#FFFFFF"
        : "#1A1A1A"
  const pickerValue = hasOverride ? overrideValue! : defaultHex

  return (
    <div className="overflow-y-auto p-4 space-y-4 max-w-md">
      <div>
        <h2 className="text-base font-semibold">{item.label}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      </div>

      <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onSetOverride(subItemId, e.target.value)}
          className="h-12 w-12 rounded cursor-pointer border-0 bg-transparent"
          aria-label={`${item.label} Farbe waehlen`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono">{pickerValue}</div>
          <div className="text-[10px] text-muted-foreground">
            {hasOverride ? "eigener Wert" : "Preset-Wert (Anker)"}
          </div>
        </div>
        {hasOverride && (
          <button
            type="button"
            onClick={() => onRemoveOverride(subItemId)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
            title="Override entfernen, Preset-Wert nutzen"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
        💡 Die Farbe wird live im Hintergrund angewendet. Speichern oben in der
        Toolbar uebernimmt sie fuer alle Mitglieder.
      </div>
    </div>
  )
}

// ============================================================
// Mobile-Drilldown Zurueck-Bar
// ============================================================

function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 px-3 py-2 border-b text-sm hover:bg-muted/50 transition-colors text-left shrink-0"
    >
      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </button>
  )
}
