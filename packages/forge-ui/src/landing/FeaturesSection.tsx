import type { ThemeConfig } from "@real-life-network/forge"
import { resolveIcon } from "../icons.js"

interface FeatureItem {
  title: string
  description: string
  icon: string
}

interface Props {
  items: FeatureItem[]
  theme: ThemeConfig
}

export function FeaturesSection({ items, theme }: Props) {
  return (
    <section
      className="forge-features"
      style={{
        padding: "5rem 2rem",
        background: theme.colors.surface,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          marginInline: "auto",
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
          gap: "2.5rem",
        }}
      >
        {items.map((item, i) => {
          const Icon = resolveIcon(item.icon)
          return (
            <div
              key={i}
              style={{
                padding: "2rem",
                borderRadius: "var(--radius, 12px)",
                background: theme.colors.background,
                border: `1px solid ${theme.colors.muted}20`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${theme.colors.primary}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                {Icon && <Icon size={28} color={theme.colors.primary} />}
              </div>

              <h3
                style={{
                  fontFamily: `'${theme.fonts.heading}', sans-serif`,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: theme.colors.text,
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  fontFamily: `'${theme.fonts.body}', sans-serif`,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: theme.colors.text,
                  opacity: 0.7,
                }}
              >
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
