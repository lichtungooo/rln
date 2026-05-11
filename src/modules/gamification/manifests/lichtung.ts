import type { SpaceManifest } from "./types"

/**
 * Lichtung-Space-Manifest (Phase F7, 11.05.2026).
 *
 * Zweites konkretes Constellation-Manifest. Bringt die Lichtung-eigenen
 * Skills mit — Friedensmeditation, Atemarbeit, Klangschalen, Cacao-
 * Zeremonie. Schwerpunkt liegt auf Bewusstsein, Seele, Gemeinschaft.
 *
 * Lichtung ist die Friedenskarte — sanft, atmend, verbunden. Die
 * Tonalitaet der Skills folgt der Herzens-Sprache.
 *
 * Skills haben deterministische IDs (kein UUID), damit der Seed
 * idempotent bleibt und ueber Geraete gleich aussieht.
 */
export const lichtungManifest: SpaceManifest = {
  slug: "lichtung",
  name: "Lichtung",
  version: "1.0.0",
  owner: "lichtungooo",
  description:
    "Friedensbewegung, Verbindung, Meditation. Lichter auf der Weltkarte, Lichtungen als Orte der Begegnung.",

  skills: [
    // --- Bewusstsein (Schwerpunkt) ---
    {
      id: "friedens-meditation",
      name: "Friedens-Meditation",
      bereichId: "bewusstsein",
      icon: "sun",
      color: "#FBBF24",
      description: "Stille fuer den Frieden — alleine oder in der Lichtung halten.",
      order: 10,
    },
    {
      id: "cacao-zeremonie",
      name: "Cacao-Zeremonie",
      bereichId: "bewusstsein",
      icon: "circle",
      color: "#92400E",
      description: "Herz-oeffnender Ritual-Raum mit Cacao als Pflanzen-Begleiter.",
      order: 20,
    },
    {
      id: "geh-meditation",
      name: "Geh-Meditation",
      bereichId: "bewusstsein",
      icon: "footprints",
      color: "#A78BFA",
      description: "Schritt fuer Schritt — Bewegung wird Achtsamkeit.",
      order: 30,
    },

    // --- Koerper ---
    {
      id: "atemarbeit",
      name: "Atemarbeit",
      bereichId: "koerper",
      icon: "wind",
      color: "#60A5FA",
      description: "Holotrop, Wim Hof, Pranayama — der Atem als Schluessel.",
      order: 100,
    },
    {
      id: "yoga",
      name: "Yoga",
      bereichId: "koerper",
      icon: "shapes",
      color: "#EC4899",
      description: "Asana, Pranayama, Meditation — die acht Glieder leben.",
      order: 110,
    },
    {
      id: "qigong",
      name: "Qigong",
      bereichId: "koerper",
      icon: "circle-dot",
      color: "#10B981",
      description: "Energie-Arbeit, fliessende Bewegung, Stehende Saeule.",
      order: 120,
    },

    // --- Seele ---
    {
      id: "klangschalen",
      name: "Klangschalen",
      bereichId: "seele",
      icon: "music",
      color: "#A855F7",
      description: "Klang als Heilung, Schwingung als Sprache.",
      order: 200,
    },
    {
      id: "tonen",
      name: "Tonen",
      bereichId: "seele",
      icon: "mic",
      color: "#EC4899",
      description: "Die eigene Stimme als Werkzeug — Oberton, Mantra, Klang.",
      order: 210,
    },
    {
      id: "tanz-meditation",
      name: "Tanz-Meditation",
      bereichId: "seele",
      icon: "music-2",
      color: "#F472B6",
      description: "5 Rhythmen, Ecstatic Dance, Bewegung als Gebet.",
      order: 220,
    },

    // --- Soziales ---
    {
      id: "verbindungskunst",
      name: "Verbindungskunst",
      bereichId: "soziales",
      icon: "users",
      color: "#F59E0B",
      description: "Lichtungs-Spruch: Liebe ist die Kunst des Lebens.",
      order: 300,
    },
    {
      id: "gewaltfreie-kommunikation",
      name: "Gewaltfreie Kommunikation",
      bereichId: "soziales",
      icon: "message-circle",
      color: "#3B82F6",
      description: "Marshall Rosenberg — vier Schritte zu echter Beruehrung.",
      order: 310,
    },

    // --- Gemeinschaft ---
    {
      id: "lichtung-halten",
      name: "Lichtung halten",
      bereichId: "gemeinschaft",
      icon: "sun",
      color: "#FBBF24",
      description: "Einen Raum fuer Begegnung oeffnen — und ihn ehren.",
      order: 400,
    },
    {
      id: "kreis-fuehren",
      name: "Kreis fuehren",
      bereichId: "gemeinschaft",
      icon: "circle",
      color: "#10B981",
      description: "Council, Way of Council — alle hoeren, alle sprechen.",
      order: 410,
    },

    // --- Natur ---
    {
      id: "naturverbundenheit",
      name: "Naturverbundenheit",
      bereichId: "natur",
      icon: "leaf",
      color: "#65A30D",
      description: "Mit Baum, Stein, Wasser sprechen. Mutter Erde fuehlen.",
      order: 500,
    },
  ],

  avatarItems: [
    {
      id: "licht-traeger",
      name: "Licht-Traeger",
      symbol: "sun",
      bereichId: "bewusstsein",
      rarity: "epic",
      condition: "Erste Friedensmeditation in der Lichtung gehalten",
      color: "#FBBF24",
    },
    {
      id: "atem-kundige",
      name: "Atem-Kundige",
      symbol: "wind",
      bereichId: "koerper",
      rarity: "rare",
      condition: "Atemarbeit Level 5 erreicht",
      color: "#60A5FA",
    },
    {
      id: "stille-huelle",
      name: "Stille-Huelle",
      symbol: "moon",
      bereichId: "bewusstsein",
      rarity: "rare",
      condition: "100 Stunden in Meditation",
      color: "#A78BFA",
    },
    {
      id: "lichtungs-stern",
      name: "Lichtungs-Stern",
      symbol: "star",
      bereichId: "gemeinschaft",
      rarity: "legendary",
      condition: "Eine eigene Lichtung gegruendet und durch ein Jahr getragen",
      color: "#FBBF24",
    },
    {
      id: "herz-oeffner",
      name: "Herz-Oeffner",
      symbol: "heart-handshake",
      bereichId: "seele",
      rarity: "epic",
      condition: "Cacao-Zeremonie geleitet",
      color: "#EC4899",
    },
  ],
}
