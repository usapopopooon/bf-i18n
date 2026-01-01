import React, { useMemo } from 'react';
import { I18n, createI18n, type I18nOptions } from '@bf-i18n/core';
import { I18nContext } from './context.js';

export interface I18nProviderProps {
  /**
   * Existing I18n instance.
   */
  i18n?: I18n;

  /**
   * Options to create a new I18n instance.
   * Ignored if i18n is provided.
   */
  options?: I18nOptions;

  /**
   * Children components.
   */
  children: React.ReactNode;
}

/**
 * I18n context provider for React.
 * Either provide an existing I18n instance or options to create one.
 */
export function I18nProvider({
  i18n,
  options,
  children,
}: I18nProviderProps): React.ReactElement {
  const i18nInstance = useMemo(() => {
    if (i18n) {
      return i18n;
    }
    if (options) {
      return createI18n(options);
    }
    throw new Error(
      'I18nProvider requires either an i18n instance or options to create one'
    );
  }, [i18n, options]);

  return (
    <I18nContext.Provider value={i18nInstance}>
      {children}
    </I18nContext.Provider>
  );
}
