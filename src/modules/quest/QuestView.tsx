import { useMemo, useState } from "react"
import {
  Plus,
  CheckCircle2,
  Circle,
  Trophy,
  MapPin,
  Sparkles,
  ChevronLeft,
  Hammer,
  Layers,
  QrCode,
  Users,
  ShieldCheck,
} from "lucide-react"
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useItems,
  useCurrentUser,
  useCreateItem,
  useDeleteItem,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import type { ModuleViewProps } from "../registry"
import {
  GAMIFICATION_ITEM_TYPES,
  BEREICH_BY_ID,
  type SkillData,
  type AvatarItemData,
  type TreeBereichId,
  useGamificationSeed,
} from "../gamification"
import { useQuests } from "./use-quests"
import type { QuestData } from "./quest-engine"
import { QrVerificationDialog } from "./QrVerificationDialog"

type Verification = "self" | "qr" | "peer" | "attestation"

/**
 * QuestView — die Sicht aufs Quest-Modul.
 *
 * Drei Modi:
 *   - Liste (default): alle Quests mit Status (offen/erledigt) + Belohnungen
 *   - Detail: Eine Quest mit Abschluss-Knopf + voller Beschreibung
 *   - Form: neue Quest anlegen
 *
 * Phase B1: nur Self-Report-Verification (Klick "Erledigt"). QR + Peer +
 * Attestation kommen in B2.
 */

export interface QuestModuleConfig {
  /** Default-Verifikation fuer neue Quests */
  defaultVerification?: "self" | "qr" | "peer" | "attestation"
  /** Maximale XP pro Quest (Anti-Grinding) */
  maxXpPerQuest?: number
}

export const questDefaultConfig: QuestModuleConfig = {
  defaultVerification: "self",
  maxXpPerQuest: 200,
}

