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
import { SpiegelSkillDetailWidget } from "./SpiegelSkillDetailWidget"
import { BereichDetailWidget } from "../dashboard/widgets/BereichDetailWidget"
import { useDemoSeed } from "./use-demo-seed"

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

export type SpiegelTab = "avatar" | "quest" | "skill"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

const PROFIL_WIDGETS: AvailableWidget[] = [
  { id: "profil-avatar", label: "Avatar + Inventar", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-quest", label: "Quests + Log", defaultColSpan: 6, defaultRowSpan: 4 },
  { id: "profil-skill", label: "Faehigkeitsbaum", defaultColSpan: 6, defaultRowSpan: 4 },
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
]

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { activeGroup } = props

  if (!activeGroup) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Bitte einen Space waehlen, um das Profil zu sehen.
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
  const { seed, busy, alreadySeeded } = useDemoSeed()

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
      headerRight={
        <>
          <StatsBar />
          {!alreadySeeded && (
            <button
              type="button"
              onClick={() => seed().catch((err) => alert(err.message))}
              disabled={busy}
              className="text-[10px] px-2 py-1 rounded border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 shrink-0"
              title="Demo-Daten anlegen — Lv ~42, Items, Quests, Log"
            >
              {busy ? "Lade Demo..." : "Demo"}
            </button>
          )}
        </>
      }
    />
  )
}
