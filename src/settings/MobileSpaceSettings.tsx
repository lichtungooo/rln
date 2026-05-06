/**
 * MobileSpaceSettings — aufgeraeumte Settings im Firefox-Drilldown-Pattern.
 *
 * Vollbild-Liste auf der Top-Page, Klick fuehrt in eine Sub-Page mit
 * Zurueck-Pfeil. Save-Buttons sind sticky am Boden mit safe-area-inset.
 *
 * Bewusst KEIN Modul-Konfigurator embedded — die Module-Sub-Page zeigt
 * nur Toggle (an/aus). Konfiguration kommt spaeter ueber Modulschmiede
 * (KI-Prompt). Siehe `feedback_mobile_aufgeraeumt.md`.
 */

import { useEffect, useMemo, useState } from "react"
import {
  Home,
  Palette,
  Puzzle,
  Users,
  Sparkles,
  Wrench,
  ArrowLeft,
  X,
  ChevronRight,
  Camera,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  useUpdateGroup,
  useGroups,
} from "@real-life-stack/toolkit"
import type { Group } from "@real-life-stack/data-interface"
import { TagInput } from "../modules/profile/TagInput"
import { ThemeView } from "../modules/theme/ThemeView"
import { MembersView } from "../modules/members/MembersView"
import { DemoSection } from "../demo/DemoSection"
import { getAllModules } from "../modules/registry"
import {
  generateSlug,
  isValidSlug,
  isSlugFree,
  canBeParent,
  collectAllHashtags,
  getSpaceMeta,
} from "../spaces/space-data"

// Welche Module sind Funktions-Module (immer in der Liste sichtbar)?
const FUNCTION_MODULE_IDS = [
  "dashboard",
  "map",
  "kanban",
  "calendar",
  "marketplace",
  "wissensfeld",
  "skill-tree",
  "avatar",
  "quest",
  "members",
]

type MobilePage =
  | null
  | "general"
  | "theme"
  | "modules"
  | "members"
  | "demo"
  | "advanced"

interface MenuEntry {
  id: Exclude<MobilePage, null>
  label: string
  hint: string
  icon: LucideIcon
}

const ENTRIES: MenuEntry[] = [
  { id: "general", label: "Allgemein", hint: "Name, Logo, Beschreibung", icon: Home },
  { id: "theme", label: "Theme", hint: "Farbwelt + Stimmung", icon: Palette },
  { id: "modules", label: "Module", hint: "Was der Space kann", icon: Puzzle },
  { id: "members", label: "Mitglieder", hint: "Rollen", icon: Users },
  { id: "demo", label: "Demo-Daten", hint: "Showroom-Inhalte", icon: Sparkles },
  { id: "advanced", label: "Erweitert", hint: "Reset, Export", icon: Wrench },
]

export interface MobileSpaceSettingsProps {
  open: boolean
  onClose: () => void
  spaceId: string | null
  activeGroup: Group | null
  initialPage?: MobilePage
}

