import { useMemo, useState } from "react"
import * as LucideIcons from "lucide-react"
import {
  Flame,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
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
import type { ModuleViewProps } from "../registry"
import { TagInput } from "../profile/TagInput"
import {
  THEMEN_FELDER,
  type FrageData,
  type AntwortData,
  type ThemenFeld,
} from "./types"
import { useWissensfeld } from "./use-wissensfeld"

/**
 * WissensfeldView — Spiegel des kollektiven Bewusstseins.
 *
 * Drei Modi:
 *   - Liste: alle Fragen, neueste zuerst, mit Themen-Pillen + Antwort-Zaehler
 *   - Detail: Eine Frage, ihre Antworten — eigenstaendig, ohne Kommentar
 *   - Form: Neue Frage saeen
 *
 * Phase W1 (01.05.2026): Frage + Antwort + Tags + Themen-Felder.
 * W2 bringt die Resonanz-Signale interaktiv.
 */

function FeldIcon({
  iconName,
  className,
}: {
  iconName: string
  className?: string
}) {
  const Icon = ((LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ??
    LucideIcons.Sparkles) as LucideIcon
  return <Icon className={className} />
}

const FELD_BY_ID: Record<string, ThemenFeld> = Object.fromEntries(
  THEMEN_FELDER.map((f) => [f.id, f])
)

export function WissensfeldView(_props: ModuleViewProps) {
  const [activeFrageId, setActiveFrageId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { fragen, antwortenByFrage, askFrage, giveAntwort, removeFrage, removeAntwort } =
    useWissensfeld()
  const { data: currentUser } = useCurrentUser()

  const activeFrage = useMemo(() => {
    if (!activeFrageId) return null
    return fragen.find((f) => f.id === activeFrageId) ?? null
  }, [activeFrageId, fragen])

  // Detail-Modus
  if (activeFrage) {
    const antworten = antwortenByFrage[activeFrage.id] ?? []
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveFrageId(null)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zum Wissensfeld
        </Button>
        <FrageDetail
          frage={activeFrage}
          antworten={antworten}
          isOwner={activeFrage.createdBy === currentUser?.id}
          currentUserId={currentUser?.id}
          onAntwort={(content, tags) =>
            giveAntwort({ frageId: activeFrage.id, content, tags })
          }
          onRemoveFrage={async () => {
            if (!confirm("Diese Frage zurueckziehen?")) return
            await removeFrage(activeFrage.id)
            setActiveFrageId(null)
          }}
          onRemoveAntwort={removeAntwort}
        />
      </div>
    )
  }

  // Form-Modus
  if (creating) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreating(false)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zum Wissensfeld
        </Button>
        <FrageForm
          onCreate={async (data) => {
            const created = await askFrage(data)
            setCreating(false)
            if (created) setActiveFrageId(created.id)
          }}
          onCancel={() => setCreating(false)}
        />
      </div>
    )
  }

  // Liste-Modus
  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-6 w-6" style={{ color: "#E8751A" }} />
            <h1 className="text-2xl font-bold">Wissensfeld</h1>
          </div>
          <p className="text-sm text-muted-foreground italic max-w-xl">
            Hier saet ihr Fragen — und tragt Antworten. Jede Frage ist ein
            Samen. Jede Antwort eine Bluete. Was beruehrt, leuchtet sanft auf.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Frage saeen
        </Button>
      </div>

      {fragen.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Flame className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm italic">
              Das Feld ist still. Was bewegt dich? Saee die erste Frage.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fragen.map((f) => (
            <FrageCard
              key={f.id}
              frage={f}
              antwortCount={(antwortenByFrage[f.id] ?? []).length}
              onClick={() => setActiveFrageId(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// FrageCard — kompakter Eintrag in der Liste
// ============================================================

function FrageCard({
  frage,
  antwortCount,
  onClick,
}: {
  frage: Item
  antwortCount: number
  onClick: () => void
}) {
  const data = frage.data as FrageData
  const felder = (data.felder ?? [])
    .map((id) => FELD_BY_ID[id])
    .filter((f): f is ThemenFeld => Boolean(f))

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-card border rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/40"
    >
      <p className="text-base font-medium leading-snug mb-2">{data.content}</p>

      {/* Themen-Felder als Pillen */}
      {felder.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {felder.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: `${f.color}15`, color: f.color }}
            >
              <FeldIcon iconName={f.icon} className="h-2.5 w-2.5" />
              {f.label}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.tags.slice(0, 5).map((t) => (
            <span key={t} className="text-[10px] text-primary/70">
              #{t}
            </span>
          ))}
          {data.tags.length > 5 && (
            <span className="text-[10px] text-muted-foreground">+{data.tags.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        {data.circleOrigin && (
          <span className="italic">aus dem Kreis: {data.circleOrigin}</span>
        )}
        <span className="ml-auto">
          {antwortCount === 0
            ? "Noch keine Bluete"
            : antwortCount === 1
            ? "1 Bluete"
            : `${antwortCount} Blueten`}
        </span>
      </div>
    </button>
  )
}

// ============================================================
// FrageDetail — Volle Frage + Antworten
// ============================================================

function FrageDetail({
  frage,
  antworten,
  isOwner,
  currentUserId,
  onAntwort,
  onRemoveFrage,
  onRemoveAntwort,
}: {
  frage: Item
  antworten: Item[]
  isOwner: boolean
  currentUserId: string | undefined
  onAntwort: (content: string, tags: string[]) => Promise<Item | null>
  onRemoveFrage: () => Promise<void>
  onRemoveAntwort: (id: string) => Promise<void>
}) {
  const data = frage.data as FrageData
  const felder = (data.felder ?? [])
    .map((id) => FELD_BY_ID[id])
    .filter((f): f is ThemenFeld => Boolean(f))

  const [draft, setDraft] = useState("")
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const handleAntwort = async () => {
    if (!draft.trim()) return
    setBusy(true)
    try {
      await onAntwort(draft.trim(), draftTags)
      setDraft("")
      setDraftTags([])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Frage-Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 mt-1 shrink-0" style={{ color: "#E8751A" }} />
            <div className="flex-1">
              <CardTitle className="text-xl leading-snug">{data.content}</CardTitle>
              {data.circleOrigin && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  saemend im Kreis: {data.circleOrigin}
                </p>
              )}
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveFrage}
                className="text-muted-foreground hover:text-destructive shrink-0"
                title="Frage zurueckziehen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {felder.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {felder.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${f.color}15`, color: f.color }}
                >
                  <FeldIcon iconName={f.icon} className="h-3 w-3" />
                  {f.label}
                </span>
              ))}
            </div>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.map((t) => (
                <span key={t} className="text-xs text-primary/80 hover:text-primary">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Vorformulierte Antwort-Impulse */}
          {data.suggestedAnswers && data.suggestedAnswers.length > 0 && (
            <div className="border-l-4 border-primary/30 pl-3 py-1 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Einladungen, eigene Antwort zu finden
              </p>
              {data.suggestedAnswers.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground italic">
                  &laquo;{s}&raquo;
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Antworten */}
      {antworten.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {antworten.length === 1 ? "Eine Bluete" : `${antworten.length} Blueten`}
          </h2>
          {antworten.map((a) => (
            <AntwortCard
              key={a.id}
              antwort={a}
              isOwner={a.createdBy === currentUserId}
              onRemove={() => onRemoveAntwort(a.id)}
            />
          ))}
        </div>
      )}

      {/* Antwort schreiben */}
      {currentUserId && (
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Trage deine Antwort
            </CardTitle>
            <p className="text-xs text-muted-foreground italic">
              Antworte aus deiner Erfahrung. Aus deinem Herzen. Wahrhaftig — sie traegt, weil du sie traegst.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Was erkennst du? Was lebt in dir, das hier antworten will?"
              className="min-h-28"
            />
            <div>
              <Label className="text-xs">Tags (optional)</Label>
              <TagInput
                value={draftTags}
                onChange={(next) => setDraftTags(next as string[])}
                placeholder="herz, verbindung, gegenwart"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAntwort} disabled={busy || !draft.trim()}>
                {busy ? "Traegt..." : "Antwort tragen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AntwortCard({
  antwort,
  isOwner,
  onRemove,
}: {
  antwort: Item
  isOwner: boolean
  onRemove: () => Promise<void>
}) {
  const data = antwort.data as AntwortData
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.content}</p>

        <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground pt-1">
          <span>
            {new Date(antwort.createdAt).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {data.circleOrigin && (
            <>
              <span>·</span>
              <span className="italic">aus dem Kreis: {data.circleOrigin}</span>
            </>
          )}
          {data.tags && data.tags.length > 0 && (
            <>
              <span>·</span>
              {data.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-primary/70">
                  #{t}
                </span>
              ))}
            </>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-auto text-muted-foreground/60 hover:text-destructive"
              title="Zurueckziehen"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Resonanz-Anzeige (interaktiv kommt in W2) */}
        {(data.resonanz?.beruehrt?.length ?? 0) +
          (data.resonanz?.willBesprechen?.length ?? 0) >
          0 && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
            {(data.resonanz?.beruehrt?.length ?? 0) > 0 && (
              <span>🌱 {data.resonanz.beruehrt.length}</span>
            )}
            {(data.resonanz?.willBesprechen?.length ?? 0) > 0 && (
              <span>🔥 {data.resonanz.willBesprechen.length}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// FrageForm — neue Frage saeen
// ============================================================

function FrageForm({
  onCreate,
  onCancel,
}: {
  onCreate: (data: FrageData) => Promise<void>
  onCancel: () => void
}) {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [activeFelder, setActiveFelder] = useState<Set<string>>(new Set())
  const [circleOrigin, setCircleOrigin] = useState("")
  const [busy, setBusy] = useState(false)

  const toggleFeld = (id: string) => {
    const next = new Set(activeFelder)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setActiveFelder(next)
  }

  const handleCreate = async () => {
    if (!content.trim()) return
    setBusy(true)
    try {
      await onCreate({
        content: content.trim(),
        tags,
        circleOrigin: circleOrigin.trim() || undefined,
        felder: activeFelder.size > 0 ? Array.from(activeFelder) : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5" style={{ color: "#E8751A" }} />
          <CardTitle className="text-lg">Deine Frage saeen</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground italic mt-1">
          Was brennt in dir? Was laesst dich wachsen? Stelle deine Frage — sie ist
          bedeutsam. Sie traegt das Licht derer, die antworten, und oeffnet
          Tueren fuer jene, die spaeter kommen.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <Label className="text-xs">Frage</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was bewegt dich? — kurz, klar, aus dem Herzen"
            className="min-h-24"
          />
        </div>

        <div>
          <Label className="text-xs mb-2 block">Themen-Felder (mehrere moeglich)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {THEMEN_FELDER.map((f) => {
              const isOn = activeFelder.has(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFeld(f.id)}
                  className={`flex items-start gap-1.5 p-2 rounded-md border-2 text-left transition-all ${
                    isOn ? "" : "border-border hover:border-muted-foreground/40"
                  }`}
                  style={
                    isOn
                      ? { borderColor: f.color, background: `${f.color}10` }
                      : undefined
                  }
                  title={f.hint}
                >
                  <FeldIcon
                    iconName={f.icon}
                    className="h-3.5 w-3.5 shrink-0 mt-0.5"
                  />
                  <span className="text-[11px] font-medium leading-tight">
                    {f.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label className="text-xs">Tags (frei)</Label>
          <TagInput
            value={tags}
            onChange={(next) => setTags(next as string[])}
            placeholder="z.B. ahnen, herz, gegenwart"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Tags weben das Wissens-Netz. Frei waehlbar, ohne #-Zeichen.
          </p>
        </div>

        <div>
          <Label className="text-xs">Aus einem Kreis? (optional)</Label>
          <Input
            value={circleOrigin}
            onChange={(e) => setCircleOrigin(e.target.value)}
            placeholder="z.B. 'Bewusstseinskreis Herzfeld, 28. April'"
          />
        </div>
      </CardContent>

      <div className="border-t p-4 flex justify-end gap-2 bg-muted/20">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Lass es ruhen
        </Button>
        <Button size="sm" onClick={handleCreate} disabled={busy || !content.trim()}>
          {busy ? "Saet..." : "Saeen"}
        </Button>
      </div>
    </Card>
  )
}
