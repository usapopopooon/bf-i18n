# backend-friendly-i18n

[![CI](https://github.com/usapopopooon/backend-friendly-i18n/actions/workflows/ci.yml/badge.svg)](https://github.com/usapopopooon/backend-friendly-i18n/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@bf-i18n/core.svg)](https://www.npmjs.com/package/@bf-i18n/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight i18n library that reads Rails/Laravel i18n formats and makes them usable in JavaScript/TypeScript applications including React and Vue.

## Features

- **Multi-format support**: Rails (`%{variable}`, key-based pluralization) and Laravel (`:variable`, pipe-based pluralization)
- **Framework integrations**: React hooks/components, Vue composables/directives
- **Vanilla JS/TS ready**: Use `@bf-i18n/core` directly without any framework
- **TypeScript first**: Full type safety with Zod runtime validation
- **Lightweight**: Minimal dependencies, tree-shakeable
- **Browser locale detection**: Automatic locale detection from browser settings
- **Missing key tracking**: Debug and identify untranslated strings
- **CLI tools**: Parse, validate, convert, and extract translation keys

## Packages

| Package | Description |
|---------|-------------|
| [@bf-i18n/core](./packages/core) | Core i18n library (framework-agnostic) |
| [@bf-i18n/react](./packages/react) | React integration (hooks, components, HOC) |
| [@bf-i18n/vue](./packages/vue) | Vue integration (plugin, composables, directive) |
| [@bf-i18n/cli](./packages/cli) | CLI tool for translation management |

## Installation

```bash
# Core only (vanilla JS/TS)
npm install @bf-i18n/core

# With React
npm install @bf-i18n/core @bf-i18n/react

# With Vue
npm install @bf-i18n/core @bf-i18n/vue

# CLI tool
npm install -g @bf-i18n/cli
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { createI18n } from '@bf-i18n/core';

const i18n = createI18n({
  defaultLocale: 'en',
  mode: 'rails', // or 'laravel'
  translations: {
    en: {
      hello: 'Hello, %{name}!',
      items: {
        zero: 'No items',
        one: '1 item',
        other: '%{count} items',
      },
    },
    ja: {
      hello: 'こんにちは、%{name}さん！',
      items: {
        zero: 'アイテムなし',
        one: '1個のアイテム',
        other: '%{count}個のアイテム',
      },
    },
  },
});

// Basic translation
console.log(i18n.t('hello', { name: 'World' })); // "Hello, World!"

// Pluralization
console.log(i18n.t('items', { count: 0 })); // "No items"
console.log(i18n.t('items', { count: 1 })); // "1 item"
console.log(i18n.t('items', { count: 5 })); // "5 items"

// Change locale
i18n.locale = 'ja';
console.log(i18n.t('hello', { name: '世界' })); // "こんにちは、世界さん！"

// Listen to locale changes
i18n.onChange(() => {
  console.log('Locale changed to:', i18n.locale);
});
```

### React

```tsx
import { I18nProvider, useTranslation } from '@bf-i18n/react';
import { createI18n } from '@bf-i18n/core';

const i18n = createI18n({
  defaultLocale: 'en',
  translations: { /* ... */ },
});

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <p>{t('hello', { name: 'React' })}</p>
      <p>Current locale: {locale}</p>
      <button onClick={() => setLocale('ja')}>日本語</button>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useTranslation } from '@bf-i18n/vue';

const { t, locale, setLocale } = useTranslation();
</script>

<template>
  <div>
    <p>{{ t('hello', { name: 'Vue' }) }}</p>
    <p>Current locale: {{ locale }}</p>
    <button @click="setLocale('ja')">日本語</button>

    <!-- Or use directive -->
    <p v-t="'hello'"></p>
  </div>
</template>
```

```typescript
// main.ts
import { createApp } from 'vue';
import { I18nPlugin } from '@bf-i18n/vue';
import { createI18n } from '@bf-i18n/core';

const i18n = createI18n({
  defaultLocale: 'en',
  translations: { /* ... */ },
});

const app = createApp(App);
app.use(I18nPlugin, { i18n });
app.mount('#app');
```

## Mode Support

### Rails Mode (default)

```yaml
# config/locales/en.yml
en:
  greeting: "Hello, %{name}!"
  items:
    zero: "No items"
    one: "1 item"
    other: "%{count} items"
```

### Laravel Mode

```php
// resources/lang/en/messages.php
return [
    'greeting' => 'Hello, :name!',
    'items' => '{0} No items|{1} 1 item|[2,*] :count items',
];
```

```typescript
const i18n = createI18n({
  mode: 'laravel',
  defaultLocale: 'en',
  translations: {
    en: {
      greeting: 'Hello, :name!',
      items: '{0} No items|{1} 1 item|[2,*] :count items',
    },
  },
});
```

## Browser Locale Detection

Automatically detect the user's preferred locale from browser settings:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  detectBrowserLocale: true, // Enable browser locale detection
  translations: {
    en: { /* ... */ },
    ja: { /* ... */ },
    'zh-CN': { /* ... */ },
  },
});

