import type { ModuleViewProps } from "../registry"
import {
  PageGrid,
  type GridPage,
  type AvailableWidget,
} from "../../components/PageGrid"
import { SelectionProvider, useNavigation } from "../../components/SelectionContext"
import { StatsBar } from "../gamification"
import { SpiegelAvatarTab } from "./SpiegelAvatarTab"
import { SpiegelQuestTab } from "./SpiegelQuestTab"
import { SpiegelSkillTab } from "./SpiegelSkillTab"
import { SpiegelLogTab } from "./SpiegelLogTab"
import { SpiegelSkillDetailWidget } from "./SpiegelSkillDetailWidget"
import { BereichDetailWidget } from "../dashboard/widgets/BereichDetailWidget"
// Demo-Seed-Hook entfernt 2026-05-12 — Demo-Daten leben in Settings/Erweitert

/**
 * SpiegelView (Profil-Modul) — drei Linsen + konfigurierbares Grid.
 *
 * Folgt der Modul-Doktrin (siehe CLAUDE.md):
 *   - PageGrid mit lockPages=true → 3 feste Pages (Avatar/Quest/Skill)
 *   - Slots innerhalb jeder Page konfigurierbar (Zahnrad)
 *   - Default-Layout pro Page: ein XL-Widget mit dem Spiegel-Tab-Inhalt
 *   - Klick-Routing via SelectionProvider — Channels werden von den
 *     enthaltenen Widgets registriert
 *   - StatsBar (XP+Trust) im Header rechts, Demo-Button daneben
 *   - Pfeile aussen nur sichtbar wenn ein Channel aktiv ist
 */

export type SpiegelTab = "avatar" | "quest" | "skill" | "log"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

const PROFIL_WIDGETS: AvailableWidget[] = [
  { id: "profil-avatar", label: "Avatar + Inventar", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-quest", label: "Quests", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-skill", label: "Faehigkeitsbaum", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-log", label: "Log — Spiegel der Reise", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "skill-detail", label: "Skill-Detail", defaultColSpan: 3, defaultRowSpan: 4 },
  { id: "bereich-detail", label: "Bereich-Detail", defaultColSpan: 3, defaultRowSpan: 4 },
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
  {
    id: "log",
    name: "Log",
    slots: [{ id: "s1", widget: "profil-log", colSpan: 6, rowSpan: 4 }],
  },
]

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { activeGroup } = props

  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte ein Netzwerk waehlen, um das Profil zu sehen.
        </p>
      </div>
    )
  }

  const spaceKey = props.spaceId ?? "default"
  return (
    <SelectionProvider storageKey={`rln-profil-${spaceKey}`}>
      <SpiegelInner {...props} />
    </SelectionProvider>
  )
}

function SpiegelInner(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { spaceId } = props
  const spaceKey = spaceId ?? "default"
  const nav = useNavigation()

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "profil-avatar":
        return (
          <div className="h-full w-full overflow-hidden">
            <SpiegelAvatarTab {...props} />
          </div>
        )
      case "profil-quest":
        return (
          <div className="h-full w-full overflow-hidden">
            <SpiegelQuestTab {...props} />
          </div>
        )
      case "profil-skill":
        return (
          <div className="h-full w-full overflow-hidden">
            <SpiegelSkillTab {...props} />
          </div>
        )
      case "profil-log":
        return (
          <div className="h-full w-full overflow-hidden">
            <SpiegelLogTab />
          </div>
        )
      case "skill-detail":
        return <SpiegelSkillDetailWidget />
      case "bereich-detail":
        return <BereichDetailWidget />
      default:
        return (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground italic">
            Unbekanntes Widget: {widgetId}
          </div>
        )
    }
  }

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
      storageKey={`rln-profil-${spaceKey}`}
      defaultPages={DEFAULT_PAGES}
      availableWidgets={PROFIL_WIDGETS}
      renderWidget={renderWidget}
      lockPages
      navApi={navApi}
      headerRight={<StatsBar />}
    />
  )
}
