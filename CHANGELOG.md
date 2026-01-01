# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
