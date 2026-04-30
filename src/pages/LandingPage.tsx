import {
  Map,
  Calendar,
  Users,
  TreePine,
  Compass,
  Shield,
  Heart,
  ScrollText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Hammer,
  Sun,
} from 'lucide-react'

/**
 * RLN-Landing — was lebt auf real-life.network/.
 *
 * Vorbild: Antons Web-of-Trust-Landing. Aufbau:
 *   1. Header mit Logo + Nav
 *   2. Hero (Claim + Sub + 2 CTAs)
 *   3. Was ist RLN (drei Saeulen)
 *   4. Module-Uebersicht (9 Module)
 *   5. Spaces-Showcase (Macher, Lichtung)
 *   6. CTA-Block
 *   7. Footer
 */

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const MODULES = [
  { icon: Shield, label: 'Trust', desc: 'Identitaet im echten Leben — 12 Worte, dezentral, in deiner Hand' },
  { icon: Users, label: 'Profile', desc: 'Kuratierter Raum, Sichtbarkeit pro Inhalt waehlbar' },
  { icon: Compass, label: 'Dashboard', desc: 'Privater Spiegel mit Widgets und Puls' },
  { icon: Map, label: 'Karte', desc: 'Orte, Menschen, Events — raeumlicher Anker' },
  { icon: Calendar, label: 'Kalender', desc: 'Persoenlich, Space, Quest — eine Zeit, drei Sichten' },
  { icon: TreePine, label: 'Gamification', desc: 'Faehigkeitenbaum, Avatar, Quests — wachsen, was waechst' },
  { icon: ScrollText, label: 'Log', desc: 'Spiegel der Reise, chronologisch und gefiltert' },
  { icon: MessageSquare, label: 'Notifications', desc: 'Stimmen zwischen Menschen, mehrkanalig' },
  { icon: Heart, label: 'Wertschoepfung', desc: 'Begabung × Beduerfnis × Begegnung' },
]

