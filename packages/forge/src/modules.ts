import type { ModuleDefinition } from "./types.js"

export const MAP_MODULE: ModuleDefinition = {
  id: "map",
  name: "Karte",
  version: "1.0.0",
  icon: "Map",
  description: "Interaktive Karte mit Pins, Clustering und Standort-Features",
  itemTypes: [],
  requiredFields: ["location"],
  optionalFields: ["tags", "category"],
  requiredCapabilities: [],
  optionalCapabilities: ["writable"],
  views: [
    { id: "fullscreen", label: "Vollbild-Karte", icon: "Maximize", layout: "fullscreen" },
    { id: "mini", label: "Mini-Karte", icon: "MapPin", layout: "panel" },
  ],
  widgets: [
    { id: "map-overview", label: "Karten-Übersicht", icon: "Map", size: "large" },
    { id: "nearby", label: "In deiner Nähe", icon: "Navigation", size: "medium" },
  ],
  actions: [
    { id: "locate-me", label: "Mein Standort", icon: "LocateFixed", type: "toolbar", requiresAuth: false },
    { id: "place-pin", label: "Pin setzen", icon: "MapPin", type: "fab", requiresAuth: true },
  ],
  config: {
    defaultCenter: { type: "string", label: "Kartenmitte (lat,lng)", defaultValue: "51.1657,10.4515" },
    defaultZoom: { type: "number", label: "Start-Zoom", defaultValue: 6 },
    maxClusterRadius: { type: "number", label: "Cluster-Radius (px)", defaultValue: 35 },
    showLocateButton: { type: "boolean", label: "Standort-Button", defaultValue: true },
  },
}

export const CALENDAR_MODULE: ModuleDefinition = {
  id: "calendar",
  name: "Kalender",
  version: "1.0.0",
  icon: "CalendarDays",
  description: "Events und Termine mit Kalenderansichten",
  itemTypes: [],
  requiredFields: ["start"],
  optionalFields: ["end", "recurring", "maxParticipants"],
  requiredCapabilities: [],
  optionalCapabilities: ["writable"],
  views: [
    { id: "month", label: "Monatsansicht", icon: "CalendarDays", layout: "panel" },
    { id: "week", label: "Wochenansicht", icon: "Calendar", layout: "panel" },
    { id: "list", label: "Listenansicht", icon: "List", layout: "panel" },
  ],
  widgets: [
    { id: "upcoming", label: "Nächste Termine", icon: "Clock", size: "medium" },
  ],
  actions: [
    { id: "create-event", label: "Event erstellen", icon: "Plus", type: "fab", requiresAuth: true },
  ],
  config: {
    defaultView: { type: "select", label: "Standard-Ansicht", defaultValue: "month", options: ["month", "week", "list"] },
    showRecurring: { type: "boolean", label: "Wiederkehrende Events", defaultValue: true },
  },
}

export const KANBAN_MODULE: ModuleDefinition = {
  id: "kanban",
  name: "Kanban",
  version: "1.0.0",
  icon: "LayoutDashboard",
  description: "Kanban-Board mit konfigurierbaren Spalten",
  itemTypes: [],
  requiredFields: ["status"],
  optionalFields: ["assignee", "priority", "dueDate"],
  requiredCapabilities: ["writable"],
  optionalCapabilities: [],
  views: [
    { id: "board", label: "Board", icon: "LayoutDashboard", layout: "fullscreen" },
  ],
  widgets: [
    { id: "my-tasks", label: "Meine Aufgaben", icon: "CheckSquare", size: "medium" },
  ],
  actions: [
    { id: "create-task", label: "Aufgabe erstellen", icon: "Plus", type: "fab", requiresAuth: true },
  ],
  config: {
    columns: { type: "string", label: "Spalten (kommasepariert)", defaultValue: "offen,in-arbeit,fertig" },
  },
}

export const PROFILE_MODULE: ModuleDefinition = {
  id: "profile",
  name: "Profil",
  version: "1.0.0",
  icon: "User",
  description: "User-Profile mit Bio, Bild und Kontaktdaten",
  itemTypes: [],
  requiredFields: [],
  optionalFields: ["bio", "avatar", "telegram", "offers", "needs"],
  requiredCapabilities: [],
  optionalCapabilities: ["profile", "contacts", "signedClaims"],
  views: [
    { id: "my-profile", label: "Mein Profil", icon: "User", layout: "drawer" },
    { id: "public-profile", label: "Öffentliches Profil", icon: "UserCircle", layout: "panel" },
  ],
  widgets: [
    { id: "profile-card", label: "Profilkarte", icon: "User", size: "small" },
    { id: "connections", label: "Verbindungen", icon: "Users", size: "medium" },
  ],
  actions: [],
  config: {
    showTelegram: { type: "boolean", label: "Telegram anzeigen", defaultValue: true },
    showOffersNeeds: { type: "boolean", label: "Angebote & Gesuche", defaultValue: false },
  },
}

