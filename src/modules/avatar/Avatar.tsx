import { useMemo } from "react"
import * as LucideIcons from "lucide-react"
import { Sparkles, type LucideIcon } from "lucide-react"
import { progressInLevel, BEREICH_BY_ID, type AvatarItemData, type TreeBereichId } from "../gamification"

/**
 * Avatar — symbolisches Portraet eines Menschen.
 *
 * Ein zentraler Kreis (mit Initial des Namens) + bis zu 5 Items als
 * Symbole im Halo drumherum. Position der Items haengt vom Bereich ab —
 * Koerper unten, Geist oben, Seele/Bewusstsein oben-seitlich, Soziales/
 * Gemeinschaft seitlich, Handwerk unten-seitlich.
 *
 * Vision: "Er traegt Symbole statt Kleidung — ein Blatt fuer Naturverbun-
 * denheit, ein Kreis fuer Gemeinschaft, ein Stern fuer Weisheit. Er ist
 * keine Foto-Aehnlichkeit, sondern ein seelisches Portraet."
 */

export interface AvatarProps {
  name: string
  level?: number
  /** Bis zu 5 Items als Halo */
  displayedItems?: Array<{ id: string; def: AvatarItemData }>
  /** Avatar-Variante — bestimmt Hintergrund-Stil */
  variant?: "schlicht" | "magisch" | "klassisch" | "default"
  /** Pixelgroesse (Aussenkreis) */
  size?: number
  /** Optional: Synergie-Bonus aktiv → leuchtender Ring */
  synergyActive?: boolean
}

const HALO_POSITIONS_BY_BEREICH: Record<TreeBereichId, number> = {
  geist: -90,           // 12 Uhr (oben)
  seele: -45,           // 1:30
  bewusstsein: -135,    // 10:30
  soziales: 0,          // 3 Uhr
  gemeinschaft: 180,    // 9 Uhr
  handwerk: 90,         // 6 Uhr (unten)
  koerper: 135,         // 7:30
}

const RARITY_GLOW: Record<string, string> = {
  common: "0 0 0 transparent",
  rare: "0 0 8px rgba(59,130,246,0.6)",
  epic: "0 0 12px rgba(168,85,247,0.7)",
  legendary: "0 0 16px rgba(251,191,36,0.85)",
}

/**
 * Renders a Lucide-Icon by name. Falls back to Sparkles if not found.
 */
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

export function Avatar({
  name,
  level,
  displayedItems = [],
  variant = "default",
  size = 200,
  synergyActive = false,
}: AvatarProps) {
  const initial = (name.trim()[0] ?? "?").toUpperCase()
  const radius = size / 2
  const haloRadius = radius + 26
  const itemSize = Math.max(34, size * 0.18)

  const bgGradient = useMemo(() => {
    if (variant === "magisch") return "linear-gradient(135deg, #A855F7, #EC4899, #F59E0B)"
    if (variant === "schlicht") return "linear-gradient(135deg, #94A3B8, #64748B)"
    if (variant === "klassisch") return "linear-gradient(135deg, #E8751A, #FBBF24)"
    return "linear-gradient(135deg, #E8751A, #FBBF24)"
  }, [variant])

  // Items je nach Bereich auf dem Halo positionieren
  const placedItems = useMemo(() => {
    const used = new Set<number>()
    return displayedItems.slice(0, 6).map((item, idx) => {
      const bereichId = item.def.bereichId
      let angle: number
      if (bereichId && HALO_POSITIONS_BY_BEREICH[bereichId] !== undefined) {
        angle = HALO_POSITIONS_BY_BEREICH[bereichId]
      } else {
        // Fallback: gleichmaessig verteilen ueber freie Plaetze
        angle = (idx * 360) / Math.max(displayedItems.length, 1) - 90
      }
      // Bei Konflikt leicht versetzen
      let attempts = 0
      while (used.has(Math.round(angle)) && attempts < 6) {
        angle += 22
        attempts++
      }
      used.add(Math.round(angle))
      const rad = (angle * Math.PI) / 180
      return {
        item,
        x: radius + haloRadius * Math.cos(rad) - itemSize / 2,
        y: radius + haloRadius * Math.sin(rad) - itemSize / 2,
      }
    })
  }, [displayedItems, radius, haloRadius, itemSize])

  const containerSize = haloRadius * 2 + itemSize

  return (
    <div
      className="relative inline-block"
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Halo-Ring fuer Synergie */}
      {synergyActive && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: itemSize / 2 - 8,
            border: "2px solid rgba(168,85,247,0.5)",
            boxShadow: "0 0 30px rgba(168,85,247,0.4)",
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Hauptkreis mit Initial */}
      <div
        className="absolute rounded-full grid place-items-center text-white font-bold shadow-lg"
        style={{
          inset: itemSize / 2,
          background: bgGradient,
          fontSize: size * 0.4,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {initial}
      </div>

      {/* Level-Badge unten rechts am Hauptkreis */}
      {level !== undefined && (
        <div
          className="absolute rounded-full bg-card border-2 border-background shadow grid place-items-center text-xs font-bold"
          style={{
            width: size * 0.22,
            height: size * 0.22,
            right: itemSize / 2,
            bottom: itemSize / 2,
            transform: "translate(30%, 30%)",
            color: "#E8751A",
          }}
          title={`Level ${level}`}
        >
          {level}
        </div>
      )}

      {/* Items als Halo */}
      {placedItems.map(({ item, x, y }) => {
        const bereich = item.def.bereichId ? BEREICH_BY_ID[item.def.bereichId] : null
        const color = item.def.color ?? bereich?.color ?? "#FBBF24"
        return (
          <div
            key={item.id}
            className="absolute rounded-full grid place-items-center bg-card border-2 transition-transform hover:scale-110"
            style={{
              left: x + itemSize / 2,
              top: y + itemSize / 2,
              width: itemSize,
              height: itemSize,
              borderColor: color,
              boxShadow: RARITY_GLOW[item.def.rarity] ?? RARITY_GLOW.common,
            }}
            title={`${item.def.name} (${item.def.rarity})`}
          >
            <DynamicIcon name={item.def.symbol} className="w-1/2 h-1/2" color={color} />
          </div>
        )
      })}
    </div>
  )
}
