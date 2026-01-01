import { z } from 'zod';

/**
 * 複数形の処理タイプ
 * - key: Rails形式（zero/one/other キーでネスト）
 * - pipe: Laravel形式（パイプ区切り文字列）
 */
export const PluralizationTypeSchema = z.enum(['key', 'pipe']);
export type PluralizationType = z.infer<typeof PluralizationTypeSchema>;

/**
 * 複数形設定
 */
export const PluralizationOptionsSchema = z.object({
  /**
   * 複数形の処理タイプ
   */
  type: PluralizationTypeSchema,
});

export type PluralizationOptions = z.infer<typeof PluralizationOptionsSchema>;

/**
 * Rails形式の複数形設定デフォルト
 */
export const RailsPluralizationDefaults: PluralizationOptions = {
  type: 'key',
};

/**
 * Laravel形式の複数形設定デフォルト
 */
export const LaravelPluralizationDefaults: PluralizationOptions = {
  type: 'pipe',
};

/**
 * Laravel複数形パースの結果
 */
export const LaravelPluralRuleSchema = z.object({
  /**
   * 完全一致の値（{0}, {1} など）
   */
  exact: z.number().optional(),

  /**
   * 範囲の開始値（[2,5] の 2）
   */
  rangeStart: z.number().optional(),

  /**
   * 範囲の終了値（[2,5] の 5、[2,*] の場合は Infinity）
   */
  rangeEnd: z.number().optional(),

  /**
   * 翻訳テキスト
   */
  text: z.string(),
});

export type LaravelPluralRule = z.infer<typeof LaravelPluralRuleSchema>;
