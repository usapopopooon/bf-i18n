import { z } from 'zod';

/**
 * Compatibility issue level.
 */
export const IssueLevelSchema = z.enum(['warning', 'error']);
export type IssueLevel = z.infer<typeof IssueLevelSchema>;

/**
 * Compatibility issue type.
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
 * Warning information.
 */
export const CompatibilityWarningSchema = z.object({
  /**
   * Target translation key.
   */
  key: z.string(),

  /**
   * Issue type.
   */
  type: IssueTypeSchema,

  /**
   * Description message.
   */
  message: z.string(),

  /**
   * Suggested fix (if available).
   */
  suggestion: z.string().optional(),
});

export type CompatibilityWarning = z.infer<typeof CompatibilityWarningSchema>;

/**
 * Error information.
 */
export const CompatibilityErrorSchema = z.object({
  /**
   * Target translation key.
   */
  key: z.string(),

  /**
   * Issue type.
   */
  type: IssueTypeSchema,

  /**
   * Description message.
   */
  message: z.string(),

  /**
   * Suggested fix (if available).
   */
  suggestion: z.string().optional(),
});

export type CompatibilityError = z.infer<typeof CompatibilityErrorSchema>;

/**
 * Compatibility report.
 */
export const CompatibilityReportSchema = z.object({
  /**
   * Whether fully compatible.
   */
  compatible: z.boolean(),

  /**
   * List of warnings (convertible but requires attention).
   */
  warnings: z.array(CompatibilityWarningSchema),

  /**
   * List of errors (not convertible).
   */
  errors: z.array(CompatibilityErrorSchema),
});

export type CompatibilityReport = z.infer<typeof CompatibilityReportSchema>;

/**
 * Callback type for warnings.
 */
export type OnWarningCallback = (warning: CompatibilityWarning) => void;

/**
 * Callback type for errors.
 */
export type OnErrorCallback = (error: CompatibilityError) => void;

/**
 * Conversion options.
 */
export const ConvertOptionsSchema = z.object({
  /**
   * If true, abort conversion on warnings.
   * @default false
   */
  strict: z.boolean().default(false),

  /**
   * Callback on warning.
   */
  onWarning: z.custom<OnWarningCallback>().optional(),

  /**
   * Callback on error.
   */
  onError: z.custom<OnErrorCallback>().optional(),

  /**
   * Fallback value when conversion is not possible.
   */
  fallbackValue: z.string().nullable().default(null),
});

export type ConvertOptions = z.input<typeof ConvertOptionsSchema>;
export type ConvertOptionsResolved = z.output<typeof ConvertOptionsSchema>;

/**
 * Conversion result.
 */
export const ConvertResultSchema = z.object({
  /**
   * Whether conversion succeeded.
   */
  success: z.boolean(),

  /**
   * Converted data.
   */
  data: z.record(z.string(), z.unknown()).optional(),

  /**
   * Compatibility report.
   */
  report: CompatibilityReportSchema,
});

export type ConvertResult = z.infer<typeof ConvertResultSchema>;