export const WERKSTAETTEN_MODULE: ModuleDefinition = {
  id: "werkstaetten",
  name: "Werkstätten",
  version: "1.0.0",
  icon: "Hammer",
  description: "Orte mit Kategorie-System, Mitgliedern und Slots",
  itemTypes: [
    {
      type: "werkstatt",
      label: "Werkstatt",
      labelPlural: "Werkstätten",
      icon: "Hammer",
      color: "#E8751A",
      fields: [
        { key: "title", type: "text", label: "Name", required: true },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "location", type: "location", label: "Standort", required: true },
        { key: "tags", type: "tags", label: "Kategorien", required: false },
        { key: "category", type: "select", label: "Hauptkategorie", required: true,
          options: ["holz", "metall", "elektro", "textil", "keramik", "schmieden", "fahrrad", "siebdruck", "laser", "reparatur", "3ddruck", "digital"] },
      ],
      appearsIn: ["map", "feed", "dashboard"],
      actions: ["create", "edit", "delete", "join", "leave", "share"],
    },
  ],
  requiredFields: ["location", "category"],
  optionalFields: ["tags", "slots"],
  requiredCapabilities: ["writable"],
  optionalCapabilities: ["groups"],
  views: [
    { id: "detail", label: "Werkstatt-Detail", icon: "Hammer", layout: "panel" },
    { id: "list", label: "Werkstatt-Liste", icon: "List", layout: "drawer" },
  ],
  widgets: [
    { id: "nearby-werkstaetten", label: "Werkstätten in der Nähe", icon: "Hammer", size: "medium" },
    { id: "my-werkstaetten", label: "Meine Werkstätten", icon: "Star", size: "small" },
  ],
  actions: [
    { id: "create-werkstatt", label: "Werkstatt eintragen", icon: "Plus", type: "fab", requiresAuth: true, itemType: "werkstatt" },
  ],
  config: {
    categories: { type: "string", label: "Kategorien (kommasepariert)", defaultValue: "holz,metall,elektro,textil,keramik,schmieden,fahrrad,siebdruck,laser,reparatur,3ddruck,digital" },
    showSlots: { type: "boolean", label: "Zeitslots anzeigen", defaultValue: true },
  },
}

export const PROJECTS_MODULE: ModuleDefinition = {
  id: "projects",
  name: "Projekte",
  version: "1.0.0",
  icon: "Rocket",
  description: "Gemeinschaftsprojekte mit Funding, Meilensteinen und Fortschritt",
  itemTypes: [
    {
      type: "project",
      label: "Projekt",
      labelPlural: "Projekte",
      icon: "Rocket",
      color: "#45B764",
      fields: [
        { key: "title", type: "text", label: "Titel", required: true },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "location", type: "location", label: "Standort", required: true },
        { key: "goalAmount", type: "number", label: "Ziel-Betrag", required: false },
        { key: "tags", type: "tags", label: "Tags", required: false },
        { key: "videoUrl", type: "url", label: "Video-URL", required: false },
      ],
      appearsIn: ["map", "feed", "dashboard"],
      actions: ["create", "edit", "delete", "fund", "share"],
    },
  ],
  requiredFields: ["location"],
  optionalFields: ["goalAmount", "currentAmount", "milestones"],
  requiredCapabilities: ["writable"],
  optionalCapabilities: [],
  views: [
    { id: "detail", label: "Projekt-Detail", icon: "Rocket", layout: "panel" },
  ],
  widgets: [
    { id: "active-projects", label: "Aktive Projekte", icon: "Rocket", size: "medium" },
  ],
  actions: [
    { id: "create-project", label: "Projekt starten", icon: "Plus", type: "fab", requiresAuth: true, itemType: "project" },
  ],
  config: {
    showFunding: { type: "boolean", label: "Funding-Balken", defaultValue: true },
    showMilestones: { type: "boolean", label: "Meilensteine", defaultValue: true },
  },
}

export const GAMIFICATION_MODULE: ModuleDefinition = {
  id: "gamification",
  name: "Gamification",
  version: "1.0.0",
  icon: "Flame",
  description: "Skill-Tree, XP, Badges, Leaderboard — portabler Charakter",
  itemTypes: [],
  requiredFields: [],
  optionalFields: [],
  requiredCapabilities: [],
  optionalCapabilities: [],
  views: [
    { id: "skill-tree", label: "Skill-Tree", icon: "GitBranch", layout: "panel" },
    { id: "badges", label: "Badges", icon: "Award", layout: "panel" },
    { id: "leaderboard", label: "Rangliste", icon: "Trophy", layout: "drawer" },
  ],
  widgets: [
    { id: "my-level", label: "Mein Level", icon: "Flame", size: "small" },
    { id: "recent-xp", label: "Letzte XP", icon: "Zap", size: "small" },
    { id: "top-macher", label: "Top Macher", icon: "Trophy", size: "medium" },
  ],
  actions: [],
  config: {
    showLeaderboard: { type: "boolean", label: "Rangliste anzeigen", defaultValue: true },
    levelFormula: { type: "select", label: "Level-Formel", defaultValue: "sqrt", options: ["sqrt", "linear", "exponential"] },
  },
}

