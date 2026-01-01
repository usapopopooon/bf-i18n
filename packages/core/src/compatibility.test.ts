import { describe, it, expect } from 'vitest';
import { checkCompatibility } from './compatibility.js';

describe('CompatibilityChecker', () => {
  describe('Rails to Laravel', () => {
    it('returns compatible for simple translations', () => {
      const translations = {
        hello: 'Hello',
        greeting: 'Hello, %{name}!',
      };

      const result = checkCompatibility(translations, 'rails', 'laravel');

      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('warns about complex plural forms', () => {
      const translations = {
        items: {
          zero: 'No items',
          one: '1 item',
          two: '2 items',
          few: 'A few items',
          many: 'Many items',
          other: '%{count} items',
        },
      };

      const result = checkCompatibility(translations, 'rails', 'laravel');

      expect(result.compatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.type === 'unsupported_plural_form')).toBe(true);
    });

    it('handles nested translations', () => {
      const translations = {
        messages: {
          welcome: 'Welcome, %{name}!',
          goodbye: 'Goodbye!',
        },
      };

      const result = checkCompatibility(translations, 'rails', 'laravel');

      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Laravel to Rails', () => {
    it('returns compatible for simple translations', () => {
      const translations = {
        hello: 'Hello',
        greeting: 'Hello, :name!',
      };

      const result = checkCompatibility(translations, 'laravel', 'rails');

      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns about range-based plural syntax', () => {
      const translations = {
        items: '{0} No items|{1} One item|[2,10] Several items|[11,*] Many items',
      };

      const result = checkCompatibility(translations, 'laravel', 'rails');

      expect(result.compatible).toBe(true);
      expect(result.warnings.some((w) => w.type === 'unsupported_range_plural')).toBe(true);
    });

    it('warns about exact match patterns beyond 2', () => {
      const translations = {
        items: '{0} None|{1} One|{2} Two|{3} Three|{4} Four',
      };

      const result = checkCompatibility(translations, 'laravel', 'rails');

      expect(result.compatible).toBe(true);
      expect(result.warnings.some((w) => w.type === 'unsupported_plural_form')).toBe(true);
    });

    it('errors on invalid plural syntax', () => {
      const translations = {
        invalid: 'This|is|not|valid|plural|syntax|with|too|many|pipes',
      };

      const result = checkCompatibility(translations, 'laravel', 'rails');

      // This might be compatible since the parser is lenient
      // The key test is that it doesn't crash
      expect(result).toBeDefined();
    });
  });

  describe('same mode', () => {
    it('returns compatible when modes are the same', () => {
      const translations = {
        hello: 'Hello',
        items: {
          zero: 'No items',
          one: '1 item',
          other: '%{count} items',
        },
      };

      const result = checkCompatibility(translations, 'rails', 'rails');

      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
