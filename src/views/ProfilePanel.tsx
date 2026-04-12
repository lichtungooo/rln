import { useEffect, useRef, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { Button, useItems } from '@real-life-stack/toolkit'
import {
  X,
  User,
  Sparkles,
  Calendar,
  Image,
  Users,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  MessageCircle,
  Shield,
  UserPlus,
} from 'lucide-react'
import { MarkdownContent } from '@/components/MarkdownContent'

interface ProfilePanelProps {
  profileId?: string
  onClose: () => void
}

interface Section {
  id: string
  label: string
  icon: typeof User
}

const sections: Section[] = [
  { id: 'about', label: 'Über mich', icon: User },
  { id: 'offers-needs', label: 'Offers & Needs', icon: Sparkles },
  { id: 'events', label: 'Veranstaltungen', icon: Calendar },
  { id: 'photos', label: 'Fotos', icon: Image },
  { id: 'connections', label: 'Verbindungen', icon: Users },
  { id: 'contact', label: 'Kontakt', icon: Mail },
]

export function ProfilePanel({ profileId, onClose }: ProfilePanelProps) {
  const { data: profiles } = useItems({ type: 'profile' })
  const { data: events } = useItems({ type: 'event' })

  const profile = profileId
    ? profiles.find((p) => p.id === profileId)
    : profiles[0]

  const [activeSection, setActiveSection] = useState('about')
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const threshold = containerRect.top + 80

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[sections[i].id]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= threshold) {
            setActiveSection(sections[i].id)
            return
          }
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id]
    const container = scrollRef.current
    if (!el || !container) return
    const offset = el.offsetTop - container.offsetTop
    container.scrollTo({ top: offset, behavior: 'smooth' })
    setActiveSection(id)
  }

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
        <p className="text-sm text-muted-foreground">Kein Profil gefunden.</p>
      </div>
    )
  }

  const data = profile.data
  const name = String(data.name ?? 'Ohne Namen')
  const pseudonym = data.pseudonym as string | undefined
  const bio = data.bio as string | undefined
  const avatar = data.avatar as string | undefined
  const aboutMe = data.aboutMe as string | undefined
  const offers = (data.offers as string[] | undefined) ?? []
  const needs = (data.needs as string[] | undefined) ?? []
  const skills = (data.skills as string[] | undefined) ?? []
  const photos = (data.photos as string[] | undefined) ?? []
  const rawLocation = data.location
  const location =
    typeof rawLocation === 'string'
      ? rawLocation
      : rawLocation && typeof rawLocation === 'object' && 'lat' in rawLocation
        ? undefined
        : undefined
  const contact = data.contact as
    | { email?: string; phone?: string; telegram?: string }
    | undefined

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
      {/* Kopfbereich */}
      <div className="shrink-0">
        {/* Drag-Handle */}
        <div className="panel-drag-handle flex h-3 cursor-move items-center justify-center">
          <div className="h-1 w-8 rounded-full bg-border/60" />
        </div>

        {/* Avatar + Name + Bio */}
        <div className="flex items-start gap-3 px-4 pb-2">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-border/40 shadow-sm">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold text-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="truncate text-base font-semibold leading-tight text-foreground">
                {name}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title="Schließen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {pseudonym && (
              <p className="truncate text-xs text-muted-foreground">{pseudonym}</p>
            )}
            {bio && (
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">
                {bio}
              </p>
            )}
            {location && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs — sticky */}
        <div className="sticky top-0 z-10 border-y border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-wrap gap-0.5 px-2 py-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Scrollbarer Inhalt */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">

        {/* ── Über mich ── */}
        <section
          ref={(el) => { sectionRefs.current.about = el }}
          className="min-h-[70%] border-b border-border/30 px-4 py-4"
        >
          <SectionTitle icon={User} label="Über mich" />
          {aboutMe ? (
            <div className="text-sm leading-relaxed">
              <MarkdownContent markdown={aboutMe} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Noch nichts erzählt.</p>
          )}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Offers & Needs ── */}
        <section
          ref={(el) => { sectionRefs.current['offers-needs'] = el }}
          className="min-h-[70%] border-b border-border/30 bg-muted/25 px-4 py-4"
        >
          <SectionTitle icon={Sparkles} label="Offers & Needs" />
          <div className="space-y-4">
            {offers.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-green-700">
                  Was ich gebe
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {offers.map((offer, i) => (
                    <Hashtag key={i} label={offer} variant="offer" />
                  ))}
                </div>
              </div>
            )}
            {needs.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-orange-700">
                  Was ich suche
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {needs.map((need, i) => (
                    <Hashtag key={i} label={need} variant="need" />
                  ))}
                </div>
              </div>
            )}
            {offers.length === 0 && needs.length === 0 && (
              <p className="text-xs text-muted-foreground">Noch keine Offers oder Needs.</p>
            )}
          </div>
        </section>

        {/* ── Veranstaltungen ── */}
        <section
          ref={(el) => { sectionRefs.current.events = el }}
          className="min-h-[70%] border-b border-border/30 px-4 py-4"
        >
          <SectionTitle icon={Calendar} label="Veranstaltungen" />
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <EventMiniCard key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Keine Veranstaltungen freigegeben.
            </p>
          )}
        </section>

        {/* ── Fotos ── */}
        <section
          ref={(el) => { sectionRefs.current.photos = el }}
          className="min-h-[70%] border-b border-border/30 bg-muted/25 px-4 py-4"
        >
          <SectionTitle icon={Image} label="Fotos" />
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-xl bg-muted shadow-sm"
                >
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Keine Fotos.</p>
          )}
        </section>

        {/* ── Verbindungen ── */}
        <section
          ref={(el) => { sectionRefs.current.connections = el }}
          className="min-h-[70%] border-b border-border/30 px-4 py-4"
        >
          <SectionTitle icon={Users} label="Verbindungen" />
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Das Trust-Netzwerk zeigt die Menschen, mit denen ich verbunden bin.
              Jede Verbindung wächst durch echte Begegnung.
            </p>

            {/* Verbindungs-Vorschau */}
            <div className="space-y-2">
              {profiles.filter((p: { id: string }) => p.id !== profile.id).map((p: { id: string; data: Record<string, unknown> }) => {
                const pName = String(p.data.name ?? 'Unbekannt')
                const pAvatar = p.data.avatar as string | undefined
                const pBio = p.data.bio as string | undefined
                const pLocation = typeof p.data.location === 'string' ? p.data.location : undefined
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-3 py-2.5 transition hover:bg-background/80"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/30">
                      {pAvatar ? (
                        <img src={pAvatar} alt={pName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold">
                          {pName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{pName}</p>
                      {pBio && (
                        <p className="truncate text-[11px] text-muted-foreground">{pBio}</p>
                      )}
                      {pLocation && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{pLocation}</span>
                        </div>
                      )}
                    </div>
                    <Shield className="h-4 w-4 shrink-0 text-green-600" />
                  </div>
                )
              })}
            </div>

            {/* Trust-Info */}
            <div className="rounded-xl border border-border/30 bg-muted/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-foreground">Vertrauensstufe</p>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Verbindungen im Real Life Network entstehen durch echte Begegnungen.
                Je mehr gemeinsame Erlebnisse, desto stärker das Band.
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Verbindung anfragen
            </button>
          </div>
        </section>

        {/* ── Kontakt ── */}
        <section
          ref={(el) => { sectionRefs.current.contact = el }}
          className="min-h-[70%] bg-muted/25 px-4 py-4"
        >
          <SectionTitle icon={Mail} label="Kontakt" />
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Kontaktwege, die dieser Mensch mit dir teilt.
              Die Sichtbarkeit richtet sich nach der Vertrauensstufe.
            </p>

            <div className="space-y-2">
              {contact?.email && (
                <ContactRow
                  icon={Mail}
                  label="E-Mail"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
              )}
              {contact?.phone && (
                <ContactRow
                  icon={Phone}
                  label="Telefon"
                  value={contact.phone}
                  href={`tel:${contact.phone}`}
                />
              )}
              {contact?.telegram && (
                <ContactRow
                  icon={MessageCircle}
                  label="Telegram"
                  value={`@${contact.telegram}`}
                  href={`https://t.me/${contact.telegram}`}
                />
              )}
            </div>

            {(!contact || !Object.values(contact).some(Boolean)) && (
              <div className="rounded-xl border border-border/30 bg-background/60 px-3 py-3 text-center">
                <Mail className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Noch keine Kontaktwege freigegeben.
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Kontaktwege werden sichtbar, sobald eine Verbindung besteht.
                </p>
              </div>
            )}

            {/* Trust-Hinweis */}
            <div className="rounded-xl border border-dashed border-border/40 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">
                  Im Real Life Network bestimmt jeder Mensch selbst, wer welche
                  Kontaktwege sehen darf. Die Freigabe folgt der Vertrauensstufe
                  im Web of Trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Puffer am Ende */}
        <div className="h-8" />
      </div>
    </div>
  )
}

// ─── Hilfskomponenten ───

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: typeof User
  label: string
}) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
        {label}
      </h3>
    </div>
  )
}

function Hashtag({
  label,
  variant,
}: {
  label: string
  variant: 'offer' | 'need'
}) {
  const colors =
    variant === 'offer'
      ? 'bg-green-100 text-green-800 hover:bg-green-200'
      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'

  return (
    <button
      type="button"
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${colors}`}
    >
      #{label}
    </button>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-3 py-2.5 transition hover:bg-background/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  )
}

function EventMiniCard({ event }: { event: Item }) {
  const start = event.data.start ? new Date(String(event.data.start)) : null
  const title = String(event.data.title ?? 'Ohne Titel')
  const loc = typeof event.data.location === 'string' ? event.data.location : undefined
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/60 px-3 py-2.5 transition hover:bg-background/80">
      {start && (
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-[8px] font-semibold uppercase leading-none">
            {start.toLocaleDateString('de-DE', { month: 'short' })}
          </span>
          <span className="text-sm font-bold leading-none">
            {start.getDate()}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {loc && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5" />
            <span className="truncate">{loc}</span>
          </div>
        )}
      </div>
    </li>
  )
}
