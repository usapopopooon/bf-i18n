import { describe, it, expect } from 'vitest';
import { convertTranslations, laravelPluralToRails } from '../converter.js';

describe('converter', () => {
  describe('convertTranslations', () => {
    it('converts interpolation from Rails to Laravel', () => {
      const translations = {
        en: { greeting: 'Hello, %{name}!' },
      };

      const result = convertTranslations(translations, 'rails', 'laravel');

      expect(result.en.greeting).toBe('Hello, :name!');
    });

    it('converts interpolation from Laravel to Rails', () => {
      const translations = {
        en: { greeting: 'Hello, :name!' },
      };

      const result = convertTranslations(translations, 'laravel', 'rails');

      expect(result.en.greeting).toBe('Hello, %{name}!');
    });

    it('converts pluralization from Rails to Laravel', () => {
      const translations = {
        en: {
          items: {
            zero: 'No items',
            one: '1 item',
            other: '%{count} items',
          },
        },
      };

      const result = convertTranslations(translations, 'rails', 'laravel');

      expect(result.en.items).toBe('{0} No items|{1} 1 item|[2,*] :count items');
    });

    it('preserves nested structures', () => {
      const translations = {
        en: {
          messages: {
            greeting: 'Hello, %{name}!',
          },
        },
      };

      const result = convertTranslations(translations, 'rails', 'laravel');

      expect((result.en.messages as Record<string, unknown>).greeting).toBe('Hello, :name!');
    });

    it('returns same translations when modes are equal', () => {
      const translations = {
        en: { hello: 'Hello' },
      };

      const result = convertTranslations(translations, 'rails', 'rails');

      expect(result).toEqual(translations);
    });
  });

  describe('laravelPluralToRails', () => {
    it('converts Laravel plural format to Rails', () => {
      const result = laravelPluralToRails('{0} No items|{1} One item|[2,*] Many items');

      expect(result).toEqual({
        zero: 'No items',
        one: 'One item',
        other: 'Many items',
      });
    });

    it('handles simple singular|plural format', () => {
      const result = laravelPluralToRails('One|Many');

      expect(result).toEqual({
        one: 'One',
        other: 'Many',
      });
    });
  });
});
