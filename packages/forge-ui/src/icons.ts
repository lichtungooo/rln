import * as icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

export function resolveIcon(name: string): LucideIcon | null {
  return (icons as Record<string, LucideIcon>)[name] ?? null
}
