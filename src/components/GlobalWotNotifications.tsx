/**
 * GlobalWotNotifications — global mounted Listener fuer eingehende
 * WoT-SignedClaims. Zeigt Toasts bei:
 *
 *   - Neuer Attestation (jemand hat dir eine Bestaetigung gegeben)
 *     - Skill-Attestation: "Bestaetigung von <Name>: Skill X auf Tier Y"
 *     - Andere Attestation: "Bestaetigung von <Name>: <claim>"
 *
 *   - Neuer Mutual-Verifikation (beide haben sich verifiziert)
 *     - "Du und <Name> seid jetzt verifizierte Kontakte"
 *
 * Erkennt Neuigkeit durch Tracking der gesehenen Claim-IDs. Beim
 * ersten Mount: alle existierenden Claims werden als "schon gesehen"
 * markiert — Konfetti gibt's nur fuer wirklich neue Eintraege.
 *
 * Stand 14.05.2026 spaet abends.
 */

import { useEffect, useRef, useState } from "react"
import { useClaims, useContacts, useCurrentUser } from "@real-life-stack/toolkit"
import { Award, Users, X } from "lucide-react"
import {
  SKILL_CLAIM_TAG,
  tierFromClaimTags,
} from "../modules/gamification/use-skill-attestation"
import { TIER_BY_ID } from "../modules/gamification/skill-system"

interface ToastEntry {
  id: string
  kind: "attestation" | "mutual"
  title: string
  subtitle: string
  iconColor: string
}

export function GlobalWotNotifications() {
  const { data: currentUser } = useCurrentUser()
  const { attestations, supported, getVerificationStatus } = useClaims()
  const { activeContacts } = useContacts()
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const seenAttestations = useRef<Set<string>>(new Set())
  const seenMutuals = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)

  // Listener fuer eingehende Attestationen
  useEffect(() => {
    if (!supported || !currentUser?.id) return

    const myAttestations = attestations.filter(
      (c) => c.to === currentUser.id
    )

    if (!initializedRef.current) {
      myAttestations.forEach((c) => seenAttestations.current.add(c.id))
      activeContacts.forEach((contact) => {
        if (getVerificationStatus(contact.id) === "mutual") {
          seenMutuals.current.add(contact.id)
        }
      })
      initializedRef.current = true
      return
    }

    for (const claim of myAttestations) {
      if (seenAttestations.current.has(claim.id)) continue
      seenAttestations.current.add(claim.id)

      const fromContact = activeContacts.find((c) => c.id === claim.from)
      const fromName = fromContact?.name ?? "Jemand im Netz"

      if (claim.tags?.includes(SKILL_CLAIM_TAG)) {
        const tier = tierFromClaimTags(claim.tags)
        const tierName = tier ? TIER_BY_ID[tier].name : "kann"
        pushToast({
          id: claim.id,
          kind: "attestation",
          title: `Bestaetigung von ${fromName}`,
          subtitle: `Skill "${claim.claim}" — Tier ${tierName}`,
          iconColor: "#10B981",
        })
      } else {
        pushToast({
          id: claim.id,
          kind: "attestation",
          title: `Attestation von ${fromName}`,
          subtitle: claim.claim,
          iconColor: "#A855F7",
        })
      }
    }
  }, [attestations, activeContacts, currentUser?.id, supported, getVerificationStatus])

  // Listener fuer neue Mutual-Verifikationen
  useEffect(() => {
    if (!supported || !currentUser?.id || !initializedRef.current) return

    for (const contact of activeContacts) {
      const status = getVerificationStatus(contact.id)
      if (status === "mutual" && !seenMutuals.current.has(contact.id)) {
        seenMutuals.current.add(contact.id)
        pushToast({
          id: `mutual-${contact.id}`,
          kind: "mutual",
          title: "Gegenseitig verifiziert",
          subtitle: `Du und ${contact.name ?? "ein Kontakt"} habt euch verbunden.`,
          iconColor: "#F59E0B",
        })
      }
    }
  }, [activeContacts, currentUser?.id, supported, getVerificationStatus])

  function pushToast(t: ToastEntry) {
    setToasts((prev) => [...prev, t])
    // Auto-dismiss nach 8 Sekunden
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, 8000)
  }

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = t.kind === "mutual" ? Users : Award
        return (
          <div
            key={t.id}
            className="bg-card rounded-xl shadow-lg border p-3 flex items-start gap-3 pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-300"
          >
            <Icon
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: t.iconColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {t.title}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {t.subtitle}
              </div>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Benachrichtigung schliessen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
