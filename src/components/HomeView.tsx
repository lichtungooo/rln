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
import { QrCode, Smartphone, ArrowRight } from 'lucide-react'

interface HomeViewProps {
  userName: string
  /** Klick auf eine Schnell-Aktion soll Home schliessen und navigieren */
  onClose: () => void
}

export function HomeView({ userName }: HomeViewProps) {
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
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/30 px-4 py-3 text-sm font-semibold text-primary-foreground/70"
          title="Handshake folgt in Phase H3"
        >
          Handshake starten
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Funktion folgt in Kuerze.
        </p>
      </section>

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
