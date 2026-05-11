import { useEffect, useMemo, useState } from "react"
import { Sparkles, Check, Lock, Filter } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useCurrentUser } from "@real-life-stack/toolkit"
import type { LucideIcon } from "lucide-react"
import type { ModuleViewProps } from "../registry"
import {
  useUserAvatar,
  useUserProgress,
  BEREICH_BY_ID,
  TREE_BEREICHE,
  SYNERGIES,
  type AvatarItemData,
  type AvatarItemRarity,
  type TreeBereichId,
} from "../gamification"
import { Avatar } from "../avatar/Avatar"

/**
 * SpiegelAvatarTab — Avatar links, Items rechts (Two-Panel-Layout).
 *
 * Linkes Panel: Avatar gross mit Halo aus displayedItems. Drag-Drop-Ziel.
 * Rechtes Panel: Items als kleine Kreise im Grid, gruppiert nach Bereich.
 * Klick auf Item: toggle ob auf Avatar getragen.
 * Drag von Item auf Avatar: legt Item an.
 *
 * Mobile: gestapelt — Avatar oben, Items darunter.
 */

const RARITY_BORDER: Record<AvatarItemRarity, string> = {
  common: "rgba(148,163,184,0.6)",
  rare: "rgba(59,130,246,0.7)",
  epic: "rgba(168,85,247,0.8)",
  legendary: "rgba(251,191,36,0.95)",
}

const RARITY_LABEL: Record<AvatarItemRarity, string> = {
  common: "Gewoehnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendaer",
}

function rarityDots(rarity: AvatarItemRarity): { dots: 1 | 2 | 3; legendary: boolean } {
  if (rarity === "common") return { dots: 1, legendary: false }
  if (rarity === "rare") return { dots: 2, legendary: false }
  if (rarity === "epic") return { dots: 3, legendary: false }
  return { dots: 3, legendary: true }
}

function DynamicIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
  const iconKey = useMemo(() => {
    return name
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  }, [name])
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconKey] ?? Sparkles
  return <Icon className={className} style={color ? { color } : undefined} />
}

export interface SpiegelAvatarTabProps extends ModuleViewProps {
  onNavReady?: (api: { prev: () => void; next: () => void; canPrev: boolean; canNext: boolean }) => void
}

