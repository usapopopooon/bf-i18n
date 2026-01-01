import { describe, it, expect } from 'vitest';
import { validateTranslations } from '../validator.js';

describe('validator', () => {
  describe('validateTranslations', () => {
    it('returns valid for matching translations', () => {
      const translations = {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        ja: { hello: 'こんにちは', goodbye: 'さようなら' },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('detects missing keys', () => {
      const translations = {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        ja: { hello: 'こんにちは' },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_key');
      expect(result.errors[0].key).toBe('goodbye');
    });

    it('warns about extra keys', () => {
      const translations = {
        en: { hello: 'Hello' },
        ja: { hello: 'こんにちは', extra: '余分' },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].key).toBe('extra');
    });

    it('detects type mismatches', () => {
      const translations = {
        en: { hello: 'Hello' },
        ja: { hello: { nested: 'value' } },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(false);
      // Errors include type mismatch + missing key for nested structure
      expect(result.errors.some((e) => e.type === 'type_mismatch')).toBe(true);
    });

    it('warns about empty values', () => {
      const translations = {
        en: { hello: 'Hello' },
        ja: { hello: '' },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('empty_value');
    });

    it('handles nested keys', () => {
      const translations = {
        en: { messages: { greeting: 'Hello' } },
        ja: { messages: {} },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].key).toBe('messages.greeting');
    });

    it('returns error for missing reference locale', () => {
      const translations = {
        ja: { hello: 'こんにちは' },
      };

      const result = validateTranslations(translations, 'en');

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Reference locale "en" not found');
    });
  });
});
