import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createI18n } from '@bf-i18n/core';
import { I18nProvider } from '../provider.js';
import { useI18n } from '../hooks.js';

const translations = {
  en: {
    hello: 'Hello',
    greeting: 'Hello, %{name}!',
  },
  ja: {
    hello: 'こんにちは',
    greeting: 'こんにちは、%{name}さん！',
  },
};

function TestComponent() {
  const i18n = useI18n();
  return <div data-testid="locale">{i18n.locale}</div>;
}

describe('I18nProvider', () => {
  it('provides i18n instance to children', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations,
    });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('creates i18n instance from options', () => {
    render(
      <I18nProvider options={{ defaultLocale: 'ja', translations }}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('ja');
  });

  it('throws error when neither i18n nor options provided', () => {
    expect(() => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    }).toThrow('I18nProvider requires either an i18n instance or options to create one');
  });

  it('prefers i18n over options when both provided', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations,
    });

    render(
      <I18nProvider i18n={i18n} options={{ defaultLocale: 'ja', translations }}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
  });
});
