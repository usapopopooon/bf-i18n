import { z } from 'zod';

/**
 * Built-in backend framework modes.
 * Future additions may include django, spring, phoenix, etc.
 */
export const BuiltInModeSchema = z.enum(['rails', 'laravel']);
export type BuiltInMode = z.infer<typeof BuiltInModeSchema>;

/**
 * Framework mode.
 * Allows built-in modes plus custom mode strings for extensibility
 * and user-defined modes.
 */
export const ModeSchema = z.union([BuiltInModeSchema, z.string()]);
export type Mode = z.infer<typeof ModeSchema>;

/**
 * Built-in source modes.
 */
export const BuiltInSourceModeSchema = z.enum(['rails', 'laravel', 'auto']);
export type BuiltInSourceMode = z.infer<typeof BuiltInSourceModeSchema>;

/**
 * Source mode (format of input data).
 * Allows built-in modes plus custom mode strings.
 */
export const SourceModeSchema = z.union([BuiltInSourceModeSchema, z.string()]);
export type SourceMode = z.infer<typeof SourceModeSchema>;

/**
 * Mode configuration interface.
 * Each mode can be extended by implementing this interface.
 */
export const ModeConfigSchema = z.object({
  /**
   * Mode name.
   */
  name: z.string(),

  /**
   * Interpolation variable prefix.
   */
  interpolationPrefix: z.string(),

  /**
   * Interpolation variable suffix.
   */
  interpolationSuffix: z.string(),

  /**
   * Pluralization type.
   */
  pluralizationType: z.enum(['key', 'pipe', 'icu', 'custom']),

  /**
   * Supported file formats.
   */
  supportedFormats: z.array(z.string()),
});

export type ModeConfig = z.infer<typeof ModeConfigSchema>;

/**
 * Built-in mode configurations.
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
