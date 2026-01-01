import { useContext, useCallback, useSyncExternalStore } from 'react';
import type { I18n, TranslateOptions } from '@bf-i18n/core';
import { I18nContext } from './context.js';

/**
 * Get the I18n instance from context.
 * Throws if used outside of I18nProvider.
 */
export function useI18n(): I18n {
  const i18n = useContext(I18nContext);
  if (!i18n) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return i18n;
}

export interface UseTranslationOptions {
  /**
   * Default scope for translations.
   */
  scope?: string | string[];
}

export interface UseTranslationReturn {
  /**
   * Translation function.
   */
  t: (key: string, options?: TranslateOptions) => string;

  /**
   * Current locale.
   */
  locale: string;

  /**
   * Set locale.
   */
  setLocale: (locale: string) => void;

  /**
   * I18n instance.
   */
  i18n: I18n;
}

/**
 * Hook for translations with automatic re-render on locale change.
 */
export function useTranslation(
  options: UseTranslationOptions = {}
): UseTranslationReturn {
  const i18n = useI18n();

  // Subscribe to locale changes for automatic re-render
  const locale = useSyncExternalStore(
    (callback) => i18n.onChange(callback),
    () => i18n.locale,
    () => i18n.locale
  );

  const t = useCallback(
    (key: string, translateOptions?: TranslateOptions) => {
      const mergedOptions: TranslateOptions = {
        ...translateOptions,
      };

      // Apply default scope if provided
      if (options.scope && !translateOptions?.scope) {
        mergedOptions.scope = options.scope;
      }

      return i18n.t(key, mergedOptions);
    },
    [i18n, options.scope]
  );

  const setLocale = useCallback(
    (newLocale: string) => {
      i18n.locale = newLocale;
    },
    [i18n]
  );

  return {
    t,
    locale,
    setLocale,
    i18n,
  };
}

export interface UseLocaleReturn {
  /**
   * Current locale.
   */
  locale: string;

  /**
   * Available locales.
   */
  availableLocales: string[];

  /**
   * Set locale.
   */
  setLocale: (locale: string) => void;
}

/**
 * Hook for locale management only.
 */
export function useLocale(): UseLocaleReturn {
  const i18n = useI18n();

  const locale = useSyncExternalStore(
    (callback) => i18n.onChange(callback),
    () => i18n.locale,
    () => i18n.locale
  );

  const setLocale = useCallback(
    (newLocale: string) => {
      i18n.locale = newLocale;
    },
    [i18n]
  );

  return {
    locale,
    availableLocales: i18n.availableLocales,
    setLocale,
  };
}
