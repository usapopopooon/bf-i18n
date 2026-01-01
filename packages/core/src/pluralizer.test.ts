import { describe, it, expect } from 'vitest';
import {
  Pluralizer,
  createRailsPluralizer,
  createLaravelPluralizer,
} from './pluralizer.js';

describe('Pluralizer', () => {
  describe('Rails format (key-based)', () => {
    const pluralizer = createRailsPluralizer('en');

    it('should select zero for count 0', () => {
      const translations = {
        zero: 'No items',
        one: 'One item',
        other: '%{count} items',
      };
      expect(pluralizer.resolveKeyBased(translations, 0)).toBe('No items');
    });

    it('should select one for count 1', () => {
      const translations = {
        zero: 'No items',
        one: 'One item',
        other: '%{count} items',
      };
      expect(pluralizer.resolveKeyBased(translations, 1)).toBe('One item');
    });

    it('should select other for count > 1', () => {
      const translations = {
        zero: 'No items',
        one: 'One item',
        other: '%{count} items',
      };
      expect(pluralizer.resolveKeyBased(translations, 5)).toBe('%{count} items');
    });

    it('should fallback to other if zero is not present', () => {
      const translations = {
        one: 'One item',
        other: '%{count} items',
      };
      expect(pluralizer.resolveKeyBased(translations, 0)).toBe('%{count} items');
    });
  });

  describe('Laravel format (pipe-separated)', () => {
    const pluralizer = createLaravelPluralizer('en');

    it('should parse exact match format', () => {
      const result = pluralizer.resolvePipeBased('{0} None|{1} One|[2,*] Many', 0);
      expect(result).toBe('None');
    });

    it('should parse range format', () => {
      const result = pluralizer.resolvePipeBased('{0} None|{1} One|[2,*] Many', 5);
      expect(result).toBe('Many');
    });

    it('should handle simple singular/plural format', () => {
      const singular = pluralizer.resolvePipeBased('item|items', 1);
      const plural = pluralizer.resolvePipeBased('item|items', 2);
      expect(singular).toBe('item');
      expect(plural).toBe('items');
    });

    it('should handle ranges with bounds', () => {
      const result = pluralizer.resolvePipeBased('[1,5] Few|[6,*] Many', 3);
      expect(result).toBe('Few');
    });
  });

  describe('parsePipeSeparated', () => {
    const pluralizer = createLaravelPluralizer();

    it('should parse exact values', () => {
      const rules = pluralizer.parsePipeSeparated('{0} None|{1} One');
      expect(rules).toHaveLength(2);
      expect(rules[0]).toEqual({ exact: 0, text: 'None' });
      expect(rules[1]).toEqual({ exact: 1, text: 'One' });
    });

    it('should parse ranges', () => {
      const rules = pluralizer.parsePipeSeparated('[2,5] Few|[6,*] Many');
      expect(rules).toHaveLength(2);
      expect(rules[0]).toEqual({ rangeStart: 2, rangeEnd: 5, text: 'Few' });
      expect(rules[1]).toEqual({ rangeStart: 6, rangeEnd: Infinity, text: 'Many' });
    });
  });

  describe('format conversion', () => {
    it('should convert key format to pipe format', () => {
      const result = Pluralizer.keyToPipe({
        zero: 'なし',
        one: '1件',
        other: ':count件',
      });
      expect(result).toBe('{0} なし|{1} 1件|[2,*] :count件');
    });

    it('should convert pipe format to key format', () => {
      const result = Pluralizer.pipeToKey('{0} None|{1} One|[2,*] Many');
      expect(result).toEqual({
        zero: 'None',
        one: 'One',
        other: 'Many',
      });
    });

    it('should convert simple singular/plural to key format', () => {
      const result = Pluralizer.pipeToKey('item|items');
      expect(result).toEqual({
        one: 'item',
        other: 'items',
      });
    });
  });

  describe('resolve with type', () => {
    it('should resolve key-based with object input', () => {
      const pluralizer = new Pluralizer('key', 'en');
      const result = pluralizer.resolve(
        { one: 'One', other: 'Many' },
        1
      );
      expect(result).toBe('One');
    });

    it('should resolve pipe-based with string input', () => {
      const pluralizer = new Pluralizer('pipe', 'en');
      const result = pluralizer.resolve('One|Many', 2);
      expect(result).toBe('Many');
    });
  });
});
