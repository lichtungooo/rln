import { useState, useEffect, useRef } from "react"
import { Copy, Check, ImagePlus, X, Camera, Pencil, Lock, Globe } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
} from "@real-life-stack/toolkit"
import type { ProfileModuleConfig, ModuleFieldConfig } from "../types"
import { TagInput } from "./TagInput"
import { LifeThreadCard } from "./LifeThreadCard"
import type { LifeThreadData } from "./life-thread"
import { PastExperiencesSection } from "./PastExperiencesSection"
import { ViaStrengthsSection } from "./ViaStrengthsSection"
import { CirclesSection } from "./CirclesSection"
import { ShareProfilesSection } from "./ShareProfilesSection"

export interface MacherProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: ProfileModuleConfig
  /** Aktuelle Profil-Daten (alle Felder, Schluessel = field.id) */
  profile: {
    did: string
    avatar?: string
    [field: string]: unknown
  }
  contactCount?: number
  onSave: (updates: Record<string, unknown>) => Promise<void>
}

export function MacherProfileDialog({
  open,
  onOpenChange,
  config,
  profile,
  contactCount,
  onSave,
}: MacherProfileDialogProps) {
  // State pro Feld — initialisiert aus profile
  const [values, setValues] = useState<Record<string, unknown>>(() => initValues(config, profile))
  // Avatar — falls ein Mobile-Browser-Remount (nach Kamera-Aufruf)
  // passiert ist, das schwebende Avatar-Bild aus sessionStorage holen.
  const [avatar, setAvatar] = useState(() => {
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem("macher-profile-pending-avatar")
      if (pending) return pending
    }
    return profile.avatar ?? ""
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [lifeThread, setLifeThread] = useState<LifeThreadData | undefined>(
    profile.lifeThread as LifeThreadData | undefined
  )

  // Avatar in sessionStorage spiegeln, damit ein Browser-Remount nach
  // Kamera-Aufruf das Bild nicht verliert. Beim ersten Save oder Abbrechen
  // raeumt der MacherApp-useEffect den Schluessel wieder weg.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (avatar) {
      sessionStorage.setItem("macher-profile-pending-avatar", avatar)
    }
  }, [avatar])

  // Reset state when profile changes (z.B. neuer Connector geladen).
  // Avatar nicht ueberschreiben wenn ein "pending"-Wert da ist (User
  // war gerade beim Foto-Auswaehlen, Wert kommt aus sessionStorage).
  useEffect(() => {
    setValues(initValues(config, profile))
    setLifeThread(profile.lifeThread as LifeThreadData | undefined)
    if (typeof window === "undefined" || !sessionStorage.getItem("macher-profile-pending-avatar")) {
      setAvatar(profile.avatar ?? "")
    }
  }, [profile, config])

  const setField = (id: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    try {
      const { resizeImage } = await import("@real-life-stack/toolkit/lib/image-utils")
      const base64 = await resizeImage(file, 200, 0.8)
      setAvatar(base64)
    } catch {
      setError("Bild konnte nicht verarbeitet werden")
    }
    e.target.value = ""
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Cleanup: leere Strings/Arrays nicht speichern (verschmutzt das Profil)
      const updates: Record<string, unknown> = { avatar }
      for (const field of config.fields) {
        const v = values[field.id]
        if (v === undefined || v === null) continue
        if (typeof v === "string" && v.trim() === "") continue
        if (Array.isArray(v) && v.length === 0) continue
        updates[field.id] = typeof v === "string" ? v.trim() : v
      }
      // Lebens-Faden — nur speichern wenn etwas drin steht
      if (lifeThread && (lifeThread.birthYear || Object.keys(lifeThread.phases ?? {}).length > 0)) {
        updates.lifeThread = lifeThread
      }
      await onSave(updates)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleCopyDid = async () => {
    await navigator.clipboard.writeText(profile.did)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortDid = profile.did.length > 24
    ? `${profile.did.slice(0, 16)}...${profile.did.slice(-8)}`
    : profile.did

  // Felder nach order sortieren
  const sortedFields = [...config.fields].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  // Name-Feld separat aus dem Header rendern (falls im Schema definiert)
  const nameField = sortedFields.find((f) => f.id === "name")
  const otherFields = sortedFields.filter((f) => f.id !== "name")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md w-screen h-[100dvh] sm:h-auto sm:max-h-[90vh] gap-0 p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Profil bearbeiten</DialogTitle>

        {/* Scroll-Bereich (Header + Felder) — Footer bleibt drunter sichtbar */}
        <div className="flex-1 overflow-y-auto">
          {/* Header: Avatar + Name + DID */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                avatar={avatar}
                name={(values.name as string) ?? ""}
                onUpload={handleAvatarUpload}
                onClear={() => setAvatar("")}
              />
              <div className="flex-1 min-w-0">
                {nameField && (
                  <Input
                    value={(values.name as string) ?? ""}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder={nameField.placeholder ?? "Dein Name"}
                    className="h-8 text-base font-semibold border-transparent shadow-none bg-transparent px-1 hover:bg-muted/50 focus:bg-card focus:border-input transition-all"
                  />
                )}
                <button
                  onClick={handleCopyDid}
                  className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted transition-colors"
                  title="DID kopieren"
                >
                  <code className="text-[10px] font-mono text-muted-foreground tracking-tight">{shortDid}</code>
                  {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground/50" />}
                </button>
                {contactCount != null && (
                  <p className="text-xs text-muted-foreground mt-1">{contactCount} Kontakte</p>
                )}
              </div>
            </div>
          </div>

          {/* Felder */}
          <div className="px-6 pb-6 space-y-4">
            {otherFields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(val) => setField(field.id, val)}
              />
            ))}

            {/* Lebens-Faden (Phase F4) — Steiner/Lievegoed 7-Jahres-Phasen */}
            <LifeThreadCard value={lifeThread} onChange={setLifeThread} />

            {/* Charakter-Staerken (Phase F6) — VIA-Onboarding-Quiz */}
            <ViaStrengthsSection />

            {/* Vergangenheits-Erfahrungen (Phase F5) — Backdating mit XP */}
            <PastExperiencesSection lifeThread={lifeThread} />

            {/* Kreise (Phase F8) — Diaspora-Aspects-Pattern */}
            <CirclesSection />

            {/* Sicht-Profile (Phase F8) — Quick-Share, wer sieht was */}
            <ShareProfilesSection />

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        {/* Footer — bleibt unten sichtbar, auch wenn Tastatur sich oeffnet */}
        <DialogFooter
          className="shrink-0 px-6 py-4 border-t bg-background"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Helpers ---

function initValues(
  config: ProfileModuleConfig,
  profile: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of config.fields) {
    const v = profile[field.id]
    if (field.type === "tags") {
      out[field.id] = Array.isArray(v) ? v : []
    } else {
      out[field.id] = v ?? ""
    }
  }
  return out
}

