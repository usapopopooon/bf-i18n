import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface ExtractedKey {
  key: string;
  file: string;
  line: number;
}

// Patterns to match translation function calls
const PATTERNS = [
  // t('key') or t("key")
  /\bt\(\s*['"]([^'"]+)['"]/g,
  // $t('key') or $t("key") - Vue global
  /\$t\(\s*['"]([^'"]+)['"]/g,
  // i18n.t('key') or i18n.t("key")
  /i18n\.t\(\s*['"]([^'"]+)['"]/g,
  // useTranslation().t('key') pattern - captured via t() above
  // Trans component i18nKey prop
  /i18nKey\s*=\s*['"]([^'"]+)['"]/g,
  // v-t directive
  /v-t\s*=\s*['"]'?([^'"]+)'?['"]/g,
];

function extractKeysFromFile(filePath: string, content: string): ExtractedKey[] {
  const keys: ExtractedKey[] = [];
  const lines = content.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        keys.push({
          key: match[1],
          file: filePath,
          line: lineIndex + 1,
        });
      }
    }
  }

  return keys;
}

function walkDirectory(
  dir: string,
  extensions: string[],
  ignore: string[]
): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Check if path should be ignored
      const shouldIgnore = ignore.some((pattern) => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(fullPath);
        }
        return fullPath.includes(pattern);
      });

      if (shouldIgnore) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

export const extractCommand = new Command('extract')
  .description('Extract translation keys from source code')
  .argument('<source>', 'Source directory to scan')
  .option(
    '-e, --extensions <extensions>',
    'File extensions to scan (comma-separated)',
    '.ts,.tsx,.js,.jsx,.vue'
  )
  .option(
    '-i, --ignore <patterns>',
    'Patterns to ignore (comma-separated)',
    'node_modules,dist,.git'
  )
  .option('-o, --output <file>', 'Output file (JSON format)')
  .option('--json', 'Output as JSON', false)
  .option('--unique', 'Only show unique keys', false)
  .action(
    (
      source: string,
      options: {
        extensions: string;
        ignore: string;
        output?: string;
        json: boolean;
        unique: boolean;
      }
    ) => {
      try {
        const absoluteSource = path.resolve(source);

        if (!fs.existsSync(absoluteSource)) {
          console.error(`Error: Source directory not found: ${absoluteSource}`);
          process.exit(1);
        }

        const extensions = options.extensions.split(',').map((e) => e.trim());
        const ignore = options.ignore.split(',').map((p) => p.trim());

        console.log(`Scanning ${absoluteSource}...`);
        console.log(`Extensions: ${extensions.join(', ')}`);
        console.log(`Ignoring: ${ignore.join(', ')}`);
        console.log('');

        const files = walkDirectory(absoluteSource, extensions, ignore);
        const allKeys: ExtractedKey[] = [];

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          const relativePath = path.relative(absoluteSource, file);
          const keys = extractKeysFromFile(relativePath, content);
          allKeys.push(...keys);
        }

        if (allKeys.length === 0) {
          console.log('No translation keys found.');
          return;
        }

        let outputKeys = allKeys;

        if (options.unique) {
          const uniqueKeys = new Set<string>();
          outputKeys = allKeys.filter((k) => {
            if (uniqueKeys.has(k.key)) return false;
            uniqueKeys.add(k.key);
            return true;
          });
        }

        if (options.json || options.output) {
          const jsonOutput = options.unique
            ? outputKeys.map((k) => k.key)
            : outputKeys;

          if (options.output) {
            fs.writeFileSync(options.output, JSON.stringify(jsonOutput, null, 2));
            console.log(`Written ${outputKeys.length} keys to ${options.output}`);
          } else {
            console.log(JSON.stringify(jsonOutput, null, 2));
          }
        } else {
          console.log(`Found ${allKeys.length} translation key references:`);
          console.log('');

          if (options.unique) {
            const uniqueKeys = [...new Set(allKeys.map((k) => k.key))].sort();
            console.log(`Unique keys (${uniqueKeys.length}):`);
            for (const key of uniqueKeys) {
              console.log(`  ${key}`);
            }
          } else {
            for (const key of outputKeys) {
              console.log(`  ${key.file}:${key.line} - ${key.key}`);
            }
          }
        }

        console.log('');
        console.log(
          `Total: ${allKeys.length} references, ${new Set(allKeys.map((k) => k.key)).size} unique keys`
        );
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
      }
    }
  );
