import { z } from 'zod';

/**
 * 翻訳値の基本型
 * string | number | boolean | null | 配列 | オブジェクト
 */
export const TranslationValueSchema: z.ZodType<TranslationValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(TranslationValueSchema),
    z.record(z.string(), TranslationValueSchema),
  ])
);

export type TranslationValue =
  | string
  | number
  | boolean
  | null
  | TranslationValue[]
  | { [key: string]: TranslationValue };

/**
 * 翻訳リソースのネストしたオブジェクト構造
 */
export const TranslationObjectSchema: z.ZodType<TranslationObject> = z.lazy(
  () => z.record(z.string(), TranslationValueSchema)
);

export type TranslationObject = {
  [key: string]: TranslationValue;
};

/**
 * ロケールごとの翻訳リソース
 * { ja: { ... }, en: { ... } }
 */
export const TranslationsSchema = z.record(z.string(), TranslationObjectSchema);
export type Translations = z.infer<typeof TranslationsSchema>;

/**
 * 複数形キーの種類（Rails形式）
 */
export const PluralCategorySchema = z.enum([
  'zero',
  'one',
  'two',
  'few',
  'many',
  'other',
]);
export type PluralCategory = z.infer<typeof PluralCategorySchema>;

/**
 * 複数形オブジェクト（Rails形式）
 */
export const PluralObjectSchema = z.object({
  zero: z.string().optional(),
  one: z.string().optional(),
  two: z.string().optional(),
  few: z.string().optional(),
  many: z.string().optional(),
  other: z.string(),
});
export type PluralObject = z.infer<typeof PluralObjectSchema>;
