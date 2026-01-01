import { z } from 'zod';
import { ModeSchema, SourceModeSchema } from './mode.js';
import { TranslationsSchema } from './translation.js';
import { InterpolationOptionsSchema } from './interpolation.js';
import { PluralizationOptionsSchema } from './pluralization.js';

/**
 * Handler for missing translations.
 */
export type MissingTranslationHandler = (key: string, locale: string) => string | undefined;

/**
 * I18n constructor options.
 */
export const I18nOptionsSchema = z.object({
  /**
   * Framework mode for usage.
   * @default 'rails'
   */
  mode: ModeSchema.default('rails'),

  /**
   * Input data format.
   * @default 'auto'
   */
  sourceMode: SourceModeSchema.default('auto'),

  /**
   * Auto-convert when source and mode differ.
   * @default true
   */
  autoConvert: z.boolean().default(true),

  /**
   * Throw error on conversion warnings.
   * @default false
   */
  strictConversion: z.boolean().default(false),

  /**
   * Translation resources.
   */
  translations: TranslationsSchema,

  /**
   * Default locale.
   */
  defaultLocale: z.string(),

  /**
   * Current locale (defaults to defaultLocale if not specified).
   * If detectBrowserLocale is true and locale is not specified,
   * the browser locale will be used instead.
   */
  locale: z.string().optional(),

  /**
   * Detect locale from browser navigator.languages/navigator.language.
   * If true, will use browser locale as initial locale (with 'en' fallback).
   * @default false
   */
  detectBrowserLocale: z.boolean().default(false),

  /**
   * Fallback locale(s).
   */
  fallbackLocale: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * Callback for missing translations.
   * Defined as TypeScript type (runtime validation skipped).
   */
  missingTranslationHandler: z.custom<MissingTranslationHandler>().optional(),

  /**
   * Interpolation options (mode-dependent if not specified).
   */
  interpolation: InterpolationOptionsSchema.partial().optional(),

  /**
   * Pluralization options (mode-dependent if not specified).
   */
  pluralization: PluralizationOptionsSchema.partial().optional(),

  /**
   * Suffix to allow HTML in translations.
   * @default '_html'
   */
  htmlSuffix: z.string().default('_html'),

  /**
   * Debug mode.
   * @default false
   */
  debug: z.boolean().default(false),
});

export type I18nOptions = z.input<typeof I18nOptionsSchema>;
export type I18nOptionsResolved = z.output<typeof I18nOptionsSchema>;

/**
 * Options for the t method.
 */
export const TranslateOptionsSchema = z.object({
  /**
   * Default value.
   */
  default: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * Scope (prefix).
   */
  scope: z.union([z.string(), z.array(z.string())]).optional(),

  /**
   * Count for pluralization.
   */
  count: z.number().optional(),

  /**
   * Locale override.
   */
  locale: z.string().optional(),
});

// Interpolation variables are allowed via TypeScript type only (no runtime validation)
export type TranslateOptions = z.infer<typeof TranslateOptionsSchema> & {
  [key: string]: unknown;
};
