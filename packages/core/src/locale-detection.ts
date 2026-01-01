/**
 * Locale detection utilities for browser environments.
 */

/**
 * Options for browser locale detection.
 */
export interface BrowserLocaleOptions {
  /**
   * List of available/supported locales.
   * If provided, will try to match browser locale to one of these.
   */
  availableLocales?: string[];

  /**
   * Fallback locale if no match is found.
   * @default 'en'
   */
  fallback?: string;
}

/**
 * Detect the user's preferred locale from the browser.
 * Uses navigator.languages or navigator.language.
 *
 * @param options Detection options
 * @returns The detected locale or fallback
 */
export function detectBrowserLocale(options: BrowserLocaleOptions = {}): string {
  const { availableLocales, fallback = 'en' } = options;

  // Check if we're in a browser environment
  if (typeof navigator === 'undefined') {
    return fallback;
  }

  // Get browser languages (ordered by preference)
  const browserLocales = getBrowserLocales();

  if (browserLocales.length === 0) {
    return fallback;
  }

  // If no available locales specified, return the first browser locale
  if (!availableLocales || availableLocales.length === 0) {
    return normalizeLocale(browserLocales[0]);
  }

  // Try to find a matching locale
  for (const browserLocale of browserLocales) {
    const match = findBestMatch(browserLocale, availableLocales);
    if (match) {
      return match;
    }
  }

  return fallback;
}

/**
 * Get browser locales in order of preference.
 */
function getBrowserLocales(): string[] {
  if (typeof navigator === 'undefined') {
    return [];
  }

  // navigator.languages is preferred (returns array in order of preference)
  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages];
  }

  // Fallback to navigator.language
  if (navigator.language) {
    return [navigator.language];
  }

  return [];
}

/**
 * Find the best matching locale from available locales.
 *
 * @param browserLocale The browser locale to match
 * @param availableLocales List of available locales
 * @returns The best matching locale or undefined
 */
function findBestMatch(browserLocale: string, availableLocales: string[]): string | undefined {
  const normalized = normalizeLocale(browserLocale);
  const languageCode = getLanguageCode(normalized);

  // 1. Try exact match (case-insensitive)
  const exactMatch = availableLocales.find(
    (loc) => normalizeLocale(loc) === normalized
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Try matching just the language code
  const languageMatch = availableLocales.find(
    (loc) => getLanguageCode(normalizeLocale(loc)) === languageCode
  );
  if (languageMatch) {
    return languageMatch;
  }

  return undefined;
}

/**
 * Normalize a locale string (lowercase, replace _ with -).
 */
function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}

/**
 * Get the language code from a locale (e.g., 'en' from 'en-US').
 */
function getLanguageCode(locale: string): string {
  return locale.split('-')[0];
}

/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}
