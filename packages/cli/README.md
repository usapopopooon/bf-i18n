# @bf-i18n/cli

[![CI](https://github.com/usapopopooon/bf-i18n/actions/workflows/ci.yml/badge.svg)](https://github.com/usapopopooon/bf-i18n/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@bf-i18n/cli.svg)](https://www.npmjs.com/package/@bf-i18n/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <img src="../../docs/img/logo-cli.svg" alt="@bf-i18n/cli logo" width="200">
</p>

CLI tool for bf-i18n. Parse, validate, convert, and extract translation keys from Rails/Laravel format files.

Part of the [bf-i18n](https://github.com/usapopopooon/bf-i18n) project.

## Installation

```bash
npm install -g @bf-i18n/cli
```

Or use with npx:

```bash
npx @bf-i18n/cli <command>
```

## Commands

### parse

Parse and display translation files (YAML, JSON, PHP).

```bash
bf-i18n parse <file>

# Examples
bf-i18n parse locales/en.yml
bf-i18n parse locales/en.json
bf-i18n parse lang/en/messages.php
```

### validate

Validate translation files for consistency across locales.

```bash
bf-i18n validate <files...>

# Example
bf-i18n validate locales/en.yml locales/ja.yml locales/fr.yml
```

Checks for:
- Missing keys between locales
- Extra keys in some locales
- Type mismatches (string vs object)

### convert

Convert translation files between Rails and Laravel formats.

```bash
bf-i18n convert <file> --from <mode> --to <mode> [--output <file>]

# Examples
bf-i18n convert locales/en.yml --from rails --to laravel
bf-i18n convert lang/en.json --from laravel --to rails --output locales/en.yml

# Check compatibility without converting
bf-i18n convert locales/en.yml --from rails --to laravel --check-only

# Fail on warnings
bf-i18n convert locales/en.yml --from rails --to laravel --strict
```

**Options:**
- `--from` - Source format (`rails` or `laravel`)
- `--to` - Target format (`rails` or `laravel`)
- `--output, -o` - Output file path
- `--check-only` - Only check compatibility, don't convert
- `--strict` - Fail if there are warnings

### extract

Extract translation keys from source code.

```bash
bf-i18n extract <dir> [options]

# Examples
bf-i18n extract src/
bf-i18n extract src/ --unique
bf-i18n extract src/ --json
bf-i18n extract src/ --output keys.txt
```

**Options:**
- `--unique, -u` - Show only unique keys
- `--json` - Output as JSON
- `--output, -o` - Write results to file

**Supported patterns:**
- `t('key')`, `$t('key')`
- `i18n.t('key')`
- `useTranslation` hook patterns

**Supported file extensions:**
- `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`

## Format Differences

### Rails Format

```yaml
en:
  greeting: "Hello, %{name}!"
  items:
    zero: "No items"
    one: "1 item"
    other: "%{count} items"
```

### Laravel Format

```yaml
en:
  greeting: "Hello, :name!"
  items: "{0} No items|{1} 1 item|[2,*] :count items"
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid input, conversion failed, etc.)

## License

MIT
