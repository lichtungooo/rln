import { useEffect, useRef, useState } from 'react'
import type { Item } from '@real-life-stack/data-interface'
import { Button, useItems } from '@real-life-stack/toolkit'
import {
  X,
  User,
  Sparkles,
  HandHeart,
  Calendar,
  Image,
  Users,
  Mail,
  MapPin,
  Phone,
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
  { id: 'offers', label: 'Offers', icon: Sparkles },
  { id: 'needs', label: 'Needs', icon: HandHeart },
  { id: 'events', label: 'Veranstaltungen', icon: Calendar },
  { id: 'photos', label: 'Fotos', icon: Image },
  { id: 'connections', label: 'Verbindungen', icon: Users },
  { id: 'contact', label: 'Kontakt', icon: Mail },
]

export function ProfilePanel({ profileId, onClose }: ProfilePanelProps) {
  const { data: profiles } = useItems({ type: 'profile' })
  const { data: events } = useItems({ type: 'event' })

  // Wenn keine ID übergeben wird, zeigen wir das erste Profil (das eigene).
  const profile = profileId
    ? profiles.find((p) => p.id === profileId)
    : profiles[0]

  const [activeSection, setActiveSection] = useState('about')
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Scroll-Spy: setze activeSection, wenn der Nutzer scrollt
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const threshold = 80
      // Von unten nach oben durchgehen — das letzte Abschnitt, dessen Top über
      // dem Threshold liegt, ist das aktive.
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[sections[i].id]
        if (el && el.offsetTop - threshold <= scrollTop) {
          setActiveSection(sections[i].id)
          return
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
    container.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' })
    setActiveSection(id)
  }

  if (!profile) {
    return (
      <div className="flex h-[70vh] w-[24rem] items-center justify-center rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
        <p className="text-sm text-muted-foreground">Kein Profil gefunden.</p>
      </div>
    )
  }

  const data = profile.data
  const name = String(data.name ?? 'Ohne Namen')
  const pseudonym = data.pseudonym as string | undefined
  const bio = data.bio as string | undefined
  const avatar = data.avatar as string | undefined
  const cover = data.cover as string | undefined
  const aboutMe = data.aboutMe as string | undefined
  const offers = (data.offers as string[] | undefined) ?? []
  const needs = (data.needs as string[] | undefined) ?? []
  const skills = (data.skills as string[] | undefined) ?? []
  const photos = (data.photos as string[] | undefined) ?? []
  const location = data.location as string | undefined
  const contact = data.contact as
    | { email?: string; phone?: string; telegram?: string }
    | undefined

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur-md">
      {/* Fester Kopf */}
      <div className="shrink-0">
        {/* Coverbild — dient als Drag-Handle für das Raster */}
        <div className="panel-drag-handle relative h-24 w-full cursor-move overflow-hidden">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/60" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white"
            title="Schließen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="-mt-10 px-5 pb-3">
          <div className="flex items-end gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-background shadow-md">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-semibold text-foreground">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h2 className="truncate text-lg font-semibold leading-tight text-foreground">
                {name}
              </h2>
              {pseudonym && (
                <p className="truncate text-xs text-muted-foreground">
                  {pseudonym}
                </p>
              )}
            </div>
          </div>
          {bio && (
            <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
          )}
          {location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Reiter-Leiste, sticky */}
        <div className="overflow-x-auto border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="flex min-w-max items-center gap-1 px-2 py-1.5">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
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
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-6"
      >
        {/* Über mich */}
        <section
          ref={(el) => {
            sectionRefs.current.about = el
          }}
        >
          <SectionTitle icon={User} label="Über mich" />
          {aboutMe ? (
            <MarkdownContent markdown={aboutMe} />
          ) : (
            <p className="text-sm text-muted-foreground">Noch nichts erzählt.</p>
          )}
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Offers */}
        <section
          ref={(el) => {
            sectionRefs.current.offers = el
          }}
        >
          <SectionTitle icon={Sparkles} label="Offers — was ich gebe" />
          {offers.length > 0 ? (
            <ul className="space-y-2">
              {offers.map((offer, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-foreground"
                >
                  {offer}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Offers.</p>
          )}
        </section>

        {/* Needs */}
        <section
          ref={(el) => {
            sectionRefs.current.needs = el
          }}
        >
          <SectionTitle icon={HandHeart} label="Needs — was ich suche" />
          {needs.length > 0 ? (
            <ul className="space-y-2">
              {needs.map((need, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-foreground"
                >
                  {need}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Needs.</p>
          )}
        </section>

        {/* Veranstaltungen */}
        <section
          ref={(el) => {
            sectionRefs.current.events = el
          }}
        >
          <SectionTitle icon={Calendar} label="Veranstaltungen" />
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.slice(0, 3).map((event) => (
                <EventMiniCard key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Keine Veranstaltungen freigegeben.
            </p>
          )}
        </section>

        {/* Fotos */}
        <section
          ref={(el) => {
            sectionRefs.current.photos = el
          }}
        >
          <SectionTitle icon={Image} label="Fotos" />
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Fotos.</p>
          )}
        </section>

        {/* Verbindungen */}
        <section
          ref={(el) => {
            sectionRefs.current.connections = el
          }}
        >
          <SectionTitle icon={Users} label="Verbindungen" />
          <p className="text-sm text-muted-foreground">
            Das Trust-Netzwerk zeigt hier bald die Menschen, mit denen ich
            verbunden bin.
          </p>
        </section>

        {/* Kontakt */}
        <section
          ref={(el) => {
            sectionRefs.current.contact = el
          }}
        >
          <SectionTitle icon={Mail} label="Kontakt" />
          {contact && Object.values(contact).some(Boolean) ? (
            <ul className="space-y-2">
              {contact.email && (
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary underline"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Noch keine Kontaktwege freigegeben.
            </p>
          )}
        </section>

        {/* Puffer am Ende, damit die letzte Sektion im Scroll-Spy erreicht wird */}
        <div className="h-8" />
      </div>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: typeof User
  label: string
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {label}
      </h3>
    </div>
  )
}

function EventMiniCard({ event }: { event: Item }) {
  const start = event.data.start ? new Date(String(event.data.start)) : null
  const title = String(event.data.title ?? 'Ohne Titel')
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-2">
      {start && (
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
          <span className="text-[9px] font-semibold uppercase">
            {start.toLocaleDateString('de-DE', { month: 'short' })}
          </span>
          <span className="text-sm font-bold leading-none">
            {start.getDate()}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
      </div>
    </li>
  )
}