// Locale is automatically set based on navigator.languages
// Falls back to defaultLocale if no match is found
console.log(i18n.locale); // e.g., "ja" if browser is set to Japanese
```

### Locale Priority

1. **Explicit `locale` option**: If you set `locale` directly, it takes highest priority
2. **Browser detection**: If `detectBrowserLocale: true` and no explicit locale is set
3. **Default locale**: Falls back to `defaultLocale` if no browser match

```typescript
// Explicit locale always wins
const i18n = createI18n({
  defaultLocale: 'en',
  locale: 'fr', // This will be used regardless of browser settings
  detectBrowserLocale: true,
  translations: { /* ... */ },
});
console.log(i18n.locale); // "fr"
```

### Locale Matching

The detection algorithm:
- Matches exact locales first (e.g., `zh-CN`)
- Falls back to language-only match (e.g., `zh-CN` → `zh`)
- Matches language-only to regional variant (e.g., `zh` → `zh-CN`)

## Missing Key Tracking

Track missing translation keys for debugging during development:

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  translations: { en: { hello: 'Hello' } },
});

// Try to translate missing keys
i18n.t('missing.key'); // Returns "missing.key"
i18n.t('another.missing'); // Returns "another.missing"

// Check if there are missing keys
if (i18n.hasMissingKeys()) {
  console.warn('Missing translations detected!');
}

// Get all missing keys with metadata
const missingKeys = i18n.getMissingKeys();
// [
//   { key: 'missing.key', locale: 'en', timestamp: Date },
//   { key: 'another.missing', locale: 'en', timestamp: Date }
// ]

// Clear tracked missing keys
i18n.clearMissingKeys();
```

### Use Cases

- **Development debugging**: Quickly identify untranslated strings
- **CI/CD integration**: Fail builds if missing translations are detected
- **Translation workflow**: Generate reports of keys that need translation

## CLI Usage

```bash
# Parse translation files
bf-i18n parse ./locales --pretty

# Validate translations across locales
bf-i18n validate ./locales --reference en

# Convert between formats
bf-i18n convert ./rails-locales ./laravel-locales --from-mode rails --to-mode laravel

# Extract translation keys from source code
bf-i18n extract ./src --output keys.json
```

### Extract Command

Find all translation keys used in your source code:

```bash
# Extract keys to JSON file
bf-i18n extract ./src --output keys.json

# Extract keys to stdout
bf-i18n extract ./src

# Specify file extensions to scan
bf-i18n extract ./src --extensions ts,tsx,vue
```

The extract command detects these patterns:
- `t('key')` / `t("key")`
- `$t('key')` (Vue template syntax)
- `i18n.t('key')`
- `i18nKey="key"` (React component prop)
- `v-t="'key'"` (Vue directive)

## Using Rails/Laravel JSON Files

You can directly use JSON translation files exported from Rails or Laravel:

```typescript
// Rails: config/locales/en.json
// {
//   "en": {
//     "greeting": "Hello, %{name}!",
//     "items": { "zero": "No items", "one": "1 item", "other": "%{count} items" }
//   }
// }

import en from './locales/en.json';
import ja from './locales/ja.json';

const i18n = createI18n({
  mode: 'rails', // Default mode, works with Rails JSON format
  defaultLocale: 'en',
  translations: {
    en: en.en,
    ja: ja.ja,
  },
});
```

## API Reference

### createI18n(options)

Creates a new I18n instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultLocale` | `string` | required | Default locale |
| `locale` | `string` | - | Current locale (takes priority over browser detection) |
| `mode` | `'rails' \| 'laravel'` | `'rails'` | Interpolation/pluralization format |
| `translations` | `object` | required | Translation resources |
| `fallbackLocale` | `string \| string[]` | - | Fallback locale(s) |
| `detectBrowserLocale` | `boolean` | `false` | Auto-detect locale from browser |
| `missingTranslationHandler` | `function` | - | Handler for missing keys |

### I18n Instance

| Method/Property | Description |
|-----------------|-------------|
| `t(key, options?)` | Translate a key |
| `locale` | Get/set current locale |
| `availableLocales` | List of available locales |
| `exists(key)` | Check if a key exists |
| `hasLocale(locale)` | Check if a locale is available |
| `onChange(callback)` | Subscribe to locale changes |
| `getMissingKeys()` | Get array of missing key info |
| `hasMissingKeys()` | Check if any missing keys were tracked |
| `clearMissingKeys()` | Clear tracked missing keys |

## License

[MIT](LICENSE)
