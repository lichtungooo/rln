import type { ThemeConfig } from "./types.js"

export function themeToCSS(theme: ThemeConfig): string {
  const lines: string[] = [":root {"]

  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  --color-${key}: ${value};`)
  }

  for (const [key, value] of Object.entries(theme.categoryColors)) {
    lines.push(`  --category-${key}: ${value};`)
  }

  lines.push(`  --font-heading: '${theme.fonts.heading}', sans-serif;`)
  lines.push(`  --font-body: '${theme.fonts.body}', sans-serif;`)
  if (theme.fonts.mono) {
    lines.push(`  --font-mono: '${theme.fonts.mono}', monospace;`)
  }

  const radiusMap = { none: "0", sm: "4px", md: "8px", lg: "12px", full: "9999px" }
  lines.push(`  --radius: ${radiusMap[theme.radius]};`)

  lines.push("}")
  return lines.join("\n")
}

export function themeToStyleObject(theme: ThemeConfig): Record<string, string> {
  const styles: Record<string, string> = {}

  for (const [key, value] of Object.entries(theme.colors)) {
    styles[`--color-${key}`] = value
  }

  for (const [key, value] of Object.entries(theme.categoryColors)) {
    styles[`--category-${key}`] = value
  }

  styles["--font-heading"] = `'${theme.fonts.heading}', sans-serif`
  styles["--font-body"] = `'${theme.fonts.body}', sans-serif`

  return styles
}

export function resolveTerm(theme: ThemeConfig, key: string, fallback?: string): string {
  return theme.terms[key] || fallback || key
}

export function getCategoryColor(theme: ThemeConfig, category: string): string {
  return theme.categoryColors[category] || theme.colors.primary
}
