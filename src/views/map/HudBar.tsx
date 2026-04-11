import { Heart, Zap, Sparkles } from 'lucide-react'

export function HudBar() {
  return (
    <div className="flex items-center gap-4 rounded-full border border-border/60 bg-background/90 px-5 py-2 shadow-md backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-sm">
        <Heart className="h-4 w-4 text-rose-500" />
        <span className="font-medium text-foreground">Level 1</span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-1.5 text-sm">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-muted-foreground">0 XP</span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-1.5 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">0 Taler</span>
      </div>
    </div>
  )
}
