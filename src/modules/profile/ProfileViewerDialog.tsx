import { useMemo } from "react"
import { X, Eye, EyeOff, Sparkles } from "lucide-react"
import * as LucideIcons from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  useCurrentUser,
  useItems,
} from "@real-life-stack/toolkit"
import type { LucideIcon } from "lucide-react"
import {
  TREE_BEREICHE,
  UNIVERSAL_SKILLS,
  GAMIFICATION_ITEM_TYPES,
  useUserProgress,
  useCircles,
  useShareProfiles,
  useSkillVisibility,
  buildViewerContext,
  resolveSkillVisibility,
  progressInLevel,
  type CircleData,
  type SkillData,
  type ShareProfileData,
  type TreeBereich,
  type TreeBereichId,
} from "../gamification"
import { useProfileExtension } from "./use-profile-extension"
import { LIFE_PHASES, ageFromBirthYear, type LifeThreadData } from "./life-thread"
import { VIA_STRENGTHS } from "./via-strengths"
import { usePastExperiences } from "../gamification"

/**
 * ProfileViewerDialog — Sicht aus den Augen eines Kreis-Mitglieds (Phase G1).
 *
 * Macht F8 (Sicht-Profile) und F9 (Skill-Visibility) tatsaechlich nutzbar:
 * der Mensch sieht **live**, was Mitglieder eines bestimmten Kreises von
 * seinem Profil sehen wuerden.
 *
 * Filterung:
 *   - Sicht-Profil (aus F8) bestimmt, welche Sektionen + Bereiche sichtbar
 *   - Skill-Override (aus F9) schlaegt das Profil
 *   - Default: privat (Anti-Konsum)
 *
 * Vorlaeufig: simulieren den Schauenden als Pseudo-Mitglied des Kreises
 * (kein echter Fremd-User noetig). Spaeter: echtes "Profil-anschauen"-
 * Pattern mit fremder DID.
 */

export interface ProfileViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ID des Kreises, aus dessen Sicht wir das Profil zeigen */
  viewerCircleId: string
}

interface RenderSkill {
  id: string
  data: SkillData
  isUniversal: boolean
}

