import type { SpaceConfig } from "../types.js"

export const LICHTUNG: SpaceConfig = {
  id: "lichtung",
  name: "Lichtung",
  tagline: "Wo Frieden sichtbar wird",
  description: "Setze Licht-Pins, gründe Lichtungen und verbinde dich mit Menschen, die den Frieden leben.",
  domain: "lichtung.ooo",

  modules: [
    { moduleId: "dashboard", label: "Start", icon: "LayoutGrid", order: 0 },
    { moduleId: "map", label: "Karte", icon: "Map", order: 1 },
    { moduleId: "calendar", label: "Termine", icon: "CalendarDays", order: 2 },
    { moduleId: "projects", label: "Lichtungen", icon: "Sun", order: 3 },
    { moduleId: "profile", label: "Profil", icon: "User", order: 4 },
    { moduleId: "gamification", label: "Wachstum", icon: "Sprout", order: 5 },
  ],

  theme: {
    colors: {
      primary: "#D4A020",
      secondary: "#45B764",
      accent: "#E8751A",
      background: "#FFFDF7",
      surface: "#FFFFFF",
      text: "#1A1A1A",
      muted: "rgba(10,10,10,0.45)",
      danger: "#DC2626",
      success: "#45B764",
      warning: "#D4A020",
    },
    categoryColors: {
      frieden: "#D4A020",
      natur: "#45B764",
      kunst: "#9B59B6",
      gemeinschaft: "#E8751A",
      bildung: "#2D7DD2",
      heilung: "#C07090",
    },
    fonts: {
      heading: "Cormorant Garamond",
      body: "Inter",
    },
    iconSet: "lucide",
    radius: "lg",
    mapStyle: {
      tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: "CartoDB",
      pinStyle: "circle",
      clusterStyle: "gradient",
    },
    terms: {
      werkstatt: "Lichtung",
      event: "Treffen",
      user: "Lichtträger",
      project: "Lichtung",
      badge: "Flamme",
      skill: "Tugend",
      leaderboard: "Leuchtturm",
      join: "Beitreten",
      create: "Gründen",
      profile: "Profil",
    },
  },

  itemTypes: [
    {
      type: "lichtung",
      label: "Lichtung",
      labelPlural: "Lichtungen",
      icon: "Sun",
      color: "#D4A020",
      fields: [
        { key: "title", type: "text", label: "Name", required: true, placeholder: "z.B. Friedensgarten Weimar" },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "location", type: "location", label: "Ort", required: true },
        { key: "tags", type: "tags", label: "Themen", required: false, placeholder: "frieden, natur, kunst..." },
        { key: "category", type: "select", label: "Bereich", required: true,
          options: ["frieden", "natur", "kunst", "gemeinschaft", "bildung", "heilung"] },
      ],
      appearsIn: ["map", "feed", "dashboard"],
      actions: ["create", "edit", "delete", "join", "leave", "share"],
      pinStyle: { shape: "circle", size: 40, anchorBottom: false },
    },
    {
      type: "licht-pin",
      label: "Licht-Pin",
      labelPlural: "Licht-Pins",
      icon: "Sparkles",
      color: "#D4A020",
      fields: [
        { key: "title", type: "text", label: "Botschaft", required: true, placeholder: "Ein Satz des Friedens" },
        { key: "location", type: "location", label: "Ort", required: true },
      ],
      appearsIn: ["map"],
      actions: ["create", "delete"],
      pinStyle: { shape: "circle", size: 24, anchorBottom: false },
    },
    {
      type: "treffen",
      label: "Treffen",
      labelPlural: "Treffen",
      icon: "CalendarDays",
      color: "#45B764",
      fields: [
        { key: "title", type: "text", label: "Titel", required: true },
        { key: "description", type: "richtext", label: "Beschreibung", required: false },
        { key: "location", type: "location", label: "Ort", required: true },
        { key: "start", type: "datetime", label: "Beginn", required: true },
        { key: "end", type: "datetime", label: "Ende", required: false },
        { key: "tags", type: "tags", label: "Themen", required: false },
      ],
      appearsIn: ["map", "calendar", "dashboard"],
      actions: ["create", "edit", "delete", "join", "leave", "share"],
      pinStyle: { shape: "circle", size: 32, anchorBottom: false },
    },
  ],

  connector: "graphql",

  gamification: {
    skillCategories: [
      { id: "frieden", name: "Frieden", color: "#D4A020", icon: "Dove" },
      { id: "natur", name: "Natur", color: "#45B764", icon: "Leaf" },
      { id: "kunst", name: "Kunst", color: "#9B59B6", icon: "Palette" },
      { id: "gemeinschaft", name: "Gemeinschaft", color: "#E8751A", icon: "Users" },
    ],
    badges: [
      { id: "erste-flamme", name: "Erste Flamme", description: "Erstes Licht-Pin gesetzt", icon: "🕯️", color: "#D4A020",
        requirement: { type: "items_created", value: 1 } },
      { id: "lichttraeger", name: "Lichtträger", description: "10 Licht-Pins gesetzt", icon: "✨", color: "#D4A020",
        requirement: { type: "items_created", value: 10 } },
      { id: "gruender", name: "Gründer", description: "Erste Lichtung gegründet", icon: "🌱", color: "#45B764",
        requirement: { type: "items_created", value: 1 } },
      { id: "verbinder", name: "Verbinder", description: "10 Verbindungen bestätigt", icon: "🤝", color: "#E8751A",
        requirement: { type: "connections", value: 10 } },
    ],
    xpRules: [
      { trigger: "item.create", itemType: "licht-pin", category: "frieden", amount: 10, description: "Licht-Pin gesetzt" },
      { trigger: "item.create", itemType: "lichtung", category: "gemeinschaft", amount: 100, description: "Lichtung gegründet" },
      { trigger: "item.join", itemType: "treffen", category: "gemeinschaft", amount: 25, description: "Treffen besucht" },
      { trigger: "connection.confirm", category: "gemeinschaft", amount: 15, description: "Verbindung bestätigt" },
    ],
    levelFormula: "sqrt",
    levelBase: 50,
  },

  landing: {
    sections: [
      {
        type: "hero",
        headline: "Wo Frieden sichtbar wird",
        subline: "Setze Licht-Pins, gründe Lichtungen und verbinde dich mit Menschen, die den Frieden leben.",
        cta: "Karte entdecken",
        ctaUrl: "/app",
      },
      {
        type: "features",
        items: [
          { title: "Licht-Pins setzen", description: "Markiere Orte des Friedens auf der Weltkarte", icon: "Sparkles" },
          { title: "Lichtungen gründen", description: "Schaffe Räume für Begegnung und Gemeinschaft", icon: "Sun" },
          { title: "Verbindungen knüpfen", description: "Finde Gleichgesinnte in deiner Nähe", icon: "Users" },
        ],
      },
      {
        type: "map-preview",
        center: [51.1657, 10.4515],
        zoom: 5,
        demoItems: 200,
      },
      {
        type: "cta",
        headline: "Werde Teil der Lichtung",
        subline: "Kostenlos. Werbefrei. Von Menschen für Menschen.",
        buttonText: "Jetzt mitmachen",
        buttonUrl: "/app",
      },
    ],
    footer: {
      links: [
        { label: "Impressum", url: "/impressum" },
        { label: "Datenschutz", url: "/datenschutz" },
      ],
      legal: "Kollektiv Lichtung e.V.",
    },
  },

  seed: {
    count: 5000,
  },

  meta: {
    author: "Timo + Eli",
    createdAt: "2026-04-28",
    updatedAt: "2026-04-28",
    version: "0.1.0",
    status: "prototype",
  },
}
