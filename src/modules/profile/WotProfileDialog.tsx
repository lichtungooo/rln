/**
 * WotProfileDialog — schlankes Profil im WoT-Geist.
 *
 * Ersetzt den frueheren MacherProfileDialog. Folgt Antons Identity-Page-
 * Pattern aus dem web-of-trust/apps/demo: Avatar + Name + Bio + DID + Logout
 * als Kern. Macher-spezifische Felder (Offers, Needs, Skills) bleiben
 * einklappbar — die schwergewichtigen Sektionen (LifeThread, VIA, Circles,
 * ShareProfiles, ElderStatus) wandern in eigene Modul-Sichten.
 *
 * Stand 14.05.2026 spaet abends.
 */

import { useState, useEffect } from "react"
import {
  Copy,
  Check,
  Camera,
  ImagePlus,
  X,
  LogOut,
  Globe,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
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
import { TagInput } from "./TagInput"

export interface WotProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: {
    did: string
    name?: string
    bio?: string
    avatar?: string
    offers?: string[]
    needs?: string[]
    skills?: string[]
    [key: string]: unknown
  }
  contactCount?: number
  onSave: (updates: Record<string, unknown>) => Promise<void>
  onLogout?: () => Promise<void>
}

export function WotProfileDialog({
  open,
  onOpenChange,
  profile,
  contactCount,
  onSave,
  onLogout,
}: WotProfileDialogProps) {
  const [name, setName] = useState(profile.name ?? "")
  const [bio, setBio] = useState(profile.bio ?? "")
  const [avatar, setAvatar] = useState(profile.avatar ?? "")
  const [offers, setOffers] = useState<string[]>(profile.offers ?? [])
  const [needs, setNeeds] = useState<string[]>(profile.needs ?? [])
  const [skills, setSkills] = useState<string[]>(profile.skills ?? [])
  const [showMacherFelder, setShowMacherFelder] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    setName(profile.name ?? "")
    setBio(profile.bio ?? "")
    setAvatar(profile.avatar ?? "")
    setOffers(profile.offers ?? [])
    setNeeds(profile.needs ?? [])
    setSkills(profile.skills ?? [])
    setError(null)
  }, [profile, open])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    try {
      const mod = await import("@real-life-stack/toolkit/lib/image-utils")
      const base64 = await mod.resizeImage(file, 200, 0.8)
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
      const updates: Record<string, unknown> = {
        avatar,
        name: name.trim(),
        bio: bio.trim(),
        offers: offers.filter((o) => o.trim()),
        needs: needs.filter((n) => n.trim()),
        skills: skills.filter((s) => s.trim()),
      }
      await onSave(updates)
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fehler beim Speichern"
      if (/not authenticated|nicht authentifiziert|no identity/i.test(msg)) {
        setError("Erst mit den 12 Worten anmelden, dann das Profil tragen.")
      } else {
        setError(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (!onLogout) return
    setLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setLoggingOut(false)
    }
  }

  const handleCopyDid = async () => {
    try {
      await navigator.clipboard.writeText(profile.did)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API kann blockiert sein — kein harter Fehler.
    }
  }

  const shortDid =
    profile.did.length > 24
      ? `${profile.did.slice(0, 16)}...${profile.did.slice(-8)}`
      : profile.did

  const macherFelderCount = offers.length + needs.length + skills.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md w-screen h-[100dvh] sm:h-auto sm:max-h-[90vh] gap-0 p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Mein Profil</DialogTitle>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar + Name + DID */}
          <div className="flex items-center gap-4">
            <AvatarUpload
              avatar={avatar}
              name={name}
              onUpload={handleAvatarUpload}
              onClear={() => setAvatar("")}
            />
            <div className="flex-1 min-w-0">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                className="h-9 text-base font-semibold"
              />
              <button
                onClick={handleCopyDid}
                className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted transition-colors"
                title="DID kopieren"
              >
                <code className="text-[10px] font-mono text-muted-foreground tracking-tight">
                  {shortDid}
                </code>
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground/50" />
                )}
              </button>
              {contactCount != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {contactCount} {contactCount === 1 ? "Kontakt" : "Kontakte"}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Wer bist du?</Label>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                <Globe className="h-2.5 w-2.5" />
                Oeffentlich
              </span>
            </div>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ein Satz, ein Bild, eine Spur."
              maxLength={280}
              className="min-h-20"
            />
          </div>

          {/* Macher-Felder einklappbar */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowMacherFelder((v) => !v)}
              className="w-full flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {showMacherFelder ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Macher-Felder
              </span>
              {macherFelderCount > 0 && (
                <span className="text-xs text-muted-foreground">{macherFelderCount}</span>
              )}
            </button>
            {showMacherFelder && (
              <div className="mt-3 space-y-3 pl-5">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Was ich anbiete</Label>
                  <TagInput
                    value={offers}
                    onChange={setOffers}
                    placeholder="Begabung, Werkzeug, Begleitung"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Was ich suche</Label>
                  <TagInput
                    value={needs}
                    onChange={setNeeds}
                    placeholder="Was du brauchst"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Skills</Label>
                  <TagInput
                    value={skills}
                    onChange={setSkills}
                    placeholder="Was du kannst"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter
          className="shrink-0 px-6 py-4 border-t bg-background flex items-center"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut || saving}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3 w-3 mr-1" />
              {loggingOut ? "..." : "Abmelden"}
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Schliessen
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Speichere..." : "Speichern"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- AvatarUpload ---

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
          <label className="block w-16 h-16 cursor-pointer">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-background shadow-sm"
            />
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </label>
          <label className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-primary text-primary-foreground border-2 border-background rounded-full shadow-sm cursor-pointer hover:bg-primary/90">
            <Camera className="h-3 w-3" />
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </label>
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
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}
