import * as fs from 'node:fs';
import * as path from 'node:path';
import yaml from 'js-yaml';

export type FileFormat = 'yaml' | 'json' | 'php';

/**
 * Parse PHP array file content to JavaScript object.
 * Supports Laravel-style translation files like:
 * <?php return ['key' => 'value', 'nested' => ['key' => 'value']];
 */
export function parsePhpArray(content: string): Record<string, unknown> {
  // Remove PHP tags and comments
  const cleaned = content
    .replace(/<\?php\s*/gi, '')
    .replace(/\?>/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
    .replace(/\/\/.*$/gm, '') // Line comments
    .replace(/#.*$/gm, ''); // Hash comments

  // Find the return statement
  const returnMatch = cleaned.match(/return\s+([\s\S]*);?\s*$/);
  if (!returnMatch) {
    throw new Error('No return statement found in PHP file');
  }

  const arrayContent = returnMatch[1].trim().replace(/;$/, '');

  // Parse the PHP array using a recursive parser
  const result = parsePhpValue(arrayContent.trim());

  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new Error('PHP file must return an associative array');
  }

  return result as Record<string, unknown>;
}

/**
 * Parse a PHP value (string, number, array, or nested structure).
 */
function parsePhpValue(input: string): unknown {
  const trimmed = input.trim();

  // Check for array syntax
  if (trimmed.startsWith('[') || trimmed.startsWith('array(')) {
    return parsePhpArrayValue(trimmed);
  }

  // Check for string
  if (trimmed.startsWith("'")) {
    const { value } = parsePhpSingleQuotedString(trimmed, 0);
    return value;
  }
  if (trimmed.startsWith('"')) {
    const { value } = parsePhpDoubleQuotedString(trimmed, 0);
    return value;
  }

  // Check for number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Check for boolean/null
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  throw new Error(`Unknown PHP value: ${trimmed.substring(0, 50)}`);
}

/**
 * Parse a PHP array value.
 */
function parsePhpArrayValue(input: string): Record<string, unknown> | unknown[] {
  let content: string;

  if (input.startsWith('[')) {
    // Find matching ]
    const endIndex = findMatchingBracket(input, 0, '[', ']');
    content = input.substring(1, endIndex).trim();
  } else if (input.startsWith('array(')) {
    // Find matching )
    const startIndex = input.indexOf('(');
    const endIndex = findMatchingBracket(input, startIndex, '(', ')');
    content = input.substring(startIndex + 1, endIndex).trim();
  } else {
    throw new Error('Not a valid PHP array');
  }

  if (content === '') {
    return {};
  }

  // Split by top-level commas and parse each element
  const elements = splitByTopLevelCommas(content);
  const isAssociative = elements.some((el) => el.includes('=>'));

  if (isAssociative) {
    const result: Record<string, unknown> = {};
    for (const element of elements) {
      const trimmedElement = element.trim();
      if (!trimmedElement) continue;

      const arrowIndex = findTopLevelArrow(trimmedElement);
      if (arrowIndex === -1) {
        throw new Error(`Expected => in associative array element: ${trimmedElement}`);
      }

      const keyPart = trimmedElement.substring(0, arrowIndex).trim();
      const valuePart = trimmedElement.substring(arrowIndex + 2).trim();

      const key = parsePhpValue(keyPart) as string;
      const value = parsePhpValue(valuePart);

      result[key] = value;
    }
    return result;
  } else {
    return elements.map((el) => parsePhpValue(el.trim()));
  }
}

/**
 * Find the index of => at the top level (not inside nested arrays or strings).
 */
function findTopLevelArrow(input: string): number {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (inSingleQuote) {
      if (char === '\\' && i + 1 < input.length) {
        i += 2;
        continue;
      }
      if (char === "'") {
        inSingleQuote = false;
      }
      i++;
      continue;
    }

    if (inDoubleQuote) {
      if (char === '\\' && i + 1 < input.length) {
        i += 2;
        continue;
      }
      if (char === '"') {
        inDoubleQuote = false;
      }
      i++;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      i++;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      i++;
      continue;
    }

    if (char === '[' || char === '(') {
      depth++;
      i++;
      continue;
    }

    if (char === ']' || char === ')') {
      depth--;
      i++;
      continue;
    }

    if (depth === 0 && char === '=' && i + 1 < input.length && input[i + 1] === '>') {
      return i;
    }

    i++;
  }

  return -1;
}

/**
 * Find matching closing bracket.
 */
function findMatchingBracket(
  input: string,
  startIndex: number,
  openBracket: string,
  closeBracket: string
): number {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = startIndex; i < input.length; i++) {
    const char = input[i];

    if (inSingleQuote) {
      if (char === '\\' && i + 1 < input.length) {
        i++;
        continue;
      }
      if (char === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '\\' && i + 1 < input.length) {
        i++;
        continue;
      }
      if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === openBracket) {
      depth++;
    } else if (char === closeBracket) {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  throw new Error(`Unmatched ${openBracket}`);
}

/**
 * Split string by top-level commas.
 */
function splitByTopLevelCommas(input: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inSingleQuote) {
      current += char;
      if (char === '\\' && i + 1 < input.length) {
        current += input[i + 1];
        i++;
        continue;
      }
      if (char === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      current += char;
      if (char === '\\' && i + 1 < input.length) {
        current += input[i + 1];
        i++;
        continue;
      }
      if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      current += char;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      current += char;
      continue;
    }

    if (char === '[' || char === '(') {
      depth++;
      current += char;
      continue;
    }

    if (char === ']' || char === ')') {
      depth--;
      current += char;
      continue;
    }

    if (depth === 0 && char === ',') {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

/**
 * Parse a PHP single-quoted string.
 */
function parsePhpSingleQuotedString(
  input: string,
  startIndex: number
): { value: string; endIndex: number } {
  let value = '';
  let i = startIndex + 1; // Skip opening quote

  while (i < input.length) {
    const char = input[i];

    if (char === '\\' && i + 1 < input.length) {
      const nextChar = input[i + 1];
      if (nextChar === "'" || nextChar === '\\') {
        value += nextChar;
        i += 2;
        continue;
      }
    }

    if (char === "'") {
      return { value, endIndex: i };
    }

    value += char;
    i++;
  }

  throw new Error('Unterminated single-quoted string');
}

/**
 * Parse a PHP double-quoted string.
 */
function parsePhpDoubleQuotedString(
  input: string,
  startIndex: number
): { value: string; endIndex: number } {
  let value = '';
  let i = startIndex + 1; // Skip opening quote

  while (i < input.length) {
    const char = input[i];

    if (char === '\\' && i + 1 < input.length) {
      const nextChar = input[i + 1];
      switch (nextChar) {
        case 'n':
          value += '\n';
          i += 2;
          continue;
        case 'r':
          value += '\r';
          i += 2;
          continue;
        case 't':
          value += '\t';
          i += 2;
          continue;
        case '\\':
        case '"':
        case '$':
          value += nextChar;
          i += 2;
          continue;
      }
    }

    if (char === '"') {
      return { value, endIndex: i };
    }

    value += char;
    i++;
  }

  throw new Error('Unterminated double-quoted string');
}
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
    case '.php':
      return 'php';
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
    case 'php':
      return parsePhpArray(content);
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
    if (ext !== '.yaml' && ext !== '.yml' && ext !== '.json' && ext !== '.php') {
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
