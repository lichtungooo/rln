import { LIFE_PHASES, ageFromBirthYear, type LifeThreadData } from "./life-thread"

/**
 * Aelteste-Status (Phase F10, 11.05.2026).
 *
 * Wer ist ein Aelteste? Drei moegliche Wege, die unabhaengig oder
 * zusammen den Status oeffnen:
 *
 *   1. **Lebenszeit** — Vollendung der 7. 7-Jahres-Phase (>=49 Jahre).
 *      Aus Steiners Lebenslaufslehre: dann ist die Bewusstseinsseele
 *      so weit, dass der Mensch Aelteste-Aufgaben tragen kann.
 *
 *   2. **App-Reife** — Charakter-Level >= 50 (Anti-Konsum-Soft-Cap aus
 *      der Recherche). Wer im RLN so weit gewachsen ist, hat ueber
 *      Jahre etwas getan — egal wie alt er biologisch ist.
 *
 *   3. **Erzaehlte Phasen** — sechs oder mehr Phasen im Lebens-Faden
 *      gefuellt. Wer sechs Phasen seines Lebens erzaehlt hat, hat sich
 *      selbst gesehen — eine andere Form von Reife.
 *
 * **Eine** der drei reicht — die Wege fuehren alle zum Aeltesten-Status.
 *
 * Was sich oeffnet (sichtbar im Profil):
 *   - Wisdom-Quest-Templates (siehe wisdom-templates.ts)
 *   - Mentor-Marker im Profil
 *   - Vertretungs-Stimme in Konsent-Verfahren (kommt mit Modul Governance)
 *
 * Reine Geste, kein Stat-Bonus. Wuerde durch Tun, nicht durch Levels.
 *
 * Recherche: skilltree-vertiefung/04-alter-lebensphasen.md (Block J),
 *            skilltree-vertiefung/01-skill-universum.md (Block E.3).
 */

export type ElderTrigger = "life-time" | "app-reife" | "erzaehlte-phasen"

export interface ElderStatus {
  /** Ist Aelteste-Status erreicht? */
  isElder: boolean
  /** Welche Trigger sind erfuellt? Mehrere moeglich. */
  triggers: ElderTrigger[]
  /** Bereit fuer das Aeltesten-Tor? (z.B. 2 von 3 Triggern, ein Schritt fehlt) */
  almost: boolean
  /** Naechster Trigger, der erreichbar waere (fuer "fehlt nur noch"-Hinweis) */
  nextStep?: { trigger: ElderTrigger; hint: string }
}

/**
 * Schwelle fuer den Charakter-Level-Trigger.
 */
export const ELDER_CHAR_LEVEL = 50

/**
 * Schwelle fuer den "Erzaehlte Phasen"-Trigger.
 */
export const ELDER_PHASES_FILLED = 6

/**
 * Schwelle fuer den Lebenszeit-Trigger (Vollendung 7. 7-Jahres-Phase).
 */
export const ELDER_AGE = 49

export function computeElderStatus(input: {
  lifeThread?: LifeThreadData
  charLevel: number
}): ElderStatus {
  const triggers: ElderTrigger[] = []

  const age = ageFromBirthYear(input.lifeThread?.birthYear)
  if (age !== undefined && age >= ELDER_AGE) {
    triggers.push("life-time")
  }

  if (input.charLevel >= ELDER_CHAR_LEVEL) {
    triggers.push("app-reife")
  }

  const phasesFilled = input.lifeThread?.phases
    ? Object.values(input.lifeThread.phases).filter((t) => t && t.trim().length > 0).length
    : 0
  if (phasesFilled >= ELDER_PHASES_FILLED) {
    triggers.push("erzaehlte-phasen")
  }

  const isElder = triggers.length > 0

  // Naechster Trigger fuer "fast da"-Hinweis
  let nextStep: ElderStatus["nextStep"] = undefined
  if (!isElder) {
    if (input.charLevel >= ELDER_CHAR_LEVEL - 10) {
      nextStep = {
        trigger: "app-reife",
        hint: `Charakter-Level ${ELDER_CHAR_LEVEL} — du bist auf ${input.charLevel}`,
      }
    } else if (phasesFilled >= ELDER_PHASES_FILLED - 2) {
      nextStep = {
        trigger: "erzaehlte-phasen",
        hint: `${ELDER_PHASES_FILLED} Lebens-Phasen erzaehlen — du hast ${phasesFilled}`,
      }
    } else if (age !== undefined && age >= ELDER_AGE - 5) {
      nextStep = {
        trigger: "life-time",
        hint: `Lebenszeit ${ELDER_AGE}+ — du bist ${age}`,
      }
    }
  }

  return {
    isElder,
    triggers,
    almost: !isElder && nextStep !== undefined,
    nextStep,
  }
}

export const TRIGGER_LABELS: Record<ElderTrigger, string> = {
  "life-time": "Lebenszeit (49+ Jahre)",
  "app-reife": "App-Reife (Level 50)",
  "erzaehlte-phasen": "Erzaehlte Phasen (6+)",
}

export const TRIGGER_DESCRIPTIONS: Record<ElderTrigger, string> = {
  "life-time":
    "Steiners 7. Sieben-Jahres-Phase ist vollendet. Die Bewusstseinsseele ist gereift.",
  "app-reife":
    "Charakter-Level 50 erreicht — durch das Tun ueber lange Zeit gewachsen.",
  "erzaehlte-phasen":
    "Sechs Lebens-Phasen mit eigener Stimme erzaehlt. Sich selbst gesehen.",
}
