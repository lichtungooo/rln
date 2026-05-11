import { useCallback, useState } from "react"
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useCurrentUser,
} from "@real-life-stack/toolkit"
import type { Item } from "@real-life-stack/data-interface"
import {
  GAMIFICATION_ITEM_TYPES,
  type UserProgressData,
  type LogEntryType,
  type LogEntryData,
  type UserAvatarData,
  type PastExperienceData,
  type ViaResultData,
  type TreeBereichId,
  type QuestGamificationFields,
} from "../gamification"
import { useGamificationSeed } from "../gamification"
import { useProfileExtension } from "../profile/use-profile-extension"
import type { LifeThreadData } from "../profile/life-thread"

/**
 * Demo-Seed fuer den Spiegel — fuellt Tree, Quests, Log, Avatar mit
 * plausiblen Werten, damit man sofort sieht, wie das System wirkt.
 *
 * Resultat nach einem Klick:
 *   - Charakter-Level ~42 (~26.000 XP) verteilt auf alle 8 Bereiche
 *   - 6-8 Skills auf Lv 20-50
 *   - 8 offene Quests (3 davon in einer Reihe)
 *   - 5 erledigte Quests im Log + weitere Log-Eintraege
 *   - Avatar mit 6 sichtbaren Items
 *   - Trust-Score 100+ (50 trust_verified Eintraege)
 *   - Lebens-Faden + VIA-Resultat als Beispiel
 *
 * Idempotent ueber einen Marker im Profile-Extension (`demoSeeded: true`).
 */