const SPACES = [
  {
    slug: 'macher',
    name: 'Macher',
    color: '#E8751A',
    tagline: 'Werkzeugkasten fuer Handwerk und Community',
    desc: 'Werkstaetten, Macher und Abenteuer auf einer Karte. Skill-Tree, Gamification, echte Begegnungen.',
    inApp: '/macher',
  },
  {
    slug: 'lichtung',
    name: 'Lichtung',
    color: '#D4AF37',
    tagline: 'Globale Friedensbewegung',
    desc: 'Licht-Pins auf der Weltkarte, Lichtungen als physische Orte, Verbindungskunst und Meditation.',
    inApp: '/lichtung',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-bg text-ink font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-ink-ghost" style={{ background: 'rgba(250,248,245,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8751A' }}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Real Life Network</span>
            </a>
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#was-ist" className="hidden md:block text-sm font-medium text-ink-soft hover:text-gold transition-colors">Vision</a>
              <a href="#module" className="hidden md:block text-sm font-medium text-ink-soft hover:text-gold transition-colors">Module</a>
              <a href="#spaces" className="hidden md:block text-sm font-medium text-ink-soft hover:text-gold transition-colors">Spaces</a>
              <a href="https://github.com/lichtungooo/rln" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-ink-faint rounded-lg hover:border-gold hover:text-gold transition-colors">
                <GitHubIcon size={16} />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="min-h-screen flex items-center pt-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(232,117,26,0.08) 0%, rgba(250,248,245,1) 50%, rgba(212,175,55,0.06) 100%)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: 'rgba(232,117,26,0.1)', color: '#E8751A' }}>
                <Sparkles className="h-3.5 w-3.5" />
                Open Source — MIT — Web of Trust
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                Werkzeuge fuer{' '}
                <span style={{ color: '#E8751A' }}>echte Begegnung</span>
              </h1>

              <p className="text-xl text-ink-soft leading-relaxed max-w-2xl mx-auto mb-10">
                Das Real Life Network ist der digitale Werkzeugkasten, der Menschen
                in die Realitaet fuehrt. Identitaet beim Menschen, Vertrauen aus
                Begegnung, Spaces fuer eigene Welten.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <a
                  href="/macher"
                  className="px-8 py-4 text-white font-semibold rounded-lg transition-colors text-lg shadow-lg"
                  style={{ background: '#E8751A' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#C4620A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#E8751A'}
                >
                  Macher-Space erleben →
                </a>
                <a href="#was-ist" className="px-6 py-3 border border-ink-faint font-medium rounded-lg hover:border-gold hover:text-gold transition-colors">
                  Was ist das
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {[
                  { icon: Shield, label: 'Identitaet beim Menschen' },
                  { icon: Heart, label: 'Begegnung im echten Leben' },
                  { icon: Compass, label: 'Spaces fuer eigene Welten' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2 text-ink-soft">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,117,26,0.1)' }}>
                      <item.icon size={22} style={{ color: '#E8751A' }} />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Was ist RLN */}
        <section id="was-ist" className="py-24 bg-warm-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Drei Wege, eine Bewegung
              </h2>
              <p className="text-lg text-ink-soft">
                Das Real Life Network steht auf drei tragenden Saeulen. Sie machen
                aus einer App ein Werkzeug, aus dem Werkzeug eine Bewegung.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Identitaet beim Menschen',
                  text: '12 Worte, dezentral, kein Konzern dazwischen. Du traegst dein Leben — niemand nimmt es dir.',
                },
                {
                  icon: Heart,
                  title: 'Vertrauen aus Begegnung',
                  text: 'Wer dich kennt, bestaetigt dich. Im echten Leben, mit echten Menschen, ohne Algorithmen.',
                },
                {
                  icon: Compass,
                  title: 'Spaces fuer eigene Welten',
                  text: 'Jede Gemeinschaft baut ihren eigenen Raum. Eigene Sprache, eigene Wertformen, gemeinsamer Werkzeugkasten.',
                },
              ].map((p) => (
                <div key={p.title} className="bg-white rounded-2xl p-8 border border-ink-ghost hover:border-gold/40 transition-colors">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(232,117,26,0.08)' }}>
                    <p.icon className="h-7 w-7" style={{ color: '#E8751A' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {p.title}
                  </h3>
                  <p className="text-ink-soft leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Module */}
        <section id="module" className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(232,117,26,0.1)', color: '#E8751A' }}>
                Neun Module
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Der Werkzeugkasten
              </h2>
              <p className="text-lg text-ink-soft">
                Jeder Space waehlt seine Module. Manche brauchen nur Karte und
                Kalender, andere die volle Welt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map((m) => (
                <div key={m.label} className="flex items-start gap-4 p-5 rounded-xl border border-ink-ghost hover:border-gold/40 hover:bg-gold-bright/30 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,117,26,0.08)' }}>
                    <m.icon className="h-5 w-5" style={{ color: '#E8751A' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{m.label}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spaces */}
        <section id="spaces" className="py-24 bg-warm-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Lebende Spaces
              </h2>
              <p className="text-lg text-ink-soft">
                Jeder Space ist sein eigenes Universum auf demselben Werkzeug-Boden.
                Schau rein und erlebe es.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SPACES.map((s) => (
                <a
                  key={s.slug}
                  href={s.inApp}
                  className="group block bg-white rounded-2xl p-8 border-2 hover:scale-[1.02] hover:shadow-xl transition-all"
                  style={{ borderColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: s.color }} />
                    <div>
                      <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {s.name}
                      </div>
                      <div className="text-sm text-ink-soft">{s.tagline}</div>
                    </div>
                  </div>
                  <p className="text-ink-soft leading-relaxed mb-6">{s.desc}</p>
                  <div className="flex items-center gap-2 font-semibold group-hover:gap-3 transition-all" style={{ color: s.color }}>
                    Reinschauen
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </a>
              ))}

              <a
                href="/macher"
                className="group flex items-center justify-center gap-3 bg-white rounded-2xl p-8 border-2 border-dashed border-ink-faint hover:border-gold hover:bg-gold-bright/20 transition-colors min-h-[200px] md:col-span-2"
              >
                <Hammer className="h-6 w-6 text-ink-soft group-hover:text-gold transition-colors" />
                <div>
                  <div className="font-semibold text-lg group-hover:text-gold transition-colors">
                    Eigenen Space gruenden
                  </div>
                  <div className="text-sm text-ink-soft">
                    Mit der Forge in Stunden statt Wochen — nicht in Jahren.
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24" style={{ background: '#1A1A1A', color: 'white' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Sun className="h-12 w-12 mx-auto mb-6" style={{ color: '#E8751A' }} />
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Werkzeuge die zurueck ins Leben tragen
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Echte Menschen, echte Orte, echte Werte. Bau mit, bring deinen Space ein,
              gestalte das Netz deiner Begegnungen — und nimm es mit dir, wohin du gehst.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/macher"
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg transition-colors text-lg"
                style={{ background: '#E8751A' }}
                onMouseEnter={e => e.currentTarget.style.background = '#C4620A'}
                onMouseLeave={e => e.currentTarget.style.background = '#E8751A'}
              >
                Macher-Space oeffnen →
              </a>
              <a
                href="https://github.com/lichtungooo/rln"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 font-medium rounded-lg hover:border-gold hover:text-gold transition-colors"
              >
                <GitHubIcon size={16} />
                Auf GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-ink text-white/70 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E8751A' }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-white">Real Life Network</span>
                </div>
                <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                  Werkzeuge die Menschen in die Realitaet fuehren. Open Source.
                  Fuer alle. Ohne Konzerne.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a href="https://web-of-trust.de" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Web of Trust</a>
                <a href="https://real-life-stack.de" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Real Life Stack</a>
                <a href="https://github.com/lichtungooo/rln" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                <a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a>
                <a href="/impressum" className="hover:text-white transition-colors">Impressum</a>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
              <div>MIT-Lizenz · Frei und offen</div>
              <div>Mit Liebe gemacht von Timo, Anton und Sebastian</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
