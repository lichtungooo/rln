import type { CircleData, ShareProfileData } from "./types"

/**
 * Default-Kreise und Default-Share-Profile (Phase F8, 11.05.2026).
 *
 * Werden beim ersten Oeffnen der Kreise-Section vorgeschlagen.
 * Mensch kann sie als Skelett anlegen und mit eigenen Mitgliedern
 * fuellen, oder eigene Kreise neben den Defaults bauen.
 *
 * Diaspora-Aspects-Pattern: einseitig, privat, persoenlich.
 *
 * Recherche: skilltree-vertiefung/06-granulare-freigabe.md (Block B, F).
 */

export const DEFAULT_CIRCLES: Array<CircleData> = [
  {
    name: "Vertraute",
    description: "Der engste Kreis — alles darf sichtbar sein.",
    memberIds: [],
    icon: "heart",
    color: "#EC4899",
  },
  {
    name: "Mitstreiter",
    description: "Mitkaempfer, Kollegen, Quest-Partner. Wer am gleichen Werk baut.",
    memberIds: [],
    icon: "handshake",
    color: "#10B981",
  },
  {
    name: "Bekannte",
    description: "Losere Verbindungen — wer mich kennt, aber nicht traegt.",
    memberIds: [],
    icon: "users",
    color: "#94A3B8",
  },
]

/**
 * Vier Default-Sicht-Profile. Jedes deckt einen klaren Lebens-Kontext ab.
 *
 * Die `targetCircleIds` bleiben anfangs leer — der Mensch entscheidet
 * spaeter, welcher Kreis welches Profil sieht.
 */
export const DEFAULT_SHARE_PROFILES: Array<ShareProfileData> = [
  {
    name: "Job-Profil",
    description: "Was Recruiter, Kollegen, Auftraggeber sehen sollen.",
    visibleBereiche: ["handwerk", "geist", "soziales"],
    showLifeThread: false,
    showVia: false,
    showPastExperiences: true,
    icon: "briefcase",
  },
  {
    name: "Date-Profil",
    description: "Was ein Date oder eine Begegnung sehen darf.",
    visibleBereiche: ["seele", "bewusstsein", "koerper", "soziales"],
    showLifeThread: false,
    showVia: true,
    showPastExperiences: false,
    icon: "heart",
  },
  {
    name: "Mentor-Profil",
    description: "Was Schueler oder Lehrlinge von dir sehen.",
    visibleBereiche: ["handwerk", "gemeinschaft", "geist", "bewusstsein"],
    showLifeThread: true,
    showVia: true,
    showPastExperiences: true,
    icon: "graduation-cap",
  },
  {
    name: "Lichtungs-Profil",
    description: "Was die Lichtungs-Schwestern und -Brueder sehen.",
    visibleBereiche: ["seele", "bewusstsein", "gemeinschaft", "natur"],
    showLifeThread: true,
    showVia: true,
    showPastExperiences: false,
    icon: "sun",
  },
]
