/**
 * FullscreenButton — schaltet zwischen Vollbild und Fenster.
 *
 * Nutzt die Fullscreen-API des Browsers. Im Vollbildmodus verschwinden
 * Tableiste, URL-Zeile, Lesezeichen — der Werkzeugkasten wirkt wie eine
 * eigene Anwendung.
 */

import { useCallback, useEffect, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export function FullscreenButton({ className }: { className?: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const update = () => setIsFullscreen(Boolean(document.fullscreenElement))
    update()
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Vollbild laesst sich nicht oeffnen:', err)
      })
    }
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      title={isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
      aria-label={isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
      className={
        className ??
        'flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground'
      }
    >
      {isFullscreen ? (
        <Minimize2 className="h-3.5 w-3.5" />
      ) : (
        <Maximize2 className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
