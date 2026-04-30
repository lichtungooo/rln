import type { ThemeConfig } from "@real-life-network/forge"

interface Props {
  headline: string
  subline: string
  cta: string
  ctaUrl: string
  backgroundImage?: string
  backgroundVideo?: string
  theme: ThemeConfig
}

export function HeroSection({ headline, subline, cta, ctaUrl, backgroundImage, backgroundVideo, theme }: Props) {
  return (
    <section
      className="forge-hero"
      style={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 2rem",
        overflow: "hidden",
        background: backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}20, ${theme.colors.accent}10)`,
        color: backgroundImage ? "#fff" : theme.colors.text,
      }}
    >
      {backgroundVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={backgroundVideo} />
        </video>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
        <h1
          style={{
            fontFamily: `'${theme.fonts.heading}', sans-serif`,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: `'${theme.fonts.body}', sans-serif`,
            fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
            lineHeight: 1.6,
            opacity: 0.85,
            marginBottom: "2.5rem",
            maxWidth: 560,
            marginInline: "auto",
          }}
        >
          {subline}
        </p>

        <a
          href={ctaUrl}
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
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: `0 4px 24px ${theme.colors.primary}40`,
          }}
        >
          {cta} →
        </a>
      </div>
    </section>
  )
}
