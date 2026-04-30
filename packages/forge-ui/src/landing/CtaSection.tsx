import type { ThemeConfig } from "@real-life-network/forge"

interface Props {
  headline: string
  subline?: string
  buttonText: string
  buttonUrl: string
  theme: ThemeConfig
}

export function CtaSection({ headline, subline, buttonText, buttonUrl, theme }: Props) {
  return (
    <section
      className="forge-cta"
      style={{
        padding: "5rem 2rem",
        textAlign: "center",
        background: theme.colors.background,
      }}
    >
      <div style={{ maxWidth: 600, marginInline: "auto" }}>
        <h2
          style={{
            fontFamily: `'${theme.fonts.heading}', sans-serif`,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "1rem",
            color: theme.colors.text,
          }}
        >
          {headline}
        </h2>

        {subline && (
          <p
            style={{
              fontFamily: `'${theme.fonts.body}', sans-serif`,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              opacity: 0.7,
              marginBottom: "2rem",
              color: theme.colors.text,
            }}
          >
            {subline}
          </p>
        )}

        <a
          href={buttonUrl}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "1rem 2.5rem",
            borderRadius: "var(--radius, 12px)",
            background: theme.colors.primary,
            color: "#fff",
            fontFamily: `'${theme.fonts.body}', sans-serif`,
            fontWeight: 600,
            fontSize: "1.1rem",
            textDecoration: "none",
            boxShadow: `0 4px 24px ${theme.colors.primary}40`,
          }}
        >
          {buttonText} →
        </a>
      </div>
    </section>
  )
}
