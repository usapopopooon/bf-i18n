import {
  I18nOptionsSchema,
  BUILT_IN_MODE_CONFIGS,
  type I18nOptions,
  type I18nOptionsResolved,
  type TranslateOptions,
  type Translations,
  type TranslationValue,
  type Mode,
  type BuiltInMode,
} from './schemas/index.js';
import { Interpolator } from './interpolator.js';
import { Pluralizer } from './pluralizer.js';
import { Translator } from './translator.js';

type ChangeListener = () => void;

/**
 * メインのI18nクラス
 * 翻訳の取得、ロケール管理を行う
 */
export class I18n {
  private readonly options: I18nOptionsResolved;
  private readonly translator: Translator;
  private readonly changeListeners: Set<ChangeListener> = new Set();
  private currentLocale: string;

  constructor(options: I18nOptions) {
    // Zodでオプションを検証・正規化
    this.options = I18nOptionsSchema.parse(options);
    this.currentLocale = this.options.locale ?? this.options.defaultLocale;

    // モードに応じたInterpolatorとPluralizerを作成
    const interpolator = this.createInterpolator();
    const pluralizer = this.createPluralizer();

    // フォールバックロケールを配列に正規化
    const fallbackLocales = this.normalizeFallbackLocales();

    // Translatorを作成
    this.translator = new Translator({
      translations: this.options.translations,
      locale: this.currentLocale,
      fallbackLocales,
      interpolator,
      pluralizer,
      missingTranslationHandler: this.options.missingTranslationHandler,
      debug: this.options.debug,
    });
  }

  /**
   * モード設定を取得
   */
  private getModeConfig() {
    const mode = this.options.mode;
    if (mode in BUILT_IN_MODE_CONFIGS) {
      return BUILT_IN_MODE_CONFIGS[mode as BuiltInMode];
    }
    // カスタムモードの場合はRailsをデフォルトとして使用
    return BUILT_IN_MODE_CONFIGS.rails;
  }

  /**
   * Interpolatorを作成
   */
  private createInterpolator(): Interpolator {
    const modeConfig = this.getModeConfig();
    const customOptions = this.options.interpolation ?? {};

    return new Interpolator({
      prefix: customOptions.prefix ?? modeConfig.interpolationPrefix,
      suffix: customOptions.suffix ?? modeConfig.interpolationSuffix,
    });
  }

  /**
   * Pluralizerを作成
   */
  private createPluralizer(): Pluralizer {
    const modeConfig = this.getModeConfig();
    const customOptions = this.options.pluralization ?? {};
    const type = customOptions.type ?? modeConfig.pluralizationType;

    // 'icu' と 'custom' は将来の拡張用、現在は 'key' として扱う
    const normalizedType = type === 'key' || type === 'pipe' ? type : 'key';

    return new Pluralizer(normalizedType, this.currentLocale);
  }

  /**
   * フォールバックロケールを配列に正規化
   */
  private normalizeFallbackLocales(): string[] {
    const { fallbackLocale, defaultLocale } = this.options;

    if (!fallbackLocale) {
      return [defaultLocale];
    }

    if (Array.isArray(fallbackLocale)) {
      return [...fallbackLocale, defaultLocale].filter(
        (loc, idx, arr) => arr.indexOf(loc) === idx
      );
    }

    return [fallbackLocale, defaultLocale].filter(
      (loc, idx, arr) => arr.indexOf(loc) === idx
    );
  }

  /**
   * 現在のモードを取得
   */
  get mode(): Mode {
    return this.options.mode;
  }

  /**
   * 現在のロケールを取得
   */
  get locale(): string {
    return this.currentLocale;
  }

  /**
   * ロケールを設定
   */
  set locale(newLocale: string) {
    if (this.currentLocale !== newLocale) {
      this.currentLocale = newLocale;
      this.translator.setLocale(newLocale);
      this.notifyChange();
    }
  }

  /**
   * 利用可能なロケール一覧を取得
   */
  get availableLocales(): string[] {
    return this.translator.getAvailableLocales();
  }

  /**
   * 翻訳を取得
   */
  t(key: string, options?: TranslateOptions): string {
    return this.translator.translate(key, options);
  }

  /**
   * キーが存在するかチェック
   */
  exists(key: string, locale?: string): boolean {
    return this.translator.exists(key, locale);
  }

  /**
   * 翻訳を追加
   */
  addTranslations(locale: string, translations: Record<string, TranslationValue>): void {
    this.translator.addTranslations(locale, translations);
    this.notifyChange();
  }

  /**
   * 変更リスナーを登録
   */
  onChange(callback: ChangeListener): () => void {
    this.changeListeners.add(callback);
    return () => {
      this.changeListeners.delete(callback);
    };
  }

  /**
   * 変更を通知
   */
  private notifyChange(): void {
    for (const listener of this.changeListeners) {
      listener();
    }
  }

  /**
   * 翻訳データを取得（静的解析用）
   */
  getTranslations(): Translations {
    return this.options.translations;
  }
}

/**
 * I18nインスタンスを作成するファクトリ関数
 */
export function createI18n(options: I18nOptions): I18n {
  return new I18n(options);
}
