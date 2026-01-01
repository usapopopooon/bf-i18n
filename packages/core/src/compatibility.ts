import type { Mode } from './schemas/mode.js';
import type {
  CompatibilityReport,
  CompatibilityWarning,
  CompatibilityError,
  IssueType,
} from './schemas/compatibility.js';
import { createRailsInterpolator, createLaravelInterpolator } from './interpolator.js';
import { Pluralizer } from './pluralizer.js';

const railsInterpolator = createRailsInterpolator();
const laravelInterpolator = createLaravelInterpolator();

/**
 * Check compatibility of translations between Rails and Laravel modes.
 */
export class CompatibilityChecker {
  /**
   * Check compatibility of translations for conversion from one mode to another.
   */
  static check(
    translations: Record<string, unknown>,
    fromMode: Mode,
    toMode: Mode
  ): CompatibilityReport {
    const warnings: CompatibilityWarning[] = [];
    const errors: CompatibilityError[] = [];

    this.checkTranslations(translations, fromMode, toMode, '', warnings, errors);

    return {
      compatible: errors.length === 0,
      warnings,
      errors,
    };
  }

  private static checkTranslations(
    obj: Record<string, unknown>,
    fromMode: Mode,
    toMode: Mode,
    prefix: string,
    warnings: CompatibilityWarning[],
    errors: CompatibilityError[]
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        this.checkStringValue(value, fromMode, toMode, fullKey, warnings, errors);
      } else if (typeof value === 'object' && value !== null) {
        // Check if it's a Rails-style plural object
        if (this.isRailsPluralObject(value as Record<string, unknown>)) {
          this.checkPluralObject(
            value as Record<string, string>,
            fromMode,
            toMode,
            fullKey,
            warnings,
            errors
          );
        } else {
          // Recurse into nested object
          this.checkTranslations(
            value as Record<string, unknown>,
            fromMode,
            toMode,
            fullKey,
            warnings,
            errors
          );
        }
      }
    }
  }

  private static isRailsPluralObject(obj: Record<string, unknown>): boolean {
    const pluralKeys = ['zero', 'one', 'two', 'few', 'many', 'other'];
    const keys = Object.keys(obj);
    return keys.length > 0 && keys.every((k) => pluralKeys.includes(k));
  }

  private static checkStringValue(
    value: string,
    fromMode: Mode,
    toMode: Mode,
    key: string,
    warnings: CompatibilityWarning[],
    errors: CompatibilityError[]
  ): void {
    // Check interpolation syntax
    this.checkInterpolation(value, fromMode, toMode, key, warnings, errors);

    // Check Laravel pipe-based pluralization
    if (fromMode === 'laravel' && value.includes('|')) {
      this.checkLaravelPluralString(value, toMode, key, warnings, errors);
    }
  }

  private static checkInterpolation(
    value: string,
    fromMode: Mode,
    toMode: Mode,
    key: string,
    warnings: CompatibilityWarning[],
    _errors: CompatibilityError[]
  ): void {
    const interpolator = fromMode === 'rails' ? railsInterpolator : laravelInterpolator;
    const variables = interpolator.extractVariables(value);

    if (variables.length === 0) return;

    // Check for variable name compatibility
    for (const variable of variables) {
      // Laravel doesn't support variable names with special characters
      if (toMode === 'laravel' && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
        warnings.push({
          key,
          type: 'invalid_variable_name' as IssueType,
          message: `Variable name "${variable}" may not be valid in Laravel mode`,
          suggestion: `Consider using alphanumeric variable names only`,
        });
      }
    }
  }

  private static checkLaravelPluralString(
    value: string,
    toMode: Mode,
    key: string,
    warnings: CompatibilityWarning[],
    errors: CompatibilityError[]
  ): void {
    if (toMode !== 'rails') return;

    // Check if it uses range syntax which is not directly supported in Rails
    const hasRangePattern = /\[\d+,(\d+|\*)\]/.test(value);
    if (hasRangePattern) {
      warnings.push({
        key,
        type: 'unsupported_range_plural' as IssueType,
        message: `Range-based plural syntax "[n,m]" will be converted to nearest Rails plural form`,
        suggestion: `Review the converted plural forms for accuracy`,
      });
    }

    // Check for exact match patterns like {0}, {1}
    const exactMatches = value.match(/\{(\d+)\}/g);
    if (exactMatches) {
      const numbers = exactMatches.map((m) => parseInt(m.slice(1, -1)));
      for (const num of numbers) {
        if (num > 2) {
          warnings.push({
            key,
            type: 'unsupported_plural_form' as IssueType,
            message: `Exact match "{${num}}" has no direct equivalent in Rails`,
            suggestion: `This will be mapped to "other" form in Rails`,
          });
        }
      }
    }

    // Try to parse and check if conversion is possible
    try {
      Pluralizer.pipeToKey(value);
    } catch {
      errors.push({
        key,
        type: 'interpolation_syntax' as IssueType,
        message: `Invalid Laravel plural syntax: ${value.substring(0, 50)}`,
        suggestion: `Check the pipe-delimited plural format`,
      });
    }
  }

  private static checkPluralObject(
    value: Record<string, string>,
    fromMode: Mode,
    toMode: Mode,
    key: string,
    warnings: CompatibilityWarning[],
    _errors: CompatibilityError[]
  ): void {
    if (fromMode !== 'rails' || toMode !== 'laravel') return;

    // Check for plural forms that might not convert well
    const keys = Object.keys(value);

    if (keys.includes('two') || keys.includes('few')) {
      warnings.push({
        key,
        type: 'unsupported_plural_form' as IssueType,
        message: `Plural forms "two" and "few" will be approximated in Laravel format`,
        suggestion: `Laravel uses simpler plural rules; review the output`,
      });
    }

    // Check each plural form's interpolation
    for (const [_pluralKey, text] of Object.entries(value)) {
      this.checkInterpolation(text, fromMode, toMode, key, warnings, _errors);
    }
  }
}

/**
 * Check if translations are compatible for conversion.
 */
export function checkCompatibility(
  translations: Record<string, unknown>,
  fromMode: Mode,
  toMode: Mode
): CompatibilityReport {
  return CompatibilityChecker.check(translations, fromMode, toMode);
}
