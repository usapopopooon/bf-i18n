import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  parseFile,
  loadTranslationsFromDir,
  writeFile,
  detectFormat,
  parsePhpArray,
} from '../parser.js';

describe('parser', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bf-i18n-test-'));
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('detectFormat', () => {
    it('detects yaml format', () => {
      expect(detectFormat('en.yaml')).toBe('yaml');
      expect(detectFormat('en.yml')).toBe('yaml');
    });

    it('detects json format', () => {
      expect(detectFormat('en.json')).toBe('json');
    });

    it('detects php format', () => {
      expect(detectFormat('messages.php')).toBe('php');
    });

    it('throws for unsupported format', () => {
      expect(() => detectFormat('en.txt')).toThrow('Unsupported file extension');
    });
  });

  describe('parseFile', () => {
    it('parses JSON file', () => {
      const filePath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filePath, JSON.stringify({ hello: 'Hello' }));

      const result = parseFile(filePath);
      expect(result).toEqual({ hello: 'Hello' });
    });

    it('parses YAML file', () => {
      const filePath = path.join(tempDir, 'test.yaml');
      fs.writeFileSync(filePath, 'hello: Hello\n');

      const result = parseFile(filePath);
      expect(result).toEqual({ hello: 'Hello' });
    });

    it('parses PHP file with short array syntax', () => {
      const filePath = path.join(tempDir, 'messages.php');
      fs.writeFileSync(
        filePath,
        `<?php

return [
    'hello' => 'Hello',
    'greeting' => 'Hello, :name!',
];
`
      );

      const result = parseFile(filePath);
      expect(result).toEqual({
        hello: 'Hello',
        greeting: 'Hello, :name!',
      });
    });

    it('parses PHP file with nested arrays', () => {
      const filePath = path.join(tempDir, 'nested.php');
      fs.writeFileSync(
        filePath,
        `<?php

return [
    'messages' => [
        'welcome' => 'Welcome!',
        'goodbye' => 'Goodbye!',
    ],
];
`
      );

      const result = parseFile(filePath);
      expect(result).toEqual({
        messages: {
          welcome: 'Welcome!',
          goodbye: 'Goodbye!',
        },
      });
    });

    it('throws for non-existent file', () => {
      expect(() => parseFile('/nonexistent/file.json')).toThrow('File not found');
    });
  });

  describe('parsePhpArray', () => {
    it('parses simple array', () => {
      const result = parsePhpArray(`<?php return ['key' => 'value'];`);
      expect(result).toEqual({ key: 'value' });
    });

    it('parses array with comments', () => {
      const result = parsePhpArray(`<?php
// This is a comment
return [
    'key' => 'value', // inline comment
    /* block comment */
    'key2' => 'value2',
];
`);
      expect(result).toEqual({ key: 'value', key2: 'value2' });
    });

    it('parses array with escape sequences', () => {
      const result = parsePhpArray(`<?php return ['escaped' => "line1\\nline2"];`);
      expect(result).toEqual({ escaped: 'line1\nline2' });
    });

    it('parses long array syntax', () => {
      const result = parsePhpArray(`<?php return array('key' => 'value');`);
      expect(result).toEqual({ key: 'value' });
    });

    it('parses pipe-based pluralization', () => {
      const result = parsePhpArray(
        `<?php return ['items' => '{0} No items|{1} One item|[2,*] :count items'];`
      );
      expect(result).toEqual({ items: '{0} No items|{1} One item|[2,*] :count items' });
    });

    it('throws for invalid PHP file', () => {
      expect(() => parsePhpArray('not php code')).toThrow('No return statement found');
    });
  });

  describe('loadTranslationsFromDir', () => {
    it('loads multiple locale files', () => {
      const dir = path.join(tempDir, 'locales');
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'en.json'), JSON.stringify({ hello: 'Hello' }));
      fs.writeFileSync(path.join(dir, 'ja.json'), JSON.stringify({ hello: 'こんにちは' }));

      const result = loadTranslationsFromDir(dir);
      expect(result).toEqual({
        en: { hello: 'Hello' },
        ja: { hello: 'こんにちは' },
      });
    });

    it('throws for non-existent directory', () => {
      expect(() => loadTranslationsFromDir('/nonexistent/dir')).toThrow('Directory not found');
    });
  });

  describe('writeFile', () => {
    it('writes JSON file', () => {
      const filePath = path.join(tempDir, 'output.json');
      writeFile(filePath, { hello: 'Hello' });

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(JSON.parse(content)).toEqual({ hello: 'Hello' });
    });

    it('writes YAML file', () => {
      const filePath = path.join(tempDir, 'output.yaml');
      writeFile(filePath, { hello: 'Hello' });

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('hello: Hello');
    });
  });
});
