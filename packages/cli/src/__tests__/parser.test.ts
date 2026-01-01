import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { parseFile, loadTranslationsFromDir, writeFile, detectFormat } from '../parser.js';

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

    it('throws for unsupported format', () => {
      expect(() => detectFormat('en.php')).toThrow('Unsupported file extension');
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

    it('throws for non-existent file', () => {
      expect(() => parseFile('/nonexistent/file.json')).toThrow('File not found');
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
