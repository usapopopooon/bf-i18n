type TranslationObject = Record<string, unknown>;

export interface ValidationError {
  type: 'missing_key' | 'type_mismatch' | 'empty_value';
  locale: string;
  key: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Get all keys from a nested object as dot-notation paths.
 */
function getAllKeys(
  obj: Record<string, unknown>,
  prefix = ''
): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Get value from nested object by dot-notation key.
 */
function getValue(obj: Record<string, unknown>, key: string): unknown {
  const parts = key.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Validate translations for consistency across locales.
 */
export function validateTranslations(
  translations: Record<string, TranslationObject>,
  referenceLocale: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const reference = translations[referenceLocale];
  if (!reference) {
    return {
      valid: false,
      errors: [
        {
          type: 'missing_key',
          locale: referenceLocale,
          key: '',
          message: `Reference locale "${referenceLocale}" not found in translations`,
        },
      ],
      warnings: [],
    };
  }

  const referenceKeys = getAllKeys(reference);
  const locales = Object.keys(translations).filter((l) => l !== referenceLocale);

  for (const locale of locales) {
    const localeTranslations = translations[locale];
    if (!localeTranslations) continue;

    const localeKeys = getAllKeys(localeTranslations);

    // Check for missing keys
    for (const key of referenceKeys) {
      if (!localeKeys.includes(key)) {
        errors.push({
          type: 'missing_key',
          locale,
          key,
          message: `Missing key "${key}" in locale "${locale}"`,
        });
      }
    }

    // Check for extra keys (warning)
    for (const key of localeKeys) {
      if (!referenceKeys.includes(key)) {
        warnings.push({
          type: 'missing_key',
          locale,
          key,
          message: `Extra key "${key}" in locale "${locale}" not found in reference`,
        });
      }
    }

    // Check for type mismatches and empty values
    for (const key of referenceKeys) {
      const refValue = getValue(reference, key);
      const locValue = getValue(localeTranslations, key);

      if (locValue === undefined) continue; // Already reported as missing

      if (typeof refValue !== typeof locValue) {
        errors.push({
          type: 'type_mismatch',
          locale,
          key,
          message: `Type mismatch for "${key}": expected ${typeof refValue}, got ${typeof locValue}`,
        });
      }

      if (typeof locValue === 'string' && locValue.trim() === '') {
        warnings.push({
          type: 'empty_value',
          locale,
          key,
          message: `Empty value for "${key}" in locale "${locale}"`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
