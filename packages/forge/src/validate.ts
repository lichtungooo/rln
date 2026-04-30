import type { SpaceConfig } from "./types.js"
import { MODULE_REGISTRY } from "./modules.js"

export interface ValidationIssue {
  level: "error" | "warning"
  path: string
  message: string
}

export function validateSpaceConfig(config: SpaceConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const mod of config.modules) {
    if (!MODULE_REGISTRY[mod.moduleId]) {
      issues.push({
        level: "error",
        path: `modules[${mod.moduleId}]`,
        message: `Unknown module "${mod.moduleId}" — not in registry`,
      })
    }
  }

  for (const item of config.itemTypes) {
    if (!item.fields.length) {
      issues.push({
        level: "warning",
        path: `itemTypes[${item.type}]`,
        message: `Item type "${item.type}" has no fields defined`,
      })
    }

    for (const module of item.appearsIn) {
      const enabled = config.modules.find(m => m.moduleId === module)
      if (!enabled) {
        issues.push({
          level: "warning",
          path: `itemTypes[${item.type}].appearsIn`,
          message: `"${item.type}" appears in "${module}" but that module is not enabled`,
        })
      }
    }

    const hasLocation = item.fields.some(f => f.key === "location")
    if (item.appearsIn.includes("map") && !hasLocation) {
      issues.push({
        level: "error",
        path: `itemTypes[${item.type}].fields`,
        message: `"${item.type}" appears on map but has no "location" field`,
      })
    }
  }

  if (config.gamification) {
    const hasGamModule = config.modules.some(m => m.moduleId === "gamification")
    if (!hasGamModule) {
      issues.push({
        level: "warning",
        path: "gamification",
        message: "Gamification config defined but gamification module not enabled",
      })
    }
  }

  if (config.landing) {
    for (const section of config.landing.sections) {
      if (section.type === "map-preview") {
        const hasMap = config.modules.some(m => m.moduleId === "map")
        if (!hasMap) {
          issues.push({
            level: "warning",
            path: "landing.sections[map-preview]",
            message: "Landing has map-preview but map module not enabled",
          })
        }
      }
    }
  }

  const { colors } = config.theme
  const required = ["primary", "secondary", "accent", "background", "surface", "text", "muted"] as const
  for (const key of required) {
    if (!colors[key]) {
      issues.push({
        level: "error",
        path: `theme.colors.${key}`,
        message: `Required theme color "${key}" is missing`,
      })
    }
  }

  return issues
}

export function isValid(config: SpaceConfig): boolean {
  return validateSpaceConfig(config).filter(i => i.level === "error").length === 0
}
