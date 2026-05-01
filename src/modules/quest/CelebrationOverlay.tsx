import { useEffect, useState, useMemo } from "react"
import { Sparkles, Trophy } from "lucide-react"

/**
 * CelebrationOverlay — kurzer Pop-Effekt beim Quest-Abschluss.
 *
 * Zeigt fuer ~1.6 Sekunden ein Vollbild-Overlay mit zentralem Trophy-Icon
 * und 24 fliegenden Sparkles. Pure CSS-Animation, keine Lib.
 *
 * Benutzung:
 *   const [show, setShow] = useState(false)
 *   ...
 *   await complete()
 *   setShow(true)
 *   ...
 *   {show && <CelebrationOverlay onDone={() => setShow(false)} />}
 */
export function CelebrationOverlay({
  onDone,
  message = "Quest erledigt",
}: {
  onDone: () => void
  message?: string
}) {
  const [phase, setPhase] = useState<"in" | "out">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1100)
    const t2 = setTimeout(() => onDone(), 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 2 * Math.PI
        const distance = 180 + Math.random() * 120
        const dx = Math.cos(angle) * distance
        const dy = Math.sin(angle) * distance
        const delay = Math.random() * 200
        const size = 12 + Math.random() * 14
        const colors = ["#E8751A", "#FBBF24", "#A855F7", "#3B82F6", "#10B981"]
        const color = colors[i % colors.length]
        return { dx, dy, delay, size, color, i }
      }),
    []
  )

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
      style={{
        background: phase === "in" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0)",
        transition: "background 600ms ease-out",
      }}
    >
      {/* Sparkles */}
      {sparkles.map((s) => (
        <Sparkles
          key={s.i}
          className="absolute"
          style={{
            color: s.color,
            width: s.size,
            height: s.size,
            transform:
              phase === "in"
                ? "translate(0, 0) scale(0.5)"
                : `translate(${s.dx}px, ${s.dy}px) scale(1) rotate(${s.dx > 0 ? 360 : -360}deg)`,
            opacity: phase === "in" ? 1 : 0,
            transition: `transform 1100ms cubic-bezier(0.2, 0.7, 0.3, 1) ${s.delay}ms, opacity 1100ms ease-out ${s.delay}ms`,
          }}
        />
      ))}

      {/* Zentrale Trophy + Message */}
      <div
        className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 20px 60px rgba(232,117,26,0.35)",
          transform: phase === "in" ? "scale(1)" : "scale(1.15)",
          opacity: phase === "in" ? 1 : 0,
          transition: "transform 700ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity 700ms ease-out",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="rounded-full p-4"
          style={{
            background: "linear-gradient(135deg, #E8751A, #FBBF24)",
            boxShadow: "0 0 40px rgba(232,117,26,0.6)",
          }}
        >
          <Trophy className="h-12 w-12 text-white" />
        </div>
        <div className="text-2xl font-bold" style={{ color: "#E8751A" }}>
          {message}
        </div>
      </div>
    </div>
  )
}
