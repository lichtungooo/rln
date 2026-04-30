// ─── Feld-Definitionen ───

export type FieldType =
  | "text"
  | "richtext"
  | "number"
  | "date"
  | "datetime"
  | "location"
  | "media"
  | "tags"
  | "select"
  | "multiselect"
  | "boolean"
  | "url"
  | "email"
  | "color"
  | "relation"

export interface FieldSpec {
  key: string
  type: FieldType
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  defaultValue?: unknown
  relation?: {
    targetType: string
    predicate: string
    direction?: "from" | "to" | "both"
  }
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// ─── Item-Typ-Definitionen ───

export interface ItemTypeSpec {
  type: string
  label: string
  labelPlural: string
  icon: string
  color: string
  fields: FieldSpec[]
  appearsIn: string[]
  actions: ItemAction[]
  pinStyle?: PinStyle
}

export type ItemAction =
  | "create"
  | "edit"
  | "delete"
  | "join"
  | "leave"
  | "fund"
  | "share"
  | "report"
  | "archive"

export interface PinStyle {
  shape: "teardrop" | "circle" | "square" | "hexagon"
  iconSvg?: string
  size: number
  anchorBottom?: boolean
}

// ─── Modul-Definitionen ───

export interface ViewSpec {
  id: string
  label: string
  icon: string
  layout: "fullscreen" | "panel" | "drawer" | "modal" | "tab"
}

export interface WidgetSpec {
  id: string
  label: string
  icon: string
  size: "small" | "medium" | "large"
  refreshInterval?: number
}

export interface ActionSpec {
  id: string
  label: string
  icon: string
  type: "fab" | "menu" | "toolbar" | "contextmenu"
  requiresAuth: boolean
  itemType?: string
}

export interface ModuleDefinition {
  id: string
  name: string
  version: string
  icon: string
  description: string

  itemTypes: ItemTypeSpec[]
  requiredFields: string[]
  optionalFields: string[]

  requiredCapabilities: string[]
  optionalCapabilities: string[]

  views: ViewSpec[]
  widgets: WidgetSpec[]
  actions: ActionSpec[]

  config: Record<string, ConfigField>
}

export interface ConfigField {
  type: "string" | "number" | "boolean" | "select" | "color"
  label: string
  defaultValue: unknown
  options?: string[]
}

// ─── Theme ───

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    muted: string
    danger?: string
    success?: string
    warning?: string
  }

  categoryColors: Record<string, string>

  fonts: {
    heading: string
    body: string
    mono?: string
  }

  iconSet: "lucide" | "phosphor" | "custom"
  customIcons?: Record<string, string>

  radius: "none" | "sm" | "md" | "lg" | "full"

  mapStyle?: {
    tileUrl: string
    attribution: string
    pinStyle: "teardrop" | "circle" | "square"
    clusterStyle: "ring" | "gradient" | "count"
    darkTileUrl?: string
  }

  terms: Record<string, string>
}

// ─── Gamification ───

export interface SkillCategoryDef {
  id: string
  name: string
  color: string
  icon: string
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category?: string
  requirement: {
    type: "skill_level" | "any_skill_level" | "skills_at_level" | "items_created" | "items_joined" | "connections" | "quests_completed" | "custom"
    value: number
    customCheck?: string
  }
}

export interface XpRule {
  trigger: "item.create" | "item.join" | "item.complete" | "connection.confirm" | "quest.complete" | "claim.create" | "custom"
  itemType?: string
  category: string
  amount: number
  description?: string
}

export interface GamificationConfig {
  skillCategories: SkillCategoryDef[]
  badges: BadgeDef[]
  xpRules: XpRule[]
  attributeMapping?: Record<string, string>
  levelFormula?: "sqrt" | "linear" | "exponential"
  levelBase?: number
}

// ─── Landingpage ───

export type LandingSection =
  | { type: "hero"; headline: string; subline: string; cta: string; ctaUrl: string; backgroundImage?: string; backgroundVideo?: string }
  | { type: "problem-solution"; problem: string; solution: string; icon?: string }
  | { type: "features"; items: { title: string; description: string; icon: string }[] }
  | { type: "modules-preview"; modules: string[]; style: "grid" | "carousel" }
  | { type: "stats"; items: { label: string; value: string; icon?: string }[] }
  | { type: "testimonials"; items: { quote: string; name: string; role: string; avatar?: string }[] }
  | { type: "target-groups"; groups: { name: string; description: string; icon: string }[] }
  | { type: "cta"; headline: string; subline?: string; buttonText: string; buttonUrl: string }
  | { type: "partners"; logos: { name: string; imageUrl: string; url?: string }[] }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | { type: "pricing"; tiers: { name: string; price: string; period?: string; features: string[]; highlighted?: boolean }[] }
  | { type: "map-preview"; center: [number, number]; zoom: number; demoItems?: number }
  | { type: "custom"; component: string; props?: Record<string, unknown> }

export interface LandingConfig {
  sections: LandingSection[]
  footer?: {
    links: { label: string; url: string }[]
    legal: string
  }
}

// ─── Space-Konfiguration (das Herzstück) ───

export interface EnabledModule {
  moduleId: string
  label?: string
  icon?: string
  config?: Record<string, unknown>
  visible?: boolean
  order?: number
}

export interface SpaceConfig {
  id: string
  name: string
  tagline: string
  description?: string
  domain?: string
  logo?: string

  modules: EnabledModule[]
  theme: ThemeConfig
  itemTypes: ItemTypeSpec[]

  connector: "mock" | "local" | "graphql" | "wot"
  connectorConfig?: Record<string, unknown>

  landing?: LandingConfig
  gamification?: GamificationConfig

  seed?: {
    cities?: { name: string; lat: number; lng: number; weight: number }[]
    count?: number
  }

  meta?: {
    author: string
    createdAt: string
    updatedAt: string
    version: string
    status: "draft" | "prototype" | "pitch" | "production"
  }
}
