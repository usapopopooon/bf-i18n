import { Command } from 'commander';
import * as path from 'node:path';
import { parseFile, writeFile, loadTranslationsFromDir, type FileFormat } from '../parser.js';
import { convertTranslations } from '../converter.js';
import type { Mode } from '@bf-i18n/core';

export const convertCommand = new Command('convert')
  .description('Convert translation files between formats or modes')
  .argument('<input>', 'Input file or directory')
  .argument('<output>', 'Output file or directory')
  .option('--from-mode <mode>', 'Source mode (rails, laravel)', 'rails')
  .option('--to-mode <mode>', 'Target mode (rails, laravel)', 'laravel')
  .option('--format <format>', 'Output format (yaml, json)')
  .action(
    (
      input: string,
      output: string,
      options: { fromMode: string; toMode: string; format?: string }
    ) => {
      try {
        const fs = require('node:fs');
        const inputStats = fs.statSync(input);

        if (inputStats.isDirectory()) {
          // Convert all files in directory
          const translations = loadTranslationsFromDir(input);
          const converted = convertTranslations(
            translations,
            options.fromMode as Mode,
            options.toMode as Mode
          );

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
          const translations = { _: content };
          const converted = convertTranslations(
            translations,
            options.fromMode as Mode,
            options.toMode as Mode
          );

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
