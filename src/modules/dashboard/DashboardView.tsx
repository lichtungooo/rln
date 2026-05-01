import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { useCurrentUser } from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { TreeWidget } from "./widgets/TreeWidget"
import { QuestWidget } from "./widgets/QuestWidget"
import { LogWidget } from "./widgets/LogWidget"
import { CalendarWidget } from "./widgets/CalendarWidget"

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
  const { data: currentUser } = useCurrentUser()
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return "Tiefe Nacht"
    if (hour < 11) return "Guten Morgen"
    if (hour < 14) return "Guten Tag"
    if (hour < 18) return "Guten Nachmittag"
    if (hour < 22) return "Guten Abend"
    return "Schoene Nacht"
  }, [])

  const userName = currentUser?.displayName?.trim() || "Macher"

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6" style={{ color: "#E8751A" }} />
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {greeting}, {userName}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Dein Spiegel im Space {activeGroup.name}.
          </p>
        </div>
      </div>

      {/* Widget-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[260px]">
        <TreeWidget spaceSlug={spaceSlug} />
        <QuestWidget spaceSlug={spaceSlug} />
        <CalendarWidget spaceSlug={spaceSlug} />
        <LogWidget />
      </div>

      {/* Hint */}
      <div className="text-[11px] text-muted-foreground/80 italic max-w-2xl border-l-2 border-primary/30 pl-3 py-1">
        Das Dashboard ist dein privater Spiegel — was hier steht, sieht nur du.
        Naechste Erweiterung: gespeicherte Ansichten als Tabs (Mein Tag /
        Spielen / Marktplatz) und sieben weitere Widgets (Avatar, Wallet,
        Marketplace, Feed, Mini-Karte, Spaces, Puls).
      </div>
    </div>
  )
}
