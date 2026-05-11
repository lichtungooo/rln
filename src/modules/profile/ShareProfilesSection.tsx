import { useState } from "react"
import { Plus, X, Eye, ChevronDown, ChevronRight } from "lucide-react"
import { Button, Input } from "@real-life-stack/toolkit"
import {
  TREE_BEREICHE,
  useCircles,
  useShareProfiles,
  DEFAULT_SHARE_PROFILES,
  type ShareProfileData,
  type TreeBereichId,
} from "../gamification"

/**
 * ShareProfilesSection — Sicht-Profile im Profil verwalten (Phase F8).
 *
 * Vier Default-Profile (Job, Date, Mentor, Lichtung) als Vorschlaege.
 * Mensch waehlt aus, welche Bereiche jedes Profil zeigt, und welche
 * Kreise dieses Profil als Default sehen.
 *
 * In F9 wird die Logik scharf: wenn jemand mein Profil oeffnet, wird
 * die Sichtbarkeit automatisch nach seinem Kreis ausgewaehlt. Hier
 * legen wir das Geruest.
 */

export function ShareProfilesSection() {
  const { mine, add, update, remove } = useShareProfiles()
  const { mine: circles } = useCircles()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleAddDefault = async (def: ShareProfileData) => {
    if (mine.some((p) => p.data.name === def.name)) return
    setBusy(true)
    try {
      await add({ ...def })
    } finally {
      setBusy(false)
    }
  }

  const missingDefaults = DEFAULT_SHARE_PROFILES.filter(
    (def) => !mine.some((p) => p.data.name === def.name)
  )

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Sicht-Profile</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mine.length} {mine.length === 1 ? "Profil" : "Profile"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Was sieht wer, wenn er mich anschaut. Pro Profil: welche Bereiche
          sichtbar, welcher Kreis das Profil als Default sieht.
        </p>
      </div>

      {/* Liste */}
      {mine.length > 0 && (
        <div className="divide-y">
          {mine.map((profile) => (
            <ShareProfileRow
              key={profile.id}
              id={profile.id}
              data={profile.data}
              circles={circles.map((c) => ({ id: c.id, name: c.data.name }))}
              expanded={expandedId === profile.id}
              onToggle={() =>
                setExpandedId((cur) => (cur === profile.id ? null : profile.id))
              }
              onUpdate={(patch) => update(profile.id, patch)}
              onRemove={() => remove(profile.id)}
            />
          ))}
        </div>
      )}

      {/* Default-Vorschlaege */}
      {missingDefaults.length > 0 && (
        <div className="p-3 border-t bg-muted/10">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Vorschlaege
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingDefaults.map((def) => (
              <button
                key={def.name}
                type="button"
                onClick={() => handleAddDefault(def)}
                disabled={busy}
                className="text-xs px-2 py-1 rounded border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                {def.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// ShareProfileRow — ein Profil in der Liste
// ============================================================

function ShareProfileRow({
  id,
  data,
  circles,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  id: string
  data: ShareProfileData
  circles: Array<{ id: string; name: string }>
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<ShareProfileData>) => Promise<void>
  onRemove: () => void
}) {
  const toggleBereich = async (b: TreeBereichId) => {
    const visible = data.visibleBereiche.includes(b)
      ? data.visibleBereiche.filter((x) => x !== b)
      : [...data.visibleBereiche, b]
    await onUpdate({ visibleBereiche: visible })
  }

  const toggleCircle = async (cId: string) => {
    const cur = data.targetCircleIds ?? []
    const next = cur.includes(cId) ? cur.filter((x) => x !== cId) : [...cur, cId]
    await onUpdate({ targetCircleIds: next })
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{data.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {data.visibleBereiche.length} Bereiche
            </span>
            {(data.targetCircleIds ?? []).length > 0 && (
              <span className="text-[10px] text-primary">
                fuer {(data.targetCircleIds ?? []).length} Kreis(e)
              </span>
            )}
          </div>
          {data.description && (
            <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">
              {data.description}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          {/* Bereiche */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              Sichtbare Bereiche
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TREE_BEREICHE.map((b) => {
                const active = data.visibleBereiche.includes(b.id)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBereich(b.id)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      active
                        ? "border-transparent text-white"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
                    }`}
                    style={active ? { background: b.color } : {}}
                  >
                    {b.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Zusatz-Sektionen */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              Zusatz-Sichtbarkeit
            </p>
            <div className="flex flex-wrap gap-1.5">
              <ToggleChip
                label="Lebens-Faden"
                active={!!data.showLifeThread}
                onClick={() => onUpdate({ showLifeThread: !data.showLifeThread })}
              />
              <ToggleChip
                label="Charakter-Staerken"
                active={!!data.showVia}
                onClick={() => onUpdate({ showVia: !data.showVia })}
              />
              <ToggleChip
                label="Vergangenheits-Erfahrungen"
                active={!!data.showPastExperiences}
                onClick={() =>
                  onUpdate({ showPastExperiences: !data.showPastExperiences })
                }
              />
            </div>
          </div>

          {/* Kreise als Target */}
          {circles.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                Kreise, die dieses Profil sehen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {circles.map((c) => {
                  const active = (data.targetCircleIds ?? []).includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCircle(c.id)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-muted-foreground/20 hover:border-foreground/40"
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">
              Noch keine Kreise — lege oben einen Kreis an und verknuepfe ihn dann.
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Profil loeschen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded border transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
      }`}
    >
      {label}
    </button>
  )
}
