import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectBrowserLocale, isBrowser } from './locale-detection.js';

describe('locale-detection', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator mock before each test
    vi.stubGlobal('navigator', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('detectBrowserLocale', () => {
    it('returns fallback when not in browser environment', () => {
      const result = detectBrowserLocale();
      expect(result).toBe('en');
    });

    it('returns custom fallback when not in browser environment', () => {
      const result = detectBrowserLocale({ fallback: 'ja' });
      expect(result).toBe('ja');
    });

    it('returns browser language when navigator.language is available', () => {
      vi.stubGlobal('navigator', { language: 'fr-FR', languages: [] });

      const result = detectBrowserLocale();
      expect(result).toBe('fr-fr');
    });

    it('returns first language from navigator.languages', () => {
      vi.stubGlobal('navigator', { languages: ['de-DE', 'en-US', 'fr-FR'] });

      const result = detectBrowserLocale();
      expect(result).toBe('de-de');
    });

    it('matches exact locale from available locales', () => {
      vi.stubGlobal('navigator', { languages: ['ja-JP', 'en-US'] });

      const result = detectBrowserLocale({
        availableLocales: ['en', 'ja-JP', 'fr'],
      });
      expect(result).toBe('ja-JP');
    });

    it('matches language code when exact match not found', () => {
      vi.stubGlobal('navigator', { languages: ['en-GB', 'fr-FR'] });

      const result = detectBrowserLocale({
        availableLocales: ['en', 'ja', 'fr'],
      });
      expect(result).toBe('en');
    });

    it('returns fallback when no match in available locales', () => {
      vi.stubGlobal('navigator', { languages: ['zh-CN', 'ko-KR'] });

      const result = detectBrowserLocale({
        availableLocales: ['en', 'ja', 'fr'],
        fallback: 'en',
      });
      expect(result).toBe('en');
    });

    it('handles underscore locale format', () => {
      vi.stubGlobal('navigator', { languages: ['pt_BR'] });

      const result = detectBrowserLocale({
        availableLocales: ['en', 'pt-BR', 'es'],
      });
      expect(result).toBe('pt-BR');
    });

    it('handles case-insensitive matching', () => {
      vi.stubGlobal('navigator', { languages: ['EN-us'] });

      const result = detectBrowserLocale({
        availableLocales: ['en-US', 'ja'],
      });
      expect(result).toBe('en-US');
    });

    it('tries multiple browser locales in order', () => {
      vi.stubGlobal('navigator', { languages: ['zh-TW', 'ja-JP', 'en-US'] });

      const result = detectBrowserLocale({
        availableLocales: ['en', 'ja'],
      });
      expect(result).toBe('ja');
    });
  });

  describe('isBrowser', () => {
    it('returns false when window is undefined', () => {
      expect(isBrowser()).toBe(false);
    });

    it('returns true when window and navigator are defined', () => {
      vi.stubGlobal('window', {});
      vi.stubGlobal('navigator', {});

      expect(isBrowser()).toBe(true);
    });
  });
});