export function ProfileViewerDialog({
  open,
  onOpenChange,
  viewerCircleId,
}: ProfileViewerDialogProps) {
  const { data: currentUser } = useCurrentUser()
  const { data: extension } = useProfileExtension()
  const { skillXp, skillProgress } = useUserProgress()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { mine: circles } = useCircles()
  const { mine: shareProfiles } = useShareProfiles()
  const { map: visibilityMap } = useSkillVisibility()
  const { mine: pastExperiences } = usePastExperiences()
  const { result: viaResult } = useViaResultLite()

  const circle = circles.find((c) => c.id === viewerCircleId)

  // Schauenden-Kontext bauen — wir simulieren ein Pseudo-Mitglied
  const viewerContext = useMemo(() => {
    if (!circle) return null
    const pseudoDid = `preview-member:${circle.id}`
    return buildViewerContext(
      pseudoDid,
      [
        {
          id: circle.id,
          data: {
            ...circle.data,
            memberIds: circle.data.memberIds.includes(pseudoDid)
              ? circle.data.memberIds
              : [pseudoDid, ...circle.data.memberIds],
          },
        },
      ],
      shareProfiles,
    )
  }, [circle, shareProfiles])

  // Skills nach Bereich + nach Sichtbarkeit gefiltert
  const visibleSkillsByBereich = useMemo(() => {
    if (!viewerContext) return null
    const map: Record<TreeBereichId, { visible: RenderSkill[]; hidden: number }> =
      {} as Record<TreeBereichId, { visible: RenderSkill[]; hidden: number }>
    for (const b of TREE_BEREICHE) map[b.id] = { visible: [], hidden: 0 }

    const allSkills: RenderSkill[] = []
    for (const u of UNIVERSAL_SKILLS) {
      const { id, ...data } = u
      allSkills.push({ id, data, isUniversal: true })
    }
    for (const it of skillItems) {
      allSkills.push({
        id: it.id,
        data: it.data as SkillData,
        isUniversal: false,
      })
    }

    for (const skill of allSkills) {
      // nur Skills mit XP zeigen (sonst wirkt's leer)
      if (skillXp(skill.id) === 0) continue

      const override = visibilityMap[skill.id]
      const decision = resolveSkillVisibility(skill.data, override, viewerContext, false)
      if (!map[skill.data.bereichId]) continue
      if (decision.visible) {
        map[skill.data.bereichId].visible.push(skill)
      } else {
        map[skill.data.bereichId].hidden++
      }
    }
    return map
  }, [viewerContext, skillItems, skillXp, visibilityMap])

  // Aktive Sicht-Profile fuer diesen Kreis
  const matchingProfile: ShareProfileData | undefined =
    viewerContext?.matchingShareProfiles[0]

  // Was zeigen die Zusatz-Sektionen?
  const showLifeThread = matchingProfile?.showLifeThread ?? false
  const showVia = matchingProfile?.showVia ?? false
  const showPastExperiences = matchingProfile?.showPastExperiences ?? false

  const lifeThread = (extension as { lifeThread?: LifeThreadData }).lifeThread

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg w-screen h-[100dvh] sm:h-auto sm:max-h-[90vh] gap-0 p-0 flex flex-col"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Sicht-Vorschau</DialogTitle>

        {/* Header */}
        <div className="px-5 py-4 border-b bg-muted/30 flex items-start gap-3">
          <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold">
              So sieht {circle?.data.name ?? "der Kreis"} dich
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {matchingProfile
                ? `Aktives Sicht-Profil: "${matchingProfile.name}".`
                : "Kein Sicht-Profil fuer diesen Kreis hinterlegt — Default-Sichtbarkeit gilt (privat)."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Identitaet — immer sichtbar */}
          <ProfileHeader name={currentUser?.displayName ?? "—"} bio={extension.bio as string | undefined} />

          {/* Skill-Tree-Vorschau */}
          {visibleSkillsByBereich && matchingProfile ? (
            <SkillTreePreview
              visibleSkillsByBereich={visibleSkillsByBereich}
              skillProgress={skillProgress}
              skillXp={skillXp}
              visibleBereiche={matchingProfile.visibleBereiche}
            />
          ) : (
            <EmptyHint hint="Tree wird nur sichtbar, wenn ein Sicht-Profil zugeordnet ist." />
          )}

          {/* Lebens-Faden */}
          {showLifeThread && lifeThread ? (
            <LifeThreadPreview lifeThread={lifeThread} />
          ) : matchingProfile ? null : null}

          {/* VIA-Strengths */}
          {showVia && viaResult && viaResult.signatureStrengthIds.length > 0 && (
            <ViaPreview signatureStrengthIds={viaResult.signatureStrengthIds} />
          )}

          {/* Vergangenheits-Erfahrungen */}
          {showPastExperiences && pastExperiences.length > 0 && (
            <PastPreview experiences={pastExperiences.slice(0, 5).map((p) => ({ title: p.data.title, mastery: p.data.mastery, startYear: p.data.startYear, endYear: p.data.endYear }))} />
          )}

          {/* Hinweis falls keine Sektionen */}
          {(!matchingProfile ||
            (!showLifeThread && !showVia && !showPastExperiences &&
              Object.values(visibleSkillsByBereich ?? {}).every((b) => b.visible.length === 0))) && (
            <div className="p-4 rounded-lg border border-dashed bg-muted/20 text-center">
              <EyeOff className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground italic">
                Diese Kreis-Mitglieder sehen nur deine Identitaet. Verknuepfe ein
                Sicht-Profil mit dem Kreis "{circle?.data.name}", um mehr freizugeben.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Hilfs-Hook: liest das eigene VIA-Result schlicht
// ============================================================

function useViaResultLite() {
  const { data: items } = useItems({ type: GAMIFICATION_ITEM_TYPES.viaResult })
  const { data: currentUser } = useCurrentUser()
  const result = useMemo(() => {
    if (!currentUser?.id) return null
    const own = items.find((i) => i.createdBy === currentUser.id)
    if (!own) return null
    return own.data as { signatureStrengthIds: string[]; answers: Record<string, number> }
  }, [items, currentUser?.id])
  return { result }
}

// ============================================================
// ProfileHeader — Identitaet (immer sichtbar)
// ============================================================

function ProfileHeader({ name, bio }: { name: string; bio?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
      <div
        className="w-12 h-12 rounded-full grid place-items-center text-base font-bold text-white shrink-0"
        style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
      >
        {(name.trim()[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{name}</div>
        {bio && <p className="text-xs text-muted-foreground mt-0.5">{bio}</p>}
        <p className="text-[10px] text-muted-foreground italic mt-1">
          Identitaet ist immer sichtbar.
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SkillTreePreview — Sichtbare Skills nach Bereich
// ============================================================

function DynamicIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
  const iconKey = useMemo(() => {
    return name
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  }, [name])
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconKey] ?? Sparkles
  return <Icon className={className} style={color ? { color } : undefined} />
}

function SkillTreePreview({
  visibleSkillsByBereich,
  skillProgress,
  skillXp,
  visibleBereiche,
}: {
  visibleSkillsByBereich: Record<TreeBereichId, { visible: RenderSkill[]; hidden: number }>
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  skillXp: (id: string) => number
  visibleBereiche: TreeBereichId[]
}) {
  const bereicheToShow = TREE_BEREICHE.filter((b) => visibleBereiche.includes(b.id))
  if (bereicheToShow.length === 0) {
    return (
      <EmptyHint hint="Im aktiven Sicht-Profil sind keine Bereiche freigegeben." />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Faehigkeiten
      </p>
      {bereicheToShow.map((bereich) => (
        <BereichPreviewRow
          key={bereich.id}
          bereich={bereich}
          info={visibleSkillsByBereich[bereich.id]}
          skillProgress={skillProgress}
          skillXp={skillXp}
        />
      ))}
    </div>
  )
}

function BereichPreviewRow({
  bereich,
  info,
  skillProgress,
  skillXp,
}: {
  bereich: TreeBereich
  info: { visible: RenderSkill[]; hidden: number }
  skillProgress: (id: string) => ReturnType<typeof progressInLevel>
  skillXp: (id: string) => number
}) {
  const Icon = bereich.icon as LucideIcon
  if (info.visible.length === 0 && info.hidden === 0) return null

  return (
    <div
      className="rounded-lg border bg-card overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: bereich.color }}
    >
      <div className="px-3 py-2 flex items-center gap-2 bg-muted/20 border-b">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${bereich.color}18` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: bereich.color }} />
        </div>
        <span className="text-sm font-semibold flex-1">{bereich.label}</span>
        {info.hidden > 0 && (
          <span
            className="text-[10px] text-muted-foreground flex items-center gap-1"
            title={`${info.hidden} Skill${info.hidden === 1 ? "" : "s"} im Bereich verborgen`}
          >
            <EyeOff className="h-3 w-3" />
            {info.hidden}
          </span>
        )}
      </div>

      <div className="px-3 py-2">
        {info.visible.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic">
            Keine Skills sichtbar (alle verborgen oder noch nicht gewachsen).
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {info.visible.map((skill) => {
              const color = skill.data.color ?? bereich.color
              const progress = skillProgress(skill.id)
              return (
                <div
                  key={skill.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded border text-xs"
                  style={{
                    background: `${color}10`,
                    borderColor: `${color}30`,
                  }}
                  title={`${skill.data.name} — ${skillXp(skill.id)} XP`}
                >
                  {skill.data.icon ? (
                    <DynamicIcon
                      name={skill.data.icon}
                      className="h-3 w-3"
                      color={color}
                    />
                  ) : (
                    <Sparkles className="h-3 w-3" style={{ color }} />
                  )}
                  <span style={{ color }}>{skill.data.name}</span>
                  <span
                    className="text-[10px] font-bold px-1 py-0 rounded ml-0.5"
                    style={{ background: `${color}25`, color }}
                  >
                    {progress.level}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// LifeThreadPreview — Lebens-Faden als Liste
// ============================================================

function LifeThreadPreview({ lifeThread }: { lifeThread: LifeThreadData }) {
  const age = ageFromBirthYear(lifeThread.birthYear)
  const filled = Object.entries(lifeThread.phases ?? {}).filter(
    ([, t]) => t && t.trim().length > 0,
  )

  if (filled.length === 0 && !lifeThread.birthYear) return null

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/20 border-b flex items-center justify-between">
        <span className="text-sm font-semibold">Lebens-Faden</span>
        {age !== undefined && (
          <span className="text-[10px] text-muted-foreground">{age} Jahre</span>
        )}
      </div>
      <div className="p-3 space-y-2">
        {filled.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic">
            Geburtsjahr eingetragen, aber noch keine Phasen erzaehlt.
          </p>
        ) : (
          filled.map(([idxStr, text]) => {
            const idx = parseInt(idxStr, 10)
            const phase = LIFE_PHASES.find((p) => p.index === idx)
            if (!phase) return null
            return (
              <div key={idx} className="text-xs">
                <div className="font-semibold">
                  {phase.label}{" "}
                  <span className="text-muted-foreground font-normal text-[10px]">
                    {phase.ageStart}–{phase.ageEnd >= 99 ? "+" : phase.ageEnd}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 leading-snug">{text}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ============================================================
// ViaPreview — Top-5 Charakter-Staerken
// ============================================================

function ViaPreview({ signatureStrengthIds }: { signatureStrengthIds: string[] }) {
  if (signatureStrengthIds.length === 0) return null
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/20 border-b">
        <span className="text-sm font-semibold">Charakter-Staerken</span>
      </div>
      <div className="p-3 flex flex-wrap gap-1.5">
        {signatureStrengthIds.map((id) => {
          const s = VIA_STRENGTHS.find((x) => x.id === id)
          if (!s) return null
          return (
            <span
              key={id}
              className="text-xs px-2 py-1 rounded border bg-primary/5 text-primary border-primary/20"
            >
              {s.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// PastPreview — Vergangenheits-Erfahrungen (kurz)
// ============================================================

function PastPreview({
  experiences,
}: {
  experiences: Array<{ title: string; mastery: string; startYear?: number; endYear?: number }>
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-3 py-2 bg-muted/20 border-b">
        <span className="text-sm font-semibold">Vergangenheits-Erfahrungen</span>
      </div>
      <div className="p-3 space-y-1.5">
        {experiences.map((e, i) => {
          const yearText =
            e.startYear && e.endYear
              ? `${e.startYear}–${e.endYear}`
              : e.startYear
              ? `${e.startYear}`
              : ""
          return (
            <div key={i} className="text-xs flex items-center gap-2">
              <span className="font-medium">{e.title}</span>
              {yearText && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {yearText}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// EmptyHint
// ============================================================

function EmptyHint({ hint }: { hint: string }) {
  return (
    <div className="p-3 rounded-lg border border-dashed bg-muted/20">
      <p className="text-[11px] text-muted-foreground italic">{hint}</p>
    </div>
  )
}
