/**
 * Demo-Datensatz fuer den Macher-Space.
 *
 * Verteilt sich quer durch Deutschland und deckt alle Pin-Typen ab:
 *   - place    (Werkstaetten)
 *   - event    (Termine + Festivals)
 *   - offer    (Verleih + Kurse)
 *   - need     (Mit-Macher + Material gesucht)
 *   - quest    (kleine offene Aufgaben)
 *   - profile-extension (Macher-Profile mit Standort)
 *
 * Jedes Item bekommt `data.isDemo: true` — daran erkennen wir die Demo-Items
 * fuer das spaetere Aufraeumen.
 */

export interface DemoItem {
  type: string
  data: Record<string, unknown>
}

export const DEMO_FLAG_FIELD = "isDemo"

export const MACHER_DEMO_ITEMS: DemoItem[] = [
  // ============================================================
  // Werkstaetten (places)
  // ============================================================
  {
    type: "place",
    data: {
      title: "Holzwerkstatt Kreuzberg",
      address: "Wiener Str. 12, 10999 Berlin",
      location: { lat: 52.4946, lng: 13.4068, address: "Wiener Str. 12, 10999 Berlin" },
      markdownBody:
        "Offene Holzwerkstatt fuer Moebel, Skateboards, Spielzeug. Bandsaege, Hobel, CNC. Mitgliedsbeitrag oder Tagespass.",
      hashtags: ["holz", "werkstatt", "berlin", "open"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "FabLab Muenchen Schwabing",
      address: "Hohenzollernstr. 92, 80796 Muenchen",
      location: { lat: 48.1745, lng: 11.5798, address: "Hohenzollernstr. 92, 80796 Muenchen" },
      markdownBody:
        "FabLab mit 3D-Druckern, Lasercutter, CNC-Fraese. Mitgliedschaft guenstig fuer Studis und Maker.",
      hashtags: ["3d-druck", "lasern", "elektronik", "muenchen", "fablab"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Metallwerkstatt Hafenstrasse",
      address: "Hafenstr. 96, 20359 Hamburg",
      location: { lat: 53.5485, lng: 9.9685, address: "Hafenstr. 96, 20359 Hamburg" },
      markdownBody:
        "Schweissen, Schmieden, Plasma-Schneiden. Industrie-Look, riesige Halle direkt am Wasser.",
      hashtags: ["metall", "schweissen", "schmieden", "hamburg"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Reparatur-Cafe Ehrenfeld",
      address: "Heliosstr. 6a, 50825 Koeln",
      location: { lat: 50.9558, lng: 6.9051, address: "Heliosstr. 6a, 50825 Koeln" },
      markdownBody:
        "Jeden Samstag: bring kaputtes Zeug, repariere es mit Helfern. Kaffee + Kuchen umsonst, Spende erwuenscht.",
      hashtags: ["reparieren", "koeln", "open", "samstag"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Toepferwerkstatt Plagwitz",
      address: "Karl-Heine-Str. 99, 04229 Leipzig",
      location: { lat: 51.3296, lng: 12.336, address: "Karl-Heine-Str. 99, 04229 Leipzig" },
      markdownBody:
        "Drehscheiben, Brennofen, Kurse fuer Anfaenger. Tee + Kekse inklusive.",
      hashtags: ["toepfern", "keramik", "leipzig", "kurse"],
      isDemo: true,
    },
  },
  {
    type: "place",
    data: {
      title: "Open-Source-Werkstatt Dresden",
      address: "Bischofsweg 50, 01099 Dresden",
      location: { lat: 51.0689, lng: 13.747, address: "Bischofsweg 50, 01099 Dresden" },
      markdownBody:
        "Hardware-Hacker treffen sich jeden Mittwoch. Loetstationen, Oszilloskope, Maker-Vibes.",
      hashtags: ["elektronik", "hardware", "dresden", "open-source"],
      isDemo: true,
    },
  },

  // ============================================================
  // Events
  // ============================================================
  {
    type: "event",
    data: {
      title: "Sommerfest Holzwerkstatt Kreuzberg",
      address: "Wiener Str. 12, 10999 Berlin",
      location: { lat: 52.4946, lng: 13.4068, address: "Wiener Str. 12, 10999 Berlin" },
      start: "2026-06-21T14:00:00.000Z",
      end: "2026-06-21T22:00:00.000Z",
      markdownBody: "Holz, Grill, Bier, Live-Musik. Bring eigene Hobelspaene mit ;-)",
      hashtags: ["sommerfest", "berlin", "holz"],
      isDemo: true,
    },
  },
  {
    type: "event",
    data: {
      title: "3D-Druck-Sprechstunde",
      address: "Hohenzollernstr. 92, 80796 Muenchen",
      location: { lat: 48.1745, lng: 11.5798, address: "Hohenzollernstr. 92, 80796 Muenchen" },
      start: "2026-05-15T18:00:00.000Z",
      end: "2026-05-15T20:00:00.000Z",
      markdownBody: "Bring dein Bastelprojekt — wir tunen den Slicer.",
      hashtags: ["3d-druck", "muenchen", "open"],
      isDemo: true,
    },
  },
  {
    type: "event",
    data: {
      title: "Macher-Festival Ferropolis",
      address: "Ferropolisstr. 1, 06773 Graefenhainichen",
      location: { lat: 51.735, lng: 12.4233, address: "Ferropolis 06773 Graefenhainichen" },
      start: "2026-08-06T16:00:00.000Z",
      end: "2026-08-09T22:00:00.000Z",
      markdownBody:
        "Das grosse Treffen aller Macher. Drei Tage, viele Werkstaetten, ein Funke.",
      hashtags: ["festival", "ferropolis", "macher", "sommer"],
      isDemo: true,
    },
  },

  // ============================================================
  // Marktplatz — alle Preis-Typen + Kategorien
  // ============================================================

  // VERLEIHEN
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "lend",
      title: "Drechselbank zu verleihen",
      description:
        "Robust und wenig genutzt. Gerne fuer Wochen-Verleih. Eigenabholung. Pfand 100 EUR.",
      category: "tool",
      condition: "like_new",
      priceText: "Pfand 100 EUR, 5 EUR/Tag",
      location: { lat: 50.9528, lng: 6.9171, address: "Koeln-Ehrenfeld" },
      hashtags: ["drechseln", "holz", "verleih", "koeln"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "lend",
      title: "Motorsaege Stihl MS 261",
      description:
        "Profi-Geraet, frisch geschaerft. Nur fuer erfahrene Saeger. Komplett mit Schutzkleidung.",
      category: "tool",
      condition: "used",
      priceText: "Kostenlos im Rahmen der Holzaktion — sonst 15 EUR/Tag",
      location: { lat: 53.55, lng: 9.965, address: "Hamburg-St.Pauli" },
      hashtags: ["motorsaege", "holz", "verleih", "hamburg"],
      isDemo: true,
    },
  },

  // VERKAUFEN
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "sell",
      title: "Akkuschrauber Bosch 18V mit 2 Akkus",
      description:
        "Starker Akkuschrauber, 2 Akkus, Ladegeraet, Koffer. 2 Jahre alt, gut gepflegt.",
      category: "tool",
      condition: "like_new",
      priceAmount: 75,
      priceText: "VHB",
      location: { lat: 48.1351, lng: 11.582, address: "Muenchen-Schwabing" },
      hashtags: ["akkuschrauber", "bosch", "muenchen"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "sell",
      title: "Schreiner-Workshop fuer 8 Personen",
      description: "8h, vom Brett zum Schemel. Inklusive Material und Mittagessen.",
      category: "knowledge",
      priceAmount: 90,
      priceText: "pro Person, naechster Termin im Mai",
      location: { lat: 48.7758, lng: 9.1593, address: "Stuttgart-West" },
      hashtags: ["holz", "workshop", "stuttgart"],
      isDemo: true,
    },
  },

  // VERSCHENKEN
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "gift",
      title: "200 kg Aepfel — Streuobstwiese-Ernte",
      description:
        "Reichliche Ernte vom Wochenende. Mostobst, gerne abholen. Kommt vor dem Frost!",
      category: "produce",
      condition: "new",
      priceText: "Selbstabholung, eigene Kisten mitbringen",
      location: { lat: 49.4521, lng: 11.0767, address: "Nuernberg-Steinbuehl" },
      hashtags: ["aepfel", "ernte", "obst", "verschenken", "nuernberg"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "gift",
      title: "Eichenholz-Reste vom Tischlern",
      description:
        "Stuecke 20-80cm, perfekt fuer Drechseln oder Loeffel-Schnitzen. Trocken gelagert.",
      category: "material",
      priceText: "Selbstabholung",
      location: { lat: 51.0504, lng: 13.7373, address: "Dresden-Neustadt" },
      hashtags: ["holz", "eiche", "reste", "verschenken", "dresden"],
      isDemo: true,
    },
  },

  // TAUSCHEN
  {
    type: "offer",
    data: {
      kind: "offer",
      priceType: "exchange",
      title: "Honig (Sommertracht) gegen Werkzeug",
      description:
        "Eigene Imkerei. Tausche 5 Glaeser gegen brauchbares Werkzeug oder Hilfe beim Schleudern.",
      category: "produce",
      priceText: "Tausch gegen Werkzeug oder Arbeitsstunden",
      location: { lat: 52.3759, lng: 9.732, address: "Hannover-Linden" },
      hashtags: ["honig", "imker", "tausch", "hannover"],
      isDemo: true,
    },
  },

  // SUCHEN
  {
    type: "offer",
    data: {
      kind: "need",
      title: "Suche Mitstreiter fuer Lastenrad-Bau",
      description:
        "Schweissen + Bremsen-Anpassung. 2 Wochenenden, dann faehrt das Ding. Werkzeug + Material vorhanden.",
      category: "service",
      priceText: "Gemeinsam — am Ende fahren wir alle eins",
      location: { lat: 50.1306, lng: 8.705, address: "Frankfurt-Bornheim" },
      hashtags: ["lastenrad", "schweissen", "frankfurt", "kollab"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      kind: "need",
      title: "Brennofen — leihen oder kaufen",
      description:
        "Mittlerer Brennofen, ca. 60L Innenvolumen. Bereit Reisekosten zu zahlen.",
      category: "tool",
      priceText: "bis 200 EUR / oder gegen Toepferarbeiten",
      location: { lat: 51.3397, lng: 12.3731, address: "Leipzig" },
      hashtags: ["toepfern", "brennofen", "leipzig"],
      isDemo: true,
    },
  },
  {
    type: "offer",
    data: {
      kind: "need",
      title: "Suche Begleitung beim Wildkraeuter-Sammeln",
      description:
        "Bin Anfaenger, suche jemanden mit Erfahrung. Vielleicht ein paar gemeinsame Streifzuege?",
      category: "knowledge",
      priceText: "Gegen Kuchen und gute Gespraeche",
      location: { lat: 51.5167, lng: 9.9333, address: "Goettingen" },
      hashtags: ["kraeuter", "wildkraeuter", "natur", "lernen", "goettingen"],
      isDemo: true,
    },
  },

  // ============================================================
  // Quests — zeigen das volle Verifikations-Spektrum
  // ============================================================

  // Quest-Reihe "Werkstatt-Pfad" mit 3 Stufen
  {
    type: "quest",
    data: {
      title: "Erste Naht legen",
      description: "Eine 10cm Schweissnaht auf Stahlblech — sauber, ohne Loecher.",
      markdownBody:
        "Erste Stufe des Werkstatt-Pfads. Ziel: ein gerader Strich. Nicht schoen, aber dicht.",
      verification: "self",
      bereichXp: { handwerk: 30, koerper: 5 },
      questSeriesId: "werkstatt-pfad",
      questSeriesPosition: 1,
      hashtags: ["werkstatt", "schweissen", "anfang"],
      isDemo: true,
    },
  },
  {
    type: "quest",
    data: {
      title: "Eckverbindung schweissen",
      description: "Zwei Stahlplatten im 90-Grad-Winkel verbinden.",
      markdownBody:
        "Zweite Stufe. Hier zaehlt die Vorbereitung — entgraten, fixieren, dann erst zuenden.",
      verification: "qr",
      qrCode: "macher-werkstatt-pfad-2-eckverbindung",
      bereichXp: { handwerk: 50, koerper: 10 },
      questSeriesId: "werkstatt-pfad",
      questSeriesPosition: 2,
      hashtags: ["werkstatt", "schweissen", "qr"],
      isDemo: true,
    },
  },
  {
    type: "quest",
    data: {
      title: "Eigenes Werkstueck",
      description: "Ein selbst entworfenes Stueck schweissen — und einen Macher um Bestaetigung bitten.",
      markdownBody:
        "Dritte Stufe. Du bringst dein Stueck, ein Werkstatt-Macher attestiert die Arbeit.",
      verification: "attestation",
      bereichXp: { handwerk: 80, geist: 20, soziales: 10 },
      questSeriesId: "werkstatt-pfad",
      questSeriesPosition: 3,
      hashtags: ["werkstatt", "schweissen", "attestiert"],
      isDemo: true,
    },
  },

  // Eigenstaendige Quest mit Standort
  {
    type: "quest",
    data: {
      title: "Bauanleitung: Hochbeet aus Paletten",
      description: "Schritt-fuer-Schritt mit Fotos dokumentieren.",
      address: "Berlin",
      location: { lat: 52.517, lng: 13.3889, address: "Berlin" },
      markdownBody:
        "Wer macht ein Schritt-fuer-Schritt mit Fotos? Open-Source CC-BY.",
      verification: "self",
      bereichXp: { handwerk: 40, geist: 30, gemeinschaft: 20 },
      hashtags: ["upcycling", "garten", "berlin", "open-source"],
      isDemo: true,
    },
  },
  {
    type: "quest",
    data: {
      title: "Reparatur-Sonntag organisieren",
      description: "Raeumlichkeit + 5 Reparateure finden, Termin festlegen.",
      address: "Hamburg-Altona",
      location: { lat: 53.55, lng: 9.9333, address: "Hamburg-Altona" },
      markdownBody:
        "Raeumlichkeit + 5 Reparateure finden. Termin: Fruehling 2026.",
      verification: "peer",
      bereichXp: { gemeinschaft: 40, soziales: 30, geist: 10 },
      hashtags: ["reparieren", "hamburg", "kollab"],
      isDemo: true,
    },
  },

  // ============================================================
  // Macher (Profile-Extensions mit Standort)
  // ============================================================
  {
    type: "profile-extension",
    data: {
      name: "Lara aus der Holzwerkstatt",
      bio: "Holzbauerin in Berlin. Moebel, Skateboards, Spielzeug.",
      address: "Berlin-Kreuzberg",
      location: { lat: 52.498, lng: 13.418, address: "Berlin-Kreuzberg" },
      skills: ["Holz", "CNC", "Drechseln"],
      offers: ["Werkstatt-Zeit", "Workshops"],
      hashtags: ["holz", "berlin"],
      isDemo: true,
    },
  },
  {
    type: "profile-extension",
    data: {
      name: "Tom Schweisst",
      bio: "Metall-Kuenstler aus Hamburg. Schmiede + Kunst.",
      address: "Hamburg-St. Pauli",
      location: { lat: 53.55, lng: 9.965, address: "Hamburg-St. Pauli" },
      skills: ["Metall", "Schweissen", "Schmieden"],
      offers: ["Auftragsarbeiten"],
      hashtags: ["metall", "hamburg"],
      isDemo: true,
    },
  },
  {
    type: "profile-extension",
    data: {
      name: "Anna 3D",
      bio: "FabLab-Pionierin Muenchen. Lehre, Kurse, Forschung.",
      address: "Muenchen-Schwabing",
      location: { lat: 48.17, lng: 11.58, address: "Muenchen-Schwabing" },
      skills: ["3D-Druck", "Lasern", "CAD"],
      offers: ["Kurse", "Beratung"],
      hashtags: ["3d-druck", "muenchen"],
      isDemo: true,
    },
  },
]

/** Item-Typen, die in den Demo-Daten vorkommen — fuer Zaehler/UI. */
export const DEMO_ITEM_TYPES = Array.from(
  new Set(MACHER_DEMO_ITEMS.map((i) => i.type))
)

/** Verteilung der Demo-Items pro Typ — fuer den Lade-Status. */
export const DEMO_BREAKDOWN: Record<string, number> = MACHER_DEMO_ITEMS.reduce(
  (acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>
)
