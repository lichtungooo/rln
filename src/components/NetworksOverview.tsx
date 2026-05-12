import { useMemo } from "react"
import { Compass, Folder, Users, Sparkles, ChevronRight } from "lucide-react"
import type { Group } from "@real-life-stack/data-interface"
import {
  PageGrid,
  type GridPage,
  type AvailableWidget,
} from "./PageGrid"
import {
  SelectionProvider,
  useChannel,
  useChannelSync,
} from "./SelectionContext"
import {
  findChildSpaces,
  findRootSpaces,
  getSpaceMeta,
} from "../spaces/space-data"

/**
 * NetworksOverview — Vollbild-Uebersicht aller Netzwerke.
 *
 * Wird gerendert wenn der Workspace-Switcher auf "Alle Netzwerke"
 * (Overview-Scope) steht.
 *
 * Aufbau (Modul-Doktrin, PageGrid):
 *   - Slot 1 schmal: Kategorien-Liste (colSpan 2)
 *     - Alle Netzwerke
 *     - Meine Netzwerke
 *     - Pro Root-Netzwerk eine Kategorie (Macher / Schule / Adventure)
 *   - Slot 2 breit: Netzwerk-Karten (colSpan 4)
 *
 * Klick-Routing ueber SelectionContext-Channel "network-category".
 * Mobile-Drilldown via PageGrid mobileDrilldown=true.
 */

export interface NetworksOverviewProps {
  groups: Group[]
  currentUserId?: string | null
  /** Mapping groupId → memberIds. Wenn leer, ist "Meine Netzwerke" alle. */
  membershipByGroup?: Record<string, string[]>
  onSelectNetwork: (groupId: string) => void
}

export function NetworksOverview({
  groups,
  currentUserId = null,
  membershipByGroup = {},
  onSelectNetwork,
}: NetworksOverviewProps) {
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "networks-categories":
        return <CategoriesWidget groups={groups} />
      case "networks-list":
        return (
          <NetworkListWidget
            groups={groups}
            currentUserId={currentUserId}
            membershipByGroup={membershipByGroup}
            onSelectNetwork={onSelectNetwork}
          />
        )
      default:
        return null
    }
  }

  const pages: GridPage[] = [
    {
      id: "main",
      name: "Netzwerke",
      slots: [
        { id: "s1", widget: "networks-categories", colSpan: 2, rowSpan: 4 },
        { id: "s2", widget: "networks-list", colSpan: 4, rowSpan: 4 },
      ],
    },
  ]

  const availableWidgets: AvailableWidget[] = [
    { id: "networks-categories", label: "Kategorien", defaultColSpan: 2, defaultRowSpan: 4 },
    { id: "networks-list", label: "Netzwerk-Karten", defaultColSpan: 4, defaultRowSpan: 4 },
  ]

  // currentUserId + membershipByGroup werden via Closure in renderWidget
  // weitergereicht — passive props
  void currentUserId
  void membershipByGroup

  return (
    <div className="h-full w-full flex flex-col">
      <SelectionProvider storageKey="rln-networks-overview">
        <PageGrid
          storageKey="rln-networks-overview-pages-v1"
          defaultPages={pages}
          availableWidgets={availableWidgets}
          renderWidget={renderWidget}
          lockPages
          mobileDrilldown
        />
      </SelectionProvider>
    </div>
  )
}

// ============================================================
// Kategorien
// ============================================================

interface CategoryDef {
  id: string
  label: string
  hint: string
  // optional: zeigt eine Pruefung welcher Netzwerk dazugehoert
  matches?: (group: Group, ctx: { allGroups: Group[] }) => boolean
  // optional: zeigt nur einen Root und seine Sub-Netzwerke
  rootId?: string
}

