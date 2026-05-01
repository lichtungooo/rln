import { useMemo, useState } from "react"
import { Plus, Trash2, ChevronRight, Scale, ShieldCheck } from "lucide-react"
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import { TagInput } from "../profile/TagInput"
import {
  type VorschlagData,
  type VorschlagStatus,
  type VorschlagSignale,
  type EntscheidungData,
} from "./types"

/**
 * KonsentSection — der gemeinsame Weg vom Vorschlag zur Entscheidung.
 *
 * Vier Status:
 *   - offen           — frisch eingebracht, Verstaendnis-Phase
 *   - im-kreis        — wird im Kreis besprochen
 *   - einwandpruefung — Signale werden gesammelt (mittragen/bedenken/einwand)
 *   - angenommen      — kein Einwand → wird zur Entscheidung
 *   - zurueck-im-kreis — Einwand → kehrt in den Kreis
 *
 * Drei Signale, ein User pro Vorschlag — ein User hat nur eine Stimme:
 *   ✅ Mittragen
 *   ⚠️ Bedenken (braucht weiteren Kreis)
 *   🛑 Schwerwiegender Einwand
 */

const STATUS_LABEL: Record<VorschlagStatus, string> = {
  offen: "Offen",
  "im-kreis": "Im Kreis",
  einwandpruefung: "Einwand-Pruefung",
  angenommen: "Angenommen",
  "zurueck-im-kreis": "Zurueck im Kreis",
}

const STATUS_COLOR: Record<VorschlagStatus, string> = {
  offen: "#6366F1",
  "im-kreis": "#F59E0B",
  einwandpruefung: "#10B981",
  angenommen: "#22C55E",
  "zurueck-im-kreis": "#EF4444",
}

export interface KonsentSectionProps {
  vorschlaege: Item[]
  entscheidungen: Item[]
  onPropose: (input: { content: string; tags?: string[] }) => Promise<Item | null>
  onSignal: (vorschlagId: string, signal: keyof VorschlagSignale) => Promise<void>
  onAdvance: (vorschlagId: string, nextStatus: VorschlagStatus) => Promise<void>
  onClose: (input: { vorschlagId: string; circleOrigin: string; circleDate: string }) => Promise<void>
  onRemove: (vorschlagId: string) => Promise<void>
}

