// @bf-i18n/react - React integration for backend-friendly i18n

// Context
export { I18nContext } from './context.js';

// Provider
export { I18nProvider, type I18nProviderProps } from './provider.js';

// Hooks
export {
  useI18n,
  useTranslation,
  useLocale,
  type UseTranslationOptions,
  type UseTranslationReturn,
  type UseLocaleReturn,
} from './hooks.js';

// Components
export { Trans, type TransProps } from './Trans.js';

// HOC
export { withTranslation, type WithTranslationProps } from './hoc.js';

// Re-export core types for convenience
export type {
  I18n,
  I18nOptions,
  TranslateOptions,
  Translations,
} from '@bf-i18n/core';
