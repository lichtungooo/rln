/**
 * HomeView — globale Startseite, ueber alle Spaces.
 *
 * Klick aufs Haeuschen-Icon in der Topbar oeffnet diese Sicht. Im Gegensatz zum
 * Dashboard-Modul (das pro Space liegt) ist Home identitaets-bezogen — es zeigt
 * Werkzeuge, die immer zur Hand sein muessen, egal in welchem Space man gerade
 * arbeitet.
 *
 * Phase H1 (Stub): Greeting + Handshake-Karte als Platzhalter.
 * Phase H2: Schnellzugriff-Sektion (Profil, neue Begegnung, Module suchen).
 * Phase H3: Echter Handshake (QR, NFC, Web-of-Trust-Bestaetigung).
 */

import { useMemo } from 'react'
import { QrCode, Smartphone, ArrowRight, ShieldCheck, Users } from 'lucide-react'

export interface HomeContact {
  id: string
  name?: string
  avatar?: string
  /** ISO-Timestamp wenn ueber Handshake verifiziert */
  verifiedAt?: string
}

interface HomeViewProps {
  userName: string
  /** Klick auf eine Schnell-Aktion soll Home schliessen und navigieren */
  onClose: () => void
  /** Handshake starten — oeffnet den Verifikations-Dialog (QR zeigen + scannen) */
  onStartHandshake: () => void
  /** True wenn aktiver Connector signierte Claims unterstuetzt + User authentifiziert */
  handshakeReady: boolean
  /** Hinweis warum Handshake aktuell blockiert (gezeigt unter dem Knopf wenn !ready) */
  handshakeBlockedHint?: string
  /** Liste verbundener Kontakte (verifiziert + unverifiziert, Status active) */
  contacts?: HomeContact[]
  /** Klick auf "Alle anzeigen" oder eine einzelne Karte */
  onOpenContacts?: () => void
}

const HOME_CONTACTS_PREVIEW = 6

export function HomeView({
  userName,
  onStartHandshake,
  handshakeReady,
  handshakeBlockedHint,
  contacts = [],
  onOpenContacts,
}: HomeViewProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Tiefe Nacht'
    if (hour < 11) return 'Guten Morgen'
    if (hour < 14) return 'Guten Tag'
    if (hour < 18) return 'Guten Nachmittag'
    if (hour < 22) return 'Guten Abend'
    return 'Schoene Nacht'
  }, [])

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      {/* Greeting */}
      <header className="pt-2">
        <h1 className="text-2xl font-bold leading-tight">
          {greeting}, {userName}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daheim im Real Life Network.
        </p>
      </header>

      {/* Handshake-Karte — Hero */}
      <section
        aria-labelledby="handshake-title"
        className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <QrCode className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="handshake-title"
              className="text-lg font-semibold text-foreground"
            >
              Begegnung
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tausche QR oder NFC mit jemandem, den du gerade triffst.
              Vertrauen wird auf beiden Geraeten verankert.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <HandshakeChannel
            icon={QrCode}
            label="QR-Code"
            hint="Zeigen oder scannen"
          />
          <HandshakeChannel
            icon={Smartphone}
            label="NFC"
            hint="Handys aneinander"
          />
        </div>

        <button
          type="button"
          onClick={onStartHandshake}
          disabled={!handshakeReady}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Handshake starten
          <ArrowRight className="h-4 w-4" />
        </button>

        {!handshakeReady && handshakeBlockedHint && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {handshakeBlockedHint}
          </p>
        )}

        {handshakeReady && contacts.length > 0 && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {contacts.length === 1
              ? 'Ein Mensch bereits verbunden.'
              : `${contacts.length} Menschen bereits verbunden.`}
          </p>
        )}
      </section>

      {/* Vertrauensnetz — Kontakt-Karten */}
      {contacts.length > 0 && (
        <ContactsSection
          contacts={contacts}
          onOpenContacts={onOpenContacts}
        />
      )}

      {/* Hinweis auf weitere Schnellzugriffe */}
      <section className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 text-center">
        <p className="text-sm text-foreground">
          Hier waechst dein Heim.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Schnellzugriffe, Discovery, dein Dashboard — alles auf einen
          Griff. Bald.
        </p>
      </section>
    </div>
  )
}

interface HandshakeChannelProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint: string
}

function HandshakeChannel({ icon: Icon, label, hint }: HandshakeChannelProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-background/60 p-3 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  )
}

interface ContactsSectionProps {
  contacts: HomeContact[]
  onOpenContacts?: () => void
}

function ContactsSection({ contacts, onOpenContacts }: ContactsSectionProps) {
  // Verifizierte zuerst, dann nach Name sortiert
  const sorted = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aVerified = Boolean(a.verifiedAt)
      const bVerified = Boolean(b.verifiedAt)
      if (aVerified !== bVerified) return aVerified ? -1 : 1
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
  }, [contacts])

  const preview = sorted.slice(0, HOME_CONTACTS_PREVIEW)
  const hasMore = sorted.length > HOME_CONTACTS_PREVIEW

  return (
    <section aria-labelledby="contacts-title" className="space-y-3">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2
            id="contacts-title"
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Vertrauensnetz · {contacts.length}
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {preview.map((c) => (
          <ContactCard
            key={c.id}
            contact={c}
            onClick={onOpenContacts}
          />
        ))}
      </div>

      {(hasMore || onOpenContacts) && (
        <button
          type="button"
          onClick={onOpenContacts}
          disabled={!onOpenContacts}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          {hasMore
            ? `Alle ${contacts.length} anzeigen`
            : 'Kontakte verwalten'}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  )
}

interface ContactCardProps {
  contact: HomeContact
  onClick?: () => void
}

function ContactCard({ contact, onClick }: ContactCardProps) {
  const initial = (contact.name ?? '?').trim().slice(0, 1).toUpperCase() || '?'
  const isVerified = Boolean(contact.verifiedAt)
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl border bg-card p-2.5 text-center transition ${
        onClick ? 'hover:bg-muted/60 cursor-pointer' : ''
      } ${isVerified ? 'border-primary/30' : 'border-border/60'}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
          isVerified ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
        }`}
      >
        {contact.avatar ? (
          <img
            src={contact.avatar}
            alt={contact.name ?? 'Kontakt'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-base font-semibold">{initial}</span>
        )}
      </div>
      <div className="min-w-0 w-full text-xs font-medium text-foreground line-clamp-1">
        {contact.name ?? 'Unbenannt'}
      </div>
      {isVerified && (
        <ShieldCheck
          className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-primary"
          aria-label="Verifiziert"
        />
      )}
    </Wrapper>
  )
}
