import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createI18n } from '@bf-i18n/core';
import { I18nProvider } from '../provider.js';
import { useI18n, useTranslation, useLocale } from '../hooks.js';

const translations = {
  en: {
    hello: 'Hello',
    greeting: 'Hello, %{name}!',
    nested: {
      key: 'Nested value',
    },
    items: {
      zero: 'No items',
      one: '1 item',
      other: '%{count} items',
    },
  },
  ja: {
    hello: 'こんにちは',
    greeting: 'こんにちは、%{name}さん！',
    nested: {
      key: 'ネストされた値',
    },
    items: {
      zero: 'アイテムなし',
      one: '1個のアイテム',
      other: '%{count}個のアイテム',
    },
  },
};

describe('useI18n', () => {
  it('returns i18n instance', () => {
    function TestComponent() {
      const i18n = useI18n();
      return <div data-testid="mode">{i18n.mode}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('mode').textContent).toBe('rails');
  });

  it('throws error when used outside provider', () => {
    function TestComponent() {
      useI18n();
      return null;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useI18n must be used within an I18nProvider');
  });
});

describe('useTranslation', () => {
  it('translates simple keys', () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div data-testid="translation">{t('hello')}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('translation').textContent).toBe('Hello');
  });

  it('translates with interpolation', () => {
    function TestComponent() {
      const { t } = useTranslation();
      return <div data-testid="translation">{t('greeting', { name: 'World' })}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('translation').textContent).toBe('Hello, World!');
  });

  it('translates with pluralization', () => {
    function TestComponent() {
      const { t } = useTranslation();
      return (
        <>
          <div data-testid="zero">{t('items', { count: 0 })}</div>
          <div data-testid="one">{t('items', { count: 1 })}</div>
          <div data-testid="many">{t('items', { count: 5 })}</div>
        </>
      );
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('zero').textContent).toBe('No items');
    expect(screen.getByTestId('one').textContent).toBe('1 item');
    expect(screen.getByTestId('many').textContent).toBe('5 items');
  });

  it('applies scope option', () => {
    function TestComponent() {
      const { t } = useTranslation({ scope: 'nested' });
      return <div data-testid="translation">{t('key')}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('translation').textContent).toBe('Nested value');
  });

  it('returns current locale', () => {
    function TestComponent() {
      const { locale } = useTranslation();
      return <div data-testid="locale">{locale}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('setLocale changes locale and re-renders', () => {
    function TestComponent() {
      const { t, locale, setLocale } = useTranslation();
      return (
        <>
          <div data-testid="locale">{locale}</div>
          <div data-testid="translation">{t('hello')}</div>
          <button data-testid="change" onClick={() => setLocale('ja')}>
            Change
          </button>
        </>
      );
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
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

  it('returns i18n instance', () => {
    function TestComponent() {
      const { i18n } = useTranslation();
      return <div data-testid="exists">{String(i18n.exists('hello'))}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('exists').textContent).toBe('true');
  });
});

describe('useLocale', () => {
  it('returns current locale', () => {
    function TestComponent() {
      const { locale } = useLocale();
      return <div data-testid="locale">{locale}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('returns available locales', () => {
    function TestComponent() {
      const { availableLocales } = useLocale();
      return <div data-testid="locales">{availableLocales.join(',')}</div>;
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locales').textContent).toBe('en,ja');
  });

  it('setLocale changes locale', () => {
    function TestComponent() {
      const { locale, setLocale } = useLocale();
      return (
        <>
          <div data-testid="locale">{locale}</div>
          <button data-testid="change" onClick={() => setLocale('ja')}>
            Change
          </button>
        </>
      );
    }

    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('locale').textContent).toBe('en');

    act(() => {
      screen.getByTestId('change').click();
    });

    expect(screen.getByTestId('locale').textContent).toBe('ja');
  });
});
