import { useMemo, useState } from "react"
import * as LucideIcons from "lucide-react"
import {
  Flame,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Scale,
  Lightbulb,
  Link2,
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
  type ErkenntnisData,
  type ThemenFeld,
} from "./types"
import { useWissensfeld } from "./use-wissensfeld"
import { StatsBar } from "../gamification"
import { PageGrid } from "../../components/PageGrid"
import { KonsentSection } from "./KonsentSection"
import { ErkenntnisSection } from "./ErkenntnisSection"
import { SpiritSection } from "./SpiritSection"

type WissensfeldTab = "fragen" | "erkenntnisse" | "konsent" | "spirit"

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

export function WissensfeldView({ activeGroup, spaceId }: ModuleViewProps) {
  const [activeTab, setActiveTab] = useState<WissensfeldTab>("fragen")
  const [activeFrageId, setActiveFrageId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [activeFeldId, setActiveFeldId] = useState<string | null>(null)
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const {
    fragen,
    antwortenByFrage,
    askFrage,
    giveAntwort,
    removeFrage,
    removeAntwort,
    toggleResonanz,
    vorschlaege,
    entscheidungen,
    proposeVorschlag,
    signalVorschlag,
    advanceVorschlag,
    closeVorschlag,
    removeVorschlag,
    stimmungsbilder,
    openStimmungsbild,
    signalStimmungsbild,
    removeStimmungsbild,
    erkenntnisse,
    erkenntnisseByFrage,
    carryErkenntnis,
    removeErkenntnis,
  } = useWissensfeld()
  const { data: currentUser } = useCurrentUser()

  const activeFrage = useMemo(() => {
    if (!activeFrageId) return null
    return fragen.find((f) => f.id === activeFrageId) ?? null
  }, [activeFrageId, fragen])

  // Felder mit Frage-Counter
  const feldCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    for (const f of fragen) {
      const felder = (f.data as FrageData).felder ?? []
      for (const id of felder) counts[id] = (counts[id] ?? 0) + 1
    }
    return counts
  }, [fragen])

  // Tag-Wolke aus allen Fragen + Antworten
  const tagCloud = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of fragen) {
      for (const t of (f.data as FrageData).tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    for (const fid of Object.keys(antwortenByFrage)) {
      for (const a of antwortenByFrage[fid]) {
        for (const t of (a.data as AntwortData).tags ?? []) {
          counts.set(t, (counts.get(t) ?? 0) + 1)
        }
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [fragen, antwortenByFrage])

  // Gefilterte Frage-Liste
  const filteredFragen = useMemo(() => {
    return fragen.filter((f) => {
      const data = f.data as FrageData
      if (activeFeldId) {
        if (!(data.felder ?? []).includes(activeFeldId)) return false
      }
      if (activeTags.size > 0) {
        const tags = data.tags ?? []
        for (const t of activeTags) {
          if (!tags.includes(t)) return false
        }
      }
      return true
    })
  }, [fragen, activeFeldId, activeTags])

  const toggleTag = (tag: string) => {
    const next = new Set(activeTags)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    setActiveTags(next)
  }
  const clearFilters = () => {
    setActiveFeldId(null)
    setActiveTags(new Set())
  }
  const hasFilter = activeFeldId !== null || activeTags.size > 0

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
          erkenntnisse={erkenntnisseByFrage[activeFrage.id] ?? []}
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
          onResonanz={toggleResonanz}
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

  // Liste-Modus — PageGrid mit 4 lockPages (Fragen/Erkenntnisse/Konsent/Spirit)
  const wissensfeldPages = [
    { id: "fragen", name: "Fragen", slots: [{ id: "s1", widget: "content", colSpan: 6 as const, rowSpan: 4 as const }] },
    { id: "erkenntnisse", name: "Erkenntnisse", slots: [{ id: "s1", widget: "content", colSpan: 6 as const, rowSpan: 4 as const }] },
    { id: "konsent", name: "Konsent", slots: [{ id: "s1", widget: "content", colSpan: 6 as const, rowSpan: 4 as const }] },
    { id: "spirit", name: "Spirit", slots: [{ id: "s1", widget: "content", colSpan: 6 as const, rowSpan: 4 as const }] },
  ]

  return (
    <PageGrid
      storageKey={`rln-wissensfeld-${spaceId ?? "default"}`}
      defaultPages={wissensfeldPages}
      availableWidgets={[{ id: "content", label: "Wissensfeld-Inhalt", defaultColSpan: 6, defaultRowSpan: 4 }]}
      lockPages
      onActivePageChange={(id) => setActiveTab(id as WissensfeldTab)}
      headerRight={
        <>
          <StatsBar />
          {activeTab === "fragen" && (
            <Button onClick={() => setCreating(true)} size="sm" className="h-7">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Frage saeen
            </Button>
          )}
        </>
      }
      renderWidget={() => (
        <div className="h-full w-full overflow-y-auto p-4 space-y-4">
      {activeTab === "erkenntnisse" && (
        <ErkenntnisSection
          erkenntnisse={erkenntnisse}
          fragen={fragen}
          onCarry={carryErkenntnis}
          onRemove={removeErkenntnis}
          onSelectFrage={(id) => {
            setActiveTab("fragen")
            setActiveFrageId(id)
          }}
        />
      )}

      {activeTab === "konsent" && (
        <KonsentSection
          vorschlaege={vorschlaege}
          entscheidungen={entscheidungen}
          stimmungsbilder={stimmungsbilder}
          onPropose={proposeVorschlag}
          onSignal={signalVorschlag}
          onAdvance={advanceVorschlag}
          onClose={closeVorschlag}
          onRemove={removeVorschlag}
          onOpenStimmungsbild={openStimmungsbild}
          onSignalStimmungsbild={signalStimmungsbild}
          onRemoveStimmungsbild={removeStimmungsbild}
        />
      )}

      {activeTab === "spirit" && (
        <SpiritSection
          spaceName={activeGroup?.name ?? "diesem Netzwerk"}
          fragen={fragen}
          antwortenByFrage={antwortenByFrage}
          erkenntnisse={erkenntnisse}
          stimmungsbilder={stimmungsbilder}
          entscheidungen={entscheidungen}
          onSelectFrage={(id) => {
            setActiveTab("fragen")
            setActiveFrageId(id)
          }}
        />
      )}

      {activeTab === "fragen" && (
        <>
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
        <>
          {/* Themen-Felder als Filter — nur wo Fragen liegen */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Felder, in denen es lebt
            </p>
            <div className="flex flex-wrap gap-1.5">
              {THEMEN_FELDER.filter((f) => (feldCounts[f.id] ?? 0) > 0).map((f) => {
                const isOn = activeFeldId === f.id
                const count = feldCounts[f.id] ?? 0
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFeldId(isOn ? null : f.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all"
                    style={
                      isOn
                        ? { borderColor: f.color, background: `${f.color}15`, color: f.color }
                        : { borderColor: "transparent", background: `${f.color}08`, color: "var(--muted-foreground)" }
                    }
                  >
                    <FeldIcon iconName={f.icon} className="h-3 w-3" />
                    {f.label}
                    <span className="opacity-60 text-[10px]">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tag-Wolke */}
          {tagCloud.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Tag-Netz
              </p>
              <div className="flex flex-wrap gap-1">
                {tagCloud.slice(0, 30).map(({ tag, count }) => {
                  const isOn = activeTags.has(tag)
                  // Schriftgroesse skaliert mit Haeufigkeit
                  const fontSize = Math.min(1 + count * 0.15, 1.6)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        isOn
                          ? "bg-primary text-primary-foreground"
                          : "text-primary/70 hover:text-primary hover:bg-primary/5"
                      }`}
                      style={{ fontSize: `${fontSize * 0.75}rem` }}
                    >
                      #{tag}
                    </button>
                  )
                })}
                {tagCloud.length > 30 && (
                  <span className="text-[10px] text-muted-foreground self-end">
                    + {tagCloud.length - 30} weitere
                  </span>
                )}
              </div>
            </div>
          )}

          {hasFilter && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filteredFragen.length}{" "}
                {filteredFragen.length === 1 ? "Frage tragt das Licht" : "Fragen tragen das Licht"}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="underline hover:text-foreground"
              >
                Alle zeigen
              </button>
            </div>
          )}

          {filteredFragen.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p className="text-sm italic">
                  Hier ist Stille. Vielleicht bist du der erste, der hier saet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFragen.map((f) => (
                <FrageCard
                  key={f.id}
                  frage={f}
                  antwortCount={(antwortenByFrage[f.id] ?? []).length}
                  onClick={() => setActiveFrageId(f.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
        </>
      )}
        </div>
      )}
    />
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
      className="w-full text-left bg-white/80 rounded-lg p-4 transition-all hover:shadow-md hover:bg-white"
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
  erkenntnisse,
  isOwner,
  currentUserId,
  onAntwort,
  onRemoveFrage,
  onRemoveAntwort,
  onResonanz,
}: {
  frage: Item
  antworten: Item[]
  erkenntnisse: Item[]
  isOwner: boolean
  currentUserId: string | undefined
  onAntwort: (content: string, tags: string[]) => Promise<Item | null>
  onRemoveFrage: () => Promise<void>
  onRemoveAntwort: (id: string) => Promise<void>
  onResonanz: (antwortId: string, signal: "beruehrt" | "willBesprechen") => Promise<void>
}) {
  const data = frage.data as FrageData
  const felder = (data.felder ?? [])
    .map((id) => FELD_BY_ID[id])
    .filter((f): f is ThemenFeld => Boolean(f))

  // Antworten nach Resonanz sortieren — leise zaehlen leiser. beruehrt+
  // willBesprechen ergeben den Score. Bei Gleichstand neueste zuerst.
  const sortedAntworten = useMemo(() => {
    return [...antworten].sort((a, b) => {
      const ra =
        (((a.data as AntwortData).resonanz?.beruehrt ?? []).length) +
        (((a.data as AntwortData).resonanz?.willBesprechen ?? []).length)
      const rb =
        (((b.data as AntwortData).resonanz?.beruehrt ?? []).length) +
        (((b.data as AntwortData).resonanz?.willBesprechen ?? []).length)
      if (ra !== rb) return rb - ra
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [antworten])

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

      {/* Erkenntnisse zu dieser Frage — Genealogie */}
      {erkenntnisse.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4" style={{ color: "#FBBF24" }} />
            {erkenntnisse.length === 1
              ? "Eine Erkenntnis aus dem Kreis"
              : `${erkenntnisse.length} Erkenntnisse aus den Kreisen`}
          </h2>
          {erkenntnisse.map((e) => {
            const ed = e.data as ErkenntnisData
            return (
              <Card key={e.id} className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-400">
                    <Lightbulb className="h-3 w-3" />
                    <span>{ed.circleOrigin}</span>
                    <span className="text-muted-foreground/70 normal-case tracking-normal">
                      {new Date(ed.circleDate).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{ed.content}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Antworten */}
      {sortedAntworten.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {sortedAntworten.length === 1 ? "Eine Bluete" : `${sortedAntworten.length} Blueten`}
          </h2>
          {sortedAntworten.map((a) => (
            <AntwortCard
              key={a.id}
              antwort={a}
              isOwner={a.createdBy === currentUserId}
              currentUserId={currentUserId}
              onRemove={() => onRemoveAntwort(a.id)}
              onResonanz={(signal) => onResonanz(a.id, signal)}
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
  currentUserId,
  onRemove,
  onResonanz,
}: {
  antwort: Item
  isOwner: boolean
  currentUserId: string | undefined
  onRemove: () => Promise<void>
  onResonanz: (signal: "beruehrt" | "willBesprechen") => Promise<void>
}) {
  const data = antwort.data as AntwortData
  const beruehrt = data.resonanz?.beruehrt ?? []
  const willBesprechen = data.resonanz?.willBesprechen ?? []
  const myBeruehrt = currentUserId ? beruehrt.includes(currentUserId) : false
  const myWillBesprechen = currentUserId ? willBesprechen.includes(currentUserId) : false
  const canResonate = Boolean(currentUserId) && !isOwner

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

        {/* Resonanz-Signale: interaktiv */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <ResonanzButton
            label="Das beruehrt mich"
            emoji="🌱"
            count={beruehrt.length}
            active={myBeruehrt}
            disabled={!canResonate}
            disabledReason={
              !currentUserId
                ? "Tritt in den Kreis"
                : isOwner
                ? "Eigene Antwort traegt sich selbst"
                : undefined
            }
            color="#10B981"
            onClick={() => onResonanz("beruehrt")}
          />
          <ResonanzButton
            label="Das will ich besprechen"
            emoji="🔥"
            count={willBesprechen.length}
            active={myWillBesprechen}
            disabled={!canResonate}
            disabledReason={
              !currentUserId
                ? "Tritt in den Kreis"
                : isOwner
                ? "Eigene Antwort traegt sich selbst"
                : undefined
            }
            color="#E8751A"
            onClick={() => onResonanz("willBesprechen")}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ResonanzButton({
  label,
  emoji,
  count,
  active,
  disabled,
  disabledReason,
  color,
  onClick,
}: {
  label: string
  emoji: string
  count: number
  active: boolean
  disabled: boolean
  disabledReason?: string
  color: string
  onClick: () => void
}) {
  const title = disabled ? disabledReason : active ? "Signal leiser stellen" : label
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
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
  const [suggestedAnswers, setSuggestedAnswers] = useState<string[]>([""])
  const [busy, setBusy] = useState(false)

  const toggleFeld = (id: string) => {
    const next = new Set(activeFelder)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setActiveFelder(next)
  }

  const updateSuggested = (idx: number, value: string) => {
    const next = [...suggestedAnswers]
    next[idx] = value
    // Wenn der letzte gefuellt wird, neuen leeren anhaengen — bis max 5
    if (idx === next.length - 1 && value.trim() && next.length < 5) {
      next.push("")
    }
    setSuggestedAnswers(next)
  }
  const removeSuggested = (idx: number) => {
    const next = suggestedAnswers.filter((_, i) => i !== idx)
    setSuggestedAnswers(next.length === 0 ? [""] : next)
  }

  const handleCreate = async () => {
    if (!content.trim()) return
    setBusy(true)
    try {
      const cleanedSuggested = suggestedAnswers.map((s) => s.trim()).filter(Boolean)
      await onCreate({
        content: content.trim(),
        tags,
        circleOrigin: circleOrigin.trim() || undefined,
        felder: activeFelder.size > 0 ? Array.from(activeFelder) : undefined,
        suggestedAnswers: cleanedSuggested.length > 0 ? cleanedSuggested : undefined,
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

        {/* Vorformulierte Antwort-Impulse — Einladung + sanfte Lenkung */}
        <div>
          <Label className="text-xs">Antwort-Impulse (optional, bis zu 5)</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
            Vorformulierte Antworten als Einladung — sie zeigen Wege, ohne den
            Raum zu schliessen. Wer sich nicht wiederfindet, traegt eine eigene
            Antwort. Die plausibelste oben — sie traegt den Spirit der Frage.
          </p>
          <div className="space-y-1.5">
            {suggestedAnswers.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[10px] text-muted-foreground/60 mt-2 w-4 shrink-0">
                  {idx + 1}.
                </span>
                <Textarea
                  value={s}
                  onChange={(e) => updateSuggested(idx, e.target.value)}
                  placeholder={
                    idx === 0
                      ? "Eine Einladung — die plausibelste, ehrlichste Antwort"
                      : "Weitere Einladung..."
                  }
                  className="min-h-[2.25rem] py-1.5 text-sm flex-1"
                  rows={1}
                />
                {(s.trim() || idx < suggestedAnswers.length - 1) && (
                  <button
                    type="button"
                    onClick={() => removeSuggested(idx)}
                    className="text-muted-foreground/50 hover:text-destructive mt-2 shrink-0"
                    title="Entfernen"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
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
