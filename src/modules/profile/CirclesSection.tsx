import { useState } from "react"
import { Plus, X, Users, UserPlus } from "lucide-react"
import { Button, Input } from "@real-life-stack/toolkit"
import { useCircles, DEFAULT_CIRCLES, type CircleData } from "../gamification"

/**
 * CirclesSection — Kreise im Profil verwalten (Phase F8, 11.05.2026).
 *
 * Diaspora-Aspects-Pattern: einseitig, privat, persoenlich. Mensch
 * baut seine eigenen Kreise — "Vertraute", "Werkstatt-Berlin",
 * "Familie", "Tantra-Schwestern". Niemand erfaehrt, in welchem Kreis
 * er ist.
 *
 * Erst-Wurf: Liste + Name-Anlegen + Mitglieder als DIDs editierbar.
 * Kontakt-Picker (aus Workspace-Kontakten) folgt in spaeterer Phase.
 */

export function CirclesSection() {
  const { mine, add, remove, addMember, removeMember } = useCircles()
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAdd = async (data: CircleData) => {
    setBusy(true)
    try {
      await add(data)
    } finally {
      setBusy(false)
    }
  }

  const handleAddCustom = async () => {
    if (!newName.trim()) return
    await handleAdd({ name: newName.trim(), memberIds: [] })
    setNewName("")
  }

  const handleAddDefault = async (def: CircleData) => {
    if (mine.some((c) => c.data.name === def.name)) return
    await handleAdd({ ...def })
  }

  const missingDefaults = DEFAULT_CIRCLES.filter(
    (def) => !mine.some((c) => c.data.name === def.name)
  )

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Kreise</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mine.length} {mine.length === 1 ? "Kreis" : "Kreise"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Eigene Gruppen — wer gehoert zu wem in meinem Leben. Andere wissen
          nicht, in welchem Kreis sie sind.
        </p>
      </div>

      {/* Liste */}
      {mine.length > 0 && (
        <div className="divide-y">
          {mine.map((circle) => (
            <CircleRow
              key={circle.id}
              id={circle.id}
              data={circle.data}
              expanded={expandedId === circle.id}
              onToggle={() => setExpandedId((cur) => (cur === circle.id ? null : circle.id))}
              onRemove={() => remove(circle.id)}
              onAddMember={(did) => addMember(circle.id, did)}
              onRemoveMember={(did) => removeMember(circle.id, did)}
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

      {/* Anlegen */}
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Neuer Kreis (Name)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddCustom()
            }
          }}
          className="h-8 text-sm flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddCustom}
          disabled={busy || !newName.trim()}
          className="h-8"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// CircleRow — ein Kreis in der Liste
// ============================================================

function CircleRow({
  id,
  data,
  expanded,
  onToggle,
  onRemove,
  onAddMember,
  onRemoveMember,
}: {
  id: string
  data: CircleData
  expanded: boolean
  onToggle: () => void
  onRemove: () => void
  onAddMember: (did: string) => Promise<void>
  onRemoveMember: (did: string) => Promise<void>
}) {
  const [newMember, setNewMember] = useState("")
  const [busy, setBusy] = useState(false)

  const handleAddMember = async () => {
    if (!newMember.trim()) return
    setBusy(true)
    try {
      await onAddMember(newMember.trim())
      setNewMember("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="px-4 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: data.color ?? "#94A3B8" }}
          />
          <span className="text-sm font-medium truncate">{data.name}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {data.memberIds.length} {data.memberIds.length === 1 ? "Mensch" : "Menschen"}
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Kreis loeschen"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {data.description && (
            <p className="text-[11px] text-muted-foreground italic">{data.description}</p>
          )}
          {data.memberIds.length > 0 ? (
            <div className="space-y-1">
              {data.memberIds.map((did) => (
                <div
                  key={did}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-muted/30 text-xs"
                >
                  <code className="flex-1 font-mono truncate text-muted-foreground">{did}</code>
                  <button
                    type="button"
                    onClick={() => onRemoveMember(did)}
                    className="shrink-0 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">
              Noch keine Mitglieder. Fuege DIDs aus deinen Kontakten hinzu.
            </p>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="DID hinzufuegen"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddMember()
                }
              }}
              className="h-7 text-xs flex-1 font-mono"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddMember}
              disabled={busy || !newMember.trim()}
              className="h-7"
            >
              <UserPlus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
