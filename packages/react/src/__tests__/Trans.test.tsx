import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createI18n } from '@bf-i18n/core';
import { I18nProvider } from '../provider.js';
import { Trans } from '../Trans.js';

const translations = {
  en: {
    simple: 'Hello World',
    withTag: 'Hello <bold>World</bold>!',
    withMultipleTags: '<bold>Hello</bold> <italic>World</italic>!',
    withVariable: 'Hello, %{name}!',
    withTagAndVariable: 'Hello, <bold>%{name}</bold>!',
    nested: {
      key: 'Nested <bold>value</bold>',
    },
  },
};

describe('Trans', () => {
  it('renders simple translation', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <Trans i18nKey="simple" />
      </I18nProvider>
    );

    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('renders translation with component tag', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <div data-testid="container">
          <Trans i18nKey="withTag" components={{ bold: <strong /> }} />
        </div>
      </I18nProvider>
    );

    const container = screen.getByTestId('container');
    expect(container.innerHTML).toContain('<strong>World</strong>');
  });

  it('renders translation with multiple component tags', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <div data-testid="container">
          <Trans
            i18nKey="withMultipleTags"
            components={{ bold: <strong />, italic: <em /> }}
          />
        </div>
      </I18nProvider>
    );

    const container = screen.getByTestId('container');
    expect(container.innerHTML).toContain('<strong>Hello</strong>');
    expect(container.innerHTML).toContain('<em>World</em>');
  });

  it('renders translation with interpolation values', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <Trans i18nKey="withVariable" values={{ name: 'Alice' }} />
      </I18nProvider>
    );

    expect(screen.getByText('Hello, Alice!')).toBeDefined();
  });

  it('renders translation with both tags and values', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <div data-testid="container">
          <Trans
            i18nKey="withTagAndVariable"
            components={{ bold: <strong /> }}
            values={{ name: 'Bob' }}
          />
        </div>
      </I18nProvider>
    );

    const container = screen.getByTestId('container');
    expect(container.innerHTML).toContain('<strong>Bob</strong>');
  });

  it('renders children as fallback when key not found', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <Trans i18nKey="nonexistent">Fallback content</Trans>
      </I18nProvider>
    );

    expect(screen.getByText('Fallback content')).toBeDefined();
  });

  it('keeps original text when component mapping not found', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <Trans i18nKey="withTag" components={{}} />
      </I18nProvider>
    );

    expect(screen.getByText('Hello <bold>World</bold>!')).toBeDefined();
  });

  it('passes additional options to translation', () => {
    const i18n = createI18n({ defaultLocale: 'en', translations });

    render(
      <I18nProvider i18n={i18n}>
        <div data-testid="container">
          <Trans
            i18nKey="key"
            options={{ scope: 'nested' }}
            components={{ bold: <strong /> }}
          />
        </div>
      </I18nProvider>
    );

    const container = screen.getByTestId('container');
    expect(container.innerHTML).toContain('<strong>value</strong>');
  });
});
