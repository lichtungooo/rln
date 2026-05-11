import { Crown, Check, Sprout } from "lucide-react"
import {
  TRIGGER_LABELS,
  TRIGGER_DESCRIPTIONS,
  type ElderTrigger,
} from "./elder-status"
import { WISDOM_TEMPLATES } from "./wisdom-templates"
import { useElderStatus } from "./use-elder-status"

/**
 * ElderStatusSection — die Krone des Reife-Fadens (Phase F10).
 *
 * Zeigt drei Wege zum Aelteste-Status, welche schon erfuellt sind,
 * und welche Wisdom-Quests sich oeffnen. Reine Geste, kein XP-Bonus.
 *
 * Wer noch nicht da ist, sieht einen sanften "fehlt nur noch X"-Hinweis
 * — niemals Druck, niemals Bedingung. Die Schwelle traegt sich selbst.
 */
export function ElderStatusSection() {
  const status = useElderStatus()

  const ALL_TRIGGERS: ElderTrigger[] = ["life-time", "app-reife", "erzaehlte-phasen"]

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div
        className={`px-4 pt-4 pb-3 border-b ${
          status.isElder
            ? "bg-gradient-to-r from-amber-50 to-yellow-50"
            : "bg-muted/30"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            {status.isElder ? (
              <Crown className="h-4 w-4 text-amber-600" />
            ) : (
              <Sprout className="h-4 w-4 text-primary" />
            )}
            <h3 className="text-sm font-semibold">
              {status.isElder ? "Aelteste-Status erreicht" : "Aelteste-Schwelle"}
            </h3>
          </div>
          {status.isElder && (
            <span
              className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "#FBBF24", color: "#78350F" }}
            >
              Aelteste
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {status.isElder
            ? "Du traegst Aelteste-Wuerde — durch Lebenszeit, App-Reife oder erzaehlte Phasen. Reine Geste, kein Bonus. Drei Wisdom-Quests stehen dir offen."
            : "Drei Wege fuehren zur Schwelle. Einer reicht. Sieh, wo du gerade stehst."}
        </p>
      </div>

      {/* Trigger-Liste */}
      <div className="divide-y">
        {ALL_TRIGGERS.map((trigger) => {
          const erfuellt = status.triggers.includes(trigger)
          return (
            <div key={trigger} className="px-4 py-2.5">
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    erfuellt
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {erfuellt ? <Check className="h-3 w-3" /> : <Sprout className="h-2.5 w-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        erfuellt ? "" : "text-muted-foreground"
                      }`}
                    >
                      {TRIGGER_LABELS[trigger]}
                    </span>
                    {erfuellt && (
                      <span className="text-[9px] uppercase font-semibold tracking-wider text-amber-700">
                        erfuellt
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground italic mt-0.5 leading-relaxed">
                    {TRIGGER_DESCRIPTIONS[trigger]}
                  </p>
                  {!erfuellt &&
                    status.nextStep?.trigger === trigger && (
                      <p className="text-[10px] text-primary mt-1">
                        Fehlt noch: {status.nextStep.hint}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wisdom-Quests */}
      {status.isElder && (
        <div className="p-4 border-t bg-amber-50/30">
          <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-2">
            Wisdom-Quests — Weisheit weitergeben
          </p>
          <div className="space-y-2">
            {WISDOM_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-3 rounded border border-amber-200 bg-white"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="text-sm font-semibold">{tmpl.title}</span>
                  <span className="text-[10px] text-amber-700 italic ml-auto">
                    {tmpl.spirit}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tmpl.prompt}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-3">
            Wisdom-Quests koennen als Vergangenheits-Erfahrung erzaehlt werden
            (oben). Eigene Quest-Engine fuer Mentees folgt in spaeterer Phase.
          </p>
        </div>
      )}
    </div>
  )
}
