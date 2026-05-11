import { useState } from "react"
import { ChevronLeft, ChevronRight, User, Trophy, Network } from "lucide-react"
import type { ModuleViewProps } from "../registry"
import { StatsBar } from "../gamification"
import { SpiegelAvatarTab } from "./SpiegelAvatarTab"
import { SpiegelQuestTab } from "./SpiegelQuestTab"
import { SpiegelSkillTab } from "./SpiegelSkillTab"
import { useDemoSeed } from "./use-demo-seed"

/**
 * SpiegelView — drei Linsen auf den Menschen in einem Modul.
 *
 * Profil hat eine FESTE Tab-Struktur (Avatar / Quest / Skill) — kein
 * konfigurierbares Grid wie das Dashboard. Pfeile aussen blaettern
 * INTERN durch den aktuellen Tab (Filter, Quest-Liste, Skill-Bereich)
 * via onNavReady-API, die jeder Tab bedient.
 *
 * Hero-Zeile oben: Tabs links, XP-Balken + Trust-Anzeige rechts.
 * Trust = Anzahl vertrauter Menschen (verifizierte Kontakte). Wenn
 * jemand nur 1 hat, koennte das auch ein guter Fake sein — also reine
 * Zahl, keine Bewertung.
 */

export type SpiegelTab = "avatar" | "quest" | "skill"

export interface SpiegelModuleConfig {
  defaultTab?: SpiegelTab
}

export const spiegelDefaultConfig: SpiegelModuleConfig = {
  defaultTab: "skill",
}

export function SpiegelView(props: ModuleViewProps<SpiegelModuleConfig>) {
  const { config } = props
  const [tab, setTab] = useState<SpiegelTab>(config?.defaultTab ?? "skill")

  // Bridge-State: aktiver Tab kommuniziert seine Nav-API zurueck
  const [navApi, setNavApi] = useState<{
    prev: () => void
    next: () => void
    canPrev: boolean
    canNext: boolean
  } | null>(null)

  // Bei Tab-Wechsel Nav-API zuruecksetzen
  const handleTabChange = (next: SpiegelTab) => {
    setNavApi(null)
    setTab(next)
  }

  return (
    <div className="flex flex-col h-full">
      <SpiegelHero tab={tab} onTabChange={handleTabChange} />

      {/* Container-Wrapper mit Pfeilen aussen */}
      <div className="flex-1 flex items-stretch min-h-0 px-0 py-1.5 gap-0">
        <button
          type="button"
          onClick={() => navApi?.prev()}
          disabled={!navApi?.canPrev}
          className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          aria-label="Zurueck"
        >
          <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
        </button>

        <div className="flex-1 flex flex-col min-w-0 p-2">
          {tab === "avatar" && <SpiegelAvatarTab {...props} onNavReady={setNavApi} />}
          {tab === "quest" && <SpiegelQuestTab {...props} onNavReady={setNavApi} />}
          {tab === "skill" && <SpiegelSkillTab {...props} onNavReady={setNavApi} />}
        </div>

        <button
          type="button"
          onClick={() => navApi?.next()}
          disabled={!navApi?.canNext}
          className="self-center shrink-0 p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          aria-label="Weiter"
        >
          <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

// ============================================================
// SpiegelHero — Tab-Buttons + XP + Trust in einer Zeile
// ============================================================

function SpiegelHero({
  tab,
  onTabChange,
}: {
  tab: SpiegelTab
  onTabChange: (t: SpiegelTab) => void
}) {
  const { seed: seedDemo, busy: seeding, alreadySeeded } = useDemoSeed()

  return (
    <div
      className="border-b px-3 sm:px-4 py-2 flex items-center gap-3 flex-wrap shrink-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(232,117,26,0.05) 0%, rgba(251,191,36,0.04) 50%, rgba(168,85,247,0.04) 100%)",
      }}
    >
      {/* Tab-Buttons im neuen Stil */}
      <div className="flex items-center gap-1 shrink-0">
        <TabButton icon={User} label="Avatar" active={tab === "avatar"} onClick={() => onTabChange("avatar")} />
        <TabButton icon={Trophy} label="Quest" active={tab === "quest"} onClick={() => onTabChange("quest")} />
        <TabButton icon={Network} label="Skill" active={tab === "skill"} onClick={() => onTabChange("skill")} />
      </div>

      <div className="flex-1" />

      <StatsBar />

      {!alreadySeeded && (
        <button
          type="button"
          onClick={() => seedDemo().catch((err) => alert(err.message))}
          disabled={seeding}
          className="text-[10px] px-2 py-1 rounded border border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 shrink-0"
          title="Demo-Daten anlegen — Lv ~42, Items, Quests, Log"
        >
          {seeding ? "Lade Demo..." : "Demo"}
        </button>
      )}
    </div>
  )
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof User
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md transition-colors ${
        active
          ? "bg-foreground text-background font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
