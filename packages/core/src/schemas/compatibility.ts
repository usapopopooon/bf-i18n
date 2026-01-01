import { z } from 'zod';

/**
 * 互換性の問題レベル
 */
export const IssueLevelSchema = z.enum(['warning', 'error']);
export type IssueLevel = z.infer<typeof IssueLevelSchema>;

/**
 * 互換性の問題タイプ
 */
export const IssueTypeSchema = z.enum([
  'unsupported_plural_form',
  'unsupported_range_plural',
  'interpolation_syntax',
  'nested_in_flat_format',
  'invalid_variable_name',
  'custom',
]);
export type IssueType = z.infer<typeof IssueTypeSchema>;

/**
 * 警告情報
 */
export const CompatibilityWarningSchema = z.object({
  /**
   * 対象の翻訳キー
   */
  key: z.string(),

  /**
   * 問題の種類
   */
  type: IssueTypeSchema,

  /**
   * 説明メッセージ
   */
  message: z.string(),

  /**
   * 修正提案（あれば）
   */
  suggestion: z.string().optional(),
});

export type CompatibilityWarning = z.infer<typeof CompatibilityWarningSchema>;

/**
 * エラー情報
 */
export const CompatibilityErrorSchema = z.object({
  /**
   * 対象の翻訳キー
   */
  key: z.string(),

  /**
   * 問題の種類
   */
  type: IssueTypeSchema,

  /**
   * 説明メッセージ
   */
  message: z.string(),

  /**
   * 修正提案（あれば）
   */
  suggestion: z.string().optional(),
});

export type CompatibilityError = z.infer<typeof CompatibilityErrorSchema>;

/**
 * 互換性レポート
 */
export const CompatibilityReportSchema = z.object({
  /**
   * 完全互換かどうか
   */
  compatible: z.boolean(),

  /**
   * 警告一覧（変換可能だが注意が必要）
   */
  warnings: z.array(CompatibilityWarningSchema),

  /**
   * エラー一覧（変換不可）
   */
  errors: z.array(CompatibilityErrorSchema),
});

export type CompatibilityReport = z.infer<typeof CompatibilityReportSchema>;

/**
 * 警告時のコールバック型
 */
export type OnWarningCallback = (warning: CompatibilityWarning) => void;

/**
 * エラー時のコールバック型
 */
export type OnErrorCallback = (error: CompatibilityError) => void;

/**
 * 変換オプション
 */
export const ConvertOptionsSchema = z.object({
  /**
   * trueの場合、警告があれば変換中止
   * @default false
   */
  strict: z.boolean().default(false),

  /**
   * 警告時のコールバック
   */
  onWarning: z.custom<OnWarningCallback>().optional(),

  /**
   * エラー時のコールバック
   */
  onError: z.custom<OnErrorCallback>().optional(),

  /**
   * 変換不可時の代替値
   */
  fallbackValue: z.string().nullable().default(null),
});

export type ConvertOptions = z.input<typeof ConvertOptionsSchema>;
export type ConvertOptionsResolved = z.output<typeof ConvertOptionsSchema>;

/**
 * 変換結果
 */
export const ConvertResultSchema = z.object({
  /**
   * 変換成功かどうか
   */
  success: z.boolean(),

  /**
   * 変換後のデータ
   */
  data: z.record(z.string(), z.unknown()).optional(),

  /**
   * 互換性レポート
   */
  report: CompatibilityReportSchema,
});

export type ConvertResult = z.infer<typeof ConvertResultSchema>;
