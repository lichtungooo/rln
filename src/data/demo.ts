import type { Item } from 'utopia-ui'

// Demo-Inhalte für die ersten Schritte. Sobald das Backend lebt,
// fließen echte Daten an diese Stelle.

export const demoSpaces = [
  { id: 'adventure-de', name: 'Adventure Deutschland', icon: '🌲', members: 42 },
  { id: 'garten-gemeinschaft', name: 'Garten-Gemeinschaft', icon: '🌱', members: 18 },
  { id: 'wir-sind-wertvoll', name: 'Wir sind wertvoll', icon: '✨', members: 27 },
  { id: 'lichtung', name: 'Lichtung', icon: '🌳', members: 9 },
]

export const demoOrte: Item[] = [
  {
    id: 'ort-1',
    name: 'Bauernhof am Hang',
    text: 'Ein lebendiger Hof mit Markttagen und offenen Werkstätten.',
    position: { type: 'Point', coordinates: [8.6821, 50.1109] },
  },
  {
    id: 'ort-2',
    name: 'Werkstatt der Hände',
    text: 'Reparatur-Café, jeden Samstag von 14 bis 18 Uhr.',
    position: { type: 'Point', coordinates: [8.7421, 50.1209] },
  },
  {
    id: 'ort-3',
    name: 'Lichtung im Wald',
    text: 'Versammlungsort der Lichtungs-Gemeinschaft.',
    position: { type: 'Point', coordinates: [8.6321, 50.0809] },
  },
]

export const demoVeranstaltungen: Item[] = [
  {
    id: 'event-1',
    name: 'Wildkräuterwanderung',
    text: 'Gemeinsam durch den Frühlingswald, mit Kräuterkunde und Geschichten.',
    position: { type: 'Point', coordinates: [8.6921, 50.1009] },
    start: '2026-04-12T14:00:00Z',
    end: '2026-04-12T17:00:00Z',
  },
  {
    id: 'event-2',
    name: 'Pflanzentausch',
    text: 'Ableger und Samen tauschen, sich austauschen, Gemeinschaft erleben.',
    position: { type: 'Point', coordinates: [8.7121, 50.1309] },
    start: '2026-04-14T15:00:00Z',
    end: '2026-04-14T18:00:00Z',
  },
]

export const demoQuests: Item[] = [
  {
    id: 'quest-1',
    name: 'Müll sammeln am Bach',
    text: 'Eine kleine Aktion mit großer Wirkung. Treffpunkt am Bachufer.',
    position: { type: 'Point', coordinates: [8.7221, 50.1009] },
  },
  {
    id: 'quest-2',
    name: 'Gemeinschaftsbeet anlegen',
    text: 'Ein neues Hochbeet entsteht. Werkzeuge sind da, Hände werden gebraucht.',
    position: { type: 'Point', coordinates: [8.6521, 50.1409] },
  },
]