export function SpiegelAvatarTab({ spaceId, onNavReady }: SpiegelAvatarTabProps) {
  const { data: currentUser } = useCurrentUser()
  const { owned, displayed, titleForSpace, toggleDisplayed } = useUserAvatar(spaceId)
  const { data: progress } = useUserProgress()

  const [filter, setFilter] = useState<TreeBereichId | "all">("all")

  const userName = currentUser?.displayName?.trim() || "Macher"
  const totalXp = useMemo(
    () => Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [progress.bereichXp]
  )

  const synergyActive = useMemo(
    () => SYNERGIES.some((syn) => syn.bereiche.every((b) => (progress.bereichXp[b] ?? 0) > 0)),
    [progress.bereichXp]
  )

  // Bereich-Filter zaehlt nur Bereiche, in denen Items existieren
  const bereicheMitItems = useMemo(() => {
    const set = new Set<TreeBereichId>()
    for (const item of owned) {
      if (item.def.bereichId) set.add(item.def.bereichId)
    }
    return TREE_BEREICHE.filter((b) => set.has(b.id))
  }, [owned])

  // Items gefiltert
  const filtered = useMemo(() => {
    if (filter === "all") return owned
    return owned.filter((item) => item.def.bereichId === filter)
  }, [owned, filter])

  // Pfeil-Navigation: rotiert durch Filter (Alle + verfuegbare Bereiche)
  const filterOrder = useMemo<Array<TreeBereichId | "all">>(
    () => ["all", ...bereicheMitItems.map((b) => b.id)],
    [bereicheMitItems]
  )
  const goPrev = () => {
    const idx = filterOrder.indexOf(filter)
    const next = idx <= 0 ? filterOrder[filterOrder.length - 1] : filterOrder[idx - 1]
    if (next !== undefined) setFilter(next)
  }
  const goNext = () => {
    const idx = filterOrder.indexOf(filter)
    const next = idx >= filterOrder.length - 1 ? filterOrder[0] : filterOrder[idx + 1]
    if (next !== undefined) setFilter(next)
  }
  useEffect(() => {
    if (!onNavReady) return
    onNavReady({
      prev: goPrev,
      next: goNext,
      canPrev: filterOrder.length > 1,
      canNext: filterOrder.length > 1,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onNavReady, filter, filterOrder.length])

  const isItemDisplayed = (id: string) => displayed.some((d) => d.id === id)

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
      {/* Links: Avatar */}
      <div className="rounded-xl border bg-card p-3 flex flex-col items-center gap-2 overflow-y-auto">
        <Avatar
          name={userName}
          displayedItems={displayed}
          synergyActive={synergyActive}
          size={180}
          onItemDropped={(itemId) => toggleDisplayed(itemId)}
          onHaloItemClick={(itemId) => toggleDisplayed(itemId)}
        />
        <div className="text-center">
          <h2 className="text-lg font-semibold">{userName}</h2>
          {titleForSpace && (
            <p className="text-xs text-muted-foreground italic">der {titleForSpace}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            {displayed.length} von {owned.length} sichtbar · {totalXp.toLocaleString("de-DE")} XP
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground text-center italic max-w-[260px]">
          Items per Drag-Drop auf den Avatar ziehen oder rechts antippen.
        </p>
      </div>

      {/* Rechts: Items */}
      <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
            Inventar
          </span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              filter === "all"
                ? "border-transparent bg-foreground text-background font-semibold"
                : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
            }`}
          >
            Alle {owned.length}
          </button>
          {bereicheMitItems.map((b) => {
            const count = owned.filter((i) => i.def.bereichId === b.id).length
            const active = filter === b.id
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setFilter(b.id)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                  active
                    ? "border-transparent text-white font-semibold"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
                }`}
                style={active ? { background: b.color } : {}}
              >
                {b.label}
                <span className="opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="p-3 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              {owned.length === 0
                ? "Noch keine Items. Quests abschliessen — sie wandern hierher."
                : "Keine Items in diesem Filter."}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
              {filtered.map((item) => (
                <SpiegelItemCircle
                  key={item.id}
                  item={item}
                  isDisplayed={isItemDisplayed(item.id)}
                  onToggle={() => toggleDisplayed(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SpiegelItemCircle — Item als Kreis mit Drag-Drop
// ============================================================

function SpiegelItemCircle({
  item,
  isDisplayed,
  onToggle,
}: {
  item: { id: string; def: AvatarItemData }
  isDisplayed: boolean
  onToggle: () => void
}) {
  const bereich = item.def.bereichId ? BEREICH_BY_ID[item.def.bereichId] : null
  const color = item.def.color ?? bereich?.color ?? "#FBBF24"
  const borderColor = RARITY_BORDER[item.def.rarity]
  const { dots, legendary } = rarityDots(item.def.rarity)

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisplayed) return
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/avatar-item-id", item.id)
  }

  const titleText = item.def.condition
    ? `${item.def.name} · ${RARITY_LABEL[item.def.rarity]} · ${item.def.condition}`
    : `${item.def.name} · ${RARITY_LABEL[item.def.rarity]}`

  return (
    <button
      type="button"
      onClick={onToggle}
      draggable={!isDisplayed}
      onDragStart={handleDragStart}
      title={titleText}
      className={`group flex flex-col items-center gap-1 transition-all ${
        isDisplayed ? "" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="relative">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:shadow-md"
          style={{
            background: `${color}15`,
            borderColor,
            boxShadow: legendary
              ? `0 0 16px ${color}80, 0 0 8px ${color}40`
              : isDisplayed
              ? `0 0 12px ${color}50`
              : undefined,
          }}
        >
          <DynamicIcon name={item.def.symbol} className="w-6 h-6 sm:w-7 sm:h-7" color={color} />
        </div>
        {isDisplayed && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full grid place-items-center text-white shadow"
            style={{ background: "#10B981" }}
            aria-label="Auf Avatar getragen"
          >
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-0.5" aria-label={RARITY_LABEL[item.def.rarity]}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full"
            style={{
              background: i <= dots ? color : "rgba(148,163,184,0.25)",
              boxShadow: legendary && i <= dots ? `0 0 4px ${color}` : undefined,
            }}
          />
        ))}
      </div>
      <div className="text-[10px] font-medium text-center leading-tight max-w-[80px] truncate">
        {item.def.name}
      </div>
    </button>
  )
}
