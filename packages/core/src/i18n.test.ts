import { describe, it, expect, vi } from 'vitest';
import { createI18n } from './i18n.js';

describe('I18n', () => {
  const translations = {
    en: {
      greeting: 'Hello',
      hello_name: 'Hello, %{name}!',
      messages: {
        welcome: 'Welcome to our app',
        nested: {
          deep: 'Deeply nested value',
        },
      },
      items: {
        zero: 'No items',
        one: 'One item',
        other: '%{count} items',
      },
    },
    ja: {
      greeting: 'こんにちは',
      hello_name: 'こんにちは、%{name}さん！',
      messages: {
        welcome: 'アプリへようこそ',
      },
    },
  };

  describe('basic translation', () => {
    const i18n = createI18n({
      translations,
      defaultLocale: 'en',
    });

    it('should translate simple key', () => {
      expect(i18n.t('greeting')).toBe('Hello');
    });

    it('should translate nested key', () => {
      expect(i18n.t('messages.welcome')).toBe('Welcome to our app');
    });

    it('should translate deeply nested key', () => {
      expect(i18n.t('messages.nested.deep')).toBe('Deeply nested value');
    });

    it('should return key if translation is missing', () => {
      expect(i18n.t('nonexistent')).toBe('nonexistent');
    });
  });

  describe('interpolation', () => {
    const i18n = createI18n({
      translations,
      defaultLocale: 'en',
    });

    it('should interpolate variables', () => {
      expect(i18n.t('hello_name', { name: 'World' })).toBe('Hello, World!');
    });
  });

  describe('pluralization', () => {
    const i18n = createI18n({
      translations,
      defaultLocale: 'en',
    });

    it('should select zero form', () => {
      expect(i18n.t('items', { count: 0 })).toBe('No items');
    });

    it('should select one form', () => {
      expect(i18n.t('items', { count: 1 })).toBe('One item');
    });

    it('should select other form and interpolate', () => {
      expect(i18n.t('items', { count: 5 })).toBe('5 items');
    });
  });

  describe('locale management', () => {
    it('should use default locale', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      expect(i18n.locale).toBe('en');
    });

    it('should use specified locale', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
        locale: 'ja',
      });
      expect(i18n.locale).toBe('ja');
    });

    it('should change locale', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      i18n.locale = 'ja';
      expect(i18n.locale).toBe('ja');
      expect(i18n.t('greeting')).toBe('こんにちは');
    });

    it('should return available locales', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      expect(i18n.availableLocales).toEqual(['en', 'ja']);
    });
  });

  describe('fallback', () => {
    it('should fallback to default locale', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
        locale: 'ja',
      });
      // 'messages.nested.deep' is not in 'ja', should fallback to 'en'
      expect(i18n.t('messages.nested.deep')).toBe('Deeply nested value');
    });

    it('should fallback from language variant to base', () => {
      const i18n = createI18n({
        translations: {
          en: { greeting: 'Hello' },
          'en-US': { specific: 'US specific' },
        },
        defaultLocale: 'en',
        locale: 'en-US',
      });
      expect(i18n.t('greeting')).toBe('Hello');
    });

    it('should use fallbackLocale option', () => {
      const i18n = createI18n({
        translations: {
          en: { greeting: 'Hello' },
          ja: { greeting: 'こんにちは' },
          fr: {},
        },
        defaultLocale: 'en',
        locale: 'fr',
        fallbackLocale: 'ja',
      });
      expect(i18n.t('greeting')).toBe('こんにちは');
    });
  });

  describe('options', () => {
    it('should use default value if translation is missing', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      expect(i18n.t('nonexistent', { default: 'Default text' })).toBe('Default text');
    });

    it('should apply scope', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      expect(i18n.t('welcome', { scope: 'messages' })).toBe('Welcome to our app');
    });

    it('should apply array scope', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      expect(i18n.t('deep', { scope: ['messages', 'nested'] })).toBe('Deeply nested value');
    });
  });

  describe('exists', () => {
    const i18n = createI18n({
      translations,
      defaultLocale: 'en',
    });

    it('should return true for existing key', () => {
      expect(i18n.exists('greeting')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      expect(i18n.exists('nonexistent')).toBe(false);
    });

    it('should check specific locale with fallback', () => {
      expect(i18n.exists('messages.nested.deep', 'en')).toBe(true);
      // Not in 'ja', but fallback finds it in 'en', so returns true
      expect(i18n.exists('messages.nested.deep', 'ja')).toBe(true);
    });

    it('should return false if not found in any fallback', () => {
      expect(i18n.exists('completely.nonexistent.key')).toBe(false);
    });
  });

  describe('addTranslations', () => {
    it('should add new translations', () => {
      const i18n = createI18n({
        translations: { en: { existing: 'Existing' } },
        defaultLocale: 'en',
      });
      i18n.addTranslations('en', { added: 'Added' });
      expect(i18n.t('added')).toBe('Added');
      expect(i18n.t('existing')).toBe('Existing');
    });

    it('should merge nested translations', () => {
      const i18n = createI18n({
        translations: { en: { messages: { a: 'A' } } },
        defaultLocale: 'en',
      });
      i18n.addTranslations('en', { messages: { b: 'B' } });
      expect(i18n.t('messages.a')).toBe('A');
      expect(i18n.t('messages.b')).toBe('B');
    });
  });

  describe('onChange', () => {
    it('should notify listeners on locale change', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      const listener = vi.fn();
      i18n.onChange(listener);
      i18n.locale = 'ja';
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not notify if locale is the same', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      const listener = vi.fn();
      i18n.onChange(listener);
      i18n.locale = 'en';
      expect(listener).not.toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
      });
      const listener = vi.fn();
      const unsubscribe = i18n.onChange(listener);
      unsubscribe();
      i18n.locale = 'ja';
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('missingTranslationHandler', () => {
    it('should call handler for missing translations', () => {
      const handler = vi.fn().mockReturnValue('Custom fallback');
      const i18n = createI18n({
        translations,
        defaultLocale: 'en',
        missingTranslationHandler: handler,
      });
      const result = i18n.t('nonexistent');
      expect(handler).toHaveBeenCalledWith('nonexistent', 'en');
      expect(result).toBe('Custom fallback');
    });
  });

  describe('Laravel mode', () => {
    const laravelTranslations = {
      en: {
        greeting: 'Hello, :name!',
        items_simple: 'item|items',
        items_full: '{0} No items|{1} One item|[2,*] :count items',
      },
    };

    const i18n = createI18n({
      mode: 'laravel',
      translations: laravelTranslations,
      defaultLocale: 'en',
    });

    it('should interpolate Laravel format', () => {
      expect(i18n.t('greeting', { name: 'World' })).toBe('Hello, World!');
    });

    it('should handle simple singular/plural', () => {
      expect(i18n.t('items_simple', { count: 1 })).toBe('item');
      expect(i18n.t('items_simple', { count: 2 })).toBe('items');
    });

    it('should handle Laravel pluralization with exact and range', () => {
      expect(i18n.t('items_full', { count: 0 })).toBe('No items');
      expect(i18n.t('items_full', { count: 1 })).toBe('One item');
      // :count is interpolated with the count value
      expect(i18n.t('items_full', { count: 5 })).toBe('5 items');
    });
  });

  describe('edge cases', () => {
    describe('locale validation', () => {
      it('should throw error for empty string locale', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(() => {
          i18n.locale = '';
        }).toThrow('Locale must be a non-empty string');
      });

      it('should throw error for whitespace-only locale', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(() => {
          i18n.locale = '   ';
        }).toThrow('Locale must be a non-empty string');
      });

      it('should trim locale string', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        i18n.locale = '  ja  ';
        expect(i18n.locale).toBe('ja');
      });
    });

    describe('hasLocale', () => {
      it('should return true for available locale', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(i18n.hasLocale('en')).toBe(true);
        expect(i18n.hasLocale('ja')).toBe(true);
      });

      it('should return false for unavailable locale', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(i18n.hasLocale('fr')).toBe(false);
        expect(i18n.hasLocale('de')).toBe(false);
      });
    });

    describe('pluralization edge cases', () => {
      const i18n = createI18n({
        translations: {
          en: {
            items: {
              zero: 'No items',
              one: 'One item',
              other: '%{count} items',
            },
          },
        },
        defaultLocale: 'en',
      });

      it('should handle negative count', () => {
        // Intl.PluralRules treats -1 as 'one' in English
        expect(i18n.t('items', { count: -1 })).toBe('One item');
        expect(i18n.t('items', { count: -5 })).toBe('-5 items');
      });

      it('should handle decimal count', () => {
        expect(i18n.t('items', { count: 1.5 })).toBe('1.5 items');
        expect(i18n.t('items', { count: 0.5 })).toBe('0.5 items');
      });

      it('should handle very large count', () => {
        expect(i18n.t('items', { count: 1000000 })).toBe('1000000 items');
      });
    });

    describe('deeply nested keys', () => {
      it('should handle very deep nesting', () => {
        const i18n = createI18n({
          translations: {
            en: {
              a: { b: { c: { d: { e: { f: 'Deep value' } } } } },
            },
          },
          defaultLocale: 'en',
        });
        expect(i18n.t('a.b.c.d.e.f')).toBe('Deep value');
      });

      it('should return key for partial path', () => {
        const i18n = createI18n({
          translations: {
            en: {
              a: { b: { c: 'Value' } },
            },
          },
          defaultLocale: 'en',
        });
        // 'a.b' returns an object, not a string
        expect(i18n.t('a.b')).toBe('{"c":"Value"}');
      });
    });

    describe('special characters in keys', () => {
      it('should handle keys with special characters', () => {
        const i18n = createI18n({
          translations: {
            en: {
              'with-dash': 'Dashed',
              with_underscore: 'Underscored',
              'with.dot': 'Dotted (as key, not nested)',
            },
          },
          defaultLocale: 'en',
        });
        expect(i18n.t('with-dash')).toBe('Dashed');
        expect(i18n.t('with_underscore')).toBe('Underscored');
      });
    });

    describe('empty translations', () => {
      it('should handle empty string translation', () => {
        const i18n = createI18n({
          translations: {
            en: { empty: '' },
          },
          defaultLocale: 'en',
        });
        expect(i18n.t('empty')).toBe('');
      });

      it('should handle empty translation object', () => {
        const i18n = createI18n({
          translations: {
            en: {},
          },
          defaultLocale: 'en',
        });
        expect(i18n.t('any.key')).toBe('any.key');
      });
    });

    describe('mode getter', () => {
      it('should return the mode', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
          mode: 'rails',
        });
        expect(i18n.mode).toBe('rails');
      });

      it('should default to rails mode', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(i18n.mode).toBe('rails');
      });
    });

    describe('getTranslations', () => {
      it('should return translations object', () => {
        const i18n = createI18n({
          translations,
          defaultLocale: 'en',
        });
        expect(i18n.getTranslations()).toStrictEqual(translations);
      });
    });

    describe('missing key tracking', () => {
      it('should track missing keys', () => {
        const i18n = createI18n({
          translations: { en: { hello: 'Hello' } },
          defaultLocale: 'en',
        });

        expect(i18n.hasMissingKeys()).toBe(false);
        expect(i18n.getMissingKeys()).toHaveLength(0);

        // Access a missing key
        i18n.t('nonexistent.key');

        expect(i18n.hasMissingKeys()).toBe(true);
        expect(i18n.getMissingKeys()).toHaveLength(1);
        expect(i18n.getMissingKeys()[0].key).toBe('nonexistent.key');
        expect(i18n.getMissingKeys()[0].locale).toBe('en');
      });

      it('should not duplicate missing keys', () => {
        const i18n = createI18n({
          translations: { en: {} },
          defaultLocale: 'en',
        });

        i18n.t('missing');
        i18n.t('missing');
        i18n.t('missing');

        expect(i18n.getMissingKeys()).toHaveLength(1);
      });

      it('should track missing keys per locale', () => {
        const i18n = createI18n({
          translations: { en: {}, ja: {} },
          defaultLocale: 'en',
        });

        i18n.t('key1');
        i18n.t('key1', { locale: 'ja' });

        expect(i18n.getMissingKeys()).toHaveLength(2);
      });

      it('should clear missing keys', () => {
        const i18n = createI18n({
          translations: { en: {} },
          defaultLocale: 'en',
        });

        i18n.t('missing');
        expect(i18n.hasMissingKeys()).toBe(true);

        i18n.clearMissingKeys();
        expect(i18n.hasMissingKeys()).toBe(false);
        expect(i18n.getMissingKeys()).toHaveLength(0);
      });

      it('should not track existing keys', () => {
        const i18n = createI18n({
          translations: { en: { hello: 'Hello' } },
          defaultLocale: 'en',
        });

        i18n.t('hello');
        expect(i18n.hasMissingKeys()).toBe(false);
      });
    });
  });
});
