import type { ThemeConfig } from "@real-life-network/forge"

interface Props {
  center: [number, number]
  zoom: number
  demoItems?: number
  theme: ThemeConfig
}

export function MapPreviewSection({ center, zoom, theme }: Props) {
  const [lat, lng] = center
  const tileUrl = theme.mapStyle?.tileUrl || "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  const staticUrl = tileUrl
    .replace("{s}", "a")
    .replace("{z}", String(zoom))
    .replace("{x}", String(Math.floor((lng + 180) / 360 * (1 << zoom))))
    .replace("{y}", String(Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << zoom))))
    .replace("{r}", "")

  return (
    <section
      className="forge-map-preview"
      style={{
        position: "relative",
        height: "50vh",
        minHeight: 400,
        background: `${theme.colors.text}08`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `${theme.colors.primary}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${theme.colors.primary}40`,
            animation: "forge-pulse 2s ease-in-out infinite",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: `'${theme.fonts.body}', sans-serif`,
            fontSize: "1rem",
            fontWeight: 500,
            color: theme.colors.text,
            opacity: 0.6,
            background: `${theme.colors.surface}cc`,
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius, 12px)",
          }}
        >
          Karte wird in der App geladen
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          backgroundImage: `url(${staticUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(1px)",
        }}
      />

      <style>{`
        @keyframes forge-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}
