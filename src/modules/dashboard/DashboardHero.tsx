import { useMemo } from "react"
import { Crown, Sparkles } from "lucide-react"
import { useCurrentUser } from "@real-life-stack/toolkit"
import { Avatar } from "../avatar/Avatar"
import {
  useUserAvatar,
  useUserProgress,
  TREE_BEREICHE,
  SYNERGIES,
  progressInLevel,
  type TreeBereichId,
} from "../gamification"
import { useElderStatus } from "../profile/use-elder-status"

/**
 * DashboardHero — Charakter-Sheet im Dashboard-Header (Polish-7, 11.05.2026).
 *
 * Im AC-Stil: Avatar gross zentriert, Level + XP-Balken, Aelteste-Marker
 * wenn da, aktive Synergien als kleine Tile-Reihe, dazu die Top-3
 * Bereiche mit Level-Pillen. Das ist die "Wer bin ich gerade"-Karte —
 * jedes Mal wenn der User die App oeffnet.
 */

export function DashboardHero({ spaceId }: { spaceId: string | null }) {
  const { data: currentUser } = useCurrentUser()
  const { data: progress, bereichXp, bereichProgress } = useUserProgress()
  const { displayed, titleForSpace, archetypesForSpace } = useUserAvatar(spaceId)
  const elder = useElderStatus()

  const userName = currentUser?.displayName?.trim() || "Macher"

  const totalXp = useMemo(
    () => Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [progress.bereichXp]
  )
  const totalProgress = useMemo(() => progressInLevel(totalXp), [totalXp])

  const activeSynergies = useMemo(
    () => SYNERGIES.filter((syn) => syn.bereiche.every((b) => (progress.bereichXp[b] ?? 0) > 0)),
    [progress.bereichXp]
  )

  // Top-3-Bereiche nach Level
  const topBereiche = useMemo(() => {
    return TREE_BEREICHE
      .map((b) => ({
        bereich: b,
        xp: bereichXp(b.id),
        progress: bereichProgress(b.id),
      }))
      .filter((row) => row.xp > 0)
      .sort((a, b) => b.progress.level - a.progress.level)
      .slice(0, 3)
  }, [bereichXp, bereichProgress])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return "Tiefe Nacht"
    if (hour < 11) return "Guten Morgen"
    if (hour < 14) return "Guten Tag"
    if (hour < 18) return "Guten Nachmittag"
    if (hour < 22) return "Guten Abend"
    return "Schoene Nacht"
  }, [])

  const archetypeNames = useMemo(() => {
    // archetypesForSpace ist Array von IDs — wir brauchen die Labels nicht hier,
    // aber die Anzahl als Indikator.
    return archetypesForSpace?.length ?? 0
  }, [archetypesForSpace])

  return (
    <div
      className="rounded-2xl border overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,117,26,0.04) 0%, rgba(251,191,36,0.04) 50%, rgba(168,85,247,0.04) 100%)",
      }}
    >
      <div className="p-5 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-5">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar
            name={userName}
            level={totalProgress.level}
            displayedItems={displayed}
            synergyActive={activeSynergies.length > 0}
            size={140}
          />
        </div>

        {/* Info-Spalte */}
        <div className="flex-1 min-w-0 w-full space-y-3 text-center md:text-left">
          {/* Greeting + Name + Titel */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {greeting}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{userName}</h1>
            {titleForSpace && (
              <p className="text-sm text-muted-foreground italic mt-0.5">
                {titleForSpace}
              </p>
            )}
          </div>

          {/* Status-Pillen */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
            >
              Level {totalProgress.level}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {totalXp.toLocaleString("de-DE")} XP
            </span>
            {elder.isElder && (
              <span
                className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"
                style={{ background: "#FBBF24", color: "#78350F" }}
              >
                <Crown className="h-3 w-3" />
                Aelteste
              </span>
            )}
            {archetypeNames > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                {archetypeNames} Archetyp{archetypeNames === 1 ? "" : "en"}
              </span>
            )}
          </div>

          {/* Total-XP-Balken */}
          {totalXp > 0 && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Lv {totalProgress.level}</span>
                <span>
                  {totalProgress.xpInLevel} / {totalProgress.xpNeeded} zur naechsten
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, totalProgress.ratio * 100)}%`,
                    background: "linear-gradient(90deg, #E8751A, #FBBF24)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Top-3 Bereiche */}
          {topBereiche.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                Staerkste Bereiche
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {topBereiche.map((row) => {
                  const Icon = row.bereich.icon
                  return (
                    <div
                      key={row.bereich.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-card"
                      style={{ borderColor: `${row.bereich.color}40` }}
                      title={`${row.xp.toLocaleString("de-DE")} XP`}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: row.bereich.color }} />
                      <span className="text-xs font-medium">{row.bereich.label}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${row.bereich.color}18`,
                          color: row.bereich.color,
                        }}
                      >
                        Lv {row.progress.level}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Aktive Synergien */}
          {activeSynergies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {activeSynergies.map((syn) => (
                <div
                  key={syn.id}
                  className="text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    borderColor: "rgba(168,85,247,0.25)",
                    color: "#7E22CE",
                  }}
                  title={syn.spirit}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span className="font-medium">{syn.name}</span>
                  <span className="opacity-70">+{Math.round(syn.bonus * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
