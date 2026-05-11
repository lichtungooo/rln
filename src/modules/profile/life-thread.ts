/**
 * Lebens-Faden — der erste der drei Faeden im Profil (Phase F4, 11.05.2026).
 *
 * Sieben-Jahres-Phasen nach Rudolf Steiner und Bernard Lievegoed
 * (siehe "Lebenskrisen, Lebenschancen"). Optional gefuellt mit kurzer
 * Lebenserzaehlung pro Phase. Wer mit 60 startet, fuellt acht Phasen;
 * wer mit 18 startet, fuellt drei. Vergangene Phasen tragen, was war —
 * die aktuelle traegt, was wird.
 *
 * Vision: drei Faeden statt einem Charakter-Level.
 *   - Lebens-Faden  — vergangene Phasen, optional gefuellt
 *   - Spiel-Faden   — App-XP (use-progress.ts)
 *   - Reife-Faden   — VIA-Strengths + Schwellen-Marker (kommt in F5/F6)
 *
 * Recherche: Real-Life-Network/Visionen/Module/07-Gamification-Recherche/
 * skilltree-vertiefung/04-alter-lebensphasen.md
 */

export interface LifePhase {
  /** Reihenfolge 0..10 */
  index: number
  /** Alters-Beginn (Jahre) */
  ageStart: number
  /** Alters-Ende (exklusiv) — fuer die 11. Phase offen (99 Platzhalter) */
  ageEnd: number
  /** Steiner-Lievegoed-Bezeichnung */
  label: string
  /** Kurzer Spruch, was diese Phase traegt */
  spirit: string
}

/**
 * Elf Phasen ueber das ganze Leben. Die letzte ist offen.
 *
 * Steiner unterteilt das Leben in drei Stroeme von je 21 Jahren:
 *   0–21  Aufbau des Leibes (Kindheit, Schulkind, Jugend)
 *   21–42 Aufbau der Seele (Empfindung, Verstand, Bewusstsein)
 *   42–63 Aufbau des Geistes (Bewusstsein vertieft, Geistselbst, Lebensgeist)
 *   63+   Aelteste — der Geistmensch
 */
export const LIFE_PHASES: LifePhase[] = [
  { index: 0,  ageStart: 0,  ageEnd: 7,  label: "Kindheit",     spirit: "Vertrauen, Welt-Erwachen, Sinne aufgehen" },
  { index: 1,  ageStart: 7,  ageEnd: 14, label: "Schulkind",    spirit: "Lernen, Gefuehl, Welt-Bilder" },
  { index: 2,  ageStart: 14, ageEnd: 21, label: "Jugend",       spirit: "Ich-Findung, Suchen, Wagen" },
  { index: 3,  ageStart: 21, ageEnd: 28, label: "Eigenstand",   spirit: "Eigenen Weg gehen, Empfindung schaerfen" },
  { index: 4,  ageStart: 28, ageEnd: 35, label: "Aufbau",       spirit: "Werk aufbauen, Verstand reifen" },
  { index: 5,  ageStart: 35, ageEnd: 42, label: "Wende",        spirit: "Mitte des Lebens, neu ausrichten" },
  { index: 6,  ageStart: 42, ageEnd: 49, label: "Reife",        spirit: "Bewusstsein vertiefen, Verantwortung tragen" },
  { index: 7,  ageStart: 49, ageEnd: 56, label: "Meisterung",   spirit: "Was du kannst weitergeben" },
  { index: 8,  ageStart: 56, ageEnd: 63, label: "Hueterzeit",   spirit: "Junge fuehren, Rahmen halten" },
  { index: 9,  ageStart: 63, ageEnd: 70, label: "Weisheit",     spirit: "Ueberblick, Segnen, Lassen" },
  { index: 10, ageStart: 70, ageEnd: 999, label: "Aelteste",    spirit: "Geist tragen, Schwelle ehren" },
]

/**
 * Lebens-Faden-Daten im Profile-Extension-Item.
 *
 *   data.lifeThread = {
 *     birthYear: 1980,
 *     phases: { 0: "...", 1: "...", 4: "..." }
 *   }
 *
 * `birthYear` ist optional und privat im Sinne der Privatheit. Mit
 * Geburtsjahr lassen sich Jahres-Ranges pro Phase berechnen, ohne ist
 * die Anzeige nur Alters-Range.
 */
export interface LifeThreadData {
  birthYear?: number
  phases?: Record<number, string>
}

/**
 * Aktuelles Alter aus Geburtsjahr (ohne Geburtstag, gerundet auf Jahr).
 */
export function ageFromBirthYear(birthYear: number | undefined, now: Date = new Date()): number | undefined {
  if (!birthYear) return undefined
  const age = now.getFullYear() - birthYear
  return age >= 0 && age < 200 ? age : undefined
}

/**
 * In welcher Phase steckt dieses Alter? Liefert den Index oder
 * undefined wenn ausserhalb der Tabelle.
 */
export function currentPhaseIndex(age: number | undefined): number | undefined {
  if (age === undefined) return undefined
  for (const p of LIFE_PHASES) {
    if (age >= p.ageStart && age < p.ageEnd) return p.index
  }
  return undefined
}

/**
 * Jahres-Range einer Phase, wenn Geburtsjahr bekannt.
 *
 * Phase 0 (0-7) mit birthYear 1980 → "1980–1987"
 * Phase 10 (Aelteste) mit birthYear 1950 → "ab 2020"
 */
export function phaseYearRange(phase: LifePhase, birthYear: number | undefined): string | undefined {
  if (!birthYear) return undefined
  const fromYear = birthYear + phase.ageStart
  if (phase.ageEnd >= 99) {
    return `ab ${fromYear}`
  }
  const toYear = birthYear + phase.ageEnd
  return `${fromYear}–${toYear}`
}

/**
 * Status einer Phase bezogen auf das heutige Alter.
 *  - past    : voll gelebt
 *  - current : aktuelle Phase
 *  - future  : noch nicht erreicht
 *  - unknown : Geburtsjahr unbekannt
 */
export type PhaseStatus = "past" | "current" | "future" | "unknown"

export function phaseStatus(phase: LifePhase, age: number | undefined): PhaseStatus {
  if (age === undefined) return "unknown"
  if (age >= phase.ageEnd) return "past"
  if (age >= phase.ageStart) return "current"
  return "future"
}
