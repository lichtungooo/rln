import { useMemo } from "react"
import * as LucideIcons from "lucide-react"
import {
  Sparkles,
  Flame,
  Lightbulb,
  ShieldCheck,
  Heart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import {
  THEMEN_FELDER,
  type FrageData,
  type AntwortData,
  type ErkenntnisData,
  type StimmungsbildData,
  type EntscheidungData,
  type ThemenFeld,
} from "./types"

/**
 * SpiritSection — der Spiegel, was im Space lebendig ist.
 *
 * Aus den Daten gezogen, nicht kuratiert. Hier sieht man, wo der Spirit
 * gerade hingeht — welche Felder leuchten, welche Antworten tragen, was
 * im Werden ist, was schon erkannt wurde.
 *
 * Vier Bereiche:
 *   1. Themen-Heatmap — wo lebt's gerade?
 *   2. Top-Antworten — was hat den Space getragen?
 *   3. Stimmungs-Trend — wo neigt sich der Kreis?
 *   4. Pfeiler — Erkenntnisse + Entscheidungen, Spuren der Klaerung.
 */

function FeldIcon({
  iconName,
  className,
  style,
}: {
  iconName: string
  className?: string
  style?: React.CSSProperties
}) {
  const Icon = ((LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ??
    LucideIcons.Sparkles) as LucideIcon
  return <Icon className={className} style={style} />
}

const FELD_BY_ID: Record<string, ThemenFeld> = Object.fromEntries(
  THEMEN_FELDER.map((f) => [f.id, f])
)

export interface SpiritSectionProps {
  spaceName: string
  fragen: Item[]
  antwortenByFrage: Record<string, Item[]>
  erkenntnisse: Item[]
  stimmungsbilder: Item[]
  entscheidungen: Item[]
  onSelectFrage?: (frageId: string) => void
}

export function SpiritSection(props: SpiritSectionProps) {
  // Themen-Heatmap: Wieviele Items beruehren jedes Feld?
  const feldHeat = useMemo(() => {
    const counts: Record<string, number> = {}
    const collect = (item: Item) => {
      const felder = (item.data as { felder?: string[] }).felder ?? []
      for (const id of felder) counts[id] = (counts[id] ?? 0) + 1
    }
    for (const f of props.fragen) collect(f)
    for (const fid of Object.keys(props.antwortenByFrage)) {
      for (const a of props.antwortenByFrage[fid]) collect(a)
    }
    for (const e of props.erkenntnisse) collect(e)
    for (const s of props.stimmungsbilder) collect(s)
    for (const e of props.entscheidungen) collect(e)
    const max = Math.max(0, ...Object.values(counts))
    return THEMEN_FELDER.map((feld) => ({
      feld,
      count: counts[feld.id] ?? 0,
      heat: max > 0 ? (counts[feld.id] ?? 0) / max : 0,
    })).sort((a, b) => b.count - a.count)
  }, [
    props.fragen,
    props.antwortenByFrage,
    props.erkenntnisse,
    props.stimmungsbilder,
    props.entscheidungen,
  ])

  // Top-Antworten nach Resonanz
  const topAntworten = useMemo(() => {
    const all: Array<{ antwort: Item; frage: Item | null; score: number }> = []
    for (const fid of Object.keys(props.antwortenByFrage)) {
      const frage = props.fragen.find((f) => f.id === fid) ?? null
      for (const a of props.antwortenByFrage[fid]) {
        const r = (a.data as AntwortData).resonanz
        const score = (r?.beruehrt?.length ?? 0) + (r?.willBesprechen?.length ?? 0)
        if (score > 0) all.push({ antwort: a, frage, score })
      }
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 3)
  }, [props.antwortenByFrage, props.fragen])

  // Stimmungs-Trend: gewichteter Mittelwert (lebendig=+1, werdend=0, fremd=-1)
  const stimmungsTrend = useMemo(() => {
    let lebendig = 0
    let werdend = 0
    let fremd = 0
    for (const s of props.stimmungsbilder) {
      const sig = (s.data as StimmungsbildData).signale
      lebendig += sig?.lebendig?.length ?? 0
      werdend += sig?.werdend?.length ?? 0
      fremd += sig?.fremd?.length ?? 0
    }
    const total = lebendig + werdend + fremd
    return {
      lebendig,
      werdend,
      fremd,
      total,
      // Skala -1 bis +1
      trend: total > 0 ? (lebendig - fremd) / total : 0,
    }
  }, [props.stimmungsbilder])

  // Klarheits-Rate: wie viele Fragen haben mind. eine Erkenntnis?
  const klarheitsRate = useMemo(() => {
    if (props.fragen.length === 0) return 0
    const erkenntnisseFrageIds = new Set(
      props.erkenntnisse
        .map((e) => (e.data as ErkenntnisData).frageId)
        .filter((id): id is string => Boolean(id))
    )
    const klar = props.fragen.filter((f) => erkenntnisseFrageIds.has(f.id)).length
    return klar / props.fragen.length
  }, [props.fragen, props.erkenntnisse])

  // Juengste Erkenntnisse + Entscheidungen
  const recentErkenntnisse = useMemo(
    () =>
      [...props.erkenntnisse]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [props.erkenntnisse]
  )
  const recentEntscheidungen = useMemo(
    () =>
      [...props.entscheidungen]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [props.entscheidungen]
  )

  const totalItems =
    props.fragen.length +
    Object.values(props.antwortenByFrage).reduce((s, arr) => s + arr.length, 0) +
    props.erkenntnisse.length +
    props.stimmungsbilder.length +
    props.entscheidungen.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Sparkles className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#A855F7" }} />
        <div>
          <h2 className="text-lg font-bold leading-tight">
            Spirit von {props.spaceName}
          </h2>
          <p className="text-xs text-muted-foreground italic max-w-xl mt-0.5">
            Was sich im Wissensfeld kristallisiert — automatisch aus den Daten
            gezogen. Kein Algorithmus, der entscheidet, sondern ein Spiegel
            dessen, was die Gemeinschaft traegt.
          </p>
        </div>
      </div>

      {/* Hero-Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Flame}
          color="#E8751A"
          label="Fragen"
          value={props.fragen.length}
          hint={
            klarheitsRate > 0
              ? `${Math.round(klarheitsRate * 100)}% mit Erkenntnis geklaert`
              : "Saatgut"
          }
        />
        <StatCard
          icon={Lightbulb}
          color="#FBBF24"
          label="Erkenntnisse"
          value={props.erkenntnisse.length}
          hint="aus Kreisen getragen"
        />
        <StatCard
          icon={ShieldCheck}
          color="#22C55E"
          label="Entscheidungen"
          value={props.entscheidungen.length}
          hint="von der Gemeinschaft gefasst"
        />
        <StatCard
          icon={TrendingUp}
          color="#06B6D4"
          label="Im Bild"
          value={stimmungsTrend.total}
          hint={
            stimmungsTrend.total === 0
              ? "noch leise"
              : stimmungsTrend.trend > 0.3
              ? "lebendig"
              : stimmungsTrend.trend < -0.3
              ? "fremd"
              : "im Werden"
          }
        />
      </div>

      {totalItems === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm italic">
              Das Netzwerk ist neu. Sobald die ersten Fragen gestellt werden, traegt
              dieser Spiegel den Spirit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Themen-Heatmap */}
          {feldHeat.some((f) => f.count > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "#A855F7" }} />
                  Was leuchtet im Space
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  Themen-Felder nach Aktivitaet — wo wird gefragt, geantwortet,
                  gefunden?
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {feldHeat
                    .filter((f) => f.count > 0)
                    .map(({ feld, count, heat }) => (
                      <div
                        key={feld.id}
                        className="flex items-start gap-2 p-2.5 rounded-md border"
                        style={{
                          background: `${feld.color}${heatToOpacity(heat)}`,
                          borderColor: heat > 0.5 ? feld.color : "transparent",
                        }}
                      >
                        <FeldIcon
                          iconName={feld.icon}
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: feld.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[11px] font-semibold leading-tight"
                            style={{ color: feld.color }}
                          >
                            {feld.label}
                          </div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">
                            {count} {count === 1 ? "Spur" : "Spuren"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top-Antworten */}
          {topAntworten.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Was das Netzwerk traegt
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  Antworten mit der staerksten Resonanz — was die Gemeinschaft
                  beruehrt hat.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topAntworten.map(({ antwort, frage, score }) => {
                  const adata = antwort.data as AntwortData
                  const fdata = frage?.data as FrageData | undefined
                  const preview =
                    adata.content.length > 200
                      ? adata.content.slice(0, 197) + "..."
                      : adata.content
                  return (
                    <div
                      key={antwort.id}
                      className="border-l-4 pl-3 py-1"
                      style={{ borderColor: "#F43F5E" }}
                    >
                      {fdata && (
                        <button
                          type="button"
                          onClick={() => props.onSelectFrage?.(frage!.id)}
                          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1"
                        >
                          <Flame className="h-2.5 w-2.5" />
                          {fdata.content.length > 80
                            ? fdata.content.slice(0, 77) + "..."
                            : fdata.content}
                        </button>
                      )}
                      <p className="text-sm leading-relaxed italic">&laquo;{preview}&raquo;</p>
                      <div className="text-[10px] text-rose-500 mt-1 flex items-center gap-2">
                        <span>🌱 {adata.resonanz?.beruehrt?.length ?? 0}</span>
                        <span>🔥 {adata.resonanz?.willBesprechen?.length ?? 0}</span>
                        <span className="text-muted-foreground">· Resonanz {score}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Stimmungs-Trend */}
          {stimmungsTrend.total > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  Wo der Kreis sich neigt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {stimmungsTrend.lebendig > 0 && (
                    <div
                      style={{
                        width: `${(stimmungsTrend.lebendig / stimmungsTrend.total) * 100}%`,
                        background: "#10B981",
                      }}
                    />
                  )}
                  {stimmungsTrend.werdend > 0 && (
                    <div
                      style={{
                        width: `${(stimmungsTrend.werdend / stimmungsTrend.total) * 100}%`,
                        background: "#06B6D4",
                      }}
                    />
                  )}
                  {stimmungsTrend.fremd > 0 && (
                    <div
                      style={{
                        width: `${(stimmungsTrend.fremd / stimmungsTrend.total) * 100}%`,
                        background: "#94A3B8",
                      }}
                    />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-emerald-600 font-bold text-lg">
                      ✨ {stimmungsTrend.lebendig}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Lebendig</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-600 font-bold text-lg">
                      🌊 {stimmungsTrend.werdend}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Im Werden</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 font-bold text-lg">
                      ✋ {stimmungsTrend.fremd}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Fremd</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pfeiler: Erkenntnisse + Entscheidungen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentErkenntnisse.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" style={{ color: "#FBBF24" }} />
                    Juengste Erkenntnisse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentErkenntnisse.map((e) => {
                    const ed = e.data as ErkenntnisData
                    return (
                      <div key={e.id} className="border-l-4 border-amber-500/40 pl-3 py-1">
                        <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                          {ed.circleOrigin}
                        </div>
                        <p className="text-sm leading-snug mt-0.5">
                          {ed.content.length > 140
                            ? ed.content.slice(0, 137) + "..."
                            : ed.content}
                        </p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {recentEntscheidungen.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" style={{ color: "#22C55E" }} />
                    Pfeiler — Entscheidungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentEntscheidungen.map((e) => {
                    const ed = e.data as EntscheidungData
                    return (
                      <div key={e.id} className="border-l-4 border-green-500/40 pl-3 py-1">
                        <div className="text-[10px] uppercase tracking-wider text-green-700 dark:text-green-400 font-semibold flex items-center gap-2">
                          <span>{ed.circleOrigin}</span>
                          <span className="text-muted-foreground/70 normal-case tracking-normal">
                            {new Date(ed.circleDate).toLocaleDateString("de-DE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm leading-snug mt-0.5">
                          {ed.content.length > 140
                            ? ed.content.slice(0, 137) + "..."
                            : ed.content}
                        </p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  color: string
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="p-3 rounded-lg bg-white/70">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>
    </div>
  )
}

/** 0..1 → Hex-Alpha "00".."FF" — fuer Heat-Shading */
function heatToOpacity(heat: number): string {
  const max = 0.35 // Max 35% opacity damit Text lesbar bleibt
  const a = Math.round(heat * max * 255)
  return a.toString(16).padStart(2, "0").toUpperCase()
}
