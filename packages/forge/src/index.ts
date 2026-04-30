// ─── Types ───
export type {
  FieldType,
  FieldSpec,
  ItemTypeSpec,
  ItemAction,
  PinStyle,
  ViewSpec,
  WidgetSpec,
  ActionSpec,
  ModuleDefinition,
  ConfigField,
  ThemeConfig,
  SkillCategoryDef,
  BadgeDef,
  XpRule,
  GamificationConfig,
  LandingSection,
  LandingConfig,
  EnabledModule,
  SpaceConfig,
} from "./types.js"

// ─── Module Registry ───
export {
  MAP_MODULE,
  CALENDAR_MODULE,
  KANBAN_MODULE,
  PROFILE_MODULE,
  WERKSTAETTEN_MODULE,
  PROJECTS_MODULE,
  GAMIFICATION_MODULE,
  MARKETPLACE_MODULE,
  DASHBOARD_MODULE,
  MODULE_REGISTRY,
  getModule,
  getAllModules,
  getModulesByCapability,
} from "./modules.js"

// ─── Theme Engine ───
export {
  themeToCSS,
  themeToStyleObject,
  resolveTerm,
  getCategoryColor,
} from "./theme.js"

// ─── Validation ───
export { validateSpaceConfig, isValid } from "./validate.js"
export type { ValidationIssue } from "./validate.js"

// ─── Spaces ───
export { MACHER_MAP } from "./spaces/macher-map.js"
export { LICHTUNG } from "./spaces/lichtung.js"
