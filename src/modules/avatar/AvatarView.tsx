import { useMemo, useState } from "react"
import { Edit2, Check, X, Sparkles, ShieldCheck, Heart, HandHeart } from "lucide-react"
import * as LucideIcons from "lucide-react"
import {
  Card,
  CardContent,
  Button,
  Input,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { LucideIcon } from "lucide-react"
import type { ModuleViewProps } from "../registry"
import {
  useUserAvatar,
  useUserProgress,
  useReputation,
  trustLabel,
  INNERE_BEREICHE,
  BEREICH_BY_ID,
  progressInLevel,
  ARCHETYPES,
  getArchetype,
  type AvatarItemData,
  type AvatarItemRarity,
  type ReputationStats,
} from "../gamification"
import { Avatar } from "./Avatar"

/**
 * AvatarView — Hauptansicht des Avatar-Moduls.
 *
 * Ueber dem Avatar: Titel (editierbar pro Space).
 * Avatar in der Mitte mit Halo aus displayedItems.
 * Darunter Inventar mit allen ownedItems — Klick auf Item toggle "auf Avatar".
 *
 * Phase D1: kein Drag-Drop, nur Klick-Toggle. Drag-Drop kommt in D2.
 */

const RARITY_LABEL: Record<AvatarItemRarity, string> = {
  common: "Gewoehnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendaer",
}

const RARITY_BORDER: Record<AvatarItemRarity, string> = {
  common: "rgba(148,163,184,0.6)",
  rare: "rgba(59,130,246,0.7)",
  epic: "rgba(168,85,247,0.8)",
  legendary: "rgba(251,191,36,0.95)",
}

function DynamicIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
  const iconKey = name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("")
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconKey] ?? Sparkles
  return <Icon className={className} style={color ? { color } : undefined} />
}

