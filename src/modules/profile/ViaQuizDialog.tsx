import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from "@real-life-stack/toolkit"
import {
  VIA_STRENGTHS,
  VIRTUE_LABELS,
  type ViaAnswer,
  type ViaStrength,
} from "./via-strengths"
import { useViaQuiz } from "./use-via-quiz"

/**
 * VIA-Quiz-Dialog (Phase F6, 11.05.2026).
 *
 * 24 Fragen, eine pro Charakter-Staerke. Skala 1..5. Eine Frage pro
 * Schritt, mit Vor-/Zurueck-Navigation. Beim Abschluss schreibt der
 * Quiz Anfangs-XP in die Bereiche und markiert die fuenf Top-Staerken
 * als Signature Strengths.
 *
 * Stil: ruhig. Eine Frage je Bildschirm — keine Liste, kein Druck.
 */

export interface ViaQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SCALE_LABELS: Record<ViaAnswer, string> = {
  1: "Gar nicht wie ich",
  2: "Wenig wie ich",
  3: "Manchmal wie ich",
  4: "Oft wie ich",
  5: "Ganz wie ich",
}

export function ViaQuizDialog({ open, onOpenChange }: ViaQuizDialogProps) {
  const { result, submit } = useViaQuiz()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, ViaAnswer>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Initial: vorhandene Antworten laden, falls schon mal gequizzt
  useEffect(() => {
    if (!open) return
    setStepIndex(0)
    setDone(false)
    setError(null)
    if (result?.answers) {
      const cleaned: Record<string, ViaAnswer> = {}
      for (const [k, v] of Object.entries(result.answers)) {
        if (v >= 1 && v <= 5) cleaned[k] = v as ViaAnswer
      }
      setAnswers(cleaned)
    } else {
      setAnswers({})
    }
  }, [open, result])

  const current: ViaStrength | undefined = VIA_STRENGTHS[stepIndex]
  const total = VIA_STRENGTHS.length
  const answeredCount = Object.keys(answers).length

  const setAnswer = (val: ViaAnswer) => {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: val }))
    // Auto-Vorwaerts nach kurzer Verzoegerung
    setTimeout(() => {
      setStepIndex((cur) => Math.min(cur + 1, total - 1))
    }, 180)
  }

  const goBack = () => setStepIndex((cur) => Math.max(cur - 1, 0))
  const goNext = () => setStepIndex((cur) => Math.min(cur + 1, total - 1))

  const handleSubmit = async () => {
    setBusy(true)
    setError(null)
    try {
      await submit(answers)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setBusy(false)
    }
  }

  const handleClose = () => {
    setDone(false)
    onOpenChange(false)
  }

  // Abschluss-Bildschirm
  if (done) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-md w-screen h-[100dvh] sm:h-auto sm:max-h-[90vh] gap-0 p-0 flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">VIA-Quiz abgeschlossen</DialogTitle>
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Quiz abgeschlossen</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Deine Antworten sind eingetragen. XP fliesst in die Bereiche, die deine
              Staerken tragen. Deine Top-5 stehen jetzt in deinem Profil sichtbar.
            </p>
          </div>
          <div className="shrink-0 px-6 py-4 border-t bg-background">
            <Button onClick={handleClose} className="w-full">
              Weiter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Quiz-Bildschirm
  if (!current) return null
  const currentAnswer = answers[current.id]
  const onLastStep = stepIndex === total - 1
  const canSubmit = answeredCount === total

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md w-screen h-[100dvh] sm:h-auto sm:max-h-[90vh] gap-0 p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">VIA-Charakter-Staerken-Quiz</DialogTitle>

        {/* Progress-Header */}
        <div className="px-6 pt-6 pb-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {VIRTUE_LABELS[current.virtue]}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {stepIndex + 1} / {total}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Frage */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center">
          <div className="text-center max-w-md mb-8">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">
              {current.label}
            </p>
            <h2 className="text-lg font-medium leading-relaxed">{current.question}</h2>
          </div>

          {/* Skala 1..5 */}
          <div className="w-full max-w-sm space-y-2">
            {([5, 4, 3, 2, 1] as ViaAnswer[]).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAnswer(val)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  currentAnswer === val
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-muted-foreground/20 hover:border-foreground/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{SCALE_LABELS[val]}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i <= val
                            ? currentAnswer === val
                              ? "bg-primary"
                              : "bg-muted-foreground/50"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-destructive mt-4">{error}</p>}
        </div>

        {/* Footer-Navigation */}
        <div
          className="shrink-0 px-6 py-4 border-t bg-background flex items-center justify-between"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurueck
          </Button>

          <span className="text-[10px] text-muted-foreground">
            {answeredCount} / {total} beantwortet
          </span>

          {onLastStep ? (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit || busy}
            >
              {busy ? "Speichern..." : "Fertig"}
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={goNext}>
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
