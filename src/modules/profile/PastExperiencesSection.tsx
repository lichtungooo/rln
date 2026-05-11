import { useState } from "react"
import { Plus, X, History, Clock } from "lucide-react"
import { Button, Input, Label, Textarea } from "@real-life-stack/toolkit"
import {
  TREE_BEREICHE,
  PAST_EXPERIENCE_XP,
  usePastExperiences,
  type PastExperienceData,
  type PastExperienceMastery,
  type TreeBereichId,
} from "../gamification"
import { currentPhaseIndex, LIFE_PHASES, type LifeThreadData } from "./life-thread"

/**
 * PastExperiencesSection — Vergangenheits-Erfahrungen im Profil (Phase F5).
 *
 * Eine Liste der bisherigen Erfahrungen plus ein Anlege-Formular. XP wird
 * direkt verteilt (gemaess Mastery-Stufe pro Bereich). Solange kein Peer
 * attestiert hat, ist der Eintrag als "vorlaeufig" markiert.
 *
 * Vision: ein 60-Jaehriger startet mit App-Level 1 — aber er kann seine
 * Lehre, sein Werk, seine Reisen nachtragen und so ehrlich sichtbar machen,
 * was schon da ist.
 */

export interface PastExperiencesSectionProps {
  /** Lebens-Faden des Users — fuer automatische Phasen-Berechnung beim Anlegen */
  lifeThread?: LifeThreadData
}

const MASTERY_LABELS: Record<PastExperienceMastery, string> = {
  memory: "Erinnerung",
  practiced: "Geuebt",
  mastered: "Meisterhaft",
}

const MASTERY_HINTS: Record<PastExperienceMastery, string> = {
  memory: "Ich erinnere mich, ich kann es noch grob",
  practiced: "Ich habe es geuebt, ich kann es im Alltag",
  mastered: "Ich bin Meister, ich kann es lehren",
}

