import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { Input, Label, Textarea } from "@real-life-stack/toolkit"
import {
  LIFE_PHASES,
  ageFromBirthYear,
  currentPhaseIndex,
  phaseYearRange,
  phaseStatus,
  type LifeThreadData,
  type LifePhase,
} from "./life-thread"

/**
 * LifeThreadCard — Lebens-Faden im Profil (Phase F4).
 *
 * Zeigt elf Sieben-Jahres-Phasen mit Steiner-Lievegoed-Bezeichnungen.
 * Optionales Geburtsjahr bringt konkrete Jahres-Ranges. Pro Phase ein
 * Text-Feld fuer freie Erzaehlung — vergangene Phasen tragen, was war,
 * die aktuelle traegt, was wird.
 *
 * Stil: ruhig, kein Druck. Die Aufforderung kommt aus dem Mensch, nicht
 * aus dem System.
 */

export interface LifeThreadCardProps {
  value: LifeThreadData | undefined
  onChange: (next: LifeThreadData) => void
}

export function LifeThreadCard({ value, onChange }: LifeThreadCardProps) {
  const [birthYearStr, setBirthYearStr] = useState(value?.birthYear ? String(value.birthYear) : "")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    setBirthYearStr(value?.birthYear ? String(value.birthYear) : "")
  }, [value?.birthYear])

  const age = ageFromBirthYear(value?.birthYear)
  const currentIdx = currentPhaseIndex(age)

  // Auto-Open der aktuellen Phase beim ersten Render
  useEffect(() => {
    if (openIndex === null && currentIdx !== undefined) {
      setOpenIndex(currentIdx)
    }
  }, [currentIdx, openIndex])

  const handleBirthYear = (raw: string) => {
    setBirthYearStr(raw)
    const num = parseInt(raw, 10)
    const thisYear = new Date().getFullYear()
    if (!raw) {
      onChange({ ...(value ?? {}), birthYear: undefined })
      return
    }
    if (Number.isFinite(num) && num >= thisYear - 130 && num <= thisYear) {
      onChange({ ...(value ?? {}), birthYear: num })
    }
  }

  const handlePhaseText = (index: number, text: string) => {
    const nextPhases = { ...(value?.phases ?? {}) }
    if (text.trim()) {
      nextPhases[index] = text
    } else {
      delete nextPhases[index]
    }
    onChange({ ...(value ?? {}), phases: nextPhases })
  }

  const filledCount = Object.keys(value?.phases ?? {}).length

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Lebens-Faden</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filledCount > 0 ? `${filledCount} Phase${filledCount === 1 ? "" : "n"} erzaehlt` : "optional"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          Sieben-Jahres-Phasen nach Steiner und Lievegoed. Was du erzaehlst, traegt deine Geschichte
          — vergangene Phasen, was war; die aktuelle, was wird.
        </p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="lt-birthyear" className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Geburtsjahr (optional)
            </Label>
            <Input
              id="lt-birthyear"
              type="number"
              min={new Date().getFullYear() - 130}
              max={new Date().getFullYear()}
              placeholder="z.B. 1980"
              value={birthYearStr}
              onChange={(e) => handleBirthYear(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
          {age !== undefined && (
            <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap">
              {age} Jahre
            </div>
          )}
        </div>
      </div>

      {/* Phasen */}
      <div className="divide-y">
        {LIFE_PHASES.map((phase) => (
          <PhaseRow
            key={phase.index}
            phase={phase}
            text={value?.phases?.[phase.index] ?? ""}
            birthYear={value?.birthYear}
            age={age}
            open={openIndex === phase.index}
            onToggle={() => setOpenIndex((cur) => (cur === phase.index ? null : phase.index))}
            onTextChange={(t) => handlePhaseText(phase.index, t)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// PhaseRow — eine Phase in der Liste
// ============================================================

interface PhaseRowProps {
  phase: LifePhase
  text: string
  birthYear: number | undefined
  age: number | undefined
  open: boolean
  onToggle: () => void
  onTextChange: (text: string) => void
}

function PhaseRow({ phase, text, birthYear, age, open, onToggle, onTextChange }: PhaseRowProps) {
  const status = phaseStatus(phase, age)
  const yearRange = phaseYearRange(phase, birthYear)
  const ageLabel =
    phase.ageEnd >= 99 ? `${phase.ageStart}+ Jahre` : `${phase.ageStart}–${phase.ageEnd} Jahre`

  const statusStyles = {
    past: "text-foreground",
    current: "text-primary font-semibold",
    future: "text-muted-foreground/70",
    unknown: "text-foreground",
  } as const

  const dotColor = {
    past: "bg-primary/60",
    current: "bg-primary ring-2 ring-primary/30",
    future: "bg-muted",
    unknown: "bg-muted-foreground/40",
  } as const

  return (
    <div className={status === "future" ? "opacity-70" : ""}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor[status]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-sm ${statusStyles[status]}`}>{phase.label}</span>
            <span className="text-[10px] text-muted-foreground">{ageLabel}</span>
            {yearRange && (
              <span className="text-[10px] font-mono text-muted-foreground">{yearRange}</span>
            )}
            {text && (
              <span className="text-[10px] text-primary/70">●</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">{phase.spirit}</p>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3">
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={
              status === "future"
                ? "Diese Phase liegt noch vor dir — frei lassen oder Vorausschau notieren."
                : status === "current"
                ? "Was waechst gerade? Was traegt diese Zeit?"
                : "Was war diese Phase? Was hat sie dir gegeben?"
            }
            className="text-sm min-h-[80px] resize-y"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}