function AvatarUpload({
  avatar,
  name,
  onUpload,
  onClear,
}: {
  avatar: string
  name: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}) {
  return (
    <div className="relative shrink-0">
      {avatar ? (
        <>
          {/* Bild ist Klick-Ziel: oeffnet File-Picker */}
          <label className="block w-16 h-16 cursor-pointer">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-background shadow-sm"
            />
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
          {/* Camera-Pin — auf Touch sichtbar */}
          <label className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-primary text-primary-foreground border-2 border-background rounded-full shadow-sm cursor-pointer hover:bg-primary/90">
            <Camera className="h-3 w-3" />
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </label>
          {/* X — auf Touch sichtbar */}
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-1 -right-1 p-1 bg-destructive text-white rounded-full shadow-sm hover:bg-destructive/90"
            aria-label="Bild entfernen"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <label className="w-16 h-16 rounded-full border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex items-center justify-center cursor-pointer transition-all hover:bg-muted/50">
          <ImagePlus className="h-5 w-5 text-muted-foreground/40" />
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </label>
      )}
    </div>
  )
}

function VisibilityBadge({ visibility }: { visibility: ModuleFieldConfig["visibility"] }) {
  if (visibility === "public") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
        <Globe className="h-2.5 w-2.5" />
        Oeffentlich
      </span>
    )
  }
  if (visibility === "contacts") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700/80">
        <Lock className="h-2.5 w-2.5" />
        Nur Kontakte
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
      <Lock className="h-2.5 w-2.5" />
      Privat
    </span>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ModuleFieldConfig
  value: unknown
  onChange: (val: unknown) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={`field-${field.id}`} className="text-xs text-muted-foreground">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <VisibilityBadge visibility={field.visibility} />
      </div>

      {field.type === "tags" ? (
        <TagInput
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          placeholder={field.placeholder}
          suggestions={field.suggestions}
        />
      ) : field.type === "textarea" ? (
        <Textarea
          id={`field-${field.id}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="min-h-20"
        />
      ) : field.type === "select" ? (
        <select
          id={`field-${field.id}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">- waehlen -</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <Input
          id={`field-${field.id}`}
          type={
            field.type === "phone" ? "tel"
            : field.type === "email" ? "email"
            : field.type === "url" ? "url"
            : field.type === "number" ? "number"
            : "text"
          }
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="h-9"
        />
      )}

      {field.hint && (
        <p className="text-[11px] text-muted-foreground/70">{field.hint}</p>
      )}
    </div>
  )
}
