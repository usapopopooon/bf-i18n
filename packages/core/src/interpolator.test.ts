import { describe, it, expect } from 'vitest';
import {
  Interpolator,
  createRailsInterpolator,
  createLaravelInterpolator,
} from './interpolator.js';

describe('Interpolator', () => {
  describe('Rails format (%{var})', () => {
    const interpolator = createRailsInterpolator();

    it('should interpolate single variable', () => {
      const result = interpolator.interpolate('Hello, %{name}!', { name: 'World' });
      expect(result).toBe('Hello, World!');
    });

    it('should interpolate multiple variables', () => {
      const result = interpolator.interpolate('%{greeting}, %{name}!', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('should keep placeholder if value is not provided', () => {
      const result = interpolator.interpolate('Hello, %{name}!', {});
      expect(result).toBe('Hello, %{name}!');
    });

    it('should handle null values as empty string', () => {
      const result = interpolator.interpolate('%{a} and %{b}', {
        a: null,
        b: 'B',
      });
      expect(result).toBe(' and B');
    });

    it('should keep placeholder if key is not in values object', () => {
      const result = interpolator.interpolate('%{a} and %{b}', {
        a: 'A',
      });
      expect(result).toBe('A and %{b}');
    });

    it('should convert numbers to strings', () => {
      const result = interpolator.interpolate('Count: %{count}', { count: 42 });
      expect(result).toBe('Count: 42');
    });

    it('should handle variables with underscores', () => {
      const result = interpolator.interpolate('%{user_name}', { user_name: 'John' });
      expect(result).toBe('John');
    });
  });

  describe('Laravel format (:var)', () => {
    const interpolator = createLaravelInterpolator();

    it('should interpolate single variable', () => {
      const result = interpolator.interpolate('Hello, :name!', { name: 'World' });
      expect(result).toBe('Hello, World!');
    });

    it('should interpolate multiple variables', () => {
      const result = interpolator.interpolate(':greeting, :name!', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('should keep placeholder if value is not provided', () => {
      const result = interpolator.interpolate('Hello, :name!', {});
      expect(result).toBe('Hello, :name!');
    });

    it('should handle variables with underscores', () => {
      const result = interpolator.interpolate(':user_name', { user_name: 'John' });
      expect(result).toBe('John');
    });
  });

  describe('extractVariables', () => {
    it('should extract Rails variables', () => {
      const interpolator = createRailsInterpolator();
      const variables = interpolator.extractVariables('Hello, %{name}! You have %{count} messages.');
      expect(variables).toEqual(['name', 'count']);
    });

    it('should extract Laravel variables', () => {
      const interpolator = createLaravelInterpolator();
      const variables = interpolator.extractVariables('Hello, :name! You have :count messages.');
      expect(variables).toEqual(['name', 'count']);
    });

    it('should not duplicate variables', () => {
      const interpolator = createRailsInterpolator();
      const variables = interpolator.extractVariables('%{name} and %{name}');
      expect(variables).toEqual(['name']);
    });
  });

  describe('format conversion', () => {
    it('should convert Rails to Laravel format', () => {
      const result = Interpolator.railsToLaravel('Hello, %{name}!');
      expect(result).toBe('Hello, :name!');
    });

    it('should convert Laravel to Rails format', () => {
      const result = Interpolator.laravelToRails('Hello, :name!');
      expect(result).toBe('Hello, %{name}!');
    });

    it('should convert multiple variables', () => {
      const result = Interpolator.railsToLaravel('%{greeting}, %{name}!');
      expect(result).toBe(':greeting, :name!');
    });
  });
});
