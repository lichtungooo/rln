/**
 * Avatar-Modul — symbolisches Portraet, Inventar, Titel.
 *
 * Phase D1 (01.05.2026): Avatar-Render mit Halo-Items, Inventar mit
 * Klick-Toggle, Titel-Edit pro Space.
 *
 * Spaeter (D2/E):
 *   - Drag & Drop von Items aufs Avatar (statt Klick)
 *   - Mehrere Avatar-Varianten pro Space (schlicht/magisch/klassisch)
 *   - Item-Slots (Kopf/Werkzeug/Begleiter) statt freiem Halo
 *   - Avatar-Animation bei Level-Up
 */
import { UserCircle } from "lucide-react"
import type { ModuleDefinition } from "../registry"
import { AvatarView } from "./AvatarView"

export const avatarModule: ModuleDefinition = {
  id: "avatar",
  label: "Avatar",
  icon: UserCircle,
  View: AvatarView,
  itemTypes: ["user-avatar", "avatar-item"],
  requiredCapabilities: ["ItemWriter"],
}

export { Avatar } from "./Avatar"
export { AvatarWidget } from "./AvatarWidget"
