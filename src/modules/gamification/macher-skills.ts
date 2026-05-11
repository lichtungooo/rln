import type { SkillData } from "./types"

/**
 * Default-Skills fuer den Macher-Space.
 *
 * Werden beim ersten Oeffnen des Skill-Tree-Moduls (oder beim Demo-Daten-
 * Laden) als `type: "skill"`-Items angelegt. Admins koennen sie spaeter
 * im Modul-Editor anpassen oder eigene hinzufuegen.
 *
 * Bereich-Mapping:
 *   handwerk     → die Macher-Klassiker (Holz, Metall, ...)
 *   koerper      → koerperlich-handfeste Skills (Schweissen, Schmieden — sind auch handwerk!)
 *   geist        → Plan, Konstruktion, Berechnung
 *   gemeinschaft → Lehrlinge ausbilden, Workshops geben
 *
 * Multi-Skill-Verteilung passiert in der Quest-Konfig — eine Quest kann
 * mehreren Skills XP geben.
 */
export const MACHER_DEFAULT_SKILLS: Array<SkillData & { id: string }> = [
  // --- Handwerk (primaer) ---
  { id: "holz", name: "Holz", bereichId: "handwerk", icon: "trees", color: "#8B5A2B", description: "Saege, Hobel, Schnitzmesser. Vom Brett zum Werk.", order: 10 },
  { id: "metall", name: "Metall", bereichId: "handwerk", icon: "wrench", color: "#94A3B8", description: "Saegen, Bohren, Feilen, Biegen.", order: 20 },
  { id: "schweissen", name: "Schweissen", bereichId: "handwerk", icon: "flame", color: "#F97316", description: "Lichtbogen, MIG, MAG, WIG. Funken fliegen, Stahl wird eins.", order: 30 },
  { id: "schmieden", name: "Schmieden", bereichId: "handwerk", icon: "hammer", color: "#A16207", description: "Esse, Amboss, Hammer. Form gibt's mit Hitze und Druck.", order: 40 },
  { id: "elektronik", name: "Elektronik", bereichId: "handwerk", icon: "cpu", color: "#3B82F6", description: "Loeten, Schaltungen, Sensorik. Wo Strom denkt.", order: 50 },
  { id: "drucken-3d", name: "3D-Druck", bereichId: "handwerk", icon: "box", color: "#10B981", description: "FDM, SLA, Slicer-Magie. Vom CAD zum Bauteil.", order: 60 },
  { id: "lasern", name: "Lasern", bereichId: "handwerk", icon: "zap", color: "#EF4444", description: "Schneiden, Gravieren, Praezision in Holz und Acryl.", order: 70 },
  { id: "naehen", name: "Naehen", bereichId: "handwerk", icon: "scissors", color: "#EC4899", description: "Maschine, Faden, Stoff. Vom Schnittmuster zum Stueck.", order: 80 },
  { id: "toepfern", name: "Toepfern", bereichId: "handwerk", icon: "circle", color: "#A78BFA", description: "Drehscheibe, Brennofen, Glasur. Erde wird Form.", order: 90 },
  { id: "drechseln", name: "Drechseln", bereichId: "handwerk", icon: "rotate-cw", color: "#92400E", description: "Drehbank, Stechbeitel. Holz im Tanz.", order: 100 },
  { id: "lackieren", name: "Lackieren", bereichId: "handwerk", icon: "palette", color: "#06B6D4", description: "Grundieren, Sprayen, Polieren. Oberflaeche als Werk.", order: 110 },
  { id: "reparieren", name: "Reparieren", bereichId: "handwerk", icon: "wrench", color: "#84CC16", description: "Diagnostizieren, oeffnen, fluechtige Teile zurueckbringen.", order: 120 },

  // --- Koerper ---
  { id: "ausdauer", name: "Ausdauer", bereichId: "koerper", icon: "activity", description: "Lange Sessions am Werkstuck, ohne dass die Kraft schwindet.", order: 200 },
  { id: "praezision", name: "Praezision", bereichId: "koerper", icon: "target", description: "Ruhige Hand, exaktes Mass — der Koerper als Werkzeug.", order: 210 },

  // --- Geist ---
  { id: "konstruktion", name: "Konstruktion", bereichId: "geist", icon: "ruler", description: "Idee → Plan → Massblatt. Vor jedem Schnitt der Gedanke.", order: 300 },
  { id: "material-kunde", name: "Material-Kunde", bereichId: "geist", icon: "book-open", description: "Was traegt was. Holz, Stahl, Aluminium, Kunststoff — die Eigenheiten kennen.", order: 310 },

  // --- Gemeinschaft ---
  { id: "lehre", name: "Lehre", bereichId: "gemeinschaft", icon: "graduation-cap", description: "Wissen weitergeben. Lehrlinge fuehren.", order: 400 },
  { id: "werkstatt-fuehren", name: "Werkstatt fuehren", bereichId: "gemeinschaft", icon: "users", description: "Open-Source-Werkstatt orchestrieren, Mitmachen ermoeglichen.", order: 410 },

  // --- Soziales ---
  { id: "auftrags-kommunikation", name: "Auftrags-Kommunikation", bereichId: "soziales", icon: "message-square", description: "Auftraggeber verstehen, Erwartung klaeren, abliefern.", order: 500 },

  // --- Bewusstsein ---
  { id: "achtsamkeit", name: "Achtsamkeit am Werk", bereichId: "bewusstsein", icon: "eye", description: "Im Tun voll praesent. Werkstatt als Meditation.", order: 600 },

  // --- Natur ---
  { id: "garten", name: "Garten", bereichId: "natur", icon: "sprout", color: "#65A30D", description: "Beet anlegen, Boden lesen, Saatgut auswaehlen. Was waechst und wann.", order: 700 },
  { id: "permakultur", name: "Permakultur", bereichId: "natur", icon: "trees", color: "#16A34A", description: "Zonen, Polykultur, Wasserrueckhaltung. Lebenssystem statt Einzelpflanze.", order: 710 },
  { id: "imkern", name: "Imkern", bereichId: "natur", icon: "hexagon", color: "#F59E0B", description: "Stockschau, Schwarmkontrolle, Honig schleudern. Bienen lesen lernen.", order: 720 },
  { id: "heilpflanzen", name: "Heilpflanzen", bereichId: "natur", icon: "flower-2", color: "#EC4899", description: "Wildkraeuter erkennen, sammeln, verarbeiten. Tinktur, Salbe, Tee.", order: 730 },
  { id: "holzwirtschaft", name: "Holzwirtschaft", bereichId: "natur", icon: "tree-pine", color: "#92400E", description: "Wald lesen, Baum faellen, Trocknen, Hochwertiges Material herstellen.", order: 740 },
]

