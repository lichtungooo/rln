import { useState } from "react"
import { Star, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { TREE_BEREICHE, type TreeBereichId } from "../gamification"
import { VIA_STRENGTHS, VIRTUE_LABELS, type ViaStrength } from "./via-strengths"
import { useViaQuiz } from "./use-via-quiz"
import { ViaQuizDialog } from "./ViaQuizDialog"

/**
 * ViaStrengthsSection — Charakter-Staerken im Profil (Phase F6).
 *
 * Vor dem Quiz: Einladung zum 24-Fragen-Onboarding (5 Minuten).
 * Nach dem Quiz: die fuenf Signature Strengths als sichtbares Bild
 * der eigenen Natur — plus Knopf "Quiz neu machen".
 *
 * Vision: ein 60-Jaehriger startet mit App-Level 1 — aber das Quiz
 * macht in 5 Minuten sichtbar, wer er ist, und seine Top-Staerken
 * tragen erste XP ins Tree.
 */
export function ViaStrengthsSection() {
  const { result, hasResult } = useViaQuiz()
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Charakter-Staerken</h3>
          </div>
          {hasResult && (
            <span className="text-[10px] text-muted-foreground">
              Top 5 sichtbar
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Nach Peterson und Seligman — 24 Fragen, fuenf Minuten. Das Ergebnis macht
          sichtbar, was du im Kern traegst, und gibt erste XP in deinen Bereichen.
        </p>
      </div>

      {/* Body */}
      {hasResult && result ? (
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            {result.signatureStrengthIds.length > 0 ? (
              result.signatureStrengthIds.map((id, idx) => {
                const strength = VIA_STRENGTHS.find((s) => s.id === id)
                if (!strength) return null
                return (
                  <SignatureStrengthRow
                    key={id}
                    rank={idx + 1}
                    strength={strength}
                    answerValue={result.answers[id]}
                  />
                )
              })
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                Keine Antwort lag bei 4 oder 5 — magst du das Quiz nochmal anschauen?
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="w-full h-8 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Quiz neu machen
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full h-10"
          >
            Quiz starten
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <ViaQuizDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

// ============================================================
// SignatureStrengthRow — eine Staerke in der Top-5-Liste
// ============================================================

function SignatureStrengthRow({
  rank,
  strength,
  answerValue,
}: {
  rank: number
  strength: ViaStrength
  answerValue: number | undefined
}) {
  const bereich = TREE_BEREICHE.find((b) => b.id === strength.bereichId as TreeBereichId)
  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: bereich?.color ?? "#888" }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{strength.label}</span>
          <span className="text-[10px] text-muted-foreground">
            {VIRTUE_LABELS[strength.virtue]}
          </span>
        </div>
      </div>
      {answerValue !== undefined && (
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= answerValue
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
