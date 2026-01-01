import React from 'react';
import type { I18n, TranslateOptions } from '@bf-i18n/core';
import { useTranslation } from './hooks.js';

/**
 * Props injected by withTranslation HOC.
 */
export interface WithTranslationProps {
  t: (key: string, options?: TranslateOptions) => string;
  locale: string;
  setLocale: (locale: string) => void;
  i18n: I18n;
}

/**
 * Higher-order component for class components.
 * Injects t, locale, setLocale, and i18n props.
 */
export function withTranslation<P extends WithTranslationProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithTranslationProps>> {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: Omit<P, keyof WithTranslationProps>) => {
    const { t, locale, setLocale, i18n } = useTranslation();

    return (
      <Component
        {...(props as P)}
        t={t}
        locale={locale}
        setLocale={setLocale}
        i18n={i18n}
      />
    );
  };

  WrappedComponent.displayName = `withTranslation(${displayName})`;

  return WrappedComponent;
}
