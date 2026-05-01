import { useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "@real-life-stack/toolkit"
import {
  useUserAvatar,
  useUserProgress,
  INNERE_BEREICHE,
  progressInLevel,
} from "../gamification"
import { Avatar } from "./Avatar"

/**
 * AvatarWidget — kompakte Avatar-Sicht fuers Dashboard.
 * Zeigt Avatar + Titel + Top-Items.
 */
export function AvatarWidget({ spaceSlug, spaceId }: { spaceSlug: string | null; spaceId: string | null }) {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const { displayed, owned, titleForSpace } = useUserAvatar(spaceId)
  const { data: progress } = useUserProgress()

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

  const goAvatar = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/avatar`)
  }

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      <button
        type="button"
        onClick={goAvatar}
        disabled={!spaceSlug}
        className="flex items-center justify-between mb-3 text-left group disabled:cursor-default w-full"
      >
        <div>
          <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
            Avatar
          </div>
          <div className="text-sm font-semibold leading-tight">
            {userName}
            {titleForSpace && (
              <span className="block text-[11px] text-muted-foreground italic font-normal">
                der {titleForSpace}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </button>

      <div className="flex-1 flex items-center justify-center">
        <Avatar
          name={userName}
          level={totalLevel}
          displayedItems={displayed}
          synergyActive={synergyActive}
          size={120}
        />
      </div>

      <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t flex justify-between">
        <span>
          {owned.length} Item{owned.length === 1 ? "" : "s"} im Inventar
        </span>
        <span>
          {displayed.length} {displayed.length === 1 ? "getragen" : "getragen"}
        </span>
      </div>
    </div>
  )
}