/**
 * Macher-Avatar-Items (Belohnungen) — Default-Set.
 * Werden beim Demo-Laden als `type: "avatar-item"`-Items angelegt.
 */
export const MACHER_DEFAULT_AVATAR_ITEMS = [
  // Handwerk-Pfad
  { id: "holzhobel", name: "Holzhobel", symbol: "trees", bereichId: "handwerk" as const, rarity: "common" as const, condition: "Holz Level 3", color: "#8B5A2B" },
  { id: "goldene-saege", name: "Goldene Saege", symbol: "scissors", bereichId: "handwerk" as const, rarity: "legendary" as const, condition: "Carpenter-Quest-Reihe abgeschlossen", color: "#FBBF24" },
  { id: "schweisser-helm", name: "Schweisser-Helm", symbol: "flame", bereichId: "handwerk" as const, rarity: "rare" as const, condition: "Schweissen Level 5", color: "#F97316" },
  { id: "loet-stern", name: "Loet-Stern", symbol: "star", bereichId: "handwerk" as const, rarity: "rare" as const, condition: "Erste eigene Schaltung gebaut", color: "#3B82F6" },

  // Koerper-Pfad
  { id: "robust", name: "Robust", symbol: "shield", bereichId: "koerper" as const, rarity: "common" as const, condition: "100h in der Werkstatt", color: "#EF4444" },

  // Gemeinschaft-Pfad
  { id: "lehrer-stab", name: "Lehrer-Stab", symbol: "graduation-cap", bereichId: "gemeinschaft" as const, rarity: "epic" as const, condition: "Drei Lehrlinge zur Gesellenpruefung gefuehrt", color: "#10B981" },
  { id: "werkstatt-schluessel", name: "Werkstatt-Schluessel", symbol: "key", bereichId: "gemeinschaft" as const, rarity: "rare" as const, condition: "Eigene Werkstatt eroeffnet", color: "#10B981" },

  // Natur-Pfad
  { id: "gruener-daumen", name: "Gruener Daumen", symbol: "sprout", bereichId: "natur" as const, rarity: "common" as const, condition: "Erstes Beet angelegt", color: "#65A30D" },
  { id: "bienen-fluesterer", name: "Bienen-Fluesterer", symbol: "hexagon", bereichId: "natur" as const, rarity: "epic" as const, condition: "Eigenes Bienenvolk durch ein Jahr gefuehrt", color: "#F59E0B" },

  // Allgemein
  { id: "macher-stern", name: "Macher-Stern", symbol: "sparkles", rarity: "epic" as const, condition: "Erste eigene Quest-Reihe veroeffentlicht", color: "#E8751A" },
]
