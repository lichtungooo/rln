/**
 * useEdgeSwipe — erkennt horizontale Wisch-Gesten am Rand des Bildschirms.
 *
 * Touch-Start in den ersten EDGE_PIXELS von links oder rechts oeffnet ein
 * Swipe-Fenster. Bewegt sich der Finger horizontal weit genug, ohne dass
 * die vertikale Bewegung dominiert, wird der Swipe gefeuert. Beruehrungen
 * in der Mitte des Bildschirms werden ignoriert — Map-Pan, Scroll und
 * andere Modul-Gesten bleiben ungestoert.
 */

import { useEffect, useRef } from 'react'

interface EdgeSwipeOptions {
  /** Wie weit vom Rand der Touch-Start liegen darf (px). */
  edgeWidth?: number
  /** Mindest-horizontale Distanz fuer einen Swipe (px). */
  minDistance?: number
  /** Faktor: horizontal muss N-fach grosser sein als vertikal. */
  horizontalDominance?: number
}

const DEFAULTS: Required<EdgeSwipeOptions> = {
  edgeWidth: 30,
  minDistance: 80,
  horizontalDominance: 1.5,
}

export function useEdgeSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  options?: EdgeSwipeOptions,
): void {
  const opts = { ...DEFAULTS, ...options }
  const startRef = useRef<{ x: number; y: number; from: 'left' | 'right' } | null>(
    null,
  )

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      const w = window.innerWidth
      if (t.clientX <= opts.edgeWidth) {
        startRef.current = { x: t.clientX, y: t.clientY, from: 'left' }
      } else if (t.clientX >= w - opts.edgeWidth) {
        startRef.current = { x: t.clientX, y: t.clientY, from: 'right' }
      } else {
        startRef.current = null
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start) return
      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const ax = Math.abs(dx)
      const ay = Math.abs(dy)
      if (ax < opts.minDistance) return
      if (ax < ay * opts.horizontalDominance) return
      // Swipe nach links (Finger bewegt sich nach links): naechster Tab
      if (dx < 0 && start.from === 'right') {
        onSwipeLeft()
        return
      }
      // Swipe nach rechts (Finger bewegt sich nach rechts): vorheriger Tab
      if (dx > 0 && start.from === 'left') {
        onSwipeRight()
        return
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    onSwipeLeft,
    onSwipeRight,
    opts.edgeWidth,
    opts.minDistance,
    opts.horizontalDominance,
  ])
}
