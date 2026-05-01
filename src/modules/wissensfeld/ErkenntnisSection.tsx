import { useMemo, useState } from "react"
import { Plus, Trash2, Lightbulb, Flame, Link2 } from "lucide-react"
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
import type { ErkenntnisData, FrageData } from "./types"

/**
 * ErkenntnisSection — was Kreise erkannt haben.
 *
 * Erkenntnisse entstehen offline, in der Begegnung am Feuer. Hier werden
 * sie online dokumentiert — als Spuren der Klaerung. Eine Erkenntnis kann
 * eine Frage klaeren (frageId-Verknuepfung), trifft sie damit als kollektive
 * Antwort. Genealogie wird sichtbar: aus dieser Frage entstanden diese
 * Erkenntnisse, aus diesen Erkenntnissen wurde diese Entscheidung.
 */

export interface ErkenntnisSectionProps {
  erkenntnisse: Item[]
  fragen: Item[]
  onCarry: (input: {
    content: string
    circleOrigin: string
    circleDate: string
    tags?: string[]
    frageId?: string
  }) => Promise<Item | null>
  onRemove: (erkenntnisId: string) => Promise<void>
  onSelectFrage?: (frageId: string) => void
}

export function ErkenntnisSection(props: ErkenntnisSectionProps) {
  const { data: currentUser } = useCurrentUser()
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#FBBF24" }} />
          <div>
            <h2 className="text-lg font-bold leading-tight">Erkenntnisse</h2>
            <p className="text-xs text-muted-foreground italic max-w-xl mt-0.5">
              Was Kreise klaeren, traegt der Kreis hierher. Nicht als Wahrheit,
              sondern als Spur — sichtbar fuer alle, die spaeter kommen.
            </p>
          </div>
        </div>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Erkenntnis tragen
          </Button>
        )}
      </div>

      {creating && (
        <ErkenntnisForm
          fragen={props.fragen}
          onSubmit={async (input) => {
            await props.onCarry(input)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {props.erkenntnisse.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm italic">
              Noch keine Erkenntnis ist hierher getragen. Was hat ein Kreis erkannt?
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {props.erkenntnisse.map((e) => (
            <ErkenntnisCard
              key={e.id}
              erkenntnis={e}
              fragen={props.fragen}
              isOwner={e.createdBy === currentUser?.id}
              onRemove={() => props.onRemove(e.id)}
              onSelectFrage={props.onSelectFrage}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ErkenntnisCard({
  erkenntnis,
  fragen,
  isOwner,
  onRemove,
  onSelectFrage,
}: {
  erkenntnis: Item
  fragen: Item[]
  isOwner: boolean
  onRemove: () => Promise<void>
  onSelectFrage?: (frageId: string) => void
}) {
  const data = erkenntnis.data as ErkenntnisData
  const frage = data.frageId ? fragen.find((f) => f.id === data.frageId) : null
  const frageTitle = frage ? (frage.data as FrageData).content : null

  return (
    <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10">
      <CardContent className="p-4 space-y-2">
        {/* Kreis + Datum oben */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
          <Lightbulb className="h-3.5 w-3.5" />
          <span>{data.circleOrigin}</span>
          <span className="text-muted-foreground/70 normal-case tracking-normal">
            {new Date(data.circleDate).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-auto text-muted-foreground/60 hover:text-destructive normal-case"
              title="Erkenntnis zurueckziehen"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.content}</p>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] text-primary/70">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Verlinkung zur Frage — Genealogie */}
        {frage && frageTitle && (
          <button
            type="button"
            onClick={() => onSelectFrage?.(frage.id)}
            className="flex items-start gap-1.5 mt-2 px-2 py-1.5 rounded-md text-left bg-primary/5 hover:bg-primary/10 transition-colors w-full"
          >
            <Link2 className="h-3 w-3 mt-0.5 shrink-0 text-primary/70" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Klaert die Frage
              </div>
              <div className="text-xs text-foreground line-clamp-2">
                <Flame className="h-3 w-3 inline mr-1" style={{ color: "#E8751A" }} />
                {frageTitle}
              </div>
            </div>
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function ErkenntnisForm({
  fragen,
  onSubmit,
  onCancel,
}: {
  fragen: Item[]
  onSubmit: (input: {
    content: string
    circleOrigin: string
    circleDate: string
    tags?: string[]
    frageId?: string
  }) => Promise<void>
  onCancel: () => void
}) {
  const [content, setContent] = useState("")
  const [circleOrigin, setCircleOrigin] = useState("")
  const [circleDate, setCircleDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [tags, setTags] = useState<string[]>([])
  const [frageId, setFrageId] = useState<string>("")
  const [busy, setBusy] = useState(false)

  // Fragen sortiert: neueste zuerst, fuer Picker
  const sortedFragen = useMemo(
    () => [...fragen].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [fragen]
  )

  const handleSubmit = async () => {
    if (!content.trim() || !circleOrigin.trim()) return
    setBusy(true)
    try {
      await onSubmit({
        content: content.trim(),
        circleOrigin: circleOrigin.trim(),
        circleDate,
        tags: tags.length > 0 ? tags : undefined,
        frageId: frageId || undefined,
      })
      setContent("")
      setCircleOrigin("")
      setTags([])
      setFrageId("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-2 border-amber-500/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" style={{ color: "#FBBF24" }} />
          <CardTitle className="text-sm font-semibold">Erkenntnis aus dem Kreis</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Was hat sich im Kreis geklaert? Schreib es einfach. Kein Beweis,
          kein Argument — nur was erkannt wurde.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Im Kreis erkannten wir, dass..."
          className="min-h-24"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Kreis</Label>
            <Input
              value={circleOrigin}
              onChange={(e) => setCircleOrigin(e.target.value)}
              placeholder="z.B. Bewusstseinskreis Berlin"
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

        {sortedFragen.length > 0 && (
          <div>
            <Label className="text-xs">Klaert eine Frage? (optional)</Label>
            <select
              value={frageId}
              onChange={(e) => setFrageId(e.target.value)}
              className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
            >
              <option value="">— keine Verknuepfung —</option>
              {sortedFragen.map((f) => {
                const fdata = f.data as FrageData
                const preview =
                  fdata.content.length > 80 ? fdata.content.slice(0, 77) + "..." : fdata.content
                return (
                  <option key={f.id} value={f.id}>
                    {preview}
                  </option>
                )
              })}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Eine Verknuepfung macht die Genealogie sichtbar — andere sehen,
              dass diese Frage hier ihre Antwort fand.
            </p>
          </div>
        )}

        <div>
          <Label className="text-xs">Tags (optional)</Label>
          <TagInput
            value={tags}
            onChange={(next) => setTags(next as string[])}
            placeholder="z.B. werkstatt, weitergabe"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            Lass es ruhen
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={busy || !content.trim() || !circleOrigin.trim()}
          >
            {busy ? "Traegt..." : "Tragen"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
