import { z } from 'zod';

/**
 * 補間設定
 */
export const InterpolationOptionsSchema = z.object({
  /**
   * 補間変数のプレフィックス
   * - Rails: '%{'
   * - Laravel: ':'
   */
  prefix: z.string(),

  /**
   * 補間変数のサフィックス
   * - Rails: '}'
   * - Laravel: '' (単語境界で終了)
   */
  suffix: z.string(),
});

export type InterpolationOptions = z.infer<typeof InterpolationOptionsSchema>;

/**
 * Rails形式の補間設定デフォルト
 */
export const RailsInterpolationDefaults: InterpolationOptions = {
  prefix: '%{',
  suffix: '}',
};

/**
 * Laravel形式の補間設定デフォルト
 */
export const LaravelInterpolationDefaults: InterpolationOptions = {
  prefix: ':',
  suffix: '',
};
