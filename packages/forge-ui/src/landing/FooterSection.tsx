import type { ThemeConfig, LandingConfig } from "@real-life-network/forge"

interface Props {
  footer: NonNullable<LandingConfig["footer"]>
  spaceName: string
  theme: ThemeConfig
}

export function FooterSection({ footer, spaceName, theme }: Props) {
  return (
    <footer
      className="forge-footer"
      style={{
        padding: "2.5rem 2rem",
        background: theme.colors.text,
        color: `${theme.colors.surface}cc`,
        fontFamily: `'${theme.fonts.body}', sans-serif`,
        fontSize: "0.875rem",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          marginInline: "auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ fontWeight: 600, opacity: 0.9 }}>{spaceName}</div>

        <nav style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {footer.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              style={{
                color: `${theme.colors.surface}99`,
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div style={{ opacity: 0.5 }}>© {new Date().getFullYear()} {footer.legal}</div>
      </div>
    </footer>
  )
}
