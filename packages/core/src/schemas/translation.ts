import { z } from 'zod';

/**
 * Base type for translation values.
 * string | number | boolean | null | array | object
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
 * Nested object structure for translation resources.
 */
export const TranslationObjectSchema: z.ZodType<TranslationObject> = z.lazy(
  () => z.record(z.string(), TranslationValueSchema)
);

export type TranslationObject = {
  [key: string]: TranslationValue;
};

/**
 * Translation resources per locale.
 * { ja: { ... }, en: { ... } }
 */
export const TranslationsSchema = z.record(z.string(), TranslationObjectSchema);
export type Translations = z.infer<typeof TranslationsSchema>;

/**
 * Plural category keys (Rails format).
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
 * Plural object (Rails format).
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