export function PastExperiencesSection({ lifeThread }: PastExperiencesSectionProps) {
  const { mine, add, remove, isAttested } = usePastExperiences()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Vergangenheits-Erfahrungen</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mine.length > 0 ? `${mine.length} eingetragen` : "leer"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Was du gelernt hast, bevor du auf RLN kamst. Lehre, Werk, Reise —
          erzaehl was war. XP zaehlt im Tree, bis ein Peer bestaetigt gilt
          die Erfahrung als vorlaeufig.
        </p>
      </div>

      {/* Liste */}
      {mine.length > 0 && (
        <div className="divide-y">
          {mine.map((exp) => (
            <PastExperienceRow
              key={exp.id}
              data={exp.data}
              attested={isAttested(exp.data)}
              onRemove={() => remove(exp.id)}
            />
          ))}
        </div>
      )}

      {/* Anlege-Button oder Form */}
      {!formOpen ? (
        <div className="p-3 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormOpen(true)}
            className="w-full h-9"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Erfahrung hinzufuegen
          </Button>
        </div>
      ) : (
        <PastExperienceForm
          lifeThread={lifeThread}
          onSubmit={async (data) => {
            await add(data)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </div>
  )
}

// ============================================================
// PastExperienceRow — eine Erfahrung in der Liste
// ============================================================

function PastExperienceRow({
  data,
  attested,
  onRemove,
}: {
  data: PastExperienceData
  attested: boolean
  onRemove: () => void
}) {
  const yearText =
    data.startYear && data.endYear
      ? `${data.startYear}–${data.endYear}`
      : data.startYear
      ? `${data.startYear}`
      : ""

  return (
    <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-medium">{data.title}</span>
            {yearText && (
              <span className="text-[10px] font-mono text-muted-foreground">{yearText}</span>
            )}
            <span
              className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(168,85,247,0.1)", color: "#7E22CE" }}
            >
              {MASTERY_LABELS[data.mastery]}
            </span>
            {!attested && (
              <span
                className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{ background: "rgba(245,158,11,0.1)", color: "#B45309" }}
                title="Noch nicht durch einen Peer bestaetigt"
              >
                <Clock className="h-2.5 w-2.5" />
                vorlaeufig
              </span>
            )}
          </div>
          {data.description && (
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              {data.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {data.bereiche.map((bId) => {
              const bereich = TREE_BEREICHE.find((b) => b.id === bId)
              if (!bereich) return null
              return (
                <span
                  key={bId}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: `${bereich.color}15`, color: bereich.color }}
                >
                  {bereich.label} +{PAST_EXPERIENCE_XP[data.mastery]}
                </span>
              )
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Eintrag loeschen (XP bleibt)"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ============================================================
// PastExperienceForm — Anlege-Formular
// ============================================================

interface FormProps {
  lifeThread?: LifeThreadData
  onSubmit: (data: PastExperienceData) => Promise<void>
  onCancel: () => void
}

function PastExperienceForm({ lifeThread, onSubmit, onCancel }: FormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")
  const [bereiche, setBereiche] = useState<TreeBereichId[]>([])
  const [mastery, setMastery] = useState<PastExperienceMastery>("practiced")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleBereich = (id: TreeBereichId) => {
    setBereiche((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]))
  }

  // Lebens-Phase aus startYear + Geburtsjahr berechnen
  const computeLifePhase = (year: number | undefined): number | undefined => {
    if (!year || !lifeThread?.birthYear) return undefined
    const ageAtStart = year - lifeThread.birthYear
    return currentPhaseIndex(ageAtStart)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!title.trim()) {
      setError("Titel fehlt")
      return
    }
    if (bereiche.length === 0) {
      setError("Mindestens einen Bereich auswaehlen")
      return
    }
    const startY = startYear ? parseInt(startYear, 10) : undefined
    const endY = endYear ? parseInt(endYear, 10) : undefined
    setBusy(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startYear: Number.isFinite(startY) ? startY : undefined,
        endYear: Number.isFinite(endY) ? endY : undefined,
        lifePhaseIndex: computeLifePhase(startY),
        bereiche,
        mastery,
      })
      // Reset
      setTitle("")
      setDescription("")
      setStartYear("")
      setEndYear("")
      setBereiche([])
      setMastery("practiced")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setBusy(false)
    }
  }

  const lifePhaseHint = (() => {
    const startY = startYear ? parseInt(startYear, 10) : undefined
    const idx = computeLifePhase(Number.isFinite(startY) ? startY : undefined)
    if (idx === undefined) return null
    const phase = LIFE_PHASES.find((p) => p.index === idx)
    return phase ? phase.label : null
  })()

  return (
    <div className="p-4 border-t space-y-3 bg-muted/20">
      <div>
        <Label htmlFor="pe-title" className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Titel
        </Label>
        <Input
          id="pe-title"
          placeholder="z.B. Tischlerlehre, Studium Architektur, Drei Jahre auf dem Permakultur-Hof"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm mt-1"
        />
      </div>

      <div>
        <Label htmlFor="pe-desc" className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Beschreibung (optional)
        </Label>
        <Textarea
          id="pe-desc"
          placeholder="Was war diese Zeit? Was hast du gelernt?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-sm mt-1 min-h-[60px] resize-y"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="pe-start" className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Beginn (Jahr)
          </Label>
          <Input
            id="pe-start"
            type="number"
            placeholder="1998"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="h-8 text-sm mt-1"
          />
        </div>
        <div>
          <Label htmlFor="pe-end" className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ende (Jahr)
          </Label>
          <Input
            id="pe-end"
            type="number"
            placeholder="2002"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="h-8 text-sm mt-1"
          />
        </div>
      </div>

      {lifePhaseHint && (
        <p className="text-[10px] text-muted-foreground italic">
          Lebens-Phase: {lifePhaseHint}
        </p>
      )}

      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Welche Bereiche hat das getragen?
        </Label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {TREE_BEREICHE.map((b) => {
            const active = bereiche.includes(b.id)
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

      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Wie tief reicht es?
        </Label>
        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          {(["memory", "practiced", "mastered"] as PastExperienceMastery[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMastery(m)}
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                mastery === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/20 hover:border-foreground/40"
              }`}
            >
              <div className="font-semibold">{MASTERY_LABELS[m]}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                +{PAST_EXPERIENCE_XP[m]} XP / Bereich
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 italic">{MASTERY_HINTS[mastery]}</p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Abbrechen
        </Button>
        <Button type="button" size="sm" onClick={handleSubmit} disabled={busy} className="flex-1">
          {busy ? "Speichern..." : "Eintragen"}
        </Button>
      </div>
    </div>
  )
}
