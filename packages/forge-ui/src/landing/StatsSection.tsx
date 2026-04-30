import type { ThemeConfig } from "@real-life-network/forge"
import { resolveIcon } from "../icons.js"

interface StatItem {
  label: string
  value: string
  icon?: string
}

interface Props {
  items: StatItem[]
  theme: ThemeConfig
}

export function StatsSection({ items, theme }: Props) {
  return (
    <section
      className="forge-stats"
      style={{
        padding: "4rem 2rem",
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          marginInline: "auto",
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
          gap: "2rem",
          textAlign: "center",
        }}
      >
        {items.map((item, i) => {
          const Icon = item.icon ? resolveIcon(item.icon) : null
          return (
            <div key={i}>
              {Icon && (
                <div style={{ marginBottom: "0.75rem", opacity: 0.9 }}>
                  <Icon size={32} color="#fff" />
                </div>
              )}
              <div
                style={{
                  fontFamily: `'${theme.fonts.heading}', sans-serif`,
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "0.25rem",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: `'${theme.fonts.body}', sans-serif`,
                  fontSize: "1rem",
                  opacity: 0.85,
                }}
              >
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
