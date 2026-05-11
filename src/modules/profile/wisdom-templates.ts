/**
 * Wisdom-Quest-Templates fuer Aelteste (Phase F10, 11.05.2026).
 *
 * Wer Aelteste-Status erreicht hat, bekommt im Profil drei Vorlagen
 * angeboten — Quests, die Weisheit weitergeben. Anders als normale
 * Quests sind sie:
 *   - **Erzaehlend** statt aufgabenstellend
 *   - **Beruhrend** statt messend
 *   - **Sichtbar fuer Mentees** statt fuer den eigenen Tree
 *
 * Reine Geste, kein XP. Die Wirkung liegt im Erzaehlen, nicht im Belohnen.
 *
 * Recherche: skilltree-vertiefung/04-alter-lebensphasen.md (Block I, J).
 */

export interface WisdomTemplate {
  id: string
  title: string
  prompt: string
  spirit: string
}

export const WISDOM_TEMPLATES: WisdomTemplate[] = [
  {
    id: "vermaechtnis",
    title: "Vermaechtnis",
    prompt:
      "Was moechtest du den Juengeren weitergeben? Erzaehl von einem Werk oder einer Einsicht, die ueber dich hinaus traegt.",
    spirit: "Was bleibt, wenn du gehst",
  },
  {
    id: "lehrling",
    title: "Lehrling annehmen",
    prompt:
      "Eine Frage einer juengeren Person, die dich beruehrt hat. Wie hast du geantwortet? Was hast du selber gelernt?",
    spirit: "Lehre ist Dialog, nicht Vortrag",
  },
  {
    id: "schwelle",
    title: "Schwelle halten",
    prompt:
      "Einen Uebergang, durch den du andere begleitet hast — Geburt, Krise, Aufbruch, Tod. Was war das fuer ein Moment?",
    spirit: "Aelteste tragen die Schwellen",
  },
]