export function useDemoSeed() {
  const { data: currentUser } = useCurrentUser()
  const { data: skillItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.skill })
  const { data: progressItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.userProgress })
  const { data: avatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.avatarItem })
  const { data: userAvatarItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.userAvatar })
  const { data: viaItems } = useItems({ type: GAMIFICATION_ITEM_TYPES.viaResult })
  const { mutate: createItem } = useCreateItem()
  const { mutate: updateItem } = useUpdateItem()
  const { data: extension, update: updateExtension } = useProfileExtension()
  const { seed: seedManifest, status: manifestStatus } = useGamificationSeed("macher")

  const [busy, setBusy] = useState(false)

  const alreadySeeded = Boolean((extension as { demoSeeded?: boolean }).demoSeeded)

  const seed = useCallback(async () => {
    if (!currentUser?.id) {
      throw new Error("Nicht eingeloggt — kein Demo-Seed moeglich.")
    }
    setBusy(true)
    try {
      // 1) Manifest seeden, falls Macher-Skills noch fehlen
      if (manifestStatus.skillsTodo > 0) {
        await seedManifest()
      }

      // 2) Fresh Lookup der Skills nach Seed
      const allSkills = skillItems
      const skillByName = new Map<string, Item>()
      for (const s of allSkills) {
        skillByName.set((s.data as { name: string }).name, s)
      }

      // 3) User-Progress setzen — Lv 42 total, gut verteilt
      const skillXpPlan: Record<string, number> = {}
      const tryAdd = (name: string, xp: number) => {
        const item = skillByName.get(name)
        if (item) skillXpPlan[item.id] = xp
      }
      // Macher-spezifisch
      tryAdd("Holz", 8200)         // ~Lv 50 in 1.10^(L-1)
      tryAdd("Metall", 3400)       // ~Lv 35
      tryAdd("Schweissen", 1700)   // ~Lv 28
      tryAdd("Schmieden", 850)     // ~Lv 22
      tryAdd("Elektronik", 320)    // ~Lv 14
      tryAdd("3D-Druck", 180)      // ~Lv 11
      tryAdd("Reparieren", 480)    // ~Lv 16
      tryAdd("Garten", 920)        // ~Lv 22
      tryAdd("Permakultur", 380)   // ~Lv 14
      tryAdd("Imkern", 220)        // ~Lv 12
      // Auch ein paar Universal-Skills direkt (mit u-Praefix-IDs)
      skillXpPlan["u-koerper-atem"] = 1100
      skillXpPlan["u-bewusstsein-meditation"] = 1450
      skillXpPlan["u-bewusstsein-achtsamkeit"] = 900
      skillXpPlan["u-seele-musik"] = 600
      skillXpPlan["u-seele-tanz"] = 280
      skillXpPlan["u-geist-lesen"] = 1200
      skillXpPlan["u-geist-lernen"] = 750
      skillXpPlan["u-soziales-zuhoeren"] = 850
      skillXpPlan["u-soziales-empathie"] = 720
      skillXpPlan["u-gemeinschaft-treffen"] = 540
      skillXpPlan["u-natur-pflanzen"] = 460

      // Bereich-XP aus skillXp aggregieren (Universal-Skill-Bereich via Praefix-Match)
      const UNIVERSAL_BEREICHE: Record<string, TreeBereichId> = {
        "u-koerper-": "koerper",
        "u-geist-": "geist",
        "u-seele-": "seele",
        "u-bewusstsein-": "bewusstsein",
        "u-soziales-": "soziales",
        "u-gemeinschaft-": "gemeinschaft",
        "u-handwerk-": "handwerk",
        "u-natur-": "natur",
      }
      const bereichXp: Partial<Record<TreeBereichId, number>> = {}
      for (const [skillId, xp] of Object.entries(skillXpPlan)) {
        let bId: TreeBereichId | undefined
        const item = allSkills.find((s) => s.id === skillId)
        if (item) {
          bId = (item.data as { bereichId: TreeBereichId }).bereichId
        } else {
          for (const [prefix, b] of Object.entries(UNIVERSAL_BEREICHE)) {
            if (skillId.startsWith(prefix)) {
              bId = b
              break
            }
          }
        }
        if (bId) {
          bereichXp[bId] = (bereichXp[bId] ?? 0) + xp
        }
      }
      // Etwas Bereich-Bonus oben drauf
      bereichXp.koerper = (bereichXp.koerper ?? 0) + 400
      bereichXp.gemeinschaft = (bereichXp.gemeinschaft ?? 0) + 300

      const progressData: UserProgressData = {
        skillXp: skillXpPlan,
        bereichXp,
        updatedAt: new Date().toISOString(),
      }
      const existingProgress = progressItems.find((p) => p.createdBy === currentUser.id)
      if (existingProgress) {
        await updateItem(existingProgress.id, { data: progressData })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.userProgress,
          createdBy: currentUser.id,
          data: progressData,
        })
      }

      // 4) Avatar — 6 Items als displayed
      const itemByName = new Map<string, Item>()
      for (const it of avatarItems) {
        itemByName.set((it.data as { name: string }).name, it)
      }
      const ownedItemIds: string[] = []
      const displayedItemIds: string[] = []
      const pickItem = (name: string, displayed = false) => {
        const it = itemByName.get(name)
        if (it) {
          ownedItemIds.push(it.id)
          if (displayed && displayedItemIds.length < 5) displayedItemIds.push(it.id)
        }
      }
      pickItem("Goldene Saege", true)
      pickItem("Schweisser-Helm", true)
      pickItem("Loet-Stern", false)
      pickItem("Robust", true)
      pickItem("Lehrer-Stab", true)
      pickItem("Werkstatt-Schluessel", false)
      pickItem("Macher-Stern", true)
      pickItem("Gruener Daumen", false)
      pickItem("Bienen-Fluesterer", false)

      const userAvatarData: UserAvatarData = {
        ownedItemIds,
        displayedItemIds,
        titlePerSpace: { macher: "Hueter der Werkstatt" },
        variantPerSpace: { macher: "klassisch" },
        archetypesPerSpace: { macher: ["pionier", "bauer"] },
      }
      const existingUserAvatar = userAvatarItems.find((a) => a.createdBy === currentUser.id)
      if (existingUserAvatar) {
        await updateItem(existingUserAvatar.id, { data: userAvatarData })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.userAvatar,
          createdBy: currentUser.id,
          data: userAvatarData,
        })
      }

      // 5) Quests anlegen — 8 offene, 3 in einer Reihe
      const seriesId = `demo-series-${Date.now()}`
      const questDefs: Array<{ title: string; description?: string; fields?: QuestGamificationFields }> = [
        {
          title: "Werkstatt-Pin eintragen",
          description: "Trage deine erste Werkstatt auf der Karte ein.",
          fields: { skillXp: {}, bereichXp: { gemeinschaft: 30 } },
        },
        {
          title: "Hobel bauen",
          description: "Aus Hartholz einen einfachen Schlichthobel bauen.",
          fields: {
            skillXp: skillByName.get("Holz") ? { [skillByName.get("Holz")!.id]: 80 } : {},
            bereichXp: { koerper: 20 },
            questSeriesId: seriesId,
            questSeriesPosition: 1,
          },
        },
        {
          title: "Schwalbenschwanz-Zinkung",
          description: "Eine sichtbare Holzverbindung von Hand schneiden.",
          fields: {
            skillXp: skillByName.get("Holz") ? { [skillByName.get("Holz")!.id]: 150 } : {},
            bereichXp: { koerper: 30 },
            questSeriesId: seriesId,
            questSeriesPosition: 2,
          },
        },
        {
          title: "Hocker bauen (Gesellenstueck)",
          description: "Ein dreibeiniger Hocker — gehobelt, verzinkt, geoelt.",
          fields: {
            skillXp: skillByName.get("Holz")
              ? { [skillByName.get("Holz")!.id]: 250 }
              : {},
            bereichXp: { koerper: 50, gemeinschaft: 20 },
            questSeriesId: seriesId,
            questSeriesPosition: 3,
            rewardItems: itemByName.get("Goldene Saege") ? [itemByName.get("Goldene Saege")!.id] : undefined,
          },
        },
        {
          title: "Schweissen WIG-Grundkurs",
          description: "Erste WIG-Naht auf 3 mm Stahl.",
          fields: {
            skillXp: skillByName.get("Schweissen") ? { [skillByName.get("Schweissen")!.id]: 100 } : {},
            verification: "peer",
          },
        },
        {
          title: "Bienenkasten lasieren",
          description: "Bienenkasten fuer den Naturschutz mit Leinoel behandeln.",
          fields: {
            skillXp: skillByName.get("Imkern") ? { [skillByName.get("Imkern")!.id]: 60 } : {},
            bereichXp: { natur: 40 },
          },
        },
        {
          title: "Permakultur-Beet anlegen",
          description: "Hochbeet mit Mulch + Polykultur.",
          fields: {
            skillXp: skillByName.get("Permakultur") ? { [skillByName.get("Permakultur")!.id]: 120 } : {},
            bereichXp: { natur: 80, koerper: 20 },
          },
        },
        {
          title: "Lehrling annehmen",
          description: "Eine juengere Person fuer drei Werkstatt-Tage anlernen.",
          fields: {
            skillXp: skillByName.get("Lehre") ? { [skillByName.get("Lehre")!.id]: 200 } : {},
            bereichXp: { gemeinschaft: 100, soziales: 60 },
            verification: "attestation",
          },
        },
      ]

      for (const q of questDefs) {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.quest,
          createdBy: currentUser.id,
          data: {
            title: q.title,
            description: q.description,
            ...(q.fields ?? {}),
          },
        })
      }

      // 6) Log-Eintraege — vergangene Erfolge
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000

      const logs: Array<{ type: LogEntryType; summary: string; ago: number; payload?: Record<string, unknown>; visibility?: LogEntryData["visibility"] }> = [
        { type: "quest_completed", summary: "Quest abgeschlossen: Holz schleifen — Grundkurs · +120 XP", ago: 2 },
        { type: "level_up", summary: "Bereich Handwerk Lv 14 → Lv 15", ago: 2 },
        { type: "item_earned", summary: "Holzhobel verdient", ago: 5 },
        { type: "quest_completed", summary: "Quest abgeschlossen: Werkstatt eintragen · +30 XP", ago: 7 },
        { type: "event_attended", summary: "Werkstatt-Tag bei Hornbach (12 Macher)", ago: 10 },
        { type: "trust_verified", summary: "Sebastian hat dich attestiert (Werkbank-Aufbau)", ago: 12, visibility: "network" },
        { type: "quest_completed", summary: "Quest abgeschlossen: Werkstuecke fotografieren · +80 XP", ago: 14 },
        { type: "item_earned", summary: "Robust verdient (100h Werkstatt)", ago: 18 },
        { type: "level_up", summary: "Charakter-Level 40 → 41", ago: 20 },
        { type: "trust_verified", summary: "Anton hat dich attestiert (Permakultur-Beet)", ago: 22, visibility: "network" },
        { type: "reflection", summary: "Reflexion: Heute war ein gutes Holz-Tag", ago: 25, payload: { mood: "froh" } },
        { type: "quest_completed", summary: "Quest abgeschlossen: Beet vorbereiten · +90 XP", ago: 30 },
        { type: "place_visited", summary: "Werkstatt 'Holz-Heim' besucht", ago: 35 },
        { type: "item_earned", summary: "Schweisser-Helm verdient", ago: 42 },
        { type: "value_given", summary: "Werkzeug verliehen an Mara", ago: 50 },
        { type: "trust_verified", summary: "Mara hat dich attestiert (Werkzeug-Hilfe)", ago: 50, visibility: "network" },
        { type: "title_earned", summary: "Titel verdient: Hueter der Werkstatt", ago: 60 },
      ]

      for (const log of logs) {
        const logEntry: LogEntryData = {
          type: log.type,
          timestamp: new Date(now - log.ago * day).toISOString(),
          sourceModule: "demo",
          summary: log.summary,
          visibility: log.visibility ?? "private",
          payload: log.payload,
        }
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.logEntry,
          createdBy: currentUser.id,
          data: logEntry,
        })
      }

      // 6b) Mehr trust_verified Eintraege fuer Reputation-Score ~100
      // received zaehlt 2x → 45 weitere received = 90 + die bereits 3 oben = 96 received → trustScore 96*2 = 192
      // Wir wollen ~100 → 22 weitere received reichen (22 * 2 + 3*2 = 50). Lass 50 weitere fuer 100+
      for (let i = 0; i < 50; i++) {
        const days = 60 + Math.floor(Math.random() * 360)
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.logEntry,
          createdBy: currentUser.id,
          data: {
            type: "trust_verified",
            timestamp: new Date(now - days * day).toISOString(),
            sourceModule: "demo",
            summary: `Macher-Festival 2024: Werkstatt-Beleg #${i + 1}`,
            visibility: "network",
            payload: { verifierId: `demo-attestor-${i}` },
          } as LogEntryData,
        })
      }

      // 7) Lebens-Faden im Profile-Extension
      const lifeThread: LifeThreadData = {
        birthYear: 1982,
        phases: {
          0: "Kindheit auf dem Land. Erster Werkzeugkasten mit sieben.",
          1: "Schule, Skateboard, Holz-Werkstatt mit dem Vater.",
          2: "Lehre als Tischler. Erstes eigenes Werk: ein Tisch.",
          3: "Wanderjahre. Hausgemeinschaft, Tanzen, Yoga.",
          4: "Eigene Werkstatt aufgebaut. Lehrlinge geholt.",
          5: "Macher-Festival mitgegruendet. Hier sind wir.",
        },
      }

      // 8) Vergangenheits-Erfahrungen
      const pastExperiencesData: PastExperienceData[] = [
        {
          title: "Tischlerlehre",
          description: "Drei Jahre Lehre bei einem Meister im Schwarzwald.",
          startYear: 2002,
          endYear: 2005,
          lifePhaseIndex: 3,
          bereiche: ["handwerk", "koerper"],
          mastery: "mastered",
          attestedBy: ["demo-meister-1"],
        },
        {
          title: "Jahr auf einem Permakultur-Hof",
          description: "Sommer-zu-Sommer auf einem Hof in Spanien. Erde, Pflanzen, Tiere.",
          startYear: 2009,
          endYear: 2010,
          lifePhaseIndex: 3,
          bereiche: ["natur", "gemeinschaft"],
          mastery: "practiced",
        },
        {
          title: "Yoga-Lehrer-Ausbildung",
          description: "200h Hatha-Vinyasa-Tradition.",
          startYear: 2015,
          endYear: 2016,
          lifePhaseIndex: 5,
          bereiche: ["koerper", "bewusstsein"],
          mastery: "practiced",
          attestedBy: ["demo-yoga-1"],
        },
      ]
      for (const exp of pastExperiencesData) {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.pastExperience,
          createdBy: currentUser.id,
          data: exp,
        })
      }

      // 9) VIA-Resultat — Top-5
      const viaResult: ViaResultData = {
        answers: {
          kreativitaet: 5,
          neugier: 5,
          ausdauer: 5,
          guete: 5,
          aufrichtigkeit: 5,
          urteilskraft: 4,
          tapferkeit: 4,
          lernfreude: 4,
          fuehrung: 4,
          fairness: 4,
          vitalitaet: 3,
          klugheit: 3,
          schoenheitssinn: 3,
          dankbarkeit: 3,
          humor: 3,
          liebe: 3,
          "soziale-intelligenz": 3,
          teamarbeit: 3,
          spiritualitaet: 3,
          perspektive: 3,
          vergebung: 3,
          bescheidenheit: 3,
          selbstregulation: 3,
          hoffnung: 4,
        },
        completedAt: new Date(now - 30 * day).toISOString(),
        signatureStrengthIds: ["kreativitaet", "neugier", "ausdauer", "guete", "aufrichtigkeit"],
      }
      const existingVia = viaItems.find((v) => v.createdBy === currentUser.id)
      if (existingVia) {
        await updateItem(existingVia.id, { data: viaResult })
      } else {
        await createItem({
          type: GAMIFICATION_ITEM_TYPES.viaResult,
          createdBy: currentUser.id,
          data: viaResult,
        })
      }

      // 10) Marker im Profile-Extension setzen
      await updateExtension({
        ...(extension as Record<string, unknown>),
        lifeThread,
        demoSeeded: true,
        bio: "Tischler. Macher. Permakultur-Bauer. Yoga-Lehrer.",
      })
    } finally {
      setBusy(false)
    }
  }, [
    currentUser?.id,
    skillItems,
    progressItems,
    avatarItems,
    userAvatarItems,
    viaItems,
    extension,
    createItem,
    updateItem,
    updateExtension,
    seedManifest,
    manifestStatus.skillsTodo,
  ])

  return { seed, busy, alreadySeeded }
}
