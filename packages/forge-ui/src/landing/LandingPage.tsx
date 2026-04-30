import type { SpaceConfig, LandingSection } from "@real-life-network/forge"
import { themeToCSS } from "@real-life-network/forge"
import { HeroSection } from "./HeroSection.js"
import { FeaturesSection } from "./FeaturesSection.js"
import { StatsSection } from "./StatsSection.js"
import { CtaSection } from "./CtaSection.js"
import { MapPreviewSection } from "./MapPreviewSection.js"
import { FooterSection } from "./FooterSection.js"

interface Props {
  space: SpaceConfig
}

function renderSection(section: LandingSection, theme: SpaceConfig["theme"], i: number) {
  switch (section.type) {
    case "hero":
      return (
        <HeroSection
          key={i}
          headline={section.headline}
          subline={section.subline}
          cta={section.cta}
          ctaUrl={section.ctaUrl}
          backgroundImage={section.backgroundImage}
          backgroundVideo={section.backgroundVideo}
          theme={theme}
        />
      )
    case "features":
      return <FeaturesSection key={i} items={section.items} theme={theme} />
    case "stats":
      return <StatsSection key={i} items={section.items} theme={theme} />
    case "cta":
      return (
        <CtaSection
          key={i}
          headline={section.headline}
          subline={section.subline}
          buttonText={section.buttonText}
          buttonUrl={section.buttonUrl}
          theme={theme}
        />
      )
    case "map-preview":
      return (
        <MapPreviewSection
          key={i}
          center={section.center}
          zoom={section.zoom}
          demoItems={section.demoItems}
          theme={theme}
        />
      )
    default:
      return null
  }
}

export function LandingPage({ space }: Props) {
  if (!space.landing) return null

  const { sections } = space.landing
  const { theme } = space
  const css = themeToCSS(theme)

  const headingFont = theme.fonts.heading
  const bodyFont = theme.fonts.body
  const googleFonts = [headingFont, bodyFont]
    .filter(Boolean)
    .map(f => f.replace(/ /g, "+"))
    .join("&family=")

  return (
    <div className="forge-landing" style={{ minHeight: "100vh", background: theme.colors.background }}>
      <style>{css}</style>
      {googleFonts && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${googleFonts}:wght@400;500;600;700&display=swap`}
        />
      )}

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `${theme.colors.surface}ee`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.colors.muted}15`,
        }}
      >
        <div
          style={{
            fontFamily: `'${theme.fonts.heading}', sans-serif`,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: theme.colors.primary,
          }}
        >
          {space.name}
        </div>
        <a
          href="/app"
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius, 12px)",
            background: theme.colors.primary,
            color: "#fff",
            fontFamily: `'${theme.fonts.body}', sans-serif`,
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          App öffnen
        </a>
      </nav>

      <main>
        {sections.map((section, i) => renderSection(section, theme, i))}
      </main>

      {space.landing.footer && (
        <FooterSection footer={space.landing.footer} spaceName={space.name} theme={theme} />
      )}
    </div>
  )
}
