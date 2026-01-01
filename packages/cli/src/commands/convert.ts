import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseFile, writeFile, loadTranslationsFromDir, type FileFormat } from '../parser.js';
import { convertTranslations } from '../converter.js';
import { checkCompatibility, type Mode, type CompatibilityReport } from '@bf-i18n/core';

function printCompatibilityReport(report: CompatibilityReport): void {
  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of report.warnings) {
      console.log(`  [WARN] ${warning.key}: ${warning.message}`);
      if (warning.suggestion) {
        console.log(`         Suggestion: ${warning.suggestion}`);
      }
    }
  }

  if (report.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of report.errors) {
      console.log(`  [ERROR] ${error.key}: ${error.message}`);
      if (error.suggestion) {
        console.log(`          Suggestion: ${error.suggestion}`);
      }
    }
  }
}

export const convertCommand = new Command('convert')
  .description('Convert translation files between formats or modes')
  .argument('<input>', 'Input file or directory')
  .argument('<output>', 'Output file or directory')
  .option('--from-mode <mode>', 'Source mode (rails, laravel)', 'rails')
  .option('--to-mode <mode>', 'Target mode (rails, laravel)', 'laravel')
  .option('--format <format>', 'Output format (yaml, json)')
  .option('--check-only', 'Only check compatibility without converting', false)
  .option('--strict', 'Fail on warnings', false)
  .action(
    (
      input: string,
      output: string,
      options: {
        fromMode: string;
        toMode: string;
        format?: string;
        checkOnly: boolean;
        strict: boolean;
      }
    ) => {
      try {
        const inputStats = fs.statSync(input);
        const fromMode = options.fromMode as Mode;
        const toMode = options.toMode as Mode;

        if (inputStats.isDirectory()) {
          // Convert all files in directory
          const translations = loadTranslationsFromDir(input);

          // Check compatibility for all locales
          let hasWarnings = false;
          let hasErrors = false;

          for (const [locale, localeTranslations] of Object.entries(translations)) {
            const report = checkCompatibility(localeTranslations, fromMode, toMode);

            if (report.warnings.length > 0 || report.errors.length > 0) {
              console.log(`\n=== ${locale} ===`);
              printCompatibilityReport(report);
            }

            if (report.warnings.length > 0) hasWarnings = true;
            if (!report.compatible) hasErrors = true;
          }

          if (options.checkOnly) {
            if (hasErrors) {
              console.log('\nCompatibility check failed with errors.');
              process.exit(1);
            }
            if (hasWarnings && options.strict) {
              console.log('\nCompatibility check failed with warnings (strict mode).');
              process.exit(1);
            }
            console.log('\nCompatibility check passed.');
            return;
          }

          if (hasErrors) {
            console.error('\nConversion aborted due to errors.');
            process.exit(1);
          }

          if (hasWarnings && options.strict) {
            console.error('\nConversion aborted due to warnings (strict mode).');
            process.exit(1);
          }

          const converted = convertTranslations(translations, fromMode, toMode);

          // Create output directory if it doesn't exist
          if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
          }

          // Write each locale to a separate file
          const format = (options.format as FileFormat) ?? 'json';
          const ext = format === 'yaml' ? '.yaml' : '.json';

          for (const [locale, localeTranslations] of Object.entries(converted)) {
            const outputPath = path.join(output, `${locale}${ext}`);
            writeFile(outputPath, localeTranslations as Record<string, unknown>, format);
            console.log(`Written: ${outputPath}`);
          }
        } else {
          // Convert single file
          const content = parseFile(input);

          // Check compatibility
          const report = checkCompatibility(content, fromMode, toMode);
          printCompatibilityReport(report);

          if (options.checkOnly) {
            if (!report.compatible) {
              console.log('\nCompatibility check failed with errors.');
              process.exit(1);
            }
            if (report.warnings.length > 0 && options.strict) {
              console.log('\nCompatibility check failed with warnings (strict mode).');
              process.exit(1);
            }
            console.log('\nCompatibility check passed.');
            return;
          }

          if (!report.compatible) {
            console.error('\nConversion aborted due to errors.');
            process.exit(1);
          }

          if (report.warnings.length > 0 && options.strict) {
            console.error('\nConversion aborted due to warnings (strict mode).');
            process.exit(1);
          }

          const translations = { _: content };
          const converted = convertTranslations(translations, fromMode, toMode);

          const format = options.format as FileFormat | undefined;
          writeFile(output, converted._ as Record<string, unknown>, format);
          console.log(`Written: ${output}`);
        }

        console.log('\nConversion complete.');
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    }
  );
