import { useMemo } from "react"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { TreeWidget } from "./widgets/TreeWidget"
import { QuestWidget } from "./widgets/QuestWidget"
import { LogWidget } from "./widgets/LogWidget"
import { CalendarWidget } from "./widgets/CalendarWidget"
import { AvatarWidget } from "../avatar"
import { OnboardingCard } from "./OnboardingCard"
import { DashboardHero } from "./DashboardHero"

/**
 * DashboardView — der private Spiegel.
 *
 * Phase C3 (01.05.2026): vier Widgets in einem responsive Grid.
 *   - TreeWidget: Faehigkeitenbaum kompakt
 *   - QuestWidget: offene Quests
 *   - LogWidget: letzte Eintraege
 *   - CalendarWidget: naechste Termine
 *
 * Naechste Phasen:
 *   - mehrere gespeicherte Ansichten als Tabs (Mein Tag / Spielen / Markt)
 *   - Drag-Drop zum Anordnen
 *   - 7 weitere Widgets (Avatar, Wallet, Marketplace, Feed, Map-mini,
 *     Spaces, Puls)
 */

export function DashboardView({ spaceId, activeGroup }: ModuleViewProps) {
  const spaceSlug = useMemo(() => {
    if (!activeGroup) return null
    return getSpaceMeta(activeGroup).slug ?? activeGroup.id
  }, [activeGroup])

  if (!activeGroup) {
    return (
      <div className="container mx-auto max-w-6xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Bitte einen Space waehlen, um das Dashboard zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-5">
      {/* Charakter-Sheet (Hero) — Avatar, Level, Synergien, Aelteste */}
      <DashboardHero spaceId={spaceId} />

      {/* Onboarding-Card fuer frische User */}
      <OnboardingCard spaceSlug={spaceSlug} />

      {/* Widget-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-[280px]">
        <AvatarWidget spaceSlug={spaceSlug} spaceId={spaceId} />
        <TreeWidget spaceSlug={spaceSlug} />
        <QuestWidget spaceSlug={spaceSlug} />
        <CalendarWidget spaceSlug={spaceSlug} />
        <LogWidget />
      </div>

      {/* Hint */}
      <div className="text-[11px] text-muted-foreground/80 italic max-w-2xl border-l-2 border-primary/30 pl-3 py-1">
        Das Dashboard ist dein privater Spiegel — was hier steht, sieht nur du.
      </div>
    </div>
  )
}
