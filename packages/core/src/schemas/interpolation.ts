import { z } from 'zod';

/**
 * Interpolation options.
 */
export const InterpolationOptionsSchema = z.object({
  /**
   * Interpolation variable prefix.
   * - Rails: '%{'
   * - Laravel: ':'
   */
  prefix: z.string(),

  /**
   * Interpolation variable suffix.
   * - Rails: '}'
   * - Laravel: '' (ends at word boundary)
   */
  suffix: z.string(),
});

export type InterpolationOptions = z.infer<typeof InterpolationOptionsSchema>;

/**
 * Rails format interpolation defaults.
 */
export const RailsInterpolationDefaults: InterpolationOptions = {
  prefix: '%{',
  suffix: '}',
};

/**
 * Laravel format interpolation defaults.
 */
export const LaravelInterpolationDefaults: InterpolationOptions = {
  prefix: ':',
  suffix: '',
};
