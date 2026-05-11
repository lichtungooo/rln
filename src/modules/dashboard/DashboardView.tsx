import { useMemo } from "react"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { PageGrid, type GridPage, type AvailableWidget } from "../../components/PageGrid"
import { SelectionProvider, useNavigation } from "../../components/SelectionContext"
import { StatsBar } from "../gamification"
import { TreeWidget } from "./widgets/TreeWidget"
import { BereichDetailWidget } from "./widgets/BereichDetailWidget"
import { QuestWidget } from "./widgets/QuestWidget"
import { QuestDetailWidget } from "./widgets/QuestDetailWidget"
import { LogWidget } from "./widgets/LogWidget"
import { LogDetailWidget } from "./widgets/LogDetailWidget"
import { CalendarWidget } from "./widgets/CalendarWidget"
import { EventDetailWidget } from "./widgets/EventDetailWidget"
import { PlaceWidget } from "./widgets/PlaceWidget"
import { PlaceDetailWidget } from "./widgets/PlaceDetailWidget"
import { MapWidget } from "./widgets/MapWidget"
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
  { id: "bereich-detail", label: "Bereich-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "quest", label: "Quests", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "quest-detail", label: "Quest-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "calendar", label: "Kalender", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "event-detail", label: "Termin-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "log", label: "Log", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "log-detail", label: "Log-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "place", label: "Orte (Liste)", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "place-detail", label: "Pin-Detail", defaultColSpan: 3, defaultRowSpan: 2 },
  { id: "map", label: "Karte", defaultColSpan: 3, defaultRowSpan: 3 },
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
      // Klick-Routing-Vorbild: Source links, Detail rechts
      { id: "s1", widget: "calendar", colSpan: 3, rowSpan: 2 },
      { id: "s2", widget: "event-detail", colSpan: 3, rowSpan: 2 },
      { id: "s3", widget: "quest", colSpan: 3, rowSpan: 2 },
      { id: "s4", widget: "quest-detail", colSpan: 3, rowSpan: 2 },
    ],
  },
  {
    id: "skills",
    name: "Skills",
    slots: [
      // Klick auf einen Bereich links → Detail rechts
      { id: "s1", widget: "tree", colSpan: 3, rowSpan: 4 },
      { id: "s2", widget: "bereich-detail", colSpan: 3, rowSpan: 4 },
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

  const spaceKey = spaceId ?? "default"
  return (
    <SelectionProvider storageKey={`rln-dashboard-${spaceKey}`}>
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
      case "bereich-detail":
        return <BereichDetailWidget />
      case "quest":
        return <QuestWidget spaceSlug={spaceSlug} />
      case "quest-detail":
        return <QuestDetailWidget />
      case "calendar":
        return <CalendarWidget spaceSlug={spaceSlug} />
      case "event-detail":
        return <EventDetailWidget />
      case "log":
        return <LogWidget />
      case "log-detail":
        return <LogDetailWidget />
      case "place":
        return <PlaceWidget spaceSlug={spaceSlug} />
      case "place-detail":
        return <PlaceDetailWidget />
      case "map":
        return <MapWidget spaceSlug={spaceSlug} />
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
