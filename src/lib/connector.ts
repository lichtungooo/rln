import { MockConnector } from '@real-life-stack/mock-connector'

// Ein einziger Connector fürs ganze RLN.
// Später können wir ihn gegen den Trust-Connector austauschen.
export const connector = new MockConnector()

// Ein paar Demo-Veranstaltungen, damit der Kalender beim ersten Öffnen lebt.
const seedDate = (daysFromNow: number, hour: number, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export async function initConnector() {
  await connector.init()

  await connector.createItem({
    type: 'event',
    createdBy: 'timo',
    data: {
      title: 'Wildkräuterwanderung im Frühlingswald',
      description:
        '## Ein Tag im Wald\n\nGemeinsam ziehen wir durch den erwachenden Frühlingswald. Wir lernen die **heimischen Kräuter** kennen, hören Geschichten über ihre Heilkräfte und sammeln gemeinsam für einen wilden Mittagsschmaus.\n\n### Was du mitbringen darfst\n\n- Feste Schuhe\n- Eine Brotzeit\n- Einen Korb oder Beutel\n- Neugier',
      coverImage:
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=675&fit=crop',
      start: seedDate(2, 14, 0),
      end: seedDate(2, 17, 0),
      location: 'Gudensberg, Waldparkplatz',
      calendar: 'adventure',
    },
  })

  await connector.createItem({
    type: 'event',
    createdBy: 'timo',
    data: {
      title: 'Pflanzentausch im Garten',
      description:
        'Ein Nachmittag voller grüner Freude. Bringe **Ableger, Samen, Stecklinge** mit — nimm etwas Neues mit nach Hause. Dazwischen: Tee, Geschichten, Gemeinschaft.',
      coverImage:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=675&fit=crop',
      start: seedDate(4, 15, 0),
      end: seedDate(4, 18, 0),
      location: 'Garten-Gemeinschaft, Wiesenweg 12',
      calendar: 'garten',
    },
  })

  await connector.createItem({
    type: 'event',
    createdBy: 'timo',
    data: {
      title: 'Reparatur-Café',
      description:
        'Bring mit, was kaputt ist. Wir reparieren gemeinsam — Toaster, Fahrräder, Lampen, Kleidung. Werkzeug und erfahrene Hände sind da. Ein Abend für das Weiterleben der Dinge.',
      coverImage:
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&h=675&fit=crop',
      start: seedDate(6, 18, 0),
      end: seedDate(6, 21, 0),
      location: 'Werkstatt der Hände, Hauptstraße 7',
      calendar: 'lichtung',
    },
  })

  await connector.createItem({
    type: 'event',
    createdBy: 'timo',
    data: {
      title: 'Morgenmeditation am Fluss',
      description: 'Ein stiller Start in den Tag. Eine halbe Stunde im Sitzen, dann Tee am Wasser.',
      coverImage:
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=675&fit=crop',
      start: seedDate(1, 7, 30),
      end: seedDate(1, 8, 30),
      location: 'Flussufer beim alten Steg',
      calendar: 'privat',
    },
  })

  return connector
}

export type Calendar = {
  id: string
  name: string
  color: string
}

export const calendars: Calendar[] = [
  { id: 'privat', name: 'Privat', color: 'oklch(0.55 0.21 264)' },
  { id: 'adventure', name: 'Adventure Deutschland', color: 'oklch(0.63 0.16 55)' },
  { id: 'garten', name: 'Garten-Gemeinschaft', color: 'oklch(0.65 0.18 140)' },
  { id: 'lichtung', name: 'Lichtung', color: 'oklch(0.60 0.15 30)' },
]
