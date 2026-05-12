import { useMemo, useState } from "react"
import { Crown, Shield, User as UserIcon, ChevronDown, Loader2, ShieldCheck, Users } from "lucide-react"
import {
  useMembers,
  useCurrentUser,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@real-life-stack/toolkit"
import type { ModuleViewProps } from "../registry"
import { useGroupRoles } from "../../groups/use-roles"
import {
  type SpaceRole,
  type SpaceRoleAssignable,
  roleLabel,
} from "../../groups/roles"
import { useReputationMap, trustLabel } from "../gamification"

/**
 * MembersView — Mitglieder + Rollen-Verwaltung.
 *
 * Zeigt fuer den aktiven Space alle Mitglieder mit ihrer Rolle:
 *   - Owner (Crown, gold)         — implizit, kann nicht geaendert werden
 *   - Admin (Shield, primary)     — explizit aus group.data.roles
 *   - Member (User-Icon, muted)   — Default
 *
 * Wenn der current User Admin (oder Owner) ist, kann er Member ↔ Admin
 * promoten/demoten. Owner-Eintrag ist read-only.
 */

export function MembersView({ spaceId, activeGroup }: ModuleViewProps) {
  const { data: members } = useMembers(spaceId)
  const { data: currentUser } = useCurrentUser()
  const { roleOf, isAdmin, setRole, busy, error } = useGroupRoles(spaceId)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const memberIds = useMemo(() => members.map((m) => m.id), [members])
  const reputationMap = useReputationMap(memberIds)

  const sortedMembers = useMemo(() => {
    if (!members.length) return []
    const order: Record<SpaceRole, number> = { owner: 0, admin: 1, member: 2 }
    return [...members].sort((a, b) => {
      const ra = order[roleOf(a.id)]
      const rb = order[roleOf(b.id)]
      if (ra !== rb) return ra - rb
      return (a.displayName ?? a.id).localeCompare(b.displayName ?? b.id)
    })
  }, [members, roleOf])

  if (!activeGroup) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Bitte ein Netzwerk waehlen, um Mitglieder zu sehen.
      </div>
    )
  }

  const handleChange = async (did: string, next: SpaceRoleAssignable) => {
    setPendingId(did)
    try {
      await setRole(did, next)
    } catch {
      // Fehler wird unten via `error` angezeigt
    } finally {
      setPendingId(null)
    }
  }

  // Rollen-Stats
  const ownerCount = sortedMembers.filter((m) => roleOf(m.id) === "owner").length
  const adminCount = sortedMembers.filter((m) => roleOf(m.id) === "admin").length
  const memberCount = sortedMembers.filter((m) => roleOf(m.id) === "member").length

  // Hoechster Trust-Score
  const maxTrust = useMemo(() => {
    let max = 0
    for (const m of sortedMembers) {
      const t = reputationMap[m.id]?.trustScore ?? 0
      if (t > max) max = t
    }
    return max
  }, [sortedMembers, reputationMap])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Stats-Hero */}
      <div
        className="rounded-xl border p-4 md:p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(232,117,26,0.05) 0%, rgba(251,191,36,0.04) 50%, rgba(168,85,247,0.04) 100%)",
        }}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center text-white shadow shrink-0"
            style={{ background: "linear-gradient(135deg, #E8751A, #FBBF24)" }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{activeGroup.name}</h1>
            <p className="text-[11px] text-muted-foreground">
              {isAdmin
                ? "Du bist Admin — du kannst Mitglieder zu Admins ernennen."
                : "Nur Admins koennen Rollen aendern."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-card border font-semibold">
            {sortedMembers.length} insgesamt
          </span>
          {ownerCount > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
              style={{ background: "#FBBF24", color: "#78350F" }}
            >
              <Crown className="h-3 w-3" />
              {ownerCount} Owner
            </span>
          )}
          {adminCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {adminCount} Admin{adminCount === 1 ? "" : "s"}
            </span>
          )}
          {memberCount > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {memberCount} Member
            </span>
          )}
          {maxTrust > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1" title={`Hoechster Trust-Score: ${maxTrust}`}>
              <ShieldCheck className="h-3 w-3" />
              Top Trust {maxTrust}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          {sortedMembers.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Noch keine Mitglieder.
            </div>
          )}

          {sortedMembers.map((member) => {
            const role = roleOf(member.id)
            const isMe = member.id === currentUser?.id
            const canEdit = isAdmin && role !== "owner" && !isMe
            const isPending = pendingId === member.id

            const rep = reputationMap[member.id]
            return (
              <MemberRow
                key={member.id}
                name={member.displayName || shortDid(member.id)}
                did={member.id}
                avatarUrl={member.avatarUrl}
                role={role}
                isMe={isMe}
                canEdit={canEdit}
                pending={isPending && busy}
                trustScore={rep?.trustScore ?? 0}
                onChange={(next) => handleChange(member.id, next)}
              />
            )
          })}

          {error && (
            <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded px-2 py-1.5">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-[11px] text-muted-foreground/70 px-2">
        💡 Owner ist immer das erste Mitglied im Netzwerk — die Rolle kann nicht
        geaendert werden. Admins koennen Module konfigurieren, andere Mitglieder
        promoten und Demo-Daten laden.
      </div>
    </div>
  )
}

