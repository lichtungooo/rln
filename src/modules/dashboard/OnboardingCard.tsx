import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Zap, Trophy, User as UserIcon, X, Loader2 } from "lucide-react"
import {
  Button,
  Card,
  CardContent,
  useItems,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import { useUserProgress, GAMIFICATION_ITEM_TYPES } from "../gamification"
import { useMacherDemoData } from "../../demo/use-demo-data"

/**
 * OnboardingCard — Welcome-Karte fuer frische User.
 *
 * Erscheint nur, wenn der User noch keine eigenen Quests + kein Progress hat
 * UND er sie nicht weggeklickt hat. Zeigt drei klare Wege:
 *   1. Demo-Tour starten (laedt Showroom-Daten)
 *   2. Erste Quest anlegen
 *   3. Avatar einrichten
 */

const DISMISS_KEY = "macher-onboarding-dismissed"

export function OnboardingCard({ spaceSlug }: { spaceSlug: string | null }) {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const { data: progress } = useUserProgress()
  const { data: quests } = useItems({ type: GAMIFICATION_ITEM_TYPES.quest })
  const demo = useMacherDemoData()
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      return false
    }
  })
  const [loading, setLoading] = useState(false)

  const isFresh = useMemo(() => {
    if (!currentUser?.id) return false
    const ownQuests = quests.filter((q) => q.createdBy === currentUser.id).length
    const totalXp = Object.values(progress.bereichXp).reduce((a, b) => a + (b ?? 0), 0)
    return ownQuests === 0 && totalXp === 0 && demo.count === 0
  }, [currentUser?.id, quests, progress.bereichXp, demo.count])

  if (!isFresh || dismissed) return null

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // localStorage nicht verfuegbar — egal, Session-State reicht
    }
    setDismissed(true)
  }

  const handleDemoTour = async () => {
    setLoading(true)
    try {
      await demo.load()
      if (spaceSlug) navigate(`/${spaceSlug}/quest`)
    } finally {
      setLoading(false)
    }
  }

  const goToQuests = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/quest`)
  }

  const goToAvatar = () => {
    if (spaceSlug) navigate(`/${spaceSlug}/avatar`)
  }

  return (
    <Card className="border-2 border-primary/40 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-rose-50/30 dark:from-amber-950/20 dark:via-orange-950/15 dark:to-rose-950/10">
      <CardContent className="p-5 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Welcome ausblenden"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold leading-tight">
              Willkommen im Macher.
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hier wird gemacht statt geredet. XP fuer das was deine Haende koennen,
              Trust durch das was andere bestaetigen, ein Avatar der deine Reise traegt.
              Drei Wege starten dich:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDemoTour}
            disabled={loading}
            className="text-left p-4 rounded-lg bg-card border-2 border-border hover:border-primary transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              {loading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Zap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              )}
              <span className="font-semibold text-sm">Demo-Tour starten</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Laed Werkstaetten, Quests, Macher-Profile und eine Quest-Reihe in
              den Space — dann klick durch und sieh wie alles ineinander greift.
            </p>
          </button>

          <button
            type="button"
            onClick={goToQuests}
            className="text-left p-4 rounded-lg bg-card border-2 border-border hover:border-primary transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Erste Quest anlegen</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Was willst du als naechstes lernen oder bauen? Schreib es als
              Quest auf — mit XP-Belohnung. Selbst, QR oder Peer-bestaetigt.
            </p>
          </button>

          <button
            type="button"
            onClick={goToAvatar}
            className="text-left p-4 rounded-lg bg-card border-2 border-border hover:border-primary transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Avatar einrichten</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ein Wesen, das dich als Macher zeigt. Symbole statt Foto — fuer
              jede gewonnene Faehigkeit ein Item im Halo. Plus Archetyp.
            </p>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
