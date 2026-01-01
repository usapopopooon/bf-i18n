// Mode schemas
export {
  ModeSchema,
  BuiltInModeSchema,
  SourceModeSchema,
  BuiltInSourceModeSchema,
  ModeConfigSchema,
  BUILT_IN_MODE_CONFIGS,
  type Mode,
  type BuiltInMode,
  type SourceMode,
  type BuiltInSourceMode,
  type ModeConfig,
} from './mode.js';

// Translation schemas
export {
  TranslationValueSchema,
  TranslationObjectSchema,
  TranslationsSchema,
  PluralCategorySchema,
  PluralObjectSchema,
  type TranslationValue,
  type TranslationObject,
  type Translations,
  type PluralCategory,
  type PluralObject,
} from './translation.js';

// Interpolation schemas
export {
  InterpolationOptionsSchema,
  RailsInterpolationDefaults,
  LaravelInterpolationDefaults,
  type InterpolationOptions,
} from './interpolation.js';

// Pluralization schemas
export {
  PluralizationTypeSchema,
  PluralizationOptionsSchema,
  LaravelPluralRuleSchema,
  RailsPluralizationDefaults,
  LaravelPluralizationDefaults,
  type PluralizationType,
  type PluralizationOptions,
  type LaravelPluralRule,
} from './pluralization.js';

// Options schemas
export {
  I18nOptionsSchema,
  TranslateOptionsSchema,
  type I18nOptions,
  type I18nOptionsResolved,
  type TranslateOptions,
  type MissingTranslationHandler,
} from './options.js';

// Compatibility schemas
export {
  IssueLevelSchema,
  IssueTypeSchema,
  CompatibilityWarningSchema,
  CompatibilityErrorSchema,
  CompatibilityReportSchema,
  ConvertOptionsSchema,
  ConvertResultSchema,
  type IssueLevel,
  type IssueType,
  type CompatibilityWarning,
  type CompatibilityError,
  type CompatibilityReport,
  type ConvertOptions,
  type ConvertOptionsResolved,
  type ConvertResult,
  type OnWarningCallback,
  type OnErrorCallback,
} from './compatibility.js';
