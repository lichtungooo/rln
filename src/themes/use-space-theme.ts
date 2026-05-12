import { useEffect } from "react"
import type { Group } from "@real-life-stack/data-interface"
import {
  DEFAULT_THEME_ID,
  applyThemeToRoot,
  type ThemeOverrides,
} from "./themes"

/**
 * Liest `group.data.theme` + `group.data.themeOverrides` und legt
 * das gemergte Theme aufs Document. Bei Netzwerk-Wechsel oder
 * Override-Aenderung wird das Theme live aktualisiert.
 *
 * Wenn kein Netzwerk aktiv ist, bleibt das Default-Theme (Macher-Orange)
 * stehen — Toolkit-globals.css setzt die Variablen schon im :root.
 */
export function useSpaceTheme(group: Group | null) {
  const themeId =
    (group?.data?.theme as string | undefined) ?? DEFAULT_THEME_ID
  const overrides = (group?.data?.themeOverrides as ThemeOverrides | undefined)
  // Stabilisieren: bei jedem Render neuer Objekt-Ref vermeiden — als JSON-Key
  const overridesKey = overrides ? JSON.stringify(overrides) : ""

  useEffect(() => {
    applyThemeToRoot(themeId, overrides)
    return () => {
      // Beim Wechsel oder Unmount: Variablen entfernen, damit der naechste
      // Effect mit sauberem Slate startet.
      applyThemeToRoot(DEFAULT_THEME_ID, undefined)
    }
    // overrides via JSON-Key — explizit als Dep gewollt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, overridesKey])
}
