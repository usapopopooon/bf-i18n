import { z } from 'zod';
import { ModeSchema, SourceModeSchema } from './mode.js';
import { TranslationsSchema } from './translation.js';
import { InterpolationOptionsSchema } from './interpolation.js';
import { PluralizationOptionsSchema } from './pluralization.js';

/**
 * 翻訳が見つからない場合のハンドラ
 */
export type MissingTranslationHandler = (
  key: string,
  locale: string
) => string | undefined;

/**
 * I18nコンストラクタオプション
 */
export const I18nOptionsSchema = z.object({
  /**
   * 使用時のフレームワークモード
   * @default 'rails'
   */
  mode: ModeSchema.default('rails'),

  /**
   * 入力データの形式
   * @default 'auto'
   */
  sourceMode: SourceModeSchema.default('auto'),

  /**
   * sourceとmodeが異なる場合に自動変換
   * @default true
   */
  autoConvert: z.boolean().default(true),

  /**
   * 変換時に警告があればエラー
   * @default false
   */
  strictConversion: z.boolean().default(false),

  /**
   * 翻訳リソース
   */
  translations: TranslationsSchema,

  /**
   * デフォルトロケール
   */
  defaultLocale: z.string(),

  /**
   * 現在のロケール（指定しない場合はdefaultLocale）
   */
  locale: z.string().optional(),

  /**
   * フォールバックロケール
   */
  fallbackLocale: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * 翻訳が見つからない場合のコールバック
   * TypeScriptの型として定義（ランタイム検証はスキップ）
   */
  missingTranslationHandler: z.custom<MissingTranslationHandler>().optional(),

  /**
   * 補間設定（指定しない場合はモードに依存）
   */
  interpolation: InterpolationOptionsSchema.partial().optional(),

  /**
   * 複数形設定（指定しない場合はモードに依存）
   */
  pluralization: PluralizationOptionsSchema.partial().optional(),

  /**
   * HTML翻訳を許可するサフィックス
   * @default '_html'
   */
  htmlSuffix: z.string().default('_html'),

  /**
   * デバッグモード
   * @default false
   */
  debug: z.boolean().default(false),
});

export type I18nOptions = z.input<typeof I18nOptionsSchema>;
export type I18nOptionsResolved = z.output<typeof I18nOptionsSchema>;

/**
 * tメソッドのオプション
 */
export const TranslateOptionsSchema = z.object({
  /**
   * デフォルト値
   */
  default: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * スコープ（プレフィックス）
   */
  scope: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * 複数形用のカウント
   */
  count: z.number().optional(),

  /**
   * ロケール上書き
   */
  locale: z.string().optional(),
});

// 補間変数はランタイム検証せず、TypeScript型のみで許可
export type TranslateOptions = z.infer<typeof TranslateOptionsSchema> & {
  [key: string]: unknown;
};
