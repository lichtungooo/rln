import { useMemo } from "react"
import { Network, Sparkles, Lock, Eye, EyeOff, Globe, Users, UsersRound, X } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useChannel } from "../../components/SelectionContext"
import {
  BEREICH_BY_ID,
  useUserProgress,
  useSkillVisibility,
  type SkillData,
  type TreeBereichId,
} from "../gamification"

/**
 * SpiegelSkillDetailWidget — zeigt das aktuell selektierte Skill aus
 * dem "skill"-Channel. Klick auf einen Skill im SpiegelSkillTab
 * (oder einem anderen Source-Widget) aktualisiert dieses Widget.
 *
 * Im Profil-Modul als optionales Widget verfuegbar — User kann es
 * ueber das Zahnrad neben dem Faehigkeitsbaum platzieren.
 */
export function SpiegelSkillDetailWidget() {
  const { selected, select } = useChannel<{
    id: string
    data: SkillData
    isUniversal: boolean
  }>("skill")
  const { skillXp, skillProgress, isUnlocked } = useUserProgress()
  const { get: getVisibility, set: setVisibility } = useSkillVisibility()

  const bereich = useMemo(() => {
    if (!selected) return null
    return BEREICH_BY_ID[selected.data.bereichId as TreeBereichId] ?? null
  }, [selected])

  if (!selected || !bereich) {
    return (
      <div className="h-full w-full bg-card border rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <Network className="h-6 w-6 opacity-40" />
        <p>Skill-Detail</p>
        <p className="text-[10px]">
          Klick auf einen Skill im Faehigkeitsbaum — das Detail erscheint hier.
        </p>
      </div>
    )
  }

  const xp = skillXp(selected.id)
  const progress = skillProgress(selected.id)
  const unlock = isUnlocked(selected.id)
  const visibility = getVisibility(selected.id)
  const color = selected.data.color ?? bereich.color

  return (
    <div
      className="h-full w-full bg-card border rounded-xl flex flex-col overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
          style={{ background: `${color}18`, borderColor: color }}
        >
          {unlock.unlocked ? (
            selected.data.icon ? (
              <DynamicIcon name={selected.data.icon} className="h-3 w-3" color={color} />
            ) : (
              <Sparkles className="h-3 w-3" style={{ color }} />
            )
          ) : (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <span className="text-sm font-semibold truncate flex-1">{selected.data.name}</span>
        {progress.level > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: `${color}18`, color }}
          >
            Lv {progress.level}
          </span>
        )}
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto text-xs">
        <div className="text-[10px] text-muted-foreground">
          Bereich: <span className="font-medium" style={{ color: bereich.color }}>{bereich.label}</span>
        </div>

        {selected.data.description && (
          <p className="text-muted-foreground leading-relaxed">{selected.data.description}</p>
        )}

        {unlock.unlocked ? (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{xp.toLocaleString("de-DE")} XP</span>
              <span>
                {progress.xpInLevel} / {progress.xpNeeded}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, progress.ratio * 100)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-2 rounded bg-muted/40 border border-dashed text-[11px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Gesperrt</span>
            </div>
            <p className="text-muted-foreground">
              Oeffnet sich mit: <strong>{unlock.missing.join(", ")}</strong>
            </p>
          </div>
        )}

        {unlock.unlocked && (
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Sichtbarkeit
            </p>
            <div className="flex flex-wrap gap-1">
              <VisChip label="Profil" active={visibility === undefined} icon={Eye} color="#94A3B8" onClick={() => setVisibility(selected.id, undefined)} />
              <VisChip label="Oeffentlich" active={visibility === "public"} icon={Globe} color="#10B981" onClick={() => setVisibility(selected.id, "public")} />
              <VisChip label="Netzwerk" active={visibility === "network"} icon={UsersRound} color="#3B82F6" onClick={() => setVisibility(selected.id, "network")} />
              <VisChip label="Kreis" active={visibility === "circle"} icon={Users} color="#A855F7" onClick={() => setVisibility(selected.id, "circle")} />
              <VisChip label="Privat" active={visibility === "private"} icon={EyeOff} color="#94A3B8" onClick={() => setVisibility(selected.id, "private")} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
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

function VisChip({
  label,
  active,
  icon: Icon,
  color,
  onClick,
}: {
  label: string
  active: boolean
  icon: LucideIcon
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
        active
          ? "border-transparent text-white font-semibold"
          : "border-muted-foreground/20 text-muted-foreground hover:border-foreground/40"
      }`}
      style={active ? { background: color } : {}}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </button>
  )
}

