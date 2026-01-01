import { Command } from 'commander';
import { loadTranslationsFromDir } from '../parser.js';
import { validateTranslations } from '../validator.js';

export const validateCommand = new Command('validate')
  .description('Validate translation files for consistency')
  .argument('<directory>', 'Directory containing translation files')
  .option('-r, --reference <locale>', 'Reference locale for comparison', 'en')
  .option('--strict', 'Treat warnings as errors', false)
  .action(
    (
      directory: string,
      options: { reference: string; strict: boolean }
    ) => {
      try {
        const translations = loadTranslationsFromDir(directory);
        const result = validateTranslations(translations, options.reference);

        // Output errors
        if (result.errors.length > 0) {
          console.error('\nErrors:');
          for (const error of result.errors) {
            console.error(`  ✗ [${error.locale}] ${error.message}`);
          }
        }

        // Output warnings
        if (result.warnings.length > 0) {
          console.warn('\nWarnings:');
          for (const warning of result.warnings) {
            console.warn(`  ⚠ [${warning.locale}] ${warning.message}`);
          }
        }

        // Summary
        console.log('\nSummary:');
        console.log(`  Locales: ${Object.keys(translations).join(', ')}`);
        console.log(`  Errors: ${result.errors.length}`);
        console.log(`  Warnings: ${result.warnings.length}`);

        if (!result.valid || (options.strict && result.warnings.length > 0)) {
          console.log('\nValidation failed.');
          process.exit(1);
        } else {
          console.log('\nValidation passed.');
        }
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    }
  );