export function AvatarView({ spaceId }: ModuleViewProps) {
  const { data: currentUser } = useCurrentUser()
  const { owned, displayed, titleForSpace, archetypesForSpace, toggleDisplayed, setTitle, toggleArchetype } = useUserAvatar(spaceId)
  const { data: progress } = useUserProgress()
  const reputation = useReputation()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")

  const totalXp = useMemo(
    () => Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0),
    [progress.bereichXp]
  )
  const totalLevel = progressInLevel(totalXp).level

  const synergyActive = useMemo(
    () => INNERE_BEREICHE.every((b) => (progress.bereichXp[b] ?? 0) > 0),
    [progress.bereichXp]
  )

  const userName = currentUser?.displayName?.trim() || "Macher"

  // Inventar nach Bereich gruppiert
  const inventoryByBereich = useMemo(() => {
    const groups: Array<{ label: string; color: string; items: typeof owned }> = []
    const map = new Map<string, typeof owned>()
    for (const item of owned) {
      const bId = item.def.bereichId ?? "_other"
      if (!map.has(bId)) map.set(bId, [])
      map.get(bId)!.push(item)
    }
    // Sortierung nach BEREICH_BY_ID-Reihenfolge
    for (const [bId, items] of map.entries()) {
      const bereich = bId !== "_other" ? BEREICH_BY_ID[bId as keyof typeof BEREICH_BY_ID] : null
      groups.push({
        label: bereich?.label ?? "Allgemein",
        color: bereich?.color ?? "#94A3B8",
        items,
      })
    }
    return groups
  }, [owned])

  const handleSaveTitle = async () => {
    if (!spaceId) return
    await setTitle(spaceId, titleDraft.trim())
    setEditingTitle(false)
  }

  const handleStartEdit = () => {
    setTitleDraft(titleForSpace ?? "")
    setEditingTitle(true)
  }

  const isItemDisplayed = (id: string) => displayed.some((d) => d.id === id)

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Hero: Avatar + Name + Titel */}
      <Card>
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <Avatar
            name={userName}
            level={totalLevel}
            displayedItems={displayed}
            synergyActive={synergyActive}
            size={200}
            onItemDropped={(itemId) => toggleDisplayed(itemId)}
            onHaloItemClick={(itemId) => toggleDisplayed(itemId)}
          />

          <div className="mt-4">
            <h1 className="text-2xl font-bold leading-tight">{userName}</h1>

            {/* Titel — editierbar */}
            <div className="mt-1 flex items-center gap-2 justify-center">
              {editingTitle ? (
                <>
                  <Input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    placeholder="z.B. Brueckenbauer, Macher des Holzes, Herzensoeffner"
                    className="h-8 text-sm w-64"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveTitle} className="h-7 w-7">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingTitle(false)} className="h-7 w-7">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground italic">
                    {titleForSpace ? `der ${titleForSpace}` : "ohne Titel"}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Titel aendern"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div>
              <div className="text-2xl font-bold" style={{ color: "#E8751A" }}>
                {totalLevel}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Level
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{owned.length}</div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Items
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{displayed.length}</div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Auf Avatar
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                {reputation.trustScore}
              </div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {trustLabel(reputation.trustScore)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputations-Karte */}
      <ReputationCard reputation={reputation} />

      {/* Archetypen */}
      <ArchetypeSection
        spaceId={spaceId}
        activeArchetypes={archetypesForSpace}
        currentTitle={titleForSpace}
        onToggle={(id) => spaceId && toggleArchetype(spaceId, id)}
        onUseTitle={(t) => spaceId && setTitle(spaceId, t)}
      />

      {/* Inventar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Inventar</h2>
          <span className="text-xs text-muted-foreground">
            Klick: Item auf Avatar zeigen / verstecken
          </span>
        </div>

        {owned.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p>
                Noch keine Items.<br />
                Quests mit Belohnung abschliessen — die Items wandern hier rein.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inventoryByBereich.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <span className="text-[10px] text-muted-foreground">
                    {group.items.length} Item{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                  {group.items.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      isDisplayed={isItemDisplayed(item.id)}
                      onToggle={() => toggleDisplayed(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hinweis */}
      <div className="text-[11px] text-muted-foreground/80 italic max-w-2xl border-l-2 border-primary/30 pl-3 py-1 leading-relaxed">
        Items sind soulbound — sie gehoeren dir, niemand kann sie tauschen oder
        nehmen. Sie reisen mit dir ueber alle Netzwerke, der Titel bleibt pro Netzwerk.
      </div>
    </div>
  )
}

// ============================================================
// ArchetypeSection — sieben Wege zur Auswahl
// ============================================================

