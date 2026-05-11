import { useMemo } from "react"
import { useUserProgress, progressInLevel } from "../gamification"
import { useProfileExtension } from "./use-profile-extension"
import { computeElderStatus, type ElderStatus } from "./elder-status"
import type { LifeThreadData } from "./life-thread"

/**
 * Hook fuer den Aelteste-Status (Phase F10, 11.05.2026).
 *
 * Liest Lebens-Faden und User-Progress, berechnet den Status mit allen
 * Triggern und ggf. einem "fehlt-noch"-Hinweis fuer die UI.
 *
 * Charakter-Level wird aus der Summe der Bereich-XP berechnet — nicht
 * ueber die quadratische Skyrim-Formel der Roadmap (die kommt mit einer
 * spaeteren Phase). Bis dahin reicht der Total-XP-Level.
 */
export function useElderStatus(): ElderStatus {
  const { data: progress } = useUserProgress()
  const { data: extension } = useProfileExtension()

  return useMemo(() => {
    const totalXp = Object.values(progress.bereichXp).reduce(
      (a, b) => a + (b ?? 0),
      0
    )
    const charLevel = progressInLevel(totalXp).level
    const lifeThread = (extension as { lifeThread?: LifeThreadData }).lifeThread
    return computeElderStatus({ lifeThread, charLevel })
  }, [progress.bereichXp, extension])
}
