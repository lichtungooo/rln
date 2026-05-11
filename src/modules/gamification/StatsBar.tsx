import { useMemo } from "react"
import { ShieldCheck, Crown, Sparkles } from "lucide-react"
import { useContacts } from "@real-life-stack/toolkit"
import { useUserProgress, SYNERGIES, progressInLevel } from "./index"
import { useElderStatus } from "../profile/use-elder-status"

/**
 * StatsBar — kompakte XP-Balken + Trust + Marker Anzeige.
 *
 * Wiederverwendbar im Profil-Hero und Dashboard-Header.
 *
 * Trust = Anzahl vertrauter Menschen (verifizierte Kontakte, useContacts).
 * Reine Zahl, keine Bewertung. Eine 1 koennte Fake sein, das sieht man am
 * niedrigen Wert.
 *
 * Marker: Aelteste-Krone, aktive Synergien.
 */
export function StatsBar({
  showMarkers = true,
}: {
  showMarkers?: boolean
}) {
  const { data: progress } = useUserProgress()
  const { activeContacts } = useContacts()
  const elder = useElderStatus()

  const totalXp = useMemo(
    () => Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [progress.bereichXp]
  )
  const totalProgress = useMemo(() => progressInLevel(totalXp), [totalXp])

  const activeSynergyCount = useMemo(
    () =>
      SYNERGIES.filter((syn) =>
        syn.bereiche.every((b) => (progress.bereichXp[b] ?? 0) > 0)
      ).length,
    [progress.bereichXp]
  )

  const trustCount = activeContacts.length

  return (
    <div className="flex items-center gap-3 shrink-0">
      {/* XP-Balken mit Level-Kreis */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div
          className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white shadow shrink-0"
          style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
        >
          {totalProgress.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, totalProgress.ratio * 100)}%`,
                background: "linear-gradient(90deg, #E8751A, #FBBF24)",
              }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">
            {totalXp.toLocaleString("de-DE")} XP
          </div>
        </div>
      </div>

      {/* Trust = Anzahl vertrauter Menschen */}
      <div
        className="flex items-center gap-1.5 shrink-0"
        title="Vertraute Menschen (verifiziert per Handshake)"
      >
        <ShieldCheck className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-bold text-purple-700">{trustCount}</span>
      </div>

      {/* Marker — Aelteste + Synergien */}
      {showMarkers && (
        <div className="flex items-center gap-1 shrink-0">
          {elder.isElder && (
            <Crown className="h-4 w-4 text-amber-500" aria-label="Aelteste" />
          )}
          {activeSynergyCount > 0 && (
            <div
              className="flex items-center gap-0.5"
              title={`${activeSynergyCount} Synergien aktiv`}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              {activeSynergyCount > 1 && (
                <span className="text-[10px] font-bold text-purple-500">
                  {activeSynergyCount}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
