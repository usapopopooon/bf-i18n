import type {
  Translations,
  TranslationValue,
  TranslateOptions,
  MissingTranslationHandler,
} from './schemas/index.js';
import { Interpolator } from './interpolator.js';
import { Pluralizer } from './pluralizer.js';

export interface TranslatorOptions {
  translations: Translations;
  locale: string;
  fallbackLocales: string[];
  interpolator: Interpolator;
  pluralizer: Pluralizer;
  missingTranslationHandler?: MissingTranslationHandler;
  debug?: boolean;
}

/**
 * 翻訳キーの解決、フォールバック処理を行うクラス
 */
export class Translator {
  private readonly translations: Translations;
  private locale: string;
  private readonly fallbackLocales: string[];
  private readonly interpolator: Interpolator;
  private pluralizer: Pluralizer;
  private readonly missingTranslationHandler?: MissingTranslationHandler;
  private readonly debug: boolean;

  constructor(options: TranslatorOptions) {
    this.translations = options.translations;
    this.locale = options.locale;
    this.fallbackLocales = options.fallbackLocales;
    this.interpolator = options.interpolator;
    this.pluralizer = options.pluralizer;
    this.missingTranslationHandler = options.missingTranslationHandler;
    this.debug = options.debug ?? false;
  }

  /**
   * 現在のロケールを取得
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * ロケールを設定
   */
  setLocale(locale: string): void {
    this.locale = locale;
    this.pluralizer = this.pluralizer.withLocale(locale);
  }

  /**
   * 利用可能なロケール一覧を取得
   */
  getAvailableLocales(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * フォールバックチェーンを構築
   * 1. 指定されたロケール
   * 2. 言語コードのみ（en-US → en）
   * 3. fallbackLocales（配列の順番に）
   */
  private buildFallbackChain(locale: string): string[] {
    const chain: string[] = [locale];

    // 言語コードのみを追加（en-US → en）
    if (locale.includes('-')) {
      const langOnly = locale.split('-')[0];
      if (!chain.includes(langOnly)) {
        chain.push(langOnly);
      }
    }

    // フォールバックロケールを追加
    for (const fallback of this.fallbackLocales) {
      if (!chain.includes(fallback)) {
        chain.push(fallback);
      }
    }

    return chain;
  }

  /**
   * ドット区切りのキーでネストしたオブジェクトから値を取得
   */
  private getNestedValue(
    obj: Record<string, TranslationValue>,
    keys: string[]
  ): TranslationValue | undefined {
    let current: TranslationValue = obj;

    for (const key of keys) {
      if (current === null || typeof current !== 'object' || Array.isArray(current)) {
        return undefined;
      }
      current = (current as Record<string, TranslationValue>)[key];
      if (current === undefined) {
        return undefined;
      }
    }

    return current;
  }

  /**
   * キーが存在するかチェック
   */
  exists(key: string, locale?: string): boolean {
    const targetLocale = locale ?? this.locale;
    const chain = this.buildFallbackChain(targetLocale);

    for (const loc of chain) {
      const localeTranslations = this.translations[loc];
      if (!localeTranslations) continue;

      const keys = key.split('.');
      const value = this.getNestedValue(
        localeTranslations as Record<string, TranslationValue>,
        keys
      );
      if (value !== undefined) {
        return true;
      }
    }

    return false;
  }

  /**
   * 翻訳を取得
   */
  translate(key: string, options: TranslateOptions = {}): string {
    const locale = options.locale ?? this.locale;
    const chain = this.buildFallbackChain(locale);

    // スコープを適用
    const fullKey = this.applyScope(key, options.scope);

    // フォールバックチェーンで探索
    for (const loc of chain) {
      const result = this.translateForLocale(fullKey, loc, options);
      if (result !== undefined) {
        return result;
      }
    }

    // デフォルト値がある場合
    if (options.default !== undefined) {
      const defaultValue = Array.isArray(options.default)
        ? options.default[0]
        : options.default;
      return this.interpolator.interpolate(defaultValue, options);
    }

    // missingTranslationHandler がある場合
    if (this.missingTranslationHandler) {
      const handlerResult = this.missingTranslationHandler(fullKey, locale);
      if (handlerResult !== undefined) {
        return handlerResult;
      }
    }

    // デバッグモードで警告
    if (this.debug) {
      console.warn(`[bf-i18n] Missing translation: ${fullKey} (locale: ${locale})`);
    }

    // キーをそのまま返す
    return fullKey;
  }

  /**
   * スコープを適用
   */
  private applyScope(
    key: string,
    scope?: string | string[]
  ): string {
    if (!scope) {
      return key;
    }

    const scopeParts = Array.isArray(scope) ? scope : [scope];
    return [...scopeParts, key].join('.');
  }

  /**
   * 特定のロケールで翻訳を取得
   */
  private translateForLocale(
    key: string,
    locale: string,
    options: TranslateOptions
  ): string | undefined {
    const localeTranslations = this.translations[locale];
    if (!localeTranslations) {
      return undefined;
    }

    const keys = key.split('.');
    let value = this.getNestedValue(
      localeTranslations as Record<string, TranslationValue>,
      keys
    );

    if (value === undefined) {
      return undefined;
    }

    // 複数形の処理
    if (options.count !== undefined) {
      value = this.pluralizer.resolve(value, options.count);
      if (value === undefined) {
        return undefined;
      }
    }

    // 文字列以外の値はJSON文字列化
    if (typeof value !== 'string') {
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value);
    }

    // 補間処理
    const interpolated = this.interpolator.interpolate(value, {
      ...options,
      count: options.count,
    });

    return interpolated;
  }

  /**
   * 翻訳を追加
   */
  addTranslations(locale: string, newTranslations: Record<string, TranslationValue>): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.deepMerge(
      this.translations[locale] as Record<string, TranslationValue>,
      newTranslations
    );
  }

  /**
   * オブジェクトをディープマージ
   */
  private deepMerge(
    target: Record<string, TranslationValue>,
    source: Record<string, TranslationValue>
  ): void {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        this.deepMerge(
          targetValue as Record<string, TranslationValue>,
          sourceValue as Record<string, TranslationValue>
        );
      } else {
        target[key] = sourceValue;
      }
    }
  }
}
