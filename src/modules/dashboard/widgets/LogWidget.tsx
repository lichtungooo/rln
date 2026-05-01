import { useState } from "react"
import { ScrollText, Star, Heart, RotateCw, MessageSquare, Sparkles, Eye } from "lucide-react"
import { useLog } from "../../gamification"
import type { LogEntryData, LogEntryVisibility } from "../../gamification"

/**
 * LogWidget — die letzten 5 Log-Eintraege.
 *
 * Phase E1: jeder Eintrag laesst sich aufklappen — drei Mark-Buttons
 * (wichtig / schoen / wiederholen) + Kommentar-Feld + Sichtbarkeits-
 * Wechsel (privat → Netzwerk / Space / public).
 *
 * Vision: zwei Modi (Spiegel = chronologisch + Ernte = gefiltert). Hier
 * ist der Spiegel-Modus. Ernte-Filter kommt im vollen Log-Modul (Phase E
 * spaeter).
 */
export function LogWidget() {
  const { entries, toggleMark, setComment, setVisibility } = useLog()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const recent = entries.slice(0, 5)

  return (
    <div className="bg-card border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" style={{ color: "#A855F7" }} />
          <div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Log
            </div>
            <div className="text-base font-bold leading-tight">Spiegel der Reise</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{entries.length}</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="text-xs text-muted-foreground italic text-center py-4 leading-relaxed">
            Noch leer.<br />
            Quests abschliessen, Events besuchen — alles landet hier.
          </div>
        ) : (
          recent.map((entry) => {
            const d = entry.data as LogEntryData
            const isOpen = expandedId === entry.id
            const isSynergy = d.type === "level_up" && d.payload?.synergyBonus
            return (
              <div
                key={entry.id}
                className="border-l-2 rounded-md hover:bg-muted/30 transition-colors"
                style={{ borderColor: isSynergy ? "#A855F7" : "#A855F7" }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : entry.id)}
                  className="w-full text-left p-2 block"
                >
                  <div className="flex items-start gap-2">
                    {isSynergy && (
                      <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{d.summary}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>
                          {new Date(d.timestamp).toLocaleDateString("de-DE", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{d.sourceModule}</span>
                        {(d.marks?.length ?? 0) > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              {d.marks?.includes("wichtig") && <Star className="h-2.5 w-2.5 text-amber-500" />}
                              {d.marks?.includes("schoen") && <Heart className="h-2.5 w-2.5 text-pink-500" />}
                              {d.marks?.includes("wiederholen") && <RotateCw className="h-2.5 w-2.5 text-blue-500" />}
                            </span>
                          </>
                        )}
                        {d.comment && (
                          <>
                            <span>·</span>
                            <MessageSquare className="h-2.5 w-2.5" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <LogReflection
                    entryId={entry.id}
                    data={d}
                    onToggleMark={toggleMark}
                    onSetComment={setComment}
                    onSetVisibility={setVisibility}
                  />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ============================================================
// LogReflection — Mark + Kommentar + Sichtbarkeit pro Eintrag
// ============================================================

function LogReflection({
  entryId,
  data,
  onToggleMark,
  onSetComment,
  onSetVisibility,
}: {
  entryId: string
  data: LogEntryData
  onToggleMark: (entryId: string, mark: string) => Promise<void>
  onSetComment: (entryId: string, comment: string) => Promise<void>
  onSetVisibility: (entryId: string, visibility: LogEntryVisibility) => Promise<void>
}) {
  const [draft, setDraft] = useState(data.comment ?? "")
  const [editing, setEditing] = useState(false)
  const marks = new Set(data.marks ?? [])

  const handleSaveComment = async () => {
    await onSetComment(entryId, draft.trim())
    setEditing(false)
  }

  return (
    <div className="border-t bg-muted/10 p-2.5 space-y-2 text-xs">
      {/* Mark-Buttons */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground mr-1">Markieren:</span>
        <MarkButton
          active={marks.has("wichtig")}
          onClick={() => onToggleMark(entryId, "wichtig")}
          icon={<Star className="h-3 w-3" />}
          color="#F59E0B"
          label="wichtig"
        />
        <MarkButton
          active={marks.has("schoen")}
          onClick={() => onToggleMark(entryId, "schoen")}
          icon={<Heart className="h-3 w-3" />}
          color="#EC4899"
          label="schoen"
        />
        <MarkButton
          active={marks.has("wiederholen")}
          onClick={() => onToggleMark(entryId, "wiederholen")}
          icon={<RotateCw className="h-3 w-3" />}
          color="#3B82F6"
          label="wiederholen"
        />
      </div>

      {/* Kommentar */}
      {editing ? (
        <div className="space-y-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Was nimmst du daraus mit?"
            className="w-full text-xs bg-background border rounded px-2 py-1.5 resize-none min-h-16 outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => { setDraft(data.comment ?? ""); setEditing(false) }}
              className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSaveComment}
              className="text-[10px] font-semibold text-white px-2 py-0.5 rounded"
              style={{ background: "#A855F7" }}
            >
              Speichern
            </button>
          </div>
        </div>
      ) : data.comment ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-left w-full italic text-muted-foreground border-l-2 border-purple-500/40 pl-2 py-0.5 hover:bg-muted/30 rounded-r"
        >
          "{data.comment}"
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          Reflexion hinzufuegen
        </button>
      )}

      {/* Sichtbarkeit */}
      <div className="flex items-center gap-1 pt-1 border-t border-dashed">
        <Eye className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-[10px] text-muted-foreground">Sichtbar:</span>
        {(["private", "network", "space", "public"] as LogEntryVisibility[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onSetVisibility(entryId, v)}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              (data.visibility ?? "private") === v
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {v === "private" ? "privat" : v === "network" ? "Netzwerk" : v === "space" ? "Space" : "oeffentlich"}
          </button>
        ))}
      </div>
    </div>
  )
}

function MarkButton({
  active,
  onClick,
  icon,
  color,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  color: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all border"
      style={{
        borderColor: active ? color : "transparent",
        background: active ? `${color}15` : "transparent",
        color: active ? color : "#64748B",
      }}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