function ArchetypeSection({
  spaceId,
  activeArchetypes,
  currentTitle,
  onToggle,
  onUseTitle,
}: {
  spaceId: string | null
  activeArchetypes: string[]
  currentTitle: string | undefined
  onToggle: (id: string) => void
  onUseTitle: (title: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  if (!spaceId) return null

  const active = new Set(activeArchetypes)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Wege</h2>
        <span className="text-xs text-muted-foreground">
          {active.size} von 7 — du traegst mehrere
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ARCHETYPES.map((arch) => {
          const Icon = arch.icon
          const isActive = active.has(arch.id)
          const isExpanded = expandedId === arch.id
          return (
            <div key={arch.id}>
              <button
                type="button"
                onClick={() => onToggle(arch.id)}
                onContextMenu={(e) => { e.preventDefault(); setExpandedId(isExpanded ? null : arch.id) }}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.01] ${
                  isActive ? "shadow-md" : "hover:shadow"
                }`}
                style={{
                  borderColor: isActive ? arch.color : "transparent",
                  background: isActive ? `${arch.color}10` : "var(--card, white)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: arch.color }} />
                  <span className={`text-sm font-semibold ${isActive ? "" : "text-muted-foreground"}`}>
                    {arch.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-snug line-clamp-2">
                  "{arch.question}"
                </p>
              </button>

              {/* Detail-Panel beim Rechtsklick (Long-Press auf Mobile) */}
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : arch.id)}
                  className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? "weniger" : "mehr"}
                </button>

                {isExpanded && (
                  <div className="mt-1 p-2 rounded border bg-muted/20 space-y-1.5">
                    <p className="text-[11px] text-foreground/80 leading-snug">
                      {arch.description}
                    </p>
                    <div className="text-[10px]">
                      <div className="text-muted-foreground mb-0.5">Bevorzugte Bereiche:</div>
                      <div className="flex flex-wrap gap-1">
                        {arch.preferredBereiche.map((b) => {
                          const bereich = BEREICH_BY_ID[b]
                          return (
                            <span
                              key={b}
                              className="px-1.5 py-0.5 rounded-full text-[9px] text-white"
                              style={{ background: bereich.color }}
                            >
                              {bereich.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="text-[10px]">
                      <div className="text-muted-foreground mb-0.5">Titel-Vorschlaege:</div>
                      <div className="flex flex-wrap gap-1">
                        {arch.titleSuggestions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onUseTitle(t) }}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                              currentTitle === t
                                ? "text-white font-semibold"
                                : "border text-muted-foreground hover:text-foreground"
                            }`}
                            style={{
                              background: currentTitle === t ? arch.color : "transparent",
                              borderColor: currentTitle === t ? arch.color : undefined,
                            }}
                          >
                            der/die {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-[11px] text-muted-foreground/80 italic mt-2 leading-relaxed">
        Archetypen sind Einladungen — kein Korsett. Sie schlagen Quests vor und
        lassen XP staerker auf bevorzugte Bereiche fliessen. Klick zum An- und
        Abwaehlen, "mehr" fuer Detail.
      </div>
    </div>
  )
}

// ============================================================
// InventoryCard
// ============================================================

/**
 * Mastery-Punkte fuer Item-Rarity (AC-Style).
 * common=1, rare=2, epic=3, legendary=3 (mit Glow).
 */
function rarityDots(rarity: AvatarItemRarity): { dots: 1 | 2 | 3; legendary: boolean } {
  if (rarity === "common") return { dots: 1, legendary: false }
  if (rarity === "rare") return { dots: 2, legendary: false }
  if (rarity === "epic") return { dots: 3, legendary: false }
  return { dots: 3, legendary: true }
}

function InventoryCard({
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
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:shadow-md`}
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
        {/* Equipped-Marker */}
        {isDisplayed && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white shadow"
            style={{ background: "#10B981" }}
            aria-label="Auf Avatar getragen"
          >
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* AC-Style Rarity-Punkte */}
      <div className="flex items-center gap-0.5" aria-label={`${RARITY_LABEL[item.def.rarity]}`}>
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

// ============================================================
// ReputationCard — verdiente Anerkennung (Phase E4)
// ============================================================

function ReputationCard({ reputation }: { reputation: ReputationStats }) {
  const empty = reputation.received === 0 && reputation.given === 0
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <h2 className="text-base font-bold">Vertrauen</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Was andere ueber dich bestaetigen
          </span>
        </div>

        {empty ? (
          <p className="text-xs text-muted-foreground italic">
            Noch keine Attestation. Schliesse Quests im Modus "Attestiert" ab — andere
            bestaetigen, was du geleistet hast. Jede Bestaetigung baut Vertrauen auf.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                Empfangen
              </div>
              <div className="text-2xl font-bold">{reputation.received}</div>
              <div className="text-[10px] text-muted-foreground">
                {reputation.attestors.length} verschiedene Attestoren
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <HandHeart className="h-3.5 w-3.5 text-emerald-500" />
                Gegeben
              </div>
              <div className="text-2xl font-bold">{reputation.given}</div>
              <div className="text-[10px] text-muted-foreground">
                {reputation.attested.length} Spieler attestiert
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