export function KonsentSection(props: KonsentSectionProps) {
  const { data: currentUser } = useCurrentUser()
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2">
          <Scale className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#10B981" }} />
          <div>
            <h2 className="text-lg font-bold leading-tight">Konsent</h2>
            <p className="text-xs text-muted-foreground italic max-w-xl mt-0.5">
              Hier traegst du Vorschlaege, die im Kreis ihr Gewicht finden. Ein
              Einwand ist kein Nein — er ist eine Einladung, den Vorschlag zu
              vertiefen.
            </p>
          </div>
        </div>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Vorschlag tragen
          </Button>
        )}
      </div>

      {creating && (
        <VorschlagForm
          onSubmit={async (input) => {
            await props.onPropose(input)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Aktive Vorschlaege */}
      {props.vorschlaege.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Scale className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm italic">
              Noch traegt kein Vorschlag. Was waere zu entscheiden — gemeinsam?
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {props.vorschlaege.map((v) => (
            <VorschlagCard
              key={v.id}
              vorschlag={v}
              isOwner={v.createdBy === currentUser?.id}
              currentUserId={currentUser?.id}
              onSignal={(signal) => props.onSignal(v.id, signal)}
              onAdvance={(next) => props.onAdvance(v.id, next)}
              onClose={(circle, date) =>
                props.onClose({ vorschlagId: v.id, circleOrigin: circle, circleDate: date })
              }
              onRemove={() => props.onRemove(v.id)}
            />
          ))}
        </div>
      )}

      {/* Entscheidungen */}
      {props.entscheidungen.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Was die Gemeinschaft sich gegeben hat
          </h3>
          {props.entscheidungen.map((e) => (
            <EntscheidungCard key={e.id} entscheidung={e} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// VorschlagCard
// ============================================================

function VorschlagCard({
  vorschlag,
  isOwner,
  currentUserId,
  onSignal,
  onAdvance,
  onClose,
  onRemove,
}: {
  vorschlag: Item
  isOwner: boolean
  currentUserId: string | undefined
  onSignal: (signal: keyof VorschlagSignale) => Promise<void>
  onAdvance: (nextStatus: VorschlagStatus) => Promise<void>
  onClose: (circleOrigin: string, circleDate: string) => Promise<void>
  onRemove: () => Promise<void>
}) {
  const data = vorschlag.data as VorschlagData
  const sig = data.signale ?? { mittragen: [], bedenken: [], einwand: [] }
  const myMittragen = currentUserId ? sig.mittragen.includes(currentUserId) : false
  const myBedenken = currentUserId ? sig.bedenken.includes(currentUserId) : false
  const myEinwand = currentUserId ? sig.einwand.includes(currentUserId) : false
  const canSignal = Boolean(currentUserId) && !isOwner
  const hasEinwand = sig.einwand.length > 0
  const isClosed = data.status === "angenommen"

  const [closing, setClosing] = useState(false)
  const [circleOrigin, setCircleOrigin] = useState("")
  const [circleDate, setCircleDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [closeError, setCloseError] = useState<string | null>(null)

  const handleClose = async () => {
    setCloseError(null)
    try {
      await onClose(circleOrigin.trim() || "Online-Konsent", circleDate)
      setClosing(false)
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : "Schliessen fehlgeschlagen")
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Status + Titel */}
        <div className="flex items-start gap-3">
          <div
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full text-white shrink-0"
            style={{ background: STATUS_COLOR[data.status] }}
          >
            {STATUS_LABEL[data.status]}
          </div>
          <p className="text-sm font-medium leading-snug flex-1">{data.content}</p>
          {isOwner && !isClosed && (
            <button
              type="button"
              onClick={onRemove}
              className="text-muted-foreground/60 hover:text-destructive shrink-0"
              title="Vorschlag zurueckziehen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] text-primary/70">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Signal-Buttons */}
        {!isClosed && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <SignalPill
              label="Kann ich mittragen"
              emoji="✅"
              count={sig.mittragen.length}
              active={myMittragen}
              disabled={!canSignal}
              color="#22C55E"
              onClick={() => onSignal("mittragen")}
            />
            <SignalPill
              label="Habe Bedenken"
              emoji="⚠️"
              count={sig.bedenken.length}
              active={myBedenken}
              disabled={!canSignal}
              color="#F59E0B"
              onClick={() => onSignal("bedenken")}
            />
            <SignalPill
              label="Schwerer Einwand"
              emoji="🛑"
              count={sig.einwand.length}
              active={myEinwand}
              disabled={!canSignal}
              color="#EF4444"
              onClick={() => onSignal("einwand")}
            />
          </div>
        )}

        {/* Owner-Aktionen: Status weiter, schliessen */}
        {isOwner && !isClosed && (
          <div className="pt-2 border-t border-border/40 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Naechster Schritt:
              </span>
              {data.status === "offen" && (
                <Button size="sm" variant="outline" onClick={() => onAdvance("im-kreis")}>
                  In den Kreis tragen
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {data.status === "im-kreis" && (
                <Button size="sm" variant="outline" onClick={() => onAdvance("einwandpruefung")}>
                  Einwand-Pruefung oeffnen
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
              {data.status === "einwandpruefung" && !hasEinwand && (
                <Button size="sm" onClick={() => setClosing(!closing)}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Als angenommen schliessen
                </Button>
              )}
              {data.status === "einwandpruefung" && hasEinwand && (
                <Button size="sm" variant="outline" onClick={() => onAdvance("zurueck-im-kreis")}>
                  Einwand integrieren — zurueck in den Kreis
                </Button>
              )}
              {data.status === "zurueck-im-kreis" && (
                <Button size="sm" variant="outline" onClick={() => onAdvance("im-kreis")}>
                  Erneut im Kreis
                </Button>
              )}
            </div>

            {closing && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs italic text-muted-foreground">
                  Beim Schliessen entsteht eine Entscheidung — dokumentiert mit
                  Kreis und Datum. Sie traegt fortan, was die Gemeinschaft sich
                  gegeben hat.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Kreis</Label>
                    <Input
                      value={circleOrigin}
                      onChange={(e) => setCircleOrigin(e.target.value)}
                      placeholder="z.B. Bewusstseinskreis Herzfeld"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Datum</Label>
                    <Input
                      type="date"
                      value={circleDate}
                      onChange={(e) => setCircleDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                {closeError && <p className="text-xs text-destructive">{closeError}</p>}
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setClosing(false)}>
                    Lass es ruhen
                  </Button>
                  <Button size="sm" onClick={handleClose}>
                    Entscheidung tragen
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SignalPill({
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
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

// ============================================================
// EntscheidungCard
// ============================================================

function EntscheidungCard({ entscheidung }: { entscheidung: Item }) {
  const data = entscheidung.data as EntscheidungData
  return (
    <Card className="border-2" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "#22C55E" }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#22C55E" }}>
            Entschieden
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {data.circleOrigin} · {new Date(data.circleDate).toLocaleDateString("de-DE")}
          </span>
        </div>
        <p className="text-sm leading-snug">{data.content}</p>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] text-primary/70">
                #{t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// VorschlagForm
// ============================================================

function VorschlagForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: { content: string; tags?: string[] }) => Promise<void>
  onCancel: () => void
}) {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setBusy(true)
    try {
      await onSubmit({
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      })
      setContent("")
      setTags([])
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Vorschlag tragen</CardTitle>
        <p className="text-xs text-muted-foreground italic">
          Klar formuliert: "Wir schlagen vor, dass...". Aus dem Erleben gesprochen,
          nicht aus Theorie.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wir schlagen vor, dass..."
          className="min-h-24"
        />
        <div>
          <Label className="text-xs">Tags (optional)</Label>
          <TagInput
            value={tags}
            onChange={(next) => setTags(next as string[])}
            placeholder="z.B. werkstatt, gemeinschaft, zeit"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            Lass es ruhen
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={busy || !content.trim()}>
            {busy ? "Tragt..." : "Tragen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
