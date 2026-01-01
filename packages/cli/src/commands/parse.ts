import { Command } from 'commander';
import { parseFile, loadTranslationsFromDir } from '../parser.js';

export const parseCommand = new Command('parse')
  .description('Parse translation files and output as JSON')
  .argument('<path>', 'File or directory to parse')
  .option('-f, --format <format>', 'Output format (json)', 'json')
  .option('-p, --pretty', 'Pretty print output', false)
  .action((inputPath: string, options: { format: string; pretty: boolean }) => {
    try {
      let result: unknown;

      // Check if it's a directory or file
      const fs = require('node:fs');
      const stats = fs.statSync(inputPath);

      if (stats.isDirectory()) {
        result = loadTranslationsFromDir(inputPath);
      } else {
        result = parseFile(inputPath);
      }

      const output = options.pretty
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result);

      console.log(output);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });
