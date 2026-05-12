import { useMemo } from "react"
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
    <button
      type="button"
      onClick={goAvatar}
      disabled={!spaceSlug}
      className="bg-amber-50/60 hover:bg-amber-50 rounded-xl p-4 h-full w-full flex flex-col text-left transition-colors disabled:cursor-default"
    >
      <div className="mb-3">
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

      <div className="flex-1 flex items-center justify-center">
        <Avatar
          name={userName}
          level={totalLevel}
          displayedItems={displayed}
          synergyActive={synergyActive}
          size={120}
        />
      </div>
    </button>
  )
}
