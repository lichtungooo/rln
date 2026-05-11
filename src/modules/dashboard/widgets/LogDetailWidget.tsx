import { useEffect, useState } from "react"
import {
  ScrollText,
  Star,
  Heart,
  RotateCw,
  MessageSquare,
  Sparkles,
  Eye,
  X,
} from "lucide-react"
import { useChannel } from "../../../components/SelectionContext"
import { useLog } from "../../gamification"
import type { LogEntryData, LogEntryVisibility } from "../../gamification"

/**
 * LogDetailWidget — Reflexion des selektierten Log-Eintrags aus dem
 * "log"-Channel. Marks (wichtig/schoen/wiederholen) + Kommentar +
 * Sichtbarkeits-Wechsel.
 */
export function LogDetailWidget() {
  const { selected, select } = useChannel<{ id: string; data: LogEntryData }>("log")
  const { toggleMark, setComment, setVisibility } = useLog()

  const [draft, setDraft] = useState("")
  const [editing, setEditing] = useState(false)

  // Bei Auswahl-Wechsel den Draft auf den Kommentar des neuen Eintrags setzen
  useEffect(() => {
    setDraft(selected?.data.comment ?? "")
    setEditing(false)
  }, [selected?.id])

  if (!selected) {
    return (
      <div className="h-full w-full bg-card border rounded-xl flex flex-col items-center justify-center text-xs text-muted-foreground italic p-4 text-center gap-2">
        <ScrollText className="h-6 w-6 opacity-40" />
        <p>Log-Detail</p>
        <p className="text-[10px]">
          Klick auf einen Eintrag im Log-Widget — Reflexion erscheint hier.
        </p>
      </div>
    )
  }

  const d = selected.data
  const marks = new Set(d.marks ?? [])
  const isSynergy = d.type === "level_up" && d.payload?.synergyBonus

  const handleSaveComment = async () => {
    await setComment(selected.id, draft.trim())
    setEditing(false)
  }

  return (
    <div className="h-full w-full bg-card border rounded-xl flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-2">
        {isSynergy ? (
          <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
        ) : (
          <ScrollText className="h-4 w-4 shrink-0" style={{ color: "#A855F7" }} />
        )}
        <span className="text-sm font-semibold truncate flex-1">{d.summary}</span>
        <button
          type="button"
          onClick={() => select(null)}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto text-xs">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>
            {new Date(d.timestamp).toLocaleString("de-DE", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>·</span>
          <span className="capitalize">{d.sourceModule}</span>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            Markieren
          </p>
          <div className="flex items-center gap-1">
            <MarkButton
              active={marks.has("wichtig")}
              onClick={() => toggleMark(selected.id, "wichtig")}
              icon={<Star className="h-3 w-3" />}
              color="#F59E0B"
              label="wichtig"
            />
            <MarkButton
              active={marks.has("schoen")}
              onClick={() => toggleMark(selected.id, "schoen")}
              icon={<Heart className="h-3 w-3" />}
              color="#EC4899"
              label="schoen"
            />
            <MarkButton
              active={marks.has("wiederholen")}
              onClick={() => toggleMark(selected.id, "wiederholen")}
              icon={<RotateCw className="h-3 w-3" />}
              color="#3B82F6"
              label="wiederholen"
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            Reflexion
          </p>
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
                  onClick={() => {
                    setDraft(d.comment ?? "")
                    setEditing(false)
                  }}
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
          ) : d.comment ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-left w-full italic text-muted-foreground border-l-2 border-purple-500/40 pl-2 py-0.5 hover:bg-muted/30 rounded-r"
            >
              "{d.comment}"
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
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Sichtbar
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {(["private", "network", "space", "public"] as LogEntryVisibility[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(selected.id, v)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  (d.visibility ?? "private") === v
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {v === "private"
                  ? "privat"
                  : v === "network"
                  ? "Netzwerk"
                  : v === "space"
                  ? "Space"
                  : "oeffentlich"}
              </button>
            ))}
          </div>
        </div>
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
