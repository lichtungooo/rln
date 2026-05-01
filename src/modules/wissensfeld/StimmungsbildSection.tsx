import { useState } from "react"
import { Plus, Sparkles, Trash2 } from "lucide-react"
import {
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { StimmungsbildData, StimmungsbildSignale } from "./types"

/**
 * StimmungsbildSection — schnelle Konsent-Abfrage ohne 5-Status-Workflow.
 *
 * Eine Stimmungsbild-Frage hat drei Resonanz-Stufen:
 *   ✨ "Lebendig in mir"
 *   🌊 "Noch im Werden"
 *   ✋ "Nicht meins"
 *
 * Kein Einwand-Drama, kein "Schwerwiegend". Nur "Wo stehen wir gerade?".
 * Wenn ein Stimmungsbild reift, kann daraus ein Vorschlag mit formellem
 * Konsent-Prozess werden — aber das ist ein bewusster Schritt, nicht der
 * Default.
 */

export interface StimmungsbildSectionProps {
  stimmungsbilder: Item[]
  onOpen: (input: { content: string; circleOrigin?: string }) => Promise<Item | null>
  onSignal: (stimmungsbildId: string, signal: keyof StimmungsbildSignale) => Promise<void>
  onRemove: (stimmungsbildId: string) => Promise<void>
}

export function StimmungsbildSection(props: StimmungsbildSectionProps) {
  const { data: currentUser } = useCurrentUser()
  const [creating, setCreating] = useState(false)

  if (props.stimmungsbilder.length === 0 && !creating) {
    return (
      <div className="flex items-start justify-between gap-3 px-1 py-2">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-cyan-500" />
          <p className="text-xs text-muted-foreground italic">
            Kein Stimmungsbild offen. Frag schnell ab, wo der Kreis gerade steht —
            ohne formellen Konsent.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Bild oeffnen
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-cyan-500" />
          <div>
            <h3 className="text-sm font-bold">Stimmungsbilder</h3>
            <p className="text-[11px] text-muted-foreground italic max-w-md">
              Schnelle Frage in den Raum — wo steht der Kreis? Ohne Workflow,
              ohne Einwand-Schwere.
            </p>
          </div>
        </div>
        {!creating && (
          <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Bild oeffnen
          </Button>
        )}
      </div>

      {creating && (
        <StimmungsbildForm
          onSubmit={async (input) => {
            await props.onOpen(input)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="space-y-2">
        {props.stimmungsbilder.map((s) => (
          <StimmungsbildCard
            key={s.id}
            stimmungsbild={s}
            isOwner={s.createdBy === currentUser?.id}
            currentUserId={currentUser?.id}
            onSignal={(signal) => props.onSignal(s.id, signal)}
            onRemove={() => props.onRemove(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StimmungsbildCard({
  stimmungsbild,
  isOwner,
  currentUserId,
  onSignal,
  onRemove,
}: {
  stimmungsbild: Item
  isOwner: boolean
  currentUserId: string | undefined
  onSignal: (signal: keyof StimmungsbildSignale) => Promise<void>
  onRemove: () => Promise<void>
}) {
  const data = stimmungsbild.data as StimmungsbildData
  const sig = data.signale ?? { lebendig: [], werdend: [], fremd: [] }
  const myLebendig = currentUserId ? sig.lebendig.includes(currentUserId) : false
  const myWerdend = currentUserId ? sig.werdend.includes(currentUserId) : false
  const myFremd = currentUserId ? sig.fremd.includes(currentUserId) : false
  const totalSignals = sig.lebendig.length + sig.werdend.length + sig.fremd.length
  const canSignal = Boolean(currentUserId) && !isOwner

  return (
    <Card className="border-cyan-500/30 bg-cyan-50/30 dark:bg-cyan-950/10">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{data.content}</p>
          {isOwner && (
            <button
              type="button"
              onClick={onRemove}
              className="text-muted-foreground/60 hover:text-destructive shrink-0"
              title="Bild schliessen"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {data.circleOrigin && (
          <p className="text-[10px] text-muted-foreground italic">
            aus dem Kreis: {data.circleOrigin}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          <StimmungPill
            label="Lebendig in mir"
            emoji="✨"
            count={sig.lebendig.length}
            active={myLebendig}
            disabled={!canSignal}
            color="#10B981"
            onClick={() => onSignal("lebendig")}
          />
          <StimmungPill
            label="Noch im Werden"
            emoji="🌊"
            count={sig.werdend.length}
            active={myWerdend}
            disabled={!canSignal}
            color="#06B6D4"
            onClick={() => onSignal("werdend")}
          />
          <StimmungPill
            label="Nicht meins"
            emoji="✋"
            count={sig.fremd.length}
            active={myFremd}
            disabled={!canSignal}
            color="#94A3B8"
            onClick={() => onSignal("fremd")}
          />
        </div>

        {totalSignals > 0 && (
          <StimmungBar signale={sig} total={totalSignals} />
        )}
      </CardContent>
    </Card>
  )
}

function StimmungPill({
  label,
  emoji,
  count,
  active,
  disabled,
  color,
  onClick,
}: {
  label: string
  emoji: string
  count: number
  active: boolean
  disabled: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
      }`}
      style={{
        background: active ? `${color}20` : "transparent",
        border: `1.5px solid ${active ? color : "rgba(0,0,0,0.1)"}`,
        color: active ? color : "var(--muted-foreground)",
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {count > 0 && (
        <span className="font-bold" style={{ color: active ? color : undefined }}>
          {count}
        </span>
      )}
    </button>
  )
}

/** Stimmungs-Bar: drei farbige Segmente proportional zur Signal-Verteilung. */
function StimmungBar({ signale, total }: { signale: StimmungsbildSignale; total: number }) {
  const lebendig = (signale.lebendig.length / total) * 100
  const werdend = (signale.werdend.length / total) * 100
  const fremd = (signale.fremd.length / total) * 100
  return (
    <div className="space-y-1">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        {lebendig > 0 && (
          <div style={{ width: `${lebendig}%`, background: "#10B981" }} />
        )}
        {werdend > 0 && (
          <div style={{ width: `${werdend}%`, background: "#06B6D4" }} />
        )}
        {fremd > 0 && (
          <div style={{ width: `${fremd}%`, background: "#94A3B8" }} />
        )}
      </div>
      <div className="text-[9px] text-muted-foreground text-right">
        {total} {total === 1 ? "Stimme" : "Stimmen"} im Bild
      </div>
    </div>
  )
}

function StimmungsbildForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { content: string; circleOrigin?: string }) => Promise<void>
  onCancel: () => void
}) {
  const [content, setContent] = useState("")
  const [circleOrigin, setCircleOrigin] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setBusy(true)
    try {
      await onSubmit({
        content: content.trim(),
        circleOrigin: circleOrigin.trim() || undefined,
      })
      setContent("")
      setCircleOrigin("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-cyan-500/40 bg-cyan-50/40 dark:bg-cyan-950/20">
      <CardContent className="p-3 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wie steht ihr zu...? — kurz, klar, in den Raum gefragt"
          className="min-h-16 text-sm"
        />
        <Input
          value={circleOrigin}
          onChange={(e) => setCircleOrigin(e.target.value)}
          placeholder="Aus welchem Kreis kommt die Frage? (optional)"
          className="h-8 text-xs"
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            Lass es ruhen
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={busy || !content.trim()}>
            {busy ? "Oeffnet..." : "Bild oeffnen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
