import { useState, useMemo } from "react"
import { Eye, Globe, Users, UsersRound, EyeOff, ExternalLink } from "lucide-react"
import { Button } from "@real-life-stack/toolkit"
import { ProfileViewerDialog } from "./ProfileViewerDialog"
import {
  TREE_BEREICHE,
  UNIVERSAL_SKILLS,
  useCircles,
  useShareProfiles,
  useSkillVisibility,
  buildViewerContext,
  resolveSkillVisibility,
} from "../gamification"

/**
 * VisibilityPreviewSection — Sicht-Vorschau im Profil (Phase F9).
 *
 * "So sehen mich Mitstreiter / Vertraute / Bekannte" — der Mensch waehlt
 * einen seiner Kreise und sieht eine Tabelle: was sichtbar, was nicht.
 * Macht die Privacy-Logik transparent, bevor man teilt.
 *
 * Sicht-Tabelle zeigt die 8 Bereiche mit Sichtbarkeits-Status, plus eine
 * Zahl-Information ueber Skill-Overrides.
 */

export function VisibilityPreviewSection() {
  const { mine: circles } = useCircles()
  const { mine: shareProfiles } = useShareProfiles()
  const { map: visibilityMap } = useSkillVisibility()
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const selectedCircle = circles.find((c) => c.id === selectedCircleId)

  // Bauen eines ViewerContext: ein erfundenes Member dieses Kreises
  const previewContext = useMemo(() => {
    if (!selectedCircle) return null
    // Wir spielen einen "Schauenden" aus diesem Kreis. Wenn der Kreis leer
    // ist, nehmen wir einen Pseudo-DID, der trotzdem als Mitglied dieses
    // Kreises gilt — fuer die Vorschau-Logik reicht das.
    const pseudoDid =
      selectedCircle.data.memberIds[0] ?? `preview-member:${selectedCircle.id}`
    return buildViewerContext(
      pseudoDid,
      // Wir laden die Circles + injizieren den pseudo, damit der Resolver
      // den Kreis findet, auch wenn er aktuell leer ist:
      [{
        id: selectedCircle.id,
        data: {
          ...selectedCircle.data,
          memberIds: selectedCircle.data.memberIds.includes(pseudoDid)
            ? selectedCircle.data.memberIds
            : [pseudoDid, ...selectedCircle.data.memberIds],
        },
      }],
      shareProfiles,
    )
  }, [selectedCircle, shareProfiles])

  // Pro Bereich: wieviele Universal-Skills sind sichtbar / verborgen?
  const bereichStats = useMemo(() => {
    if (!previewContext) return null
    return TREE_BEREICHE.map((bereich) => {
      const skillsInBereich = UNIVERSAL_SKILLS.filter((s) => s.bereichId === bereich.id)
      let visible = 0
      let hidden = 0
      let overridden = 0
      for (const skill of skillsInBereich) {
        const override = visibilityMap[skill.id]
        if (override !== undefined) overridden++
        const decision = resolveSkillVisibility(skill, override, previewContext, false)
        if (decision.visible) visible++
        else hidden++
      }
      return {
        bereich,
        visible,
        hidden,
        overridden,
        total: skillsInBereich.length,
      }
    })
  }, [previewContext, visibilityMap])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Sicht-Vorschau</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {selectedCircle ? "live" : "Kreis waehlen"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          So sieht ein Mensch aus deinem Kreis dein Tree. Wechsle den Kreis,
          um die Sicht durchzuspielen — Skill-Overrides aus dem Tree und
          Sicht-Profile aus F8 wirken zusammen.
        </p>
      </div>

      {circles.length === 0 ? (
        <div className="p-4">
          <p className="text-[11px] text-muted-foreground italic">
            Lege oben einen Kreis an, dann kannst du hier die Sicht durchspielen.
          </p>
        </div>
      ) : (
        <>
          {/* Kreis-Selector */}
          <div className="p-3 border-b flex flex-wrap gap-1.5">
            {circles.map((c) => {
              const active = c.id === selectedCircleId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCircleId(active ? null : c.id)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-muted-foreground/20 hover:border-foreground/40"
                  }`}
                >
                  {c.data.name}
                </button>
              )
            })}
          </div>

          {/* Bereich-Tabelle */}
          {bereichStats && (
            <div className="p-3 space-y-3">
              <p className="text-[10px] text-muted-foreground">
                Universal-Skills pro Bereich. Eigene Skill-Overrides (Tree-Augen)
                schlagen das Sicht-Profil.
              </p>
              <div className="space-y-1">
                {bereichStats.map((row) => (
                  <BereichVisibilityRow
                    key={row.bereich.id}
                    label={row.bereich.label}
                    color={row.bereich.color}
                    visible={row.visible}
                    hidden={row.hidden}
                    total={row.total}
                    overridden={row.overridden}
                  />
                ))}
              </div>
              {/* Live-Vorschau-Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewerOpen(true)}
                className="w-full h-9 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Live-Vorschau anzeigen
              </Button>
            </div>
          )}

          {!previewContext && (
            <div className="p-4">
              <p className="text-[11px] text-muted-foreground italic">
                Waehle einen Kreis aus, um die Sicht zu sehen.
              </p>
            </div>
          )}
        </>
      )}

      {/* Live-Vorschau-Dialog */}
      {selectedCircleId && (
        <ProfileViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          viewerCircleId={selectedCircleId}
        />
      )}

      {/* Legende */}
      <div className="p-3 border-t bg-muted/10 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Folgt Profil
        </span>
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3" style={{ color: "#10B981" }} />
          Oeffentlich
        </span>
        <span className="flex items-center gap-1">
          <UsersRound className="h-3 w-3" style={{ color: "#3B82F6" }} />
          Netzwerk
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" style={{ color: "#A855F7" }} />
          Kreis
        </span>
        <span className="flex items-center gap-1">
          <EyeOff className="h-3 w-3" />
          Privat
        </span>
      </div>
    </div>
  )
}

function BereichVisibilityRow({
  label,
  color,
  visible,
  hidden,
  total,
  overridden,
}: {
  label: string
  color: string
  visible: number
  hidden: number
  total: number
  overridden: number
}) {
  const ratio = total > 0 ? visible / total : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="flex-1 min-w-0 truncate">{label}</span>
      <span
        className="text-[10px]"
        style={{ color: visible > 0 ? color : undefined }}
      >
        {visible}
      </span>
      <span className="text-[10px] text-muted-foreground">/</span>
      <span className="text-[10px] text-muted-foreground">{total}</span>
      {overridden > 0 && (
        <span
          className="text-[9px] uppercase font-semibold tracking-wider px-1 py-0 rounded ml-1"
          style={{ background: "rgba(245,158,11,0.1)", color: "#B45309" }}
          title={`${overridden} Skill-Override${overridden === 1 ? "" : "s"} in diesem Bereich`}
        >
          {overridden} override
        </span>
      )}
      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${ratio * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}
