import type { SkillData } from "./types"

/**
 * Universelle Sub-Skills — in jedem Space gleich (Phase F2, 11.05.2026).
 *
 * 80 Skills, 10 pro Bereich, decken den ganzen Menschen ab — egal in
 * welchem Space er sich bewegt. Diese Skills leben **als Code-Konstanten**,
 * nicht als WoT-Items. Sie haben den Praefix `u-` in der ID und sind
 * ueber alle Spaces hinweg identisch.
 *
 * Vision: Eure 7+1 Bereiche traegen den Menschen ganz. Die universellen
 * Sub-Skills sind die Linsen, durch die jeder Mensch wachsen kann —
 * unabhaengig von der Tonalitaet des Spaces.
 *
 * Space-spezifische Skills (Macher: Holz, Schweissen, ...) leben weiter
 * als WoT-Items und stehen als spezialisierte Schicht ueber den
 * universellen.
 *
 * Recherche: Real-Life-Network/Visionen/Module/07-Gamification-Recherche/
 * skilltree-vertiefung/01-skill-universum.md
 */

export const UNIVERSAL_SKILLS: Array<SkillData & { id: string }> = [
  // ============================================================
  // KOERPER — das physische Gefaess
  // ============================================================
  { id: "u-koerper-atem", name: "Atem", bereichId: "koerper", icon: "wind", description: "Bewusste Atemfuehrung — Pranayama, Holotrop, Wim Hof, Buteyko.", order: 1010 },
  { id: "u-koerper-bewegung", name: "Bewegung", bereichId: "koerper", icon: "footprints", description: "Den Koerper im Raum fuehren — Gehen, Tanzen, Spielen.", order: 1020 },
  { id: "u-koerper-kraft", name: "Kraft", bereichId: "koerper", icon: "dumbbell", description: "Muskel-Kraft aufbauen und halten — heben, ziehen, tragen.", order: 1030 },
  { id: "u-koerper-ausdauer", name: "Ausdauer", bereichId: "koerper", icon: "activity", description: "Lange tun ohne Erschoepfung — Laufen, Radfahren, Wandern.", order: 1040 },
  { id: "u-koerper-beweglichkeit", name: "Beweglichkeit", bereichId: "koerper", icon: "shapes", description: "Gelenke, Faszien, Geschmeidigkeit — Yoga, Dehnen.", order: 1050 },
  { id: "u-koerper-ernaehrung", name: "Ernaehrung", bereichId: "koerper", icon: "apple", description: "Was naehrt, was zehrt — den Koerper hoeren beim Essen.", order: 1060 },
  { id: "u-koerper-schlaf", name: "Schlaf", bereichId: "koerper", icon: "moon", description: "Schlaf-Hygiene, Traum-Praxis, echte Erholung.", order: 1070 },
  { id: "u-koerper-beruehrung", name: "Beruehrung", bereichId: "koerper", icon: "hand", description: "Geben und empfangen — Massage, Naehe, Haltung.", order: 1080 },
  { id: "u-koerper-stimme", name: "Stimme", bereichId: "koerper", icon: "mic", description: "Sprechen, Singen, Tonen — die Stimme als Werkzeug.", order: 1090 },
  { id: "u-koerper-sinne", name: "Sinne", bereichId: "koerper", icon: "eye", description: "Sehen, Hoeren, Schmecken, Riechen, Fuehlen — Sinne schaerfen.", order: 1100 },

  // ============================================================
  // GEIST — das denkende Werkzeug
  // ============================================================
  { id: "u-geist-lesen", name: "Lesen", bereichId: "geist", icon: "book-open", description: "Texte aufnehmen, verstehen, einordnen.", order: 2010 },
  { id: "u-geist-schreiben", name: "Schreiben", bereichId: "geist", icon: "pen-tool", description: "Klar formulieren, Gedanken zu Papier bringen.", order: 2020 },
  { id: "u-geist-logik", name: "Logik", bereichId: "geist", icon: "binary", description: "Argumentation, Schluss, Beweis fuehren.", order: 2030 },
  { id: "u-geist-mathematik", name: "Mathematik", bereichId: "geist", icon: "calculator", description: "Zahl, Form, Struktur — die Sprache der Welt.", order: 2040 },
  { id: "u-geist-wissenschaft", name: "Wissenschaft", bereichId: "geist", icon: "microscope", description: "Forschen, methodisch erkennen, beweisen, pruefen.", order: 2050 },
  { id: "u-geist-lernen", name: "Lernen lernen", bereichId: "geist", icon: "brain", description: "Wie man Wissen aufnimmt, behaelt, anwendet.", order: 2060 },
  { id: "u-geist-gedaechtnis", name: "Gedaechtnis", bereichId: "geist", icon: "lightbulb", description: "Erinnern, Memo-Techniken, Mnemonik.", order: 2070 },
  { id: "u-geist-fokus", name: "Fokus", bereichId: "geist", icon: "crosshair", description: "Aufmerksamkeit halten, tief eintauchen, dranbleiben.", order: 2080 },
  { id: "u-geist-kritik", name: "Kritisches Denken", bereichId: "geist", icon: "search", description: "Annahmen pruefen, Quellen wiegen, durchschauen.", order: 2090, prerequisites: { minLevel: [{ skillId: "u-geist-logik", level: 2 }] } },
  { id: "u-geist-loesen", name: "Problemloesen", bereichId: "geist", icon: "puzzle", description: "Auseinandernehmen, neu zusammensetzen, einen Weg finden.", order: 2100 },

  // ============================================================
  // SEELE — das beseelte Feld
  // ============================================================
  { id: "u-seele-gefuehl", name: "Gefuehle", bereichId: "seele", icon: "heart", description: "Gefuehle wahrnehmen, benennen, halten lernen.", order: 3010 },
  { id: "u-seele-ausdruck", name: "Ausdruck", bereichId: "seele", icon: "feather", description: "Was in dir lebt sichtbar machen.", order: 3020 },
  { id: "u-seele-kunst", name: "Kunst", bereichId: "seele", icon: "palette", description: "Schoenes schaffen — malen, zeichnen, gestalten.", order: 3030 },
  { id: "u-seele-musik", name: "Musik", bereichId: "seele", icon: "music", description: "Klaenge machen, hoeren, weben.", order: 3040 },
  { id: "u-seele-tanz", name: "Tanz", bereichId: "seele", icon: "music-2", description: "Bewegung als Ausdruck der Seele.", order: 3050 },
  { id: "u-seele-poesie", name: "Poesie", bereichId: "seele", icon: "scroll", description: "Worte als Klang, Geschichten als Bruecke.", order: 3060 },
  { id: "u-seele-schoenheit", name: "Schoenheit", bereichId: "seele", icon: "flower", description: "Schoenheit erkennen, ehren, bewahren.", order: 3070 },
  { id: "u-seele-trauer", name: "Trauer", bereichId: "seele", icon: "cloud-rain", description: "Verlust halten, durch das Tal gehen, ehren.", order: 3080 },
  { id: "u-seele-liebe", name: "Liebe", bereichId: "seele", icon: "heart-handshake", description: "Liebe geben und empfangen ohne Bedingung.", order: 3090 },
  { id: "u-seele-eros", name: "Eros", bereichId: "seele", icon: "sparkle", description: "Lebensfreude, Sinnlichkeit, Sexualitaet als Quelle.", order: 3100 },

  // ============================================================
  // BEWUSSTSEIN — der Beobachter, das Gewahrsein
  // ============================================================
  { id: "u-bewusstsein-meditation", name: "Meditation", bereichId: "bewusstsein", icon: "circle-dot", description: "Sitz- und Geh-Meditation — Vipassana, Zen, Metta.", order: 4010 },
  { id: "u-bewusstsein-achtsamkeit", name: "Achtsamkeit", bereichId: "bewusstsein", icon: "eye", description: "Im Alltag bei sich sein, wahrnehmen ohne zu reagieren.", order: 4020 },
  { id: "u-bewusstsein-praesenz", name: "Praesenz", bereichId: "bewusstsein", icon: "sun", description: "Voll da sein — ganz im Hier und Jetzt.", order: 4030 },
  { id: "u-bewusstsein-selbst", name: "Selbst-Beobachtung", bereichId: "bewusstsein", icon: "user", description: "Sich selber beim Tun zusehen — der innere Zeuge.", order: 4040 },
  { id: "u-bewusstsein-reflexion", name: "Reflexion", bereichId: "bewusstsein", icon: "rotate-ccw", description: "Erlebtes durchdenken, einordnen, lernen.", order: 4050 },
  { id: "u-bewusstsein-schatten", name: "Schatten-Arbeit", bereichId: "bewusstsein", icon: "moon-star", description: "Was verdraengt ist sichtbar machen und versoehnen.", order: 4060, prerequisites: { minLevel: [{ skillId: "u-bewusstsein-selbst", level: 2 }] } },
  { id: "u-bewusstsein-werte", name: "Werte", bereichId: "bewusstsein", icon: "compass", description: "Klaeren, was wirklich traegt — die innere Richtung.", order: 4070 },
  { id: "u-bewusstsein-vision", name: "Vision", bereichId: "bewusstsein", icon: "telescope", description: "Schau, was werden will — den Faden erkennen.", order: 4080, prerequisites: { minLevel: [{ skillId: "u-bewusstsein-reflexion", level: 2 }, { skillId: "u-bewusstsein-werte", level: 1 }] } },
  { id: "u-bewusstsein-stille", name: "Stille", bereichId: "bewusstsein", icon: "volume-x", description: "Im Schweigen sein, dem Lauschen Raum geben.", order: 4090 },
  { id: "u-bewusstsein-hingabe", name: "Hingabe", bereichId: "bewusstsein", icon: "flame", description: "Sich dem Groesseren anvertrauen.", order: 4100 },

  // ============================================================
  // SOZIALES — Begegnen mit anderen
  // ============================================================
  { id: "u-soziales-zuhoeren", name: "Zuhoeren", bereichId: "soziales", icon: "ear", description: "Da sein, verstehen, nicht bewerten.", order: 5010 },
  { id: "u-soziales-sprechen", name: "Klar sprechen", bereichId: "soziales", icon: "message-circle", description: "Wahrhaftig, klar, liebevoll sich mitteilen.", order: 5020 },
  { id: "u-soziales-empathie", name: "Empathie", bereichId: "soziales", icon: "users", description: "Mitfuehlen, ohne sich zu verlieren.", order: 5030 },
  { id: "u-soziales-konflikt", name: "Konflikt", bereichId: "soziales", icon: "swords", description: "Konflikt aushalten, klaeren, wandeln.", order: 5040 },
  { id: "u-soziales-vertrauen", name: "Vertrauen", bereichId: "soziales", icon: "handshake", description: "Vertrauen geben, empfangen, halten.", order: 5050 },
  { id: "u-soziales-beduerfnisse", name: "Beduerfnisse", bereichId: "soziales", icon: "heart-pulse", description: "Eigene und fremde Beduerfnisse erkennen.", order: 5060 },
  { id: "u-soziales-grenzen", name: "Grenzen", bereichId: "soziales", icon: "shield", description: "Klar Grenzen setzen — schuetzend, ohne Mauer.", order: 5070 },
  { id: "u-soziales-konsent", name: "Konsent", bereichId: "soziales", icon: "check-circle", description: "Wheel of Consent — geben, empfangen, fragen.", order: 5080 },
  { id: "u-soziales-reparieren", name: "Reparieren", bereichId: "soziales", icon: "git-merge", description: "Nach dem Bruch zurueck zueinander finden.", order: 5090, prerequisites: { minLevel: [{ skillId: "u-soziales-konflikt", level: 2 }] } },
  { id: "u-soziales-freundschaft", name: "Freundschaft", bereichId: "soziales", icon: "smile", description: "Beziehungen pflegen ueber Zeit hinweg.", order: 5100 },

  // ============================================================
  // GEMEINSCHAFT — Wirken im Wir
  // ============================================================
  { id: "u-gemeinschaft-treffen", name: "Treffen halten", bereichId: "gemeinschaft", icon: "users-round", description: "Council, Open Space, World Cafe — Raum fuer Gruppen.", order: 6010 },
  { id: "u-gemeinschaft-konsent", name: "Konsent-Entscheidung", bereichId: "gemeinschaft", icon: "vote", description: "Soziokratie, Holokratie — gemeinsam entscheiden.", order: 6020 },
  { id: "u-gemeinschaft-mediation", name: "Mediation", bereichId: "gemeinschaft", icon: "scale", description: "Konflikt zwischen Menschen klaeren helfen.", order: 6030 },
  { id: "u-gemeinschaft-feste", name: "Feste feiern", bereichId: "gemeinschaft", icon: "party-popper", description: "Geburtstag, Jahres-Rad, Uebergaenge ehren.", order: 6040 },
  { id: "u-gemeinschaft-rituale", name: "Rituale halten", bereichId: "gemeinschaft", icon: "flame", description: "Geburt, Bund, Tod — den Rahmen bauen.", order: 6050 },
  { id: "u-gemeinschaft-schenken", name: "Schenken", bereichId: "gemeinschaft", icon: "gift", description: "Geben ohne Erwartung — Schenk-Oekonomie leben.", order: 6060 },
  { id: "u-gemeinschaft-teilen", name: "Teilen", bereichId: "gemeinschaft", icon: "share-2", description: "Was da ist gemeinsam nutzen, Werkzeuge, Wissen, Raum.", order: 6070 },
  { id: "u-gemeinschaft-buergerschaft", name: "Buergerschaft", bereichId: "gemeinschaft", icon: "landmark", description: "Beteiligen — Wahlen, Engagement, Stimme heben.", order: 6080 },
  { id: "u-gemeinschaft-organisation", name: "Organisation", bereichId: "gemeinschaft", icon: "network", description: "Gruppen tragen, Genossenschaften aufbauen.", order: 6090 },
  { id: "u-gemeinschaft-initiation", name: "Initiation", bereichId: "gemeinschaft", icon: "key-round", description: "Andere durch Schwellen begleiten — Coming of Age, Aelteste.", order: 6100, prerequisites: { minLevel: [{ skillId: "u-gemeinschaft-rituale", level: 3 }] } },

  // ============================================================
  // HANDWERK — mit den Haenden formen
  // ============================================================
  { id: "u-handwerk-werkstoffe", name: "Werkstoffe", bereichId: "handwerk", icon: "package", description: "Material lesen — Holz, Metall, Stein, Stoff, Erde.", order: 7010 },
  { id: "u-handwerk-werkzeug", name: "Werkzeug", bereichId: "handwerk", icon: "wrench", description: "Werkzeug kennen, pflegen, sicher fuehren.", order: 7020 },
  { id: "u-handwerk-konstruktion", name: "Konstruktion", bereichId: "handwerk", icon: "ruler", description: "Planen, masseln, vorbereiten vor dem ersten Schnitt.", order: 7030 },
  { id: "u-handwerk-fuegen", name: "Fuegen", bereichId: "handwerk", icon: "link", description: "Verbinden — Schraube, Nagel, Schweissnaht, Stich.", order: 7040 },
  { id: "u-handwerk-formen", name: "Formen", bereichId: "handwerk", icon: "shapes", description: "Schneiden, Schleifen, Gestalten — die Form finden.", order: 7050 },
  { id: "u-handwerk-oberflaeche", name: "Oberflaeche", bereichId: "handwerk", icon: "paintbrush", description: "Lasur, Lack, Oel, Beize, Polieren — die Haut des Werks.", order: 7060 },
  { id: "u-handwerk-reparieren", name: "Reparieren", bereichId: "handwerk", icon: "hammer", description: "Das Kaputte ins Leben zurueck holen.", order: 7070 },
  { id: "u-handwerk-textil", name: "Textil", bereichId: "handwerk", icon: "scissors", description: "Stoff und Faden bearbeiten — naehen, weben, stricken.", order: 7080 },
  { id: "u-handwerk-kueche", name: "Kueche", bereichId: "handwerk", icon: "utensils", description: "Kochen, Backen, Konservieren, Fermentieren.", order: 7090 },
  { id: "u-handwerk-digital", name: "Digital", bereichId: "handwerk", icon: "code", description: "Programmieren, CAD, 3D-Druck — Handwerk im Digitalen.", order: 7100 },

  // ============================================================
  // NATUR — das lebendige Feld
  // ============================================================
  { id: "u-natur-pflanzen", name: "Pflanzen", bereichId: "natur", icon: "flower-2", description: "Pflanzen erkennen, ihre Eigenheit und Heilkraft kennen.", order: 8010 },
  { id: "u-natur-tiere", name: "Tiere", bereichId: "natur", icon: "bird", description: "Tiere lesen, mit ihnen leben, sie versorgen.", order: 8020 },
  { id: "u-natur-boden", name: "Boden", bereichId: "natur", icon: "layers", description: "Erde lesen, was darin lebt, was sie braucht.", order: 8030 },
  { id: "u-natur-wasser", name: "Wasser", bereichId: "natur", icon: "droplet", description: "Wasser finden, lesen, ehren, ruhig fliessen lassen.", order: 8040 },
  { id: "u-natur-wetter", name: "Wetter", bereichId: "natur", icon: "cloud-sun", description: "Wolken lesen, Wind verstehen, Stuerme spueren.", order: 8050 },
  { id: "u-natur-feuer", name: "Feuer", bereichId: "natur", icon: "flame", description: "Feuer machen, halten, sicher fuehren.", order: 8060 },
  { id: "u-natur-wildnis", name: "Wildnis", bereichId: "natur", icon: "tent", description: "In der Wildnis bestehen — Bushcraft, Schutz, Orientierung.", order: 8070 },
  { id: "u-natur-anbau", name: "Anbau", bereichId: "natur", icon: "sprout", description: "Saeen, pflegen, ernten — was die Erde traegt.", order: 8080 },
  { id: "u-natur-jahreskreis", name: "Jahreskreis", bereichId: "natur", icon: "calendar", description: "Den Lauf der Jahreszeiten lesen und mitgehen.", order: 8090 },
  { id: "u-natur-spuren", name: "Spuren", bereichId: "natur", icon: "footprints", description: "Spuren lesen — was war hier, wer ging vorbei.", order: 8100 },
]

/**
 * Lookup-Map fuer schnellen Zugriff per ID.
 */
export const UNIVERSAL_SKILL_BY_ID: Record<string, SkillData & { id: string }> =
  UNIVERSAL_SKILLS.reduce((acc, s) => {
    acc[s.id] = s
    return acc
  }, {} as Record<string, SkillData & { id: string }>)

/**
 * Praefix der universellen Skill-IDs. Universal-Skills sind ueber alle
 * Spaces hinweg identisch und im Code definiert (nicht als WoT-Items).
 */
export const UNIVERSAL_SKILL_PREFIX = "u-"

export function isUniversalSkillId(id: string): boolean {
  return id.startsWith(UNIVERSAL_SKILL_PREFIX)
}
