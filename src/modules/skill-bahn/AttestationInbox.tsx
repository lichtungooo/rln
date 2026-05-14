/**
 * AttestationInbox — eingehende und eigene Bestaetigungs-Anfragen.
 *
 * Mentor sieht eingehende Anfragen + kann approve/reject.
 * Lerner sieht eigene Anfragen + Status, kann zuruecknehmen.
 *
 * Stand 14.05.2026.
 */

import { useMemo } from "react"
import { Inbox, CheckCircle2, XCircle, Clock } from "lucide-react"
import type { Item } from "@real-life-stack/data-interface"
import {
  useSkillAttestations,
  TIER_BY_ID,
  type SkillV2,
  type Tier,
  type SkillAttestationRequestData,
} from "../gamification"

interface AttestationInboxProps {
  allSkills: SkillV2[]
}

interface RequestKarteProps {
  request: Item
  skill: SkillV2 | undefined
  mode: "incoming" | "outgoing"
  onApprove?: () => void
  onReject?: () => void
  onWithdraw?: () => void
}

function statusFarbe(status: SkillAttestationRequestData["status"]): {
  bg: string
  text: string
  icon: typeof Clock
  label: string
} {
  switch (status) {
    case "approved":
      return { bg: "bg-emerald-100", text: "text-emerald-900", icon: CheckCircle2, label: "Bestaetigt" }
    case "rejected":
      return { bg: "bg-rose-100", text: "text-rose-900", icon: XCircle, label: "Abgelehnt" }
    case "withdrawn":
      return { bg: "bg-slate-100", text: "text-slate-700", icon: XCircle, label: "Zurueckgenommen" }
    default:
      return { bg: "bg-amber-100", text: "text-amber-900", icon: Clock, label: "Offen" }
  }
}

function RequestKarte({ request, skill, mode, onApprove, onReject, onWithdraw }: RequestKarteProps) {
  const data = request.data as SkillAttestationRequestData
  const status = statusFarbe(data.status)
  const StatusIcon = status.icon
  const tierName = TIER_BY_ID[data.requestedTier].name

  return (
    <div className="rounded-lg p-3 bg-white/70 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="text-sm font-semibold">{skill?.name ?? data.skillId}</div>
          <div className="text-xs text-muted-foreground">
            {skill?.beschreibung ?? "Skill nicht gefunden"}
          </div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${status.bg} ${status.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground">
        Angefragter Tier: <span className="font-semibold">{tierName}</span>
        {" · "}Datum: {new Date(data.createdAt).toLocaleDateString("de-DE")}
      </div>
      {data.notes && (
        <div className="text-xs italic text-muted-foreground">"{data.notes}"</div>
      )}
      {data.status === "approved" && data.attesterId && (
        <div className="text-[11px] text-emerald-700">
          Bestaetigt von DID-Snippet {data.attesterId.slice(0, 12)}...
        </div>
      )}

      {data.status === "pending" && (
        <div className="flex flex-wrap gap-2 mt-1">
          {mode === "incoming" ? (
            <>
              <button
                onClick={onApprove}
                className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
              >
                Bestaetigen
              </button>
              <button
                onClick={onReject}
                className="text-xs px-3 py-1 rounded-md bg-rose-100 text-rose-900 hover:bg-rose-200"
              >
                Ablehnen
              </button>
            </>
          ) : (
            <button
              onClick={onWithdraw}
              className="text-xs px-3 py-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              Anfrage zuruecknehmen
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function AttestationInbox({ allSkills }: AttestationInboxProps) {
  const {
    myRequests,
    incomingRequests,
    myAttestations,
    myGivenAttestations,
    approveRequest,
    rejectRequest,
    withdrawRequest,
  } = useSkillAttestations()

  const skillById = useMemo(() => {
    const m = new Map<string, SkillV2>()
    allSkills.forEach((s) => m.set(s.id, s))
    return m
  }, [allSkills])

  const istLeer = myRequests.length === 0 && incomingRequests.length === 0

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Inbox className="w-5 h-5 text-violet-700" />
          <h2 className="text-lg font-bold">Bestaetigungs-Anfragen</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Tier "kann" und hoeher brauchen Bestaetigung durch einen anderen Macher
          oder Mentor. Wer erkennt, dass du kannst, bestaetigt — und schenkt dir
          den naechsten Schritt.
        </p>
      </div>

      {/* Eingehende Anfragen */}
      {incomingRequests.length > 0 && (
        <div className="rounded-2xl p-4 bg-violet-50/60">
          <h3 className="text-sm font-bold mb-2">
            Anfragen an mich ({incomingRequests.length})
          </h3>
          <div className="flex flex-col gap-2">
            {incomingRequests.map((req) => {
              const skill = skillById.get((req.data as { skillId: string }).skillId)
              return (
                <RequestKarte
                  key={req.id}
                  request={req}
                  skill={skill}
                  mode="incoming"
                  onApprove={() => approveRequest(req.id)}
                  onReject={() => rejectRequest(req.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Eigene Anfragen */}
      {myRequests.length > 0 && (
        <div className="rounded-2xl p-4 bg-amber-50/60">
          <h3 className="text-sm font-bold mb-2">Meine Anfragen ({myRequests.length})</h3>
          <div className="flex flex-col gap-2">
            {myRequests.map((req) => {
              const skill = skillById.get((req.data as { skillId: string }).skillId)
              return (
                <RequestKarte
                  key={req.id}
                  request={req}
                  skill={skill}
                  mode="outgoing"
                  onWithdraw={() => withdrawRequest(req.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Stand */}
      {(myAttestations.length > 0 || myGivenAttestations.length > 0) && (
        <div className="rounded-2xl p-4 bg-card text-xs text-muted-foreground space-y-1">
          {myAttestations.length > 0 && (
            <div>
              Erhalten:{" "}
              <span className="font-semibold text-emerald-700">{myAttestations.length}</span>{" "}
              Bestaetigungen.
            </div>
          )}
          {myGivenAttestations.length > 0 && (
            <div>
              Gegeben:{" "}
              <span className="font-semibold text-violet-700">{myGivenAttestations.length}</span>{" "}
              Bestaetigungen — du traegst Mentor-Wirkung.
            </div>
          )}
        </div>
      )}

      {istLeer && (
        <div className="rounded-2xl p-4 bg-card text-sm text-muted-foreground">
          Noch keine Anfragen. Im Bahn-Modus auf einen Skill klicken und{" "}
          <span className="font-semibold">"Kann ich" — Bestaetigung anfragen</span> waehlen.
        </div>
      )}
    </div>
  )
}
