import { useState } from 'react'
import { Settings, Locate, Loader2 } from 'lucide-react'
import { flyToLocation } from '@/lib/map-access'

interface ProfileClusterProps {
  userName: string
  onSettingsClick?: () => void
  onProfileClick?: () => void
}

export function ProfileCluster({
  userName,
  onSettingsClick,
  onProfileClick,
}: ProfileClusterProps) {
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        flyToLocation(position.coords.latitude, position.coords.longitude, 14)
        setLocating(false)
      },
      () => {
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-md backdrop-blur-md transition hover:bg-background hover:text-foreground disabled:opacity-60"
        title="Wo bin ich auf der Karte"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Locate className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={onSettingsClick}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-md backdrop-blur-md transition hover:bg-background hover:text-foreground"
        title="Einstellungen"
      >
        <Settings className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onProfileClick}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-background/90 py-1 pl-1 pr-4 shadow-md backdrop-blur-md transition hover:bg-background"
        title="Profil öffnen"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-sm font-semibold text-white shadow-inner">
          {initial}
        </div>
        <span className="text-sm font-medium text-foreground">Trust</span>
      </button>
    </div>
  )
}
