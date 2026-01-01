# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.4] - 2026-01-01

### Changed

#### Documentation
- Update README.md, LICENSE, and root package.json to use `bf-i18n` name

## [0.5.3] - 2026-01-01

### Changed

#### Repository
- Rename repository from `backend-friendly-i18n` to `bf-i18n`
- Update all package URLs (homepage, repository, bugs) to use new repository name

## [0.5.2] - 2026-01-01

### Added

#### Metadata
- Add homepage, repository, and bugs fields to all packages for npm

## [0.5.1] - 2026-01-01

### Added

#### Documentation
- README.md for each package (@bf-i18n/core, @bf-i18n/react, @bf-i18n/vue, @bf-i18n/cli)

## [0.5.0] - 2026-01-01

### Added

#### Infrastructure
- Playwright E2E tests for browser environment verification
- E2E tests for Vanilla JS, React, and Vue integrations
- Test server for serving built packages in browser
- `npm run test:e2e` script for running browser tests

## [0.4.0] - 2026-01-01

### Added

#### @bf-i18n/core
- `detectBrowserLocale()` function to detect user's preferred locale from browser
- `detectBrowserLocale` option in `createI18n()` to automatically use browser locale
- `hasLocale()` method to check if a locale is available
- `getMissingKeys()`, `clearMissingKeys()`, `hasMissingKeys()` methods for tracking missing translation keys
- `MissingKeyInfo` type for missing key tracking data
- `isBrowser()` utility function to check if running in browser environment
- Comprehensive test suite for React package (provider, hooks, Trans component, HOC)
- Edge case tests for pluralization, locale validation, and deeply nested keys

#### @bf-i18n/vue
- HTML sanitization in `v-t.html` directive to prevent XSS attacks
- Allowlist-based sanitization for safe HTML tags and attributes

#### @bf-i18n/cli
- `extract` command to scan source code and extract translation keys
- Support for multiple file extensions (`.ts`, `.tsx`, `.js`, `.jsx`, `.vue`)
- `--unique` flag to show only unique keys
- `--json` flag for JSON output
- `--output` flag to write results to file

#### @bf-i18n/react
- Complete test suite with 31 tests covering all components and hooks

### Changed

#### @bf-i18n/core
- Locale setter now validates input and throws on empty/invalid strings
- Locale strings are trimmed before setting
- Default mode is `rails` for consistency

### Security

#### @bf-i18n/vue
- Fixed potential XSS vulnerability in `v-t.html` directive by sanitizing HTML content

## [0.3.0] - 2026-01-01

### Added

#### @bf-i18n/core
- `CompatibilityChecker` class for checking translation compatibility between modes
- `checkCompatibility()` function to analyze translations before conversion
- Detection of unsupported plural forms when converting between Rails and Laravel
- Warning generation for range-based plural syntax in Laravel mode
- Error detection for invalid syntax that cannot be converted

#### @bf-i18n/cli
- PHP array file parsing support for Laravel translation files
- `--check-only` flag for convert command to validate without converting
- `--strict` flag for convert command to fail on warnings
- Compatibility warnings and errors displayed before conversion
- Support for `.php` extension in parse and convert commands

### Changed

#### @bf-i18n/cli
- Convert command now checks compatibility before proceeding
- Conversion aborts automatically on errors
- Warnings are displayed with suggestions for resolution

## [0.1.0] - 2026-01-01

### Added

#### @bf-i18n/core
- Initial release of core i18n library
- Support for Rails mode (`%{variable}` interpolation, key-based pluralization)
- Support for Laravel mode (`:variable` interpolation, pipe-based pluralization)
- `I18n` class with locale management and change listeners
- `Translator` class for key resolution with fallback chain
- `Interpolator` class for variable substitution
- `Pluralizer` class for plural form handling using `Intl.PluralRules`
- Zod schemas for runtime validation
- Automatic format conversion between Rails and Laravel modes

#### @bf-i18n/react
- React integration package
- `I18nProvider` component for context setup
- `useTranslation` hook for translations with reactive locale
- `useLocale` hook for locale management
- `useI18n` hook for direct I18n instance access
- `Trans` component for JSX-based translations
- `withTranslation` HOC for class components

#### @bf-i18n/vue
- Vue integration package
- `I18nPlugin` for Vue app installation
- Global `$t`, `$i18n`, `$locale` properties
- `useTranslation` composable for translations
- `useLocale` composable for locale management
- `useI18n` composable for direct I18n instance access
- `v-t` directive for template-based translations

#### @bf-i18n/cli
- CLI tool for translation file management
- `parse` command to read YAML/JSON translation files
- `validate` command to check translation consistency across locales
- `convert` command to convert between Rails and Laravel formats

### Infrastructure
- Monorepo setup with npm workspaces
- TypeScript configuration with strict mode
- Vitest for testing
- tsup for building
- GitHub Actions CI workflow
