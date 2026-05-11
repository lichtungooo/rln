import { useEffect, useMemo, useState } from "react"
import {
  Settings as SettingsIcon,
  Home,
  Palette,
  Puzzle,
  Hammer,
  Users,
  Sparkles,
  Wrench,
  X,
  Camera,
  PanelRightOpen,
  PanelRightClose,
  Heart,
  Star,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  Button,
  Label,
  Input,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useUpdateGroup,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import { ThemeView } from "../modules/theme/ThemeView"
import { MembersView } from "../modules/members/MembersView"
import { ModulschmiedeView } from "../modules/modulschmiede/ModulschmiedeView"
import { DemoSection } from "../demo/DemoSection"
import { TagInput } from "../modules/profile/TagInput"
import { ImageUploadField } from "../modules/calendar/ImageUploadField"
import { getAllModules, getModule, getModuleConfig } from "../modules/registry"
import {
  generateSlug,
  isValidSlug,
  isSlugFree,
  canBeParent,
  collectAllHashtags,
  getSpaceMeta,
} from "../spaces/space-data"
import { useGroups } from "@real-life-stack/toolkit"
import { useModuleConfig } from "../modules/use-module-config"
import { MapSettingsPanel } from "../modules/map/MapSettingsPanel"
import { MapView, DEFAULT_PIN_STYLES, type MapModuleConfig } from "../modules/map/MapView"
import { CalendarSettingsPanel } from "../modules/calendar/CalendarSettingsPanel"
import { CalendarView, type CalendarModuleConfig } from "../modules/calendar/CalendarView"
import { ChevronDown } from "lucide-react"

/**
 * SpaceSettings — Vollbild-Konfigurations-Dialog pro Space.
 *
 * Linke Sidebar: Tabs (Allgemein, Theme, Module, Modulschmiede, Mitglieder,
 * Demo-Daten, Erweitert). Rechter Content: Inhalt des aktiven Tabs.
 *
 * Phase A: Allgemein + Theme + Mitglieder + Demo. Module + Modulschmiede
 * folgen in Phase B.
 *
 * Geoeffnet wird der Dialog ueber den Settings-Knopf in der Navbar (Admin-
 * sichtbar) oder ueber Inline-Zahnraeder in den Modulen, die direkt zum
 * passenden Tab springen.
 */

export type SpaceSettingsTab =
  | "general"
  | "theme"
  | "modules"
  | "modulschmiede"
  | "members"
  | "demo"
  | "advanced"

export interface SpaceSettingsProps {
  open: boolean
  onClose: () => void
  spaceId: string | null
  activeGroup: Group | null
  /** Welcher Tab beim Oeffnen aktiv sein soll. Default: "general". */
  initialTab?: SpaceSettingsTab
  /** Wenn gesetzt: im Module-Tab automatisch dieses Modul aufgeklappt zeigen. */
  initialModuleId?: string | null
}

interface TabDef {
  id: SpaceSettingsTab
  label: string
  icon: LucideIcon
  hint?: string
}

const TABS: TabDef[] = [
  { id: "general", label: "Allgemein", icon: Home, hint: "Name, Beschreibung" },
  { id: "theme", label: "Theme", icon: Palette, hint: "Farbwelt + Stimmung" },
  { id: "modules", label: "Module", icon: Puzzle, hint: "Was kann der Space" },
  { id: "modulschmiede", label: "Modulschmiede", icon: Hammer, hint: "Eigene Module bauen" },
  { id: "members", label: "Mitglieder", icon: Users, hint: "Rollen, Admins" },
  { id: "demo", label: "Demo-Daten", icon: Sparkles, hint: "Showroom-Inhalte" },
  { id: "advanced", label: "Erweitert", icon: Wrench, hint: "Reset, Export" },
]

export function SpaceSettings({
  open,
  onClose,
  spaceId,
  activeGroup,
  initialTab = "general",
  initialModuleId = null,
}: SpaceSettingsProps) {
  const [activeTab, setActiveTab] = useState<SpaceSettingsTab>(initialTab)
  const [previewVisible, setPreviewVisible] = useState(true)
  // Sub-Selection pro Tab — z.B. fuer Module-Tab welches Modul gerade
  // selektiert ist (Detail wandert in Spalte 3)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId)

  // Wenn Dialog mit initialTab/initialModuleId neu geoeffnet wird:
  // den State entsprechend setzen.
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
      setSelectedModuleId(initialModuleId)
    }
  }, [open, initialTab, initialModuleId])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="max-w-none w-screen h-[100dvh] p-0 gap-0 overflow-hidden rounded-none border-none"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          {/* Header — Tab-Buttons OBEN (wie Profil) + Close-Button rechts */}
          <div
            className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b shrink-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(168,85,247,0.04) 100%)",
            }}
          >
            <SettingsIcon className="h-4 w-4 text-primary shrink-0" />
            {/* Tab-Buttons im Modul-Doktrin-Stil — scrollen horizontal bei eng */}
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md transition-colors shrink-0 ${
                      isActive
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title={tab.hint}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
            <span className="text-[11px] text-muted-foreground truncate hidden lg:inline shrink-0 max-w-[20rem]">
              {activeGroup?.name ?? "Kein Space"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body: 3-Spalten-Drilldown unter dem Tab-Header */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {!activeGroup && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Bitte einen Space waehlen, um die Einstellungen zu oeffnen.
              </div>
            )}

            {activeGroup && (
              <SettingsBody
                activeTab={activeTab}
                spaceId={spaceId}
                activeGroup={activeGroup}
                selectedModuleId={selectedModuleId}
                setSelectedModuleId={setSelectedModuleId}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// SettingsBody — 3-Spalten-Drilldown unter dem Top-Tab-Header.
// Spalte 1 (Sub-Liste): nur fuer Tabs mit Sub-Hierarchie (Module).
// Spalte 2 (Editor): Form / Liste — der Hauptinhalt des Tabs.
// Spalte 3 (Detail/Preview): Live-Vorschau oder Sub-Item-Detail.
// Auf Mobile: Firefox-Drilldown (eines nach dem anderen, Wisch + Zurueck).
// ============================================================

function SettingsBody({
  activeTab,
  spaceId,
  activeGroup,
  selectedModuleId,
  setSelectedModuleId,
}: {
  activeTab: SpaceSettingsTab
  spaceId: string | null
  activeGroup: Group
  selectedModuleId: string | null
  setSelectedModuleId: (id: string | null) => void
}) {
  // Mobile-Erkennung
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Welche Spalten hat dieser Tab?
  const hasSubList = activeTab === "modules" // spaeter: auch members, modulschmiede
  const hasPreview = tabHasPreview(activeTab) || (activeTab === "modules" && !!selectedModuleId)

  const subList = hasSubList ? renderSubList(activeTab, activeGroup, selectedModuleId, setSelectedModuleId) : null
  const editor = renderEditor(activeTab, spaceId, activeGroup, selectedModuleId, setSelectedModuleId)
  const preview = renderPreview(activeTab, activeGroup, selectedModuleId, setSelectedModuleId)

  // Mobile: Firefox-Drilldown — eines nach dem anderen
  if (isMobile) {
    return (
      <div className="h-full overflow-y-auto p-3">
        {/* Falls Sub-Liste vorhanden und nichts ausgewaehlt: Liste anzeigen */}
        {hasSubList && !selectedModuleId && subList}
        {/* Falls Sub-Liste vorhanden und Item ausgewaehlt: Detail mit Zurueck */}
        {hasSubList && selectedModuleId && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedModuleId(null)}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              ← Zurueck zur Modul-Liste
            </button>
            {preview}
          </div>
        )}
        {/* Sonst: Editor + ggf. Preview untereinander */}
        {!hasSubList && (
          <div className="space-y-4">
            {editor}
            {hasPreview && preview && (
              <div className="border-t pt-4">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 tracking-wider">
                  Vorschau
                </div>
                {preview}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Desktop: 3 feste Spalten unter dem Tab-Header
  return (
    <div className="grid h-full grid-cols-[1fr_1.4fr_1.4fr]">
      {/* Spalte 1: Sub-Liste (nur bei Tabs mit Hierarchie) */}
      <div
        className="border-r overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(232,117,26,0.03) 0%, rgba(168,85,247,0.03) 100%)",
        }}
      >
        <div className="p-3 sm:p-4">
          {subList ?? (
            <p className="text-[11px] text-muted-foreground italic">
              {TABS.find((t) => t.id === activeTab)?.hint ?? "—"}
            </p>
          )}
        </div>
      </div>
      {/* Spalte 2: Editor / Form / Inhalt */}
      <div className="overflow-y-auto border-r">
        <div className="p-3 sm:p-6">{editor}</div>
      </div>
      {/* Spalte 3: Detail / Preview / Hint */}
      <div
        className="overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(232,117,26,0.02) 0%, rgba(168,85,247,0.03) 100%)",
        }}
      >
        <div className="p-3 sm:p-6">
          {hasPreview && preview ? (
            <>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-3 tracking-wider">
                {activeTab === "modules" ? "Modul-Konfig" : "Live-Vorschau"}
              </div>
              {preview}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground italic px-6">
              <p>
                Detail-Ansicht. Klick auf einen Eintrag links zeigt hier die
                Konfiguration oder Vorschau.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// renderSubList — Spalte 1: nur fuer Tabs mit Hierarchie
function renderSubList(
  tab: SpaceSettingsTab,
  group: Group,
  selectedModuleId: string | null,
  setSelectedModuleId: (id: string | null) => void,
): React.ReactNode {
  if (tab === "modules") {
    const all = getAllModules()
    const fn = FUNCTION_MODULE_IDS.map((id) => all.find((m) => m.id === id)).filter(
      (m): m is NonNullable<typeof m> => Boolean(m)
    )
    const rest = all.filter((m) => !FUNCTION_MODULE_IDS.includes(m.id))
    const sorted = [...fn, ...rest]
    const enabled = (group.data?.modules as string[] | undefined) ?? FUNCTION_MODULE_IDS
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Module ({enabled.length} aktiv)
        </p>
        {sorted.map((mod) => {
          const Icon = mod.icon
          const isOn = enabled.includes(mod.id)
          const isSelected = selectedModuleId === mod.id
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModuleId(mod.id)}
              className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
                isSelected
                  ? "bg-primary/10 border border-primary/50 shadow-sm"
                  : "border border-transparent hover:bg-muted/40"
              } ${!isOn ? "opacity-50" : ""}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{mod.label}</span>
              {!isOn && (
                <span className="text-[9px] text-muted-foreground italic">aus</span>
              )}
            </button>
          )
        })}
      </div>
    )
  }
  return null
}

// ============================================================
// EmbeddedView — Wrapper damit eingebettete Modul-Views
// nicht ihren eigenen Page-Container nochmal mitbringen
// ============================================================

function EmbeddedView({ children }: { children: React.ReactNode }) {
  return <div className="-m-4 sm:-m-6">{children}</div>
}

// ============================================================
// Tab-Renderer
// ============================================================

function tabHasPreview(tab: SpaceSettingsTab): boolean {
  // Nur Tabs mit sinnvoller Live-Vorschau melden true. Phase B (Module-Tab)
  // schaltet sein Preview spaeter anhand des aktiven Sub-Moduls ein.
  return tab === "theme" || tab === "general"
}

function renderEditor(
  tab: SpaceSettingsTab,
  spaceId: string | null,
  activeGroup: Group,
  selectedModuleId: string | null,
  onSelectModuleId: (id: string | null) => void,
): React.ReactNode {
  switch (tab) {
    case "general":
      return <GeneralTab group={activeGroup} />
    case "theme":
      return (
        <EmbeddedView>
          <ThemeView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
    case "modules":
      return (
        <ModuleInfo
          group={activeGroup}
          selectedModuleId={selectedModuleId}
        />
      )
    case "modulschmiede":
      return (
        <EmbeddedView>
          <ModulschmiedeView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
    case "members":
      return (
        <EmbeddedView>
          <MembersView
            spaceId={spaceId}
            activeGroup={activeGroup}
            allGroups={[]}
            config={undefined}
          />
        </EmbeddedView>
      )
    case "demo":
      return (
        <div className="max-w-md mx-auto">
          <DemoSection />
        </div>
      )
    case "advanced":
      return <AdvancedTab group={activeGroup} />
  }
}

function renderPreview(
  tab: SpaceSettingsTab,
  activeGroup: Group,
  selectedModuleId: string | null,
  onSelectModuleId: (id: string | null) => void,
): React.ReactNode {
  switch (tab) {
    case "theme":
      return <ThemePreview groupName={activeGroup.name} />
    case "general":
      return <GeneralPreview group={activeGroup} />
    case "modules":
      if (selectedModuleId) {
        return (
          <ModuleDetailPanel
            moduleId={selectedModuleId}
            group={activeGroup}
            onClose={() => onSelectModuleId(null)}
          />
        )
      }
      return null
    default:
      return null
  }
}

// ============================================================
// Vorschauen
// ============================================================

function ThemePreview({ groupName }: { groupName: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{groupName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            So sehen Karten und Buttons in deinem Space aus. Klick auf ein
            Theme links — die Vorschau wechselt sofort mit.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">Werkstatt eintragen</Button>
            <Button size="sm" variant="outline">Mehr erfahren</Button>
            <Button size="sm" variant="ghost">Abbrechen</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
          <Heart className="h-4 w-4 text-primary mb-1.5" />
          <div className="text-xs font-semibold mb-0.5">Akzent-Box</div>
          <div className="text-[10px] text-muted-foreground">Primary-Farbe</div>
        </div>
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <Star className="h-4 w-4 text-secondary mb-1.5" />
          <div className="text-xs font-semibold mb-0.5">Card-Beispiel</div>
          <div className="text-[10px] text-muted-foreground">Standard-Look</div>
        </div>
      </div>

      <div className="rounded-lg border p-3 bg-card">
        <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 tracking-wider">
          Sample-Liste
        </div>
        <ul className="space-y-1.5 text-xs">
          {["Holzwerkstatt Kreuzberg", "FabLab Schwabing", "Reparatur-Cafe Ehrenfeld"].map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="flex-1 truncate">{name}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function GeneralPreview({ group }: { group: Group }) {
  const { data: allGroups } = useGroups()
  const meta = getSpaceMeta(group)
  const parent = meta.parentSpaceId
    ? allGroups.find((g) => g.id === meta.parentSpaceId)
    : null
  const slugUrl = meta.slug ? `/spaces/${meta.slug}` : `/spaces/${group.id.slice(0, 8)}…`

  return (
    <div className="space-y-4">
      {/* URL-Pfad-Vorschau */}
      <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
        <span className="text-muted-foreground">real-life.network</span>
        <span className="text-primary font-semibold">{slugUrl}</span>
        <span className="text-muted-foreground">/karte</span>
      </div>

      <Card>
        <CardHeader className="pb-2">
          {parent && (
            <div className="text-[10px] text-muted-foreground mb-1">
              Sub-Space von <span className="text-foreground font-medium">{parent.name}</span>
            </div>
          )}
          <CardTitle className="text-base">{group.name || "(ohne Namen)"}</CardTitle>
          {meta.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {meta.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {meta.hashtags && meta.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            So erscheint dein Space im Workspace-Switcher, in Einladungen
            und im Spaces-Browser.
          </p>
        </CardContent>
      </Card>

      {/* Workspace-Switcher-Darstellung */}
      <div className="rounded-md border bg-muted/30 px-3 py-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-[10px] font-semibold text-primary">
          {(group.name.trim()[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{group.name || "(ohne Namen)"}</div>
          <div className="text-[10px] text-muted-foreground">
            {parent ? `↳ unter ${parent.name}` : "Root-Space"}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Tab: Allgemein
// ============================================================

function GeneralTab({ group }: { group: Group }) {
  const updateGroup = useUpdateGroup()
  const { data: allGroups } = useGroups()
  const meta = getSpaceMeta(group)

  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(meta.description ?? "")
  const [slug, setSlug] = useState(meta.slug ?? "")
  const [hashtags, setHashtags] = useState<string[]>(meta.hashtags ?? [])
  const [parentSpaceId, setParentSpaceId] = useState<string>(meta.parentSpaceId ?? "")
  const initialImage = (group.data?.image as string | undefined) ?? (group.data?.avatar as string | undefined)
  const [image, setImage] = useState<string | undefined>(initialImage)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Slug-Validierung
  const slugError = useMemo(() => {
    if (!slug) return null
    if (!isValidSlug(slug)) {
      return "Slug nur Kleinbuchstaben, Zahlen, Bindestriche."
    }
    if (!isSlugFree(allGroups, slug, group.id)) {
      return "Dieser Slug wird schon von einem anderen Space genutzt."
    }
    return null
  }, [slug, allGroups, group.id])

  // Parent-Optionen — alle Spaces ausser self und seine Nachfahren
  const parentOptions = useMemo(() => {
    return allGroups.filter(
      (g) => g.id !== group.id && canBeParent(allGroups, group.id, g.id)
    )
  }, [allGroups, group.id])

  // Hashtag-Vorschlaege aus allen Spaces
  const hashtagSuggestions = useMemo(() => collectAllHashtags(allGroups), [allGroups])

  const handleAutoSlug = () => {
    const generated = generateSlug(name.trim() || group.name)
    setSlug(generated)
  }

  const handleSave = async () => {
    setError(null)
    if (slugError) {
      setError(slugError)
      return
    }
    setSaving(true)
    try {
      const nextData: Record<string, unknown> = { ...(group.data ?? {}) }
      nextData.description = description.trim()
      nextData.slug = slug.trim() || undefined
      nextData.hashtags = hashtags.length > 0 ? hashtags : undefined
      nextData.parentSpaceId = parentSpaceId || undefined
      nextData.image = image || undefined
      // Beim Setzen von image auch das Legacy-avatar-Feld synchron halten
      if (image) nextData.avatar = image
      else delete nextData.avatar
      // undefined-Felder loeschen, damit data sauber bleibt
      Object.keys(nextData).forEach((k) => {
        if (nextData[k] === undefined) delete nextData[k]
      })
      await updateGroup(group.id, {
        name: name.trim() || group.name,
        data: nextData,
      })
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }

  const dirty =
    name.trim() !== group.name ||
    description.trim() !== (meta.description ?? "") ||
    slug.trim() !== (meta.slug ?? "") ||
    parentSpaceId !== (meta.parentSpaceId ?? "") ||
    image !== initialImage ||
    JSON.stringify(hashtags) !== JSON.stringify(meta.hashtags ?? [])

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-0.5">Allgemein</h3>
        <p className="text-xs text-muted-foreground">
          Name, Logo, Beschreibung, URL-Slug, Eltern-Space, Hashtags.
        </p>
      </div>

      <div className="space-y-3">
        {/* Avatar zuerst — wie im Profil-Dialog. Tap/Klick oeffnet Auswahl. */}
        <SpaceAvatarUpload
          image={image}
          name={name}
          onChange={setImage}
        />

        <div>
          <Label className="text-xs">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Macher Berlin Mitte"
          />
        </div>

        <div>
          <Label className="text-xs">Beschreibung</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es?"
            className="min-h-16"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">URL-Slug</Label>
            <button
              type="button"
              onClick={handleAutoSlug}
              className="text-[10px] text-primary hover:underline"
            >
              Aus Name
            </button>
          </div>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="macher-berlin-mitte"
            className={slugError ? "border-destructive" : ""}
          />
          {slugError && (
            <p className="text-[10px] text-destructive mt-1">{slugError}</p>
          )}
        </div>

        <div>
          <Label className="text-xs">Eltern-Space</Label>
          <select
            value={parentSpaceId}
            onChange={(e) => setParentSpaceId(e.target.value)}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm"
          >
            <option value="">— Root-Space —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs">Hashtags</Label>
          <TagInput
            value={hashtags}
            onChange={(next) => setHashtags(next.map((t) => t.replace(/^#/, "").toLowerCase()))}
            placeholder="handwerk, regional ..."
            suggestions={hashtagSuggestions}
            quickSuggestions={8}
          />
        </div>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
          {error}
        </div>
      )}

      {/* Sticky Save am Boden — auch bei aufgeschlagener Tastatur sichtbar */}
      <div
        className="sticky bottom-0 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 bg-background/95 backdrop-blur border-t flex items-center justify-end gap-2"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {savedAt && !dirty && (
          <span className="text-[11px] text-muted-foreground">Gespeichert.</span>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving || Boolean(slugError)}
        >
          {saving ? "Speichere..." : "Speichern"}
        </Button>
      </div>
    </div>
  )
}

/**
 * SpaceAvatarUpload — kompakte Avatar-Auswahl im Stil des Profil-Dialogs.
 * Tap/Klick aufs Bild oeffnet File-Picker. Camera-Pin und X-Knopf sind auf
 * Touch-Geraeten sichtbar (kein Hover noetig).
 */
function SpaceAvatarUpload({
  image,
  name,
  onChange,
}: {
  image?: string
  name: string
  onChange: (value: string | undefined) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const initial = (name?.trim() ?? "?").slice(0, 1).toUpperCase() || "?"

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    try {
      const { resizeImage } = await import("@real-life-stack/toolkit/lib/image-utils")
      const base64 = await resizeImage(file, 400, 0.85)
      onChange(base64)
      setError(null)
    } catch {
      setError("Bild konnte nicht verarbeitet werden")
    }
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        {image ? (
          <>
            <label className="block w-16 h-16 cursor-pointer">
              <img
                src={image}
                alt={name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-background shadow-sm"
              />
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            <label className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-primary text-primary-foreground border-2 border-background rounded-full shadow-sm cursor-pointer hover:bg-primary/90">
              <Camera className="h-3 w-3" />
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute -top-1 -right-1 p-1 bg-destructive text-white rounded-full shadow-sm hover:bg-destructive/90"
              aria-label="Bild entfernen"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/50">
            <span className="text-lg font-semibold text-muted-foreground/60">{initial}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs">Logo</Label>
        <p className="text-[11px] text-muted-foreground">
          Erscheint im Switcher.
        </p>
        {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
      </div>
    </div>
  )
}

// ============================================================
// Platzhalter — werden in Phase B/C gefuellt
// ============================================================

// ============================================================
// Tab: Module — An/Aus + Sub-Konfig mit Live-Preview
// ============================================================

const FUNCTION_MODULE_IDS = ["dashboard", "map", "kanban", "calendar", "marketplace", "quest", "skill-tree", "avatar"]

const MODULES_WITH_CONFIG = new Set(["map", "calendar"])

// ============================================================
// ModuleInfo — Spalte 2 im Module-Tab: zeigt Beschreibung + Toggle
// fuer das ausgewaehlte Modul. Detail-Konfig wandert in Spalte 3.
// ============================================================

function ModuleInfo({
  group,
  selectedModuleId,
}: {
  group: Group
  selectedModuleId: string | null
}) {
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)
  const enabled = (group.data?.modules as string[] | undefined) ?? FUNCTION_MODULE_IDS

  if (!selectedModuleId) {
    return (
      <div className="text-xs text-muted-foreground italic">
        <p>Klick auf ein Modul links — hier siehst du Beschreibung + Status.</p>
        <p className="mt-2">Detail-Konfiguration erscheint rechts in Spalte 3.</p>
      </div>
    )
  }

  const mod = getModule(selectedModuleId)
  if (!mod) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Modul nicht gefunden: {selectedModuleId}
      </p>
    )
  }

  const isOn = enabled.includes(mod.id)
  const hasConfig = MODULES_WITH_CONFIG.has(mod.id)

  const toggle = async () => {
    setBusy(true)
    try {
      const next = isOn ? enabled.filter((x) => x !== mod.id) : [...enabled, mod.id]
      await updateGroup(group.id, { data: { ...(group.data ?? {}), modules: next } })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center">
          <mod.icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{mod.label}</h3>
          <p className="text-[11px] text-muted-foreground">id: {mod.id}</p>
        </div>
      </div>

      <div className="border rounded-md p-3 flex items-center gap-3 bg-muted/10">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Modul im Space aktiv</div>
          <p className="text-[11px] text-muted-foreground">
            {isOn
              ? "Erscheint als Tab in der Modul-Leiste oben."
              : "Modul ist ausgeschaltet — kein Tab sichtbar."}
          </p>
        </div>
        <label className="inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isOn}
            onChange={toggle}
            disabled={busy}
            className="sr-only peer"
          />
          <div className={`relative w-10 h-5 rounded-full transition-colors ${
            isOn ? "bg-primary" : "bg-muted-foreground/30"
          }`}>
            <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              isOn ? "translate-x-5" : "translate-x-0"
            }`} />
          </div>
        </label>
      </div>

      <div className="text-xs text-muted-foreground">
        {hasConfig ? (
          <p>
            Dieses Modul hat eine eigene Konfiguration — siehe rechts in
            Spalte 3.
          </p>
        ) : (
          <p>
            Konfiguration erfolgt direkt im Modul (Drag-and-Drop fuer
            Slots, Resize an der Ecke, "+" fuer neue Pages).
          </p>
        )}
      </div>
    </div>
  )
}

// ModulesTab — alte Liste, wird nicht mehr direkt genutzt (renderSubList
// uebernimmt die Liste in Spalte 1). Bleibt fuer Backward-Compat erhalten.
function ModulesTab({
  group,
  selectedModuleId,
  onSelectModuleId,
}: {
  group: Group
  selectedModuleId: string | null
  onSelectModuleId: (id: string | null) => void
}) {
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)

  const enabled = useMemo<string[]>(
    () => (group.data?.modules as string[] | undefined) ?? FUNCTION_MODULE_IDS,
    [group.data?.modules]
  )

  const sortedModules = useMemo(() => {
    const all = getAllModules()
    const fn = FUNCTION_MODULE_IDS
      .map((id) => all.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
    const rest = all.filter((m) => !FUNCTION_MODULE_IDS.includes(m.id))
    return [...fn, ...rest]
  }, [])

  const toggleModule = async (id: string) => {
    setBusy(true)
    try {
      const next = enabled.includes(id)
        ? enabled.filter((x) => x !== id)
        : [...enabled, id]
      await updateGroup(group.id, {
        data: { ...(group.data ?? {}), modules: next },
      })
    } finally {
      setBusy(false)
    }
  }

  // Klick auf Modul-Namen waehlt es aus — Detail erscheint in Spalte 3.
  const openConfig = (id: string) => {
    onSelectModuleId(id)
  }

  return (<div className="space-y-3">
    <div className="max-w-2xl">
      <h3 className="text-base font-semibold mb-0.5">Module</h3>
      <p className="text-xs text-muted-foreground">
        Schalte ein, was dieser Space koennen soll. Aktive Module erscheinen sofort als Tab.
        Klick auf Modul-Namen oeffnet die Konfiguration in der Spalte rechts.
      </p>
    </div>

    <div className="space-y-1.5 max-w-2xl">
      {sortedModules.map((mod) => {
        const Icon = mod.icon
        const isOn = enabled.includes(mod.id)
        const hasConfig = MODULES_WITH_CONFIG.has(mod.id)
        const isSelected = selectedModuleId === mod.id
        return (
          <div
            key={mod.id}
            className={`border rounded-md transition-colors ${
              isSelected ? "border-primary bg-primary/5 shadow-sm" : isOn ? "bg-card" : "bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2.5 px-3 py-2">
              <Icon className={`h-4 w-4 shrink-0 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
              <button
                type="button"
                onClick={() => (hasConfig && isOn ? openConfig(mod.id) : null)}
                disabled={!hasConfig || !isOn}
                className={`flex-1 min-w-0 text-left ${
                  hasConfig && isOn ? "cursor-pointer hover:opacity-80" : "cursor-default"
                }`}
              >
                <div className="text-sm font-medium leading-tight flex items-center gap-1.5">
                  {mod.label}
                  {hasConfig && isOn && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggleModule(mod.id)}
                  disabled={busy}
                  className="sr-only peer"
                />
                <div className={`relative w-9 h-5 rounded-full transition-colors ${
                  isOn ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isOn ? "translate-x-4" : "translate-x-0"
                  }`} />
                </div>
              </label>
            </div>
          </div>
        )
      })}
    </div>
  </div>
  )
}

// ============================================================
// ModuleDetailPanel — Modul-Konfig in Spalte 3 von SpaceSettings
// ============================================================

function ModuleDetailPanel({
  moduleId,
  group,
  onClose,
}: {
  moduleId: string
  group: Group
  onClose: () => void
}) {
  const { setModuleConfig } = useModuleConfig()
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<unknown>(null)

  // Beim Wechsel des moduleId: draft neu laden
  useEffect(() => {
    if (!MODULES_WITH_CONFIG.has(moduleId)) {
      setDraft(null)
      return
    }
    const mod = getModule(moduleId)
    if (!mod) return
    const current = getModuleConfig(group, moduleId, mod.defaultConfig)
    setDraft(current ?? mod.defaultConfig ?? {})
  }, [moduleId, group])

  const mod = getModule(moduleId)
  if (!mod) {
    return (
      <div className="text-xs text-muted-foreground italic p-2">
        Modul nicht gefunden.
      </div>
    )
  }

  if (!MODULES_WITH_CONFIG.has(moduleId)) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <mod.icon className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">{mod.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Dieses Modul hat aktuell keine Konfiguration. Aenderungen
          (Pages, Slots) erfolgen direkt im Modul ueber Drag-and-Drop
          und Resize.
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    if (draft === null) return
    setBusy(true)
    try {
      await setModuleConfig(group, moduleId, draft)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <mod.icon className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold flex-1">{mod.label} konfigurieren</h3>
        <Button type="button" size="sm" onClick={handleSave} disabled={busy || draft === null}>
          {busy ? "Speichere..." : "Speichern"}
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/10 p-3 overflow-y-auto">
          {draft !== null && (
            <ModuleConfigEditor
              moduleId={moduleId}
              draft={draft}
              setDraft={setDraft}
            />
          )}
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Live-Vorschau
      </div>
      <div className="border rounded-md overflow-hidden h-[40vh]">
        {draft !== null && <ModuleConfigPreview moduleId={moduleId} draft={draft} />}
      </div>
    </div>
  )
}

// ============================================================
// ModuleConfigSplit — Editor + Live-Preview pro Modul
// ============================================================

/**
 * ModuleConfigFullscreen — ersetzt den ModulesTab-Inhalt komplett, wenn
 * ein Modul zur Konfiguration ausgewaehlt ist. So bekommt Editor + Live-
 * Vorschau die volle verfuegbare Hoehe (vorher: 60vh-Quetsche).
 *
 * Layout: Header oben (Zurueck + Title + Speichern), darunter zwei Spalten —
 * Editor links (~40%, scroll), Live-Vorschau rechts (~60%, fix).
 */
function ModuleConfigFullscreen({
  moduleId,
  moduleLabel,
  draft,
  setDraft,
  onSave,
  onBack,
  saving,
}: {
  moduleId: string
  moduleLabel: string
  draft: unknown
  setDraft: (next: unknown) => void
  onSave: () => void
  onBack: () => void
  saving: boolean
}) {
  return (
    <div className="-m-4 sm:-m-6 flex flex-col h-full min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={saving} className="text-xs">
          ← Module
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight truncate">
            {moduleLabel} konfigurieren
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Aenderungen sind erst nach "Speichern" persistent — die Vorschau zeigt sie sofort.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={saving}>
          Abbrechen
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Speichere..." : "Speichern"}
        </Button>
      </div>

      {/* Body: Editor + Live-Vorschau */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(320px,40%)_1fr] gap-0 lg:divide-x min-h-0">
        {/* Editor */}
        <div className="overflow-y-auto p-4 bg-muted/10">
          <ModuleConfigEditor
            moduleId={moduleId}
            draft={draft}
            setDraft={setDraft}
          />
        </div>

        {/* Live-Vorschau */}
        <div className="bg-background flex flex-col min-h-0">
          <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Live-Vorschau
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ModuleConfigPreview moduleId={moduleId} draft={draft} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Modul-spezifische Editor + Preview Adapter
// ============================================================

function ModuleConfigEditor({
  moduleId,
  draft,
  setDraft,
}: {
  moduleId: string
  draft: unknown
  setDraft: (next: unknown) => void
}) {
  if (moduleId === "map") {
    const pinTypeOptions = Object.entries(DEFAULT_PIN_STYLES).map(([id, s]) => ({
      id,
      label: s.label,
      defaultColor: s.color,
    }))
    return (
      <MapSettingsPanel
        config={draft as MapModuleConfig}
        onChange={(next) => setDraft(next)}
        pinTypeOptions={pinTypeOptions}
      />
    )
  }
  if (moduleId === "calendar") {
    return (
      <CalendarSettingsPanel
        config={draft as CalendarModuleConfig}
        onChange={(next) => setDraft(next)}
      />
    )
  }
  return (
    <div className="text-xs text-muted-foreground">
      Kein Konfigurations-Editor verfuegbar.
    </div>
  )
}

function ModuleConfigPreview({ moduleId, draft }: { moduleId: string; draft: unknown }) {
  if (moduleId === "map") {
    return (
      <MapView
        spaceId={null}
        activeGroup={null}
        allGroups={[]}
        config={draft as MapModuleConfig}
        isPreview
      />
    )
  }
  if (moduleId === "calendar") {
    return (
      <div className="h-full overflow-y-auto p-3">
        <CalendarView
          spaceId={null}
          activeGroup={null}
          allGroups={[]}
          config={draft as CalendarModuleConfig}
          isPreview
        />
      </div>
    )
  }
  return (
    <div className="h-full grid place-items-center text-xs text-muted-foreground p-4">
      Keine Vorschau verfuegbar.
    </div>
  )
}

// ============================================================
// Tab: Erweitert
// ============================================================

function AdvancedTab({ group }: { group: Group }) {
  const updateGroup = useUpdateGroup()
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const moduleConfigs = (group.data?.moduleConfig as Record<string, unknown> | undefined) ?? {}
  const configCount = Object.keys(moduleConfigs).length

  const resetModuleConfigs = async () => {
    setBusy(true)
    try {
      const next = { ...(group.data ?? {}) }
      delete (next as { moduleConfig?: unknown }).moduleConfig
      await updateGroup(group.id, { data: next })
      setConfirmReset(false)
    } finally {
      setBusy(false)
    }
  }

  const exportSpaceJson = () => {
    const blob = new Blob([JSON.stringify(group, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `space-${group.id.slice(0, 12)}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1">Erweitert</h3>
        <p className="text-xs text-muted-foreground">
          Werkzeuge fuer Aufraeumen, Export und Reset.
        </p>
      </div>

      {/* Export */}
      <div className="border rounded-md p-3 bg-card space-y-2">
        <div>
          <h4 className="text-sm font-semibold">Space exportieren</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Laedt die Group-Daten als JSON herunter — Name, Beschreibung,
            Mitglieder, Modul-Konfig, Theme. Items selbst sind getrennt im
            WoT gespeichert.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={exportSpaceJson}>
          JSON herunterladen
        </Button>
      </div>

      {/* Modul-Konfig zuruecksetzen */}
      <div className="border rounded-md p-3 bg-card space-y-2">
        <div>
          <h4 className="text-sm font-semibold">Modul-Konfiguration zuruecksetzen</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Setzt alle pro-Modul-Einstellungen (Karte, Kalender, ...) auf
            ihre Default-Werte zurueck. Der Modul-Tab zeigt wieder die
            volle Demo-First-Ausstattung.
          </p>
          {configCount > 0 && (
            <p className="text-[11px] text-amber-700 mt-1">
              Aktuell {configCount} Modul{configCount === 1 ? "" : "e"} mit eigener Konfig.
            </p>
          )}
        </div>
        {!confirmReset ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setConfirmReset(true)}
            disabled={busy || configCount === 0}
          >
            Zuruecksetzen
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-[11px] text-amber-700">Wirklich alle Modul-Konfigs zuruecksetzen?</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmReset(false)} disabled={busy}>
              Abbrechen
            </Button>
            <Button type="button" size="sm" onClick={resetModuleConfigs} disabled={busy}>
              {busy ? "Setze zurueck..." : "Ja, zuruecksetzen"}
            </Button>
          </div>
        )}
      </div>

      <div className="border border-dashed rounded-md p-3 text-[11px] text-muted-foreground/80 leading-relaxed">
        💡 Demo-Daten loeschen geht im Tab "Demo-Daten". Mitglieder verwalten
        im Tab "Mitglieder". Theme zuruecksetzen via Theme-Tab → Macher-Orange.
      </div>
    </div>
  )
}
