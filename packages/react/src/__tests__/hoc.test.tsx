import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createI18n } from '@bf-i18n/core';
import { I18nProvider } from '../provider.js';
import { withTranslation, type WithTranslationProps } from '../hoc.js';

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

interface TestProps extends WithTranslationProps {
  customProp?: string;
}

function TestComponent({ t, locale, setLocale, i18n, customProp }: TestProps) {
  return (
    <>
      <div data-testid="translation">{t('hello')}</div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="custom">{customProp}</div>
      <div data-testid="exists">{String(i18n.exists('hello'))}</div>
      <button data-testid="change" onClick={() => setLocale('ja')}>
        Change
      </button>
    </>
  );
}

const WrappedComponent = withTranslation(TestComponent);

describe('withTranslation', () => {
  it('injects t function', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <WrappedComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('translation').textContent).toBe('Hello');
  });

  it('injects locale', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <WrappedComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('injects i18n instance', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <WrappedComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('exists').textContent).toBe('true');
  });

  it('injects setLocale that changes locale', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <WrappedComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('translation').textContent).toBe('Hello');

    act(() => {
      screen.getByTestId('change').click();
    });

    expect(screen.getByTestId('locale').textContent).toBe('ja');
    expect(screen.getByTestId('translation').textContent).toBe('こんにちは');
  });

  it('passes through custom props', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <WrappedComponent customProp="test value" />
      </I18nProvider>
    );

    expect(screen.getByTestId('custom').textContent).toBe('test value');
  });

  it('sets displayName correctly', () => {
    expect(WrappedComponent.displayName).toBe('withTranslation(TestComponent)');
  });

  it('works with anonymous component', () => {
    const AnonymousWrapped = withTranslation(({ t }: WithTranslationProps) => (
      <div data-testid="anon">{t('hello')}</div>
    ));

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <AnonymousWrapped />
      </I18nProvider>
    );

    expect(screen.getByTestId('anon').textContent).toBe('Hello');
    expect(AnonymousWrapped.displayName).toBe('withTranslation(Component)');
  });
});