export function QuestView(_props: ModuleViewProps<QuestModuleConfig>) {
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { quests, isCompleted, complete, uncomplete } = useQuests()
  const { data: skills } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { data: avatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.avatarItem })
  const { seed, busy: seeding, status: seedStatus } = useGamificationSeed()

  const activeQuest = useMemo(() => {
    if (!activeQuestId) return null
    return quests.find((q) => q.id === activeQuestId) ?? null
  }, [activeQuestId, quests])

  // Quests in Reihen gruppieren — Series werden zuerst gezeigt, dann
  // Single-Quests
  const grouped = useMemo(() => {
    const seriesMap = new Map<string, Item[]>()
    const singles: Item[] = []
    for (const q of quests) {
      const sid = (q.data as QuestData).questSeriesId
      if (sid) {
        if (!seriesMap.has(sid)) seriesMap.set(sid, [])
        seriesMap.get(sid)!.push(q)
      } else {
        singles.push(q)
      }
    }
    // Sortierung pro Series nach questSeriesPosition
    for (const [, items] of seriesMap) {
      items.sort((a, b) => {
        const aPos = (a.data as QuestData).questSeriesPosition ?? 999
        const bPos = (b.data as QuestData).questSeriesPosition ?? 999
        return aPos - bPos
      })
    }
    return {
      series: Array.from(seriesMap.entries()).map(([id, items]) => ({ id, items })),
      singles,
    }
  }, [quests])

  // Detail-Modus
  if (activeQuest) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveQuestId(null)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurueck zur Liste
        </Button>
        <QuestDetail
          quest={activeQuest}
          skills={skills}
          avatarItems={avatarItems}
          isCompleted={isCompleted(activeQuest.id)}
          onComplete={(verification) => complete(activeQuest, verification)}
          onUncomplete={() => uncomplete(activeQuest.id)}
          allQuests={quests}
          onSelectQuest={setActiveQuestId}
        />
      </div>
    )
  }

  // Form-Modus
  if (creating) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreating(false)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurueck zur Liste
        </Button>
        <QuestForm
          skills={skills}
          avatarItems={avatarItems}
          onCreated={(id) => {
            setCreating(false)
            setActiveQuestId(id)
          }}
          onCancel={() => setCreating(false)}
        />
      </div>
    )
  }

  // Liste-Modus
  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">Quests</h1>
          <p className="text-sm text-muted-foreground">
            Klare Aufgaben mit klarer Belohnung — XP fuer deine Skills, Items
            fuer deinen Avatar.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Neue Quest
        </Button>
      </div>

      {/* Seed-Hinweis wenn keine Skills vorhanden */}
      {seedStatus.skillsExisting === 0 && (
        <Card className="border-dashed border-2 border-primary/40">
          <CardContent className="p-5 flex items-start gap-3">
            <Hammer className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Skills + Avatar-Items fehlen noch</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {seedStatus.skillsTodo} Macher-Skills (Holz, Metall, Schweissen, ...) und{" "}
                {seedStatus.itemsTodo} Avatar-Items koennen mit einem Klick angelegt werden.
              </p>
              <Button size="sm" onClick={seed} disabled={seeding}>
                {seeding ? "Lade..." : "Macher-Skills anlegen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {quests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm">Noch keine Quest. Lege die erste an mit "+ Neue Quest".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quest-Reihen */}
          {grouped.series.map(({ id, items }) => {
            const seriesLabel = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            const doneCount = items.filter((q) => isCompleted(q.id)).length
            return (
              <div key={id}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4" style={{ color: "#A855F7" }} />
                  <h2 className="text-base font-semibold">{seriesLabel}</h2>
                  <span className="text-xs text-muted-foreground">
                    Reihe · {doneCount}/{items.length} erledigt
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((q) => (
                    <QuestCard
                      key={q.id}
                      quest={q}
                      skills={skills}
                      avatarItems={avatarItems}
                      completed={isCompleted(q.id)}
                      onClick={() => setActiveQuestId(q.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Einzelne Quests */}
          {grouped.singles.length > 0 && (
            <div>
              {grouped.series.length > 0 && (
                <h2 className="text-base font-semibold mb-2">Einzelne Quests</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped.singles
                  .slice()
                  .sort((a, b) => {
                    const aDone = isCompleted(a.id) ? 1 : 0
                    const bDone = isCompleted(b.id) ? 1 : 0
                    if (aDone !== bDone) return aDone - bDone
                    return a.createdAt.localeCompare(b.createdAt)
                  })
                  .map((q) => (
                    <QuestCard
                      key={q.id}
                      quest={q}
                      skills={skills}
                      avatarItems={avatarItems}
                      completed={isCompleted(q.id)}
                      onClick={() => setActiveQuestId(q.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// QuestCard — kompakter Eintrag in der Liste
// ============================================================

function QuestCard({
  quest,
  skills,
  avatarItems,
  completed,
  onClick,
}: {
  quest: Item
  skills: Item[]
  avatarItems: Item[]
  completed: boolean
  onClick: () => void
}) {
  const data = quest.data as QuestData
  const skillXp = data.skillXp ?? {}
  const bereichXp = data.bereichXp ?? {}
  const rewardItems = data.rewardItems ?? []

  const skillBadges = Object.entries(skillXp).map(([skillId, xp]) => {
    const skill = skills.find((s) => s.id === skillId)
    const skillData = skill?.data as SkillData | undefined
    const bereich = skillData ? BEREICH_BY_ID[skillData.bereichId] : null
    return {
      label: skillData?.name ?? skillId,
      xp,
      color: skillData?.color ?? bereich?.color ?? "#888",
    }
  })

  const totalXp =
    Object.values(skillXp).reduce((a, b) => a + b, 0) +
    Object.values(bereichXp).reduce((a, b) => a + (b ?? 0), 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-card border rounded-lg p-4 transition-all hover:scale-[1.01] hover:shadow-md ${
        completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">{data.title}</h3>
          {data.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Verifikations-Marker */}
      {data.verification && data.verification !== "self" && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
          {data.verification === "qr" && <><QrCode className="h-3 w-3" /> QR</>}
          {data.verification === "peer" && <><Users className="h-3 w-3" /> Peer</>}
          {data.verification === "attestation" && <><ShieldCheck className="h-3 w-3" /> Attestiert</>}
        </div>
      )}

      {/* Belohnungen */}
      <div className="space-y-1.5 mt-3">
        {totalXp > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span className="font-semibold text-primary">+{totalXp} XP</span>
            <div className="flex flex-wrap gap-1">
              {skillBadges.slice(0, 3).map((b) => (
                <span
                  key={b.label}
                  className="px-1.5 py-0 rounded-full text-[9px] text-white"
                  style={{ background: b.color }}
                >
                  {b.label} +{b.xp}
                </span>
              ))}
              {skillBadges.length > 3 && (
                <span className="text-[9px] text-muted-foreground">
                  +{skillBadges.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        {rewardItems.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Trophy className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="text-muted-foreground">
              {rewardItems.length} Item{rewardItems.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
        {data.location?.address && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{data.location.address}</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ============================================================
// QuestDetail — Volle Quest mit Abschluss-Knopf
// ============================================================

function QuestDetail({
  quest,
  skills,
  avatarItems,
  isCompleted,
  onComplete,
  onUncomplete,
  allQuests,
  onSelectQuest,
}: {
  quest: Item
  skills: Item[]
  avatarItems: Item[]
  isCompleted: boolean
  onComplete: (verification: Verification) => Promise<void>
  onUncomplete: () => Promise<void>
  allQuests: Item[]
  onSelectQuest: (id: string) => void
}) {
  const data = quest.data as QuestData
  const verification: Verification = data.verification ?? "self"
  const [busy, setBusy] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  // Series-Sequenz fuer Vorgaenger/Nachfolger
  const seriesQuests = useMemo(() => {
    if (!data.questSeriesId) return null
    const items = allQuests
      .filter((q) => (q.data as QuestData).questSeriesId === data.questSeriesId)
      .sort((a, b) => {
        const aPos = (a.data as QuestData).questSeriesPosition ?? 999
        const bPos = (b.data as QuestData).questSeriesPosition ?? 999
        return aPos - bPos
      })
    const idx = items.findIndex((q) => q.id === quest.id)
    return {
      seriesLabel: data.questSeriesId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      total: items.length,
      position: data.questSeriesPosition ?? idx + 1,
      previous: idx > 0 ? items[idx - 1] : null,
      next: idx < items.length - 1 ? items[idx + 1] : null,
    }
  }, [data.questSeriesId, data.questSeriesPosition, quest.id, allQuests])

  const handleSelfComplete = async () => {
    setBusy(true)
    try {
      await onComplete("self")
    } finally {
      setBusy(false)
    }
  }

  const handleQrVerified = async () => {
    await onComplete("qr")
  }

  const handleUncomplete = async () => {
    if (!confirm("Quest wieder oeffnen? XP bleiben — aber sie kann erneut abgeschlossen werden.")) return
    setBusy(true)
    try {
      await onUncomplete()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        {/* Series-Banner */}
        {seriesQuests && (
          <div
            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-md text-xs"
            style={{ background: "rgba(168,85,247,0.08)", borderLeft: "3px solid #A855F7" }}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: "#A855F7" }} />
            <span className="font-semibold" style={{ color: "#A855F7" }}>
              {seriesQuests.seriesLabel}
            </span>
            <span className="text-muted-foreground">
              · Teil {seriesQuests.position} von {seriesQuests.total}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {isCompleted ? (
            <CheckCircle2 className="h-7 w-7 text-primary shrink-0" />
          ) : (
            <Circle className="h-7 w-7 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1">
            <CardTitle className="text-xl">{data.title}</CardTitle>
            {data.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {data.markdownBody && (
          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap border-l-4 border-primary/30 pl-3">
            {data.markdownBody}
          </div>
        )}

        {/* Skill-XP-Verteilung */}
        {data.skillXp && Object.keys(data.skillXp).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
              Skill-XP
            </h4>
            <div className="space-y-1.5">
              {Object.entries(data.skillXp).map(([skillId, xp]) => {
                const skill = skills.find((s) => s.id === skillId)
                const skillData = skill?.data as SkillData | undefined
                const bereich = skillData ? BEREICH_BY_ID[skillData.bereichId] : null
                return (
                  <div key={skillId} className="flex items-center justify-between gap-2 p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: skillData?.color ?? bereich?.color ?? "#888" }}
                      />
                      <span className="text-sm font-medium">{skillData?.name ?? skillId}</span>
                      {bereich && (
                        <span className="text-[10px] text-muted-foreground">({bereich.label})</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary">+{xp}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Direkt-Bereich-XP */}
        {data.bereichXp && Object.keys(data.bereichXp).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
              Bereich-XP (zusaetzlich)
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.bereichXp).map(([bId, xp]) => {
                const bereich = BEREICH_BY_ID[bId as TreeBereichId]
                return (
                  <span
                    key={bId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: bereich.color }}
                  >
                    {bereich.label} +{xp}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Avatar-Items als Belohnung */}
        {data.rewardItems && data.rewardItems.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
              Belohnung
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.rewardItems.map((itemId) => {
                const itemDef = avatarItems.find((it) => it.id === itemId)
                const itemData = itemDef?.data as AvatarItemData | undefined
                return (
                  <span
                    key={itemId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2"
                    style={{
                      borderColor: itemData?.color ?? "#FBBF24",
                      color: itemData?.color ?? "#FBBF24",
                    }}
                    title={itemData?.condition}
                  >
                    <Trophy className="h-3 w-3" />
                    {itemData?.name ?? itemId}
                    {itemData?.rarity && (
                      <span className="text-[9px] uppercase opacity-80">{itemData.rarity}</span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Standort */}
        {data.location?.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{data.location.address}</span>
          </div>
        )}
      </CardContent>

      <div className="border-t p-4 flex justify-end gap-2 bg-muted/20">
        {isCompleted ? (
          <>
            <span className="flex-1 text-sm text-muted-foreground self-center">
              ✓ Quest erledigt — die XP sind gutgeschrieben.
            </span>
            <Button variant="ghost" size="sm" onClick={handleUncomplete} disabled={busy}>
              Wieder oeffnen
            </Button>
          </>
        ) : verification === "qr" ? (
          <>
            <span className="flex-1 text-xs text-muted-foreground self-center">
              <QrCode className="h-3.5 w-3.5 inline mr-1" />
              QR-Verifikation noetig
            </span>
            <Button size="lg" onClick={() => setQrDialogOpen(true)} disabled={busy}>
              <QrCode className="h-4 w-4 mr-2" />
              QR pruefen
            </Button>
          </>
        ) : verification === "peer" ? (
          <>
            <span className="flex-1 text-xs text-muted-foreground self-center">
              <Users className="h-3.5 w-3.5 inline mr-1" />
              Peer-Bestaetigung — kommt in der naechsten Phase
            </span>
            <Button size="lg" disabled variant="outline">
              Anfrage senden
            </Button>
          </>
        ) : verification === "attestation" ? (
          <>
            <span className="flex-1 text-xs text-muted-foreground self-center">
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
              Attestation — kommt in der naechsten Phase
            </span>
            <Button size="lg" disabled variant="outline">
              Attestieren
            </Button>
          </>
        ) : (
          <Button size="lg" onClick={handleSelfComplete} disabled={busy}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {busy ? "Schliesse ab..." : "Quest abschliessen"}
          </Button>
        )}
      </div>

      {/* QR-Verifikations-Dialog */}
      {verification === "qr" && data.qrCode && (
        <QrVerificationDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          expectedCode={data.qrCode}
          questTitle={data.title}
          onVerified={handleQrVerified}
        />
      )}

      {/* Series-Navigation: Vorgaenger / Nachfolger */}
      {seriesQuests && (seriesQuests.previous || seriesQuests.next) && (
        <div className="border-t bg-muted/10 p-3 flex items-center justify-between gap-2">
          {seriesQuests.previous ? (
            <button
              type="button"
              onClick={() => onSelectQuest(seriesQuests.previous!.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-muted/40 rounded transition-colors text-left max-w-[45%]"
            >
              <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] text-muted-foreground uppercase">Vorher</div>
                <div className="text-sm truncate">{(seriesQuests.previous.data as QuestData).title}</div>
              </div>
            </button>
          ) : <div />}
          {seriesQuests.next ? (
            <button
              type="button"
              onClick={() => onSelectQuest(seriesQuests.next!.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-muted/40 rounded transition-colors text-right max-w-[45%]"
            >
              <div className="min-w-0">
                <div className="text-[9px] text-muted-foreground uppercase">Naechste</div>
                <div className="text-sm truncate">{(seriesQuests.next.data as QuestData).title}</div>
              </div>
              <ChevronLeft className="h-3.5 w-3.5 shrink-0 rotate-180" />
            </button>
          ) : <div />}
        </div>
      )}
    </Card>
  )
}

// ============================================================
// QuestForm — neue Quest anlegen
// ============================================================

function QuestForm({
  skills,
  avatarItems,
  onCreated,
  onCancel,
}: {
  skills: Item[]
  avatarItems: Item[]
  onCreated: (id: string) => void
  onCancel: () => void
}) {
  const { data: currentUser } = useCurrentUser()
  const { mutate: createItem } = useCreateItem()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skillXp, setSkillXp] = useState<Record<string, number>>({})
  const [rewardItemIds, setRewardItemIds] = useState<Set<string>>(new Set())
  const [seriesName, setSeriesName] = useState("")
  const [seriesPosition, setSeriesPosition] = useState<number | "">("")
  const [verification, setVerification] = useState<Verification>("self")
  const [qrCode, setQrCode] = useState("")
  const [busy, setBusy] = useState(false)

  const totalXp = Object.values(skillXp).reduce((a, b) => a + b, 0)

  const setXpForSkill = (skillId: string, xp: number) => {
    if (xp <= 0) {
      const next = { ...skillXp }
      delete next[skillId]
      setSkillXp(next)
    } else {
      setSkillXp({ ...skillXp, [skillId]: xp })
    }
  }

  const toggleReward = (itemId: string) => {
    const next = new Set(rewardItemIds)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    setRewardItemIds(next)
  }

  const handleCreate = async () => {
    if (!currentUser?.id || !title.trim()) return
    setBusy(true)
    try {
      const seriesId = seriesName.trim()
        ? seriesName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        : undefined
      // QR-Code automatisch generieren, falls verification=qr und nichts gesetzt
      const finalQrCode =
        verification === "qr"
          ? qrCode.trim() || `quest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
          : undefined
      const data: QuestData = {
        title: title.trim(),
        description: description.trim() || undefined,
        skillXp: Object.keys(skillXp).length > 0 ? skillXp : undefined,
        rewardItems: rewardItemIds.size > 0 ? Array.from(rewardItemIds) : undefined,
        verification,
        qrCode: finalQrCode,
        questSeriesId: seriesId,
        questSeriesPosition: seriesId && typeof seriesPosition === "number" ? seriesPosition : undefined,
      }
      const created = await createItem({
        type: GAMIFICATION_ITEM_TYPES.quest,
        createdBy: currentUser.id,
        data: data as unknown as Record<string, unknown>,
      })
      if (created) onCreated(created.id)
      else onCancel()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Neue Quest</CardTitle>
        <p className="text-xs text-muted-foreground">
          Eine Quest ist eine klare Aufgabe mit XP-Belohnung und ggf. einem Avatar-Item.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Titel</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Erste Schweiss-Naht legen"
          />
        </div>

        <div>
          <Label className="text-xs">Beschreibung</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Was ist zu tun? Warum lohnt es sich?"
            className="min-h-20"
          />
        </div>

        {/* Verifikations-Modus */}
        <div>
          <Label className="text-xs mb-1.5 block">Wie wird die Quest bestaetigt?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(
              [
                { id: "self", label: "Selbst", icon: CheckCircle2, hint: "Klick reicht" },
                { id: "qr", label: "QR-Code", icon: QrCode, hint: "Vor Ort scannen" },
                { id: "peer", label: "Peer", icon: Users, hint: "Naechste Phase" },
                { id: "attestation", label: "Attestiert", icon: ShieldCheck, hint: "Naechste Phase" },
              ] as { id: Verification; label: string; icon: typeof CheckCircle2; hint: string }[]
            ).map((opt) => {
              const Icon = opt.icon
              const isOn = verification === opt.id
              const disabled = opt.id === "peer" || opt.id === "attestation"
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setVerification(opt.id)}
                  className={`flex flex-col items-start gap-1 p-2.5 rounded-md border-2 text-left transition-all ${
                    isOn
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={disabled ? "Kommt mit Phase B2.2/B2.3" : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{opt.hint}</span>
                </button>
              )
            })}
          </div>

          {/* QR-Code-Feld nur sichtbar wenn QR gewaehlt */}
          {verification === "qr" && (
            <div className="mt-3 space-y-1.5">
              <Label className="text-xs">QR-Code-Inhalt (optional)</Label>
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Frei lassen — wird automatisch generiert"
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Den QR-Code findest du nach dem Anlegen im Quest-Detail unter "QR pruefen → Zeigen".
                Er kann ausgedruckt am Stand/in der Werkstatt haengen.
              </p>
            </div>
          )}
        </div>

        {/* Skills mit XP-Inputs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Skill-XP-Verteilung</Label>
            <span className="text-xs text-primary font-semibold">Gesamt: +{totalXp} XP</span>
          </div>
          {skills.length === 0 ? (
            <p className="text-xs text-muted-foreground border border-dashed rounded p-3 text-center">
              Erst Skills anlegen (in der Quest-Liste).
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto border rounded p-2">
              {skills.map((skillItem) => {
                const skillData = skillItem.data as SkillData
                const bereich = BEREICH_BY_ID[skillData.bereichId]
                const xp = skillXp[skillItem.id] ?? 0
                return (
                  <div
                    key={skillItem.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: skillData.color ?? bereich.color }}
                    />
                    <span className="text-sm flex-1 truncate">
                      {skillData.name}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({bereich.label})
                      </span>
                    </span>
                    <Input
                      type="number"
                      min="0"
                      max="500"
                      step="5"
                      value={xp || ""}
                      onChange={(e) => setXpForSkill(skillItem.id, Number(e.target.value) || 0)}
                      className="w-20 h-7 text-xs"
                      placeholder="0"
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quest-Reihe */}
        <div className="border-t pt-4 space-y-2">
          <Label className="text-xs flex items-center gap-1.5">
            <Layers className="h-3 w-3" />
            Quest-Reihe (optional)
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
            <Input
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder="z.B. Carpenter-Pfad, Schweiss-Schule, Lichtungs-Reise"
            />
            <Input
              type="number"
              min="1"
              max="99"
              value={seriesPosition || ""}
              onChange={(e) => setSeriesPosition(Number(e.target.value) || "")}
              placeholder="Position"
              disabled={!seriesName.trim()}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Quests mit dem gleichen Reihen-Namen erscheinen in der Liste gruppiert + verlinkt.
            Position ist die Stelle in der Reihe (1, 2, 3, ...).
          </p>
        </div>

        {/* Avatar-Items als Belohnung */}
        {avatarItems.length > 0 && (
          <div>
            <Label className="text-xs">Belohnungs-Item (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {avatarItems.map((itemDef) => {
                const itemData = itemDef.data as AvatarItemData
                const isOn = rewardItemIds.has(itemDef.id)
                return (
                  <button
                    key={itemDef.id}
                    type="button"
                    onClick={() => toggleReward(itemDef.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-colors ${
                      isOn ? "text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      borderColor: itemData.color ?? "#FBBF24",
                      background: isOn ? (itemData.color ?? "#FBBF24") : "transparent",
                    }}
                  >
                    {itemData.name}
                    <span className="text-[9px] uppercase ml-1 opacity-70">{itemData.rarity}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      <div className="border-t p-4 flex justify-end gap-2 bg-muted/20">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={handleCreate} disabled={busy || !title.trim()}>
          {busy ? "Lege an..." : "Quest anlegen"}
        </Button>
      </div>
    </Card>
  )
}
