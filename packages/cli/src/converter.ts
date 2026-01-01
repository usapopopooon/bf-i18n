import { Interpolator, Pluralizer } from '@bf-i18n/core';
import {
  RailsInterpolationDefaults,
  LaravelInterpolationDefaults,
} from '@bf-i18n/core';
import type { Mode } from '@bf-i18n/core';

type TranslationObject = Record<string, unknown>;

/**
 * Get interpolation options for a mode.
 */
function getInterpolationOptions(mode: Mode) {
  if (mode === 'rails') {
    return RailsInterpolationDefaults;
  }
  return LaravelInterpolationDefaults;
}

/**
 * Convert translations from one mode format to another.
 */
export function convertTranslations(
  translations: Record<string, TranslationObject>,
  fromMode: Mode,
  toMode: Mode
): Record<string, TranslationObject> {
  if (fromMode === toMode) {
    return translations;
  }

  const result: Record<string, TranslationObject> = {};

  for (const [locale, localeTranslations] of Object.entries(translations)) {
    result[locale] = convertLocaleTranslations(
      localeTranslations,
      fromMode,
      toMode
    );
  }

  return result;
}

/**
 * Convert a single locale's translations.
 */
function convertLocaleTranslations(
  translations: TranslationObject,
  fromMode: Mode,
  toMode: Mode
): TranslationObject {
  const result: TranslationObject = {};

  for (const [key, value] of Object.entries(translations)) {
    if (typeof value === 'string') {
      result[key] = convertString(value, fromMode, toMode);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Check if this is a pluralization object
      if (isPluralObject(value as TranslationObject)) {
        result[key] = convertPluralObject(
          value as TranslationObject,
          fromMode,
          toMode
        );
      } else {
        result[key] = convertLocaleTranslations(
          value as TranslationObject,
          fromMode,
          toMode
        );
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Check if an object is a Rails-style plural object.
 */
function isPluralObject(obj: TranslationObject): boolean {
  const keys = Object.keys(obj);
  const pluralKeys = ['zero', 'one', 'two', 'few', 'many', 'other'];
  return keys.length > 0 && keys.every((key) => pluralKeys.includes(key));
}

/**
 * Convert a string with interpolation variables.
 */
function convertString(str: string, fromMode: Mode, toMode: Mode): string {
  const fromOptions = getInterpolationOptions(fromMode);
  const toOptions = getInterpolationOptions(toMode);
  return Interpolator.convert(str, fromOptions, toOptions);
}

/**
 * Convert a pluralization object between formats.
 */
function convertPluralObject(
  obj: TranslationObject,
  fromMode: Mode,
  toMode: Mode
): string | TranslationObject {
  // Rails to Laravel: Convert key-based to pipe-based
  if (fromMode === 'rails' && toMode === 'laravel') {
    const stringObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        stringObj[key] = convertString(value, fromMode, toMode);
      }
    }
    return Pluralizer.keyToPipe(stringObj);
  }

  // Laravel to Rails: Keep as object but convert interpolation in values
  if (fromMode === 'laravel' && toMode === 'rails') {
    const result: TranslationObject = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = convertString(value, fromMode, toMode);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return obj;
}

/**
 * Convert Laravel pipe-based plural string to Rails key-based object.
 */
export function laravelPluralToRails(str: string): Record<string, string> | null {
  return Pluralizer.pipeToKey(str);
}
