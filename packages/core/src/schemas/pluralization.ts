import { z } from 'zod';

/**
 * Pluralization type.
 * - key: Rails format (nested zero/one/other keys)
 * - pipe: Laravel format (pipe-separated string)
 */
export const PluralizationTypeSchema = z.enum(['key', 'pipe']);
export type PluralizationType = z.infer<typeof PluralizationTypeSchema>;

/**
 * Pluralization options.
 */
export const PluralizationOptionsSchema = z.object({
  /**
   * Pluralization type.
   */
  type: PluralizationTypeSchema,
});

export type PluralizationOptions = z.infer<typeof PluralizationOptionsSchema>;

/**
 * Rails format pluralization defaults.
 */
export const RailsPluralizationDefaults: PluralizationOptions = {
  type: 'key',
};

/**
 * Laravel format pluralization defaults.
 */
export const LaravelPluralizationDefaults: PluralizationOptions = {
  type: 'pipe',
};

/**
 * Laravel plural rule parse result.
 */
export const LaravelPluralRuleSchema = z.object({
  /**
   * Exact match value ({0}, {1}, etc.)
   */
  exact: z.number().optional(),

  /**
   * Range start value ([2,5] -> 2)
   */
  rangeStart: z.number().optional(),

  /**
   * Range end value ([2,5] -> 5, [2,*] -> Infinity)
   */
  rangeEnd: z.number().optional(),

  /**
   * Translation text.
   */
  text: z.string(),
});

export type LaravelPluralRule = z.infer<typeof LaravelPluralRuleSchema>;