// ============================================================
// MemberRow
// ============================================================

interface MemberRowProps {
  name: string
  did: string
  avatarUrl?: string
  role: SpaceRole
  isMe: boolean
  canEdit: boolean
  pending: boolean
  trustScore: number
  onChange: (next: SpaceRoleAssignable) => void
}

function MemberRow({ name, did, avatarUrl, role, isMe, canEdit, pending, trustScore, onChange }: MemberRowProps) {
  return (
    <div className="flex items-center gap-3 p-2 border rounded-md bg-card">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xs font-semibold text-muted-foreground">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Name + DID */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {name}
          {isMe && <span className="ml-1 text-[10px] text-muted-foreground">(du)</span>}
        </div>
        <code className="text-[10px] text-muted-foreground truncate block">
          {shortDid(did)}
        </code>
      </div>

      {/* Trust-Badge — nur wenn Score > 0 */}
      {trustScore > 0 && (
        <div
          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 shrink-0"
          title={`${trustLabel(trustScore)} (${trustScore})`}
        >
          <ShieldCheck className="h-2.5 w-2.5" />
          <span className="font-semibold">{trustScore}</span>
        </div>
      )}

      {/* Rolle */}
      <RoleSelector role={role} canEdit={canEdit} pending={pending} onChange={onChange} />
    </div>
  )
}

function RoleSelector({
  role,
  canEdit,
  pending,
  onChange,
}: {
  role: SpaceRole
  canEdit: boolean
  pending: boolean
  onChange: (next: SpaceRoleAssignable) => void
}) {
  const [open, setOpen] = useState(false)

  if (!canEdit) {
    return (
      <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border bg-muted/30 shrink-0">
        <RoleIcon role={role} />
        <span>{roleLabel(role)}</span>
      </div>
    )
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border hover:bg-muted/50 transition-colors"
        disabled={pending}
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RoleIcon role={role} />}
        <span>{roleLabel(role)}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-popover border rounded-md shadow-md min-w-32 py-1">
            <RoleOption
              role="admin"
              active={role === "admin"}
              onClick={() => {
                setOpen(false)
                onChange("admin")
              }}
            />
            <RoleOption
              role="member"
              active={role === "member"}
              onClick={() => {
                setOpen(false)
                onChange("member")
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function RoleOption({
  role,
  active,
  onClick,
}: {
  role: "admin" | "member"
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted ${
        active ? "bg-muted font-medium" : ""
      }`}
    >
      <RoleIcon role={role} />
      <span>{roleLabel(role)}</span>
    </button>
  )
}

function RoleIcon({ role }: { role: SpaceRole }) {
  switch (role) {
    case "owner":
      return <Crown className="h-3 w-3 text-amber-500" />
    case "admin":
      return <Shield className="h-3 w-3 text-primary" />
    case "member":
      return <UserIcon className="h-3 w-3 text-muted-foreground" />
  }
}

function shortDid(did: string): string {
  if (did.length <= 22) return did
  return `${did.slice(0, 14)}…${did.slice(-6)}`
}