export const MARKETPLACE_MODULE: ModuleDefinition = {
  id: "marketplace",
  name: "Marktplatz",
  version: "0.1.0",
  icon: "ShoppingBag",
  description: "Angebote & Gesuche, Matching, Tausch und Handel",
  itemTypes: [
    {
      type: "offer",
      label: "Angebot",
      labelPlural: "Angebote",
      icon: "Package",
      color: "#45B764",
      fields: [
        { key: "title", type: "text", label: "Titel", required: true },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "price", type: "number", label: "Preis", required: false },
        { key: "tags", type: "tags", label: "Kategorien", required: false },
        { key: "location", type: "location", label: "Standort", required: false },
        { key: "media", type: "media", label: "Bilder", required: false },
      ],
      appearsIn: ["marketplace", "map", "feed"],
      actions: ["create", "edit", "delete", "share"],
    },
    {
      type: "need",
      label: "Gesuch",
      labelPlural: "Gesuche",
      icon: "Search",
      color: "#2D7DD2",
      fields: [
        { key: "title", type: "text", label: "Titel", required: true },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "budget", type: "number", label: "Budget", required: false },
        { key: "tags", type: "tags", label: "Kategorien", required: false },
        { key: "location", type: "location", label: "Standort", required: false },
      ],
      appearsIn: ["marketplace", "map", "feed"],
      actions: ["create", "edit", "delete", "share"],
    },
  ],
  requiredFields: ["title"],
  optionalFields: ["price", "location", "media", "tags"],
  requiredCapabilities: ["writable"],
  optionalCapabilities: ["contacts"],
  views: [
    { id: "grid", label: "Rasteransicht", icon: "Grid3x3", layout: "fullscreen" },
    { id: "list", label: "Listenansicht", icon: "List", layout: "panel" },
    { id: "matching", label: "Matching", icon: "Handshake", layout: "panel" },
  ],
  widgets: [
    { id: "recent-offers", label: "Neue Angebote", icon: "Package", size: "medium" },
    { id: "my-listings", label: "Meine Einträge", icon: "Tag", size: "small" },
  ],
  actions: [
    { id: "create-offer", label: "Angebot erstellen", icon: "Plus", type: "fab", requiresAuth: true, itemType: "offer" },
    { id: "create-need", label: "Gesuch erstellen", icon: "Search", type: "menu", requiresAuth: true, itemType: "need" },
  ],
  config: {
    showPrices: { type: "boolean", label: "Preise anzeigen", defaultValue: true },
    currency: { type: "string", label: "Währung", defaultValue: "EUR" },
    enableMatching: { type: "boolean", label: "Angebot-Gesuch-Matching", defaultValue: true },
  },
}

export const DASHBOARD_MODULE: ModuleDefinition = {
  id: "dashboard",
  name: "Dashboard",
  version: "1.0.0",
  icon: "LayoutGrid",
  description: "Konfigurierbares Widget-Board als Absprungpunkt",
  itemTypes: [],
  requiredFields: [],
  optionalFields: [],
  requiredCapabilities: [],
  optionalCapabilities: [],
  views: [
    { id: "dashboard", label: "Dashboard", icon: "LayoutGrid", layout: "fullscreen" },
  ],
  widgets: [],
  actions: [],
  config: {
    columns: { type: "number", label: "Spalten", defaultValue: 3 },
    compactLayout: { type: "boolean", label: "Kompaktes Layout", defaultValue: false },
  },
}

// ─── Registry ───

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  map: MAP_MODULE,
  calendar: CALENDAR_MODULE,
  kanban: KANBAN_MODULE,
  profile: PROFILE_MODULE,
  werkstaetten: WERKSTAETTEN_MODULE,
  projects: PROJECTS_MODULE,
  gamification: GAMIFICATION_MODULE,
  marketplace: MARKETPLACE_MODULE,
  dashboard: DASHBOARD_MODULE,
}

export function getModule(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[id]
}

export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY)
}

export function getModulesByCapability(capability: string): ModuleDefinition[] {
  return getAllModules().filter(
    m => m.requiredCapabilities.includes(capability) || m.optionalCapabilities.includes(capability)
  )
}
