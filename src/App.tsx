import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@real-life-stack/toolkit'
import { WotIdentity } from '@real-life/wot-core'

type TrustState =
  | { status: 'idle' }
  | { status: 'creating' }
  | { status: 'ready'; did: string }
  | { status: 'error'; message: string }

export function App() {
  const [trust, setTrust] = useState<TrustState>({ status: 'idle' })

  useEffect(() => {
    // Beim ersten Laden eine flüchtige Trust-Identität anlegen,
    // damit wir sehen: die Schicht atmet.
    const loadIdentity = async () => {
      setTrust({ status: 'creating' })
      try {
        const identity = new WotIdentity()
        await identity.create('real-life-network-fundament', true)
        const did = identity.getDid()
        setTrust({ status: 'ready', did })
      } catch (error) {
        setTrust({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unbekannter Fehler',
        })
      }
    }
    loadIdentity()
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted to-background p-6">
      <div className="max-w-2xl w-full space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-light tracking-tight text-foreground">
            Real Life Network
          </h1>
          <p className="text-xl text-muted-foreground">
            Echte Begegnungen in deiner Realität.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Das Fundament atmet</CardTitle>
            <CardDescription>
              Trust und Toolkit spielen zum ersten Mal zusammen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Toolkit</p>
              <p className="text-sm text-muted-foreground">
                Komponenten aus <code className="px-1 py-0.5 rounded bg-muted text-foreground">@real-life-stack/toolkit</code> sind geladen.
                Dieser Kartenblock, die Knöpfe, die Farben — alles kommt von dort.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Trust</p>
              {trust.status === 'idle' && (
                <p className="text-sm text-muted-foreground">Bereit.</p>
              )}
              {trust.status === 'creating' && (
                <p className="text-sm text-muted-foreground">
                  Eine Identität entsteht aus zwölf magischen Worten...
                </p>
              )}
              {trust.status === 'ready' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Eine Identität lebt. Ihr did:key lautet:
                  </p>
                  <code className="block text-xs break-all p-3 rounded bg-muted text-foreground">
                    {trust.did}
                  </code>
                </div>
              )}
              {trust.status === 'error' && (
                <p className="text-sm text-destructive">
                  {trust.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="default">Loslegen</Button>
              <Button variant="outline">Mehr erfahren</Button>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
          <p>Vision von Timo · Entwicklung von Eli · Gemeinschaftliches Schöpfen</p>
        </footer>
      </div>
    </main>
  )
}
