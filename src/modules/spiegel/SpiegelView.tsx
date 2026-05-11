import { useMemo } from "react"
import type { ModuleViewProps } from "../registry"
import { getSpaceMeta } from "../../spaces/space-data"
import { PageGrid, type GridPage, type AvailableWidget } from "../../components/PageGrid"
import { SpiegelAvatarTab } from "./SpiegelAvatarTab"
import { SpiegelQuestTab } from "./SpiegelQuestTab"
import { SpiegelSkillTab } from "./SpiegelSkillTab"
import { DashboardHero } from "../dashboard/DashboardHero"
import { TreeWidget } from "../dashboard/widgets/TreeWidget"
import { QuestWidget } from "../dashboard/widgets/QuestWidget"
import { LogWidget } from "../dashboard/widgets/LogWidget"
import { CalendarWidget } from "../dashboard/widgets/CalendarWidget"
import { AvatarWidget } from "../avatar"

/**
 * SpiegelView (Profil-Modul) — drei Linsen + freies Grid.
 *
 * Volle Grid-Transformation: Avatar, Quest, Skill-Tree sind XL-Widgets
 * mit eigener Two-Panel-Logik (interne Pfeile am Footer). User kann
 * sich Seiten selbst zusammenstellen — Default sind drei Seiten mit
 * je einem XL-Widget.
 */

export type SpiegelTab = "avatar" | "quest" | "skill"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

const PROFIL_WIDGETS: AvailableWidget[] = [
  // Profil-XL: ganze Spiegel-Tabs als grosse Widgets
  { id: "profil-avatar", label: "Avatar + Inventar", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-quest", label: "Quests + Log", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-skill", label: "Faehigkeitsbaum", defaultColSpan: 6, defaultRowSpan: 4 },
  // Kompakte Widgets aus Dashboard wiederverwendet
  { id: "hero", label: "Begruessung", defaultColSpan: 6, defaultRowSpan: 2 },
  { id: "avatar", label: "Avatar (kompakt)", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "tree", label: "Faehigkeiten (kompakt)", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "quest", label: "Quests (kompakt)", defaultColSpan: 2, defaultRowSpan: 2 },
  { id: "calendar", label: "Kalender", defaultColSpan: 6, defaultRowSpan: 2 },
  { id: "log", label: "Log", defaultColSpan: 3, defaultRowSpan: 2 },
]

const DEFAULT_PAGES: GridPage[] = [
  {
    id: "avatar",
    name: "Avatar",
    slots: [{ id: "s1", widget: "profil-avatar", colSpan: 6, rowSpan: 4 }],
  },
  {
    id: "quest",
    name: "Quest",
    slots: [{ id: "s1", widget: "profil-quest", colSpan: 6, rowSpan: 4 }],
  },
  {
    id: "skill",
    name: "Skill",
    slots: [{ id: "s1", widget: "profil-skill", colSpan: 6, rowSpan: 4 }],
  },
]

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { spaceId, activeGroup } = props
  const spaceSlug = useMemo(() => {
    if (!activeGroup) return null
    return getSpaceMeta(activeGroup).slug ?? activeGroup.id
  }, [activeGroup])
  const spaceKey = spaceId ?? "default"

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "profil-avatar":
        return (
          <div className="h-full w-full rounded-xl border bg-card overflow-hidden p-2">
            <SpiegelAvatarTab {...props} />
          </div>
        )
      case "profil-quest":
        return (
          <div className="h-full w-full rounded-xl border bg-card overflow-hidden p-2">
            <SpiegelQuestTab {...props} />
          </div>
        )
      case "profil-skill":
        return (
          <div className="h-full w-full rounded-xl border bg-card overflow-hidden p-2">
            <SpiegelSkillTab {...props} />
          </div>
        )
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

  return (
    <PageGrid
      storageKey={`rln-profil-${spaceKey}`}
      defaultPages={DEFAULT_PAGES}
      availableWidgets={PROFIL_WIDGETS}
      renderWidget={renderWidget}
    />
  )
}
