import { useMemo } from "react"
import { Trophy, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuests } from "../../quest"
import type { QuestData } from "../../quest"
import { useChannel, useChannelSync } from "../../../components/SelectionContext"

/**
 * QuestWidget — die naechsten offenen Quests + Anzahl erledigter.
 *
 * Klick-Routing: registriert offene Quests im "quest"-Channel. Klick
 * auf eine Quest setzt sie als selected — ein QuestDetailWidget in
 * einem anderen Slot zeigt das Detail. Pfeile aussen rotieren durch
 * die Quests.
 *
 * Pfeil rechts oben fuehrt zum Quest-Modul (alter Sprung-Behavior).
 */
export function QuestWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { quests, isCompleted } = useQuests()

  const openQuests = useMemo(
    () => quests.filter((q) => !isCompleted(q.id)),
    [quests, isCompleted]
  )
  const openPreview = useMemo(() => openQuests.slice(0, 3), [openQuests])
  const doneCount = useMemo(
    () => quests.filter((q) => isCompleted(q.id)).length,
    [quests, isCompleted]
  )

  // Channel-Sync: alle offenen Quests im "quest"-Channel verfuegbar machen
  useChannelSync("quest", openQuests)
  const { selectedId, select } = useChannel("quest")

  const goQuests = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/quest`)
  }

  void goQuests

  return (
    <div className="bg-orange-50/60 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5" style={{ color: "#E8751A" }} />
        <div>
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Quests
          </div>
          <div className="text-base font-bold leading-tight">
            {openQuests.length} offen · {doneCount} erledigt
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {openPreview.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4">
            {quests.length === 0 ? "Noch keine Quest angelegt." : "Alle erledigt — neue anlegen."}
          </div>
        ) : (
          openPreview.map((quest) => {
            const data = quest.data as QuestData
            const totalXp =
              Object.values(data.skillXp ?? {}).reduce((a, b) => a + b, 0) +
              Object.values(data.bereichXp ?? {}).reduce((a, b) => a + (b ?? 0), 0)
            const isSelected = selectedId === quest.id
            return (
              <button
                key={quest.id}
                type="button"
                onClick={() => select(quest.id)}
                className={`w-full text-left p-2 rounded-md border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">{data.title}</div>
                    {totalXp > 0 && (
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: "#E8751A" }}>
                        +{totalXp} XP
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
