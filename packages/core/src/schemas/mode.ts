import { z } from 'zod';

/**
 * 組み込みのバックエンドフレームワークモード
 * 将来的に django, spring, phoenix 等を追加可能
 */
export const BuiltInModeSchema = z.enum(['rails', 'laravel']);
export type BuiltInMode = z.infer<typeof BuiltInModeSchema>;

/**
 * フレームワークモード
 * 組み込みモードに加え、カスタムモード（文字列）も許可
 * これにより将来的な拡張やユーザー定義モードに対応
 */
export const ModeSchema = z.union([BuiltInModeSchema, z.string()]);
export type Mode = z.infer<typeof ModeSchema>;

/**
 * 組み込みのソースモード
 */
export const BuiltInSourceModeSchema = z.enum(['rails', 'laravel', 'auto']);
export type BuiltInSourceMode = z.infer<typeof BuiltInSourceModeSchema>;

/**
 * ソースモード（入力データの形式）
 * 組み込みモードに加え、カスタムモード（文字列）も許可
 */
export const SourceModeSchema = z.union([BuiltInSourceModeSchema, z.string()]);
export type SourceMode = z.infer<typeof SourceModeSchema>;

/**
 * モード設定のインターフェース
 * 各モードはこのインターフェースを実装することで拡張可能
 */
export const ModeConfigSchema = z.object({
  /**
   * モード名
   */
  name: z.string(),

  /**
   * 補間変数のプレフィックス
   */
  interpolationPrefix: z.string(),

  /**
   * 補間変数のサフィックス
   */
  interpolationSuffix: z.string(),

  /**
   * 複数形の処理タイプ
   */
  pluralizationType: z.enum(['key', 'pipe', 'icu', 'custom']),

  /**
   * サポートするファイル形式
   */
  supportedFormats: z.array(z.string()),
});

export type ModeConfig = z.infer<typeof ModeConfigSchema>;

/**
 * 組み込みモードの設定
 */
export const BUILT_IN_MODE_CONFIGS: Record<BuiltInMode, ModeConfig> = {
  rails: {
    name: 'rails',
    interpolationPrefix: '%{',
    interpolationSuffix: '}',
    pluralizationType: 'key',
    supportedFormats: ['yaml', 'json'],
  },
  laravel: {
    name: 'laravel',
    interpolationPrefix: ':',
    interpolationSuffix: '',
    pluralizationType: 'pipe',
    supportedFormats: ['php', 'json'],
  },
};