export function MobileSpaceSettings({
  open,
  onClose,
  spaceId,
  activeGroup,
  initialPage = null,
}: MobileSpaceSettingsProps) {
  const [page, setPage] = useState<MobilePage>(initialPage)

  // Beim Oeffnen oder bei initialPage-Wechsel die Sub-Page setzen
  useEffect(() => {
    if (open) setPage(initialPage)
  }, [open, initialPage])

  const handleClose = () => {
    setPage(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose()
      }}
    >
      <DialogContent
        className="max-w-none w-screen h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[92vh] p-0 gap-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Space-Einstellungen</DialogTitle>

        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-background px-2">
          {page !== null ? (
            <button
              type="button"
              onClick={() => setPage(null)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
              aria-label="Zurueck"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-9 ml-1 flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-primary" />
            </div>
          )}
          <h2 className="flex-1 text-base font-semibold text-foreground line-clamp-1">
            {page === null
              ? activeGroup?.name ?? "Einstellungen"
              : ENTRIES.find((e) => e.id === page)?.label ?? ""}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Inhalt */}
        <div className="flex-1 overflow-y-auto">
          {!activeGroup ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Bitte einen Space waehlen.
            </div>
          ) : page === null ? (
            <MenuList onSelect={(id) => setPage(id)} />
          ) : page === "general" ? (
            <GeneralSubPage group={activeGroup} onClose={handleClose} />
          ) : page === "theme" ? (
            <ThemeSubPage group={activeGroup} spaceId={spaceId} />
          ) : page === "modules" ? (
            <ModulesSubPage group={activeGroup} />
          ) : page === "members" ? (
            <MembersSubPage group={activeGroup} spaceId={spaceId} />
          ) : page === "demo" ? (
            <DemoSubPage group={activeGroup} spaceId={spaceId} />
          ) : page === "advanced" ? (
            <AdvancedSubPage />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Top-Level: Liste der Sub-Pages
// ============================================================

function MenuList({ onSelect }: { onSelect: (page: Exclude<MobilePage, null>) => void }) {
  return (
    <ul className="divide-y">
      {ENTRIES.map((e) => {
        const Icon = e.icon
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelect(e.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{e.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{e.hint}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ============================================================
// Allgemein
// ============================================================

function GeneralSubPage({ group, onClose }: { group: Group; onClose: () => void }) {
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

  const slugError = useMemo(() => {
    if (!slug) return null
    if (!isValidSlug(slug)) return "Slug nur Kleinbuchstaben, Zahlen, Bindestriche."
    if (!isSlugFree(allGroups, slug, group.id)) return "Slug schon vergeben."
    return null
  }, [slug, allGroups, group.id])

  const parentOptions = useMemo(
    () => allGroups.filter((g) => g.id !== group.id && canBeParent(allGroups, group.id, g.id)),
    [allGroups, group.id]
  )

  const hashtagSuggestions = useMemo(() => collectAllHashtags(allGroups), [allGroups])

  const dirty =
    name.trim() !== group.name ||
    description.trim() !== (meta.description ?? "") ||
    slug.trim() !== (meta.slug ?? "") ||
    parentSpaceId !== (meta.parentSpaceId ?? "") ||
    image !== initialImage ||
    JSON.stringify(hashtags) !== JSON.stringify(meta.hashtags ?? [])

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
      if (image) nextData.avatar = image
      else delete nextData.avatar
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

  return (
    <div className="flex flex-col">
      <div className="px-4 py-4 space-y-4">
        <SpaceAvatarUpload image={image} name={name} onChange={setImage} />

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
              onClick={() => setSlug(generateSlug(name.trim() || group.name))}
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
          {slugError && <p className="text-[10px] text-destructive mt-1">{slugError}</p>}
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
              <option key={p.id} value={p.id}>{p.name}</option>
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
            quickSuggestions={6}
          />
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
            {error}
          </div>
        )}
      </div>

      {/* Sticky Save */}
      <div
        className="sticky bottom-0 px-4 py-3 bg-background/95 backdrop-blur border-t flex items-center justify-end gap-2"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
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
          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex items-center justify-center cursor-pointer transition-all hover:bg-muted/50">
            <span className="text-lg font-semibold text-muted-foreground/60">{initial}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs">Logo</Label>
        <p className="text-[11px] text-muted-foreground">Erscheint im Switcher.</p>
        {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
      </div>
    </div>
  )
}

// ============================================================
// Theme — wieder verwendete Komponente, in Embedded-Wrapper
// ============================================================

function ThemeSubPage({ group, spaceId }: { group: Group; spaceId: string | null }) {
  return (
    <div className="px-4 py-4">
      <ThemeView
        spaceId={spaceId}
        activeGroup={group}
        allGroups={[]}
        config={undefined}
      />
    </div>
  )
}

// ============================================================
// Module — NUR Toggle (an/aus). Kein Konfigurator!
// Konfiguration kommt spaeter ueber Modulschmiede / KI-Prompt.
// ============================================================

function ModulesSubPage({ group }: { group: Group }) {
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

  return (
    <div>
      <p className="px-4 py-3 text-xs text-muted-foreground border-b">
        Welche Module sind im Space sichtbar.
      </p>
      <ul className="divide-y">
        {sortedModules.map((mod) => {
          const Icon = mod.icon
          const isOn = enabled.includes(mod.id)
          return (
            <li key={mod.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className={`h-4 w-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0 text-sm font-medium text-foreground">
                {mod.label}
              </div>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggleModule(mod.id)}
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================
// Mitglieder
// ============================================================

function MembersSubPage({ group, spaceId }: { group: Group; spaceId: string | null }) {
  return (
    <div className="px-4 py-4">
      <MembersView
        spaceId={spaceId}
        activeGroup={group}
        allGroups={[]}
        config={undefined}
      />
    </div>
  )
}

// ============================================================
// Demo-Daten
// ============================================================

function DemoSubPage({ group, spaceId }: { group: Group; spaceId: string | null }) {
  return (
    <div className="px-4 py-4">
      <DemoSection
        spaceId={spaceId}
        activeGroup={group}
        allGroups={[]}
        config={undefined}
      />
    </div>
  )
}

// ============================================================
// Erweitert
// ============================================================

function AdvancedSubPage() {
  const handleReset = () => {
    if (!confirm("Alle lokalen Daten loeschen und neu starten?")) return
    indexedDB.databases().then((dbs) => {
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name)
      }
      localStorage.clear()
      window.location.reload()
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Lokaler Reset</h3>
        <p className="text-xs text-muted-foreground">
          Loescht IndexedDB + localStorage und laedt neu. Identitaet bleibt
          nur erhalten, wenn du die 12 Worte aufgeschrieben hast.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleReset}
          className="mt-2"
        >
          Alles zuruecksetzen
        </Button>
      </div>
    </div>
  )
}