function CategoriesWidget({ groups }: { groups: Group[] }) {
  const roots = useMemo(() => findRootSpaces(groups), [groups])

  // Kategorien aufbauen — statische + ein Eintrag pro Root-Netzwerk
  const categories: CategoryDef[] = useMemo(() => {
    const cats: CategoryDef[] = [
      { id: "all", label: "Alle Netzwerke", hint: "Was es im RLN gibt" },
      { id: "mine", label: "Meine Netzwerke", hint: "Wo ich Mitglied bin" },
    ]
    for (const root of roots) {
      cats.push({
        id: `root:${root.id}`,
        label: root.name,
        hint: "Hauptnetzwerk + Subnetzwerke",
        rootId: root.id,
      })
    }
    return cats
  }, [roots])

  const channel = useChannel("network-category")
  useChannelSync(
    "network-category",
    useMemo(() => categories.map((c) => ({ id: c.id })), [categories])
  )

  // Default-Auswahl: "all"
  const hasSelection = !!channel.selectedId
  useMemo(() => {
    if (!hasSelection && categories.length > 0) {
      channel.select("all")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelection])

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <Compass className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold truncate flex-1">Kategorien</span>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y">
        {categories.map((cat) => {
          const isActive = channel.selectedId === cat.id
          const Icon =
            cat.id === "all"
              ? Sparkles
              : cat.id === "mine"
                ? Users
                : Folder
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => channel.select(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                  isActive ? "bg-muted/70" : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cat.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {cat.hint}
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================
// Netzwerk-Karten
// ============================================================

function NetworkListWidget({
  groups,
  currentUserId,
  membershipByGroup,
  onSelectNetwork,
}: {
  groups: Group[]
  currentUserId: string | null
  membershipByGroup: Record<string, string[]>
  onSelectNetwork: (groupId: string) => void
}) {
  const channel = useChannel("network-category")
  const selectedCategoryId = channel.selectedId ?? "all"

  const roots = useMemo(() => findRootSpaces(groups), [groups])

  const filtered = useMemo(() => {
    if (selectedCategoryId === "all") {
      return groups
    }
    if (selectedCategoryId === "mine") {
      // Wenn keine Memberships-Daten vorliegen: zeige alle Netzwerke
      const hasMemberships = Object.keys(membershipByGroup).length > 0
      if (!hasMemberships || !currentUserId) return groups
      return groups.filter((g) => {
        const members = membershipByGroup[g.id] ?? []
        return members.includes(currentUserId)
      })
    }
    if (selectedCategoryId.startsWith("root:")) {
      const rootId = selectedCategoryId.slice("root:".length)
      const subIds = findChildSpaces(groups, rootId).map((g) => g.id)
      return groups.filter((g) => g.id === rootId || subIds.includes(g.id))
    }
    return groups
  }, [groups, selectedCategoryId, currentUserId, membershipByGroup])

  const headline = useMemo(() => {
    if (selectedCategoryId === "all") return "Alle Netzwerke"
    if (selectedCategoryId === "mine") return "Meine Netzwerke"
    if (selectedCategoryId.startsWith("root:")) {
      const rootId = selectedCategoryId.slice("root:".length)
      return roots.find((r) => r.id === rootId)?.name ?? "Netzwerke"
    }
    return "Netzwerke"
  }, [selectedCategoryId, roots])

  return (
    <div className="h-full w-full bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold truncate flex-1">{headline}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {filtered.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-12">
            Keine Netzwerke in dieser Kategorie.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((group) => (
              <NetworkCard
                key={group.id}
                group={group}
                allGroups={groups}
                onSelect={() => onSelectNetwork(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NetworkCard({
  group,
  allGroups,
  onSelect,
}: {
  group: Group
  allGroups: Group[]
  onSelect: () => void
}) {
  const meta = getSpaceMeta(group)
  const parent = useMemo(
    () => (meta.parentSpaceId ? allGroups.find((g) => g.id === meta.parentSpaceId) : null),
    [meta.parentSpaceId, allGroups]
  )
  const children = useMemo(() => findChildSpaces(allGroups, group.id), [allGroups, group.id])
  const initials = group.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left p-4 rounded-xl border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center text-sm font-semibold text-primary shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{group.name}</div>
          {parent && (
            <div className="text-[10px] text-muted-foreground truncate">
              ↑ {parent.name}
            </div>
          )}
          {!parent && children.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {children.length} Subnetzwerk{children.length === 1 ? "" : "e"}
            </div>
          )}
        </div>
      </div>
      {meta.description && (
        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mb-2">
          {meta.description}
        </p>
      )}
      {meta.hashtags && meta.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {meta.hashtags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
