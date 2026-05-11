import { useMemo } from "react"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { PageGrid, type GridPage, type AvailableWidget } from "../../components/PageGrid"
import { SelectionProvider, useNavigation } from "../../components/SelectionContext"
import { StatsBar } from "../gamification"
import { TreeWidget } from "./widgets/TreeWidget"
import { QuestWidget } from "./widgets/QuestWidget"
import { QuestDetailWidget } from "./widgets/QuestDetailWidget"
import { LogWidget } from "./widgets/LogWidget"
import { CalendarWidget } from "./widgets/CalendarWidget"
import { AvatarWidget } from "../avatar"
import { DashboardHero } from "./DashboardHero"

/**
 * DashboardView — konfigurierbares Widget-Grid (Dashboard-Variante).
 *
 * Nutzt die geteilte PageGrid-Komponente. Stellt Dashboard-spezifische
 * Widgets und Default-Seiten bereit.
 */

const DASHBOARD_WIDGETS: AvailableWidget[] = [
  { id: "hero", label: "Begruessung", defaultColSpan: 6, defaultRowSpan: 2 },
  { id: "avatar", label: "Avatar", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "tree", label: "Faehigkeiten", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "quest", label: "Quests", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "quest-detail", label: "Quest-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "calendar", label: "Kalender", defaultColSpan: 6, defaultRowSpan: 2 },
  { id: "log", label: "Log", defaultColSpan: 3, defaultRowSpan: 2 },
]

const DEFAULT_PAGES: GridPage[] = [
  {
    id: "start",
    name: "Start",
    slots: [
      { id: "s1", widget: "hero", colSpan: 6, rowSpan: 2 },
      { id: "s2", widget: "avatar", colSpan: 2, rowSpan: 2 },
      { id: "s3", widget: "tree", colSpan: 2, rowSpan: 2 },
      { id: "s4", widget: "quest", colSpan: 2, rowSpan: 2 },
    ],
  },
  {
    id: "tag",
    name: "Tag",
    slots: [
      { id: "s1", widget: "calendar", colSpan: 6, rowSpan: 2 },
      // Quest links + Quest-Detail rechts — Klick-Routing-Vorbild
      { id: "s2", widget: "quest", colSpan: 3, rowSpan: 2 },
      { id: "s3", widget: "quest-detail", colSpan: 3, rowSpan: 2 },
    ],
  },
]

export function DashboardView({ spaceId, activeGroup }: ModuleViewProps) {
  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte einen Space waehlen, um das Dashboard zu sehen.
        </p>
      </div>
    )
  }

  return (
    <SelectionProvider>
      <DashboardInner spaceId={spaceId} activeGroup={activeGroup} />
    </SelectionProvider>
  )
}

function DashboardInner({
  spaceId,
  activeGroup,
}: {
  spaceId: string | null
  activeGroup: NonNullable<ModuleViewProps["activeGroup"]>
}) {
  const spaceSlug = useMemo(() => {
    return getSpaceMeta(activeGroup).slug ?? activeGroup.id
  }, [activeGroup])

  const spaceKey = spaceId ?? "default"
  const nav = useNavigation()

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "hero":
        return (
          <div className="h-full w-full overflow-auto">
            <DashboardHero spaceId={spaceId} />
          </div>
        )
      case "avatar":
        return <AvatarWidget spaceSlug={spaceSlug} spaceId={spaceId} />
      case "tree":
        return <TreeWidget spaceSlug={spaceSlug} />
      case "quest":
        return <QuestWidget spaceSlug={spaceSlug} />
      case "quest-detail":
        return <QuestDetailWidget />
      case "calendar":
        return <CalendarWidget spaceSlug={spaceSlug} />
      case "log":
        return <LogWidget />
      default:
        return (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground italic">
            Unbekanntes Widget: {widgetId}
          </div>
        )
    }
  }

  // navApi nur dann passen wenn ein Channel aktiv ist — sonst keine Pfeile
  const navApi = nav.activeChannelId
    ? {
        prev: nav.prev,
        next: nav.next,
        canPrev: nav.canPrev,
        canNext: nav.canNext,
      }
    : undefined

  return (
    <PageGrid
      storageKey={`rln-dashboard-${spaceKey}`}
      defaultPages={DEFAULT_PAGES}
      availableWidgets={DASHBOARD_WIDGETS}
      renderWidget={renderWidget}
      headerRight={<StatsBar />}
      navApi={navApi}
    />
  )
}
