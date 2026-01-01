import * as fs from 'node:fs';
import * as path from 'node:path';
import yaml from 'js-yaml';

export type FileFormat = 'yaml' | 'json';
export type TranslationData = Record<string, unknown>;

/**
 * Detect file format from extension.
 */
export function detectFormat(filePath: string): FileFormat {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.yaml':
    case '.yml':
      return 'yaml';
    case '.json':
      return 'json';
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
}

/**
 * Parse a translation file and return the translations object.
 */
export function parseFile(filePath: string): Record<string, unknown> {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const format = detectFormat(filePath);

  switch (format) {
    case 'yaml':
      return yaml.load(content) as Record<string, unknown>;
    case 'json':
      return JSON.parse(content) as Record<string, unknown>;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Load translations from a directory.
 * Expects files named like: en.yaml, ja.yaml, en.json, etc.
 */
export function loadTranslationsFromDir(dirPath: string): Record<string, TranslationData> {
  const absolutePath = path.resolve(dirPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Directory not found: ${absolutePath}`);
  }

  const stat = fs.statSync(absolutePath);
  if (!stat.isDirectory()) {
    throw new Error(`Not a directory: ${absolutePath}`);
  }

  const files = fs.readdirSync(absolutePath);
  const translations: Record<string, TranslationData> = {};

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.yaml' && ext !== '.yml' && ext !== '.json') {
      continue;
    }

    const locale = path.basename(file, ext);
    const filePath = path.join(absolutePath, file);
    const content = parseFile(filePath);

    // If the content is already keyed by locale, use it directly
    if (content[locale]) {
      translations[locale] = content[locale] as Record<string, unknown>;
    } else {
      translations[locale] = content;
    }
  }

  return translations;
}

/**
 * Write translations to a file.
 */
export function writeFile(
  filePath: string,
  data: Record<string, unknown>,
  format?: FileFormat
): void {
  const absolutePath = path.resolve(filePath);
  const outputFormat = format ?? detectFormat(filePath);

  let content: string;
  switch (outputFormat) {
    case 'yaml':
      content = yaml.dump(data, { indent: 2, lineWidth: 120 });
      break;
    case 'json':
      content = JSON.stringify(data, null, 2);
      break;
    default:
      throw new Error(`Unsupported format: ${outputFormat}`);
  }

  fs.writeFileSync(absolutePath, content, 'utf-8');
}
