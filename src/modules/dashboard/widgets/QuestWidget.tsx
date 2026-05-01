import { useMemo } from "react"
import { Trophy, CheckCircle2, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useQuests } from "../../quest"
import type { QuestData } from "../../quest"

/**
 * QuestWidget — die naechsten offenen Quests + Anzahl erledigter.
 */
export function QuestWidget({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { quests, isCompleted } = useQuests()

  const open = useMemo(() => quests.filter((q) => !isCompleted(q.id)).slice(0, 3), [quests, isCompleted])
  const doneCount = useMemo(() => quests.filter((q) => isCompleted(q.id)).length, [quests, isCompleted])

  const goQuests = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/quest`)
  }

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      <button
        type="button"
        onClick={goQuests}
        disabled={!spaceSlug}
        className="flex items-center justify-between mb-3 text-left group disabled:cursor-default"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: "#E8751A" }} />
          <div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Quests
            </div>
            <div className="text-base font-bold leading-tight">
              {open.length} offen · {doneCount} erledigt
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {open.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4">
            {quests.length === 0 ? "Noch keine Quest angelegt." : "Alle erledigt — neue anlegen."}
          </div>
        ) : (
          open.map((quest) => {
            const data = quest.data as QuestData
            const totalXp =
              Object.values(data.skillXp ?? {}).reduce((a, b) => a + b, 0) +
              Object.values(data.bereichXp ?? {}).reduce((a, b) => a + (b ?? 0), 0)
            return (
              <button
                key={quest.id}
                type="button"
                onClick={goQuests}
                className="w-full text-left p-2 rounded-md border hover:bg-muted/30 transition-colors"
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
