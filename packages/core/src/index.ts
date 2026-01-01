// @bf-i18n/core - Core library for backend-friendly i18n

// Export all schemas and types
export * from './schemas/index.js';

// Export core classes
export { I18n, createI18n } from './i18n.js';
export { Translator, type TranslatorOptions } from './translator.js';
export {
  Interpolator,
  createRailsInterpolator,
  createLaravelInterpolator,
} from './interpolator.js';
export {
  Pluralizer,
  createRailsPluralizer,
  createLaravelPluralizer,
} from './pluralizer.js';
