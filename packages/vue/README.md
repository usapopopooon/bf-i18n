# @bf-i18n/vue

Vue 3 integration for @bf-i18n/core.

## Installation

```bash
npm install @bf-i18n/vue
```

## Features

- Vue plugin with global properties
- Composables for translations and locale management
- `v-t` directive for template-based translations
- HTML sanitization for XSS protection
- Reactive locale updates

## Usage

### Setup

```typescript
import { createApp } from 'vue';
import { createI18n } from '@bf-i18n/core';
import { I18nPlugin } from '@bf-i18n/vue';

const i18n = createI18n({
  defaultLocale: 'en',
  mode: 'rails',
  translations: {
    en: {
      greeting: 'Hello, %{name}!',
      items: {
        one: '1 item',
        other: '%{count} items',
      },
    },
  },
});

const app = createApp(App);
app.use(I18nPlugin, { i18n });
app.mount('#app');
```

### useTranslation Composable

```vue
<script setup>
import { useTranslation } from '@bf-i18n/vue';

const { t, locale, setLocale } = useTranslation();
</script>

<template>
  <div>
    <p>{{ t('greeting', { name: 'Vue' }) }}</p>
    <p>{{ t('items', { count: 5 }) }}</p>
    <p>Current locale: {{ locale }}</p>
    <button @click="setLocale('ja')">
      Switch to Japanese
    </button>
  </div>
</template>
```

### useLocale Composable

```vue
<script setup>
import { useLocale } from '@bf-i18n/vue';

const { locale, setLocale, availableLocales } = useLocale();
</script>

<template>
  <select :value="locale" @change="setLocale($event.target.value)">
    <option v-for="loc in availableLocales" :key="loc" :value="loc">
      {{ loc }}
    </option>
  </select>
</template>
```

### useI18n Composable

```vue
<script setup>
import { useI18n } from '@bf-i18n/vue';

const i18n = useI18n();
</script>

<template>
  <pre>{{ JSON.stringify(i18n.getMissingKeys(), null, 2) }}</pre>
</template>
```

### v-t Directive

```vue
<template>
  <!-- Basic usage -->
  <p v-t="'greeting'"></p>

  <!-- With arguments -->
  <p v-t="{ path: 'greeting', args: { name: 'Vue' } }"></p>

  <!-- With HTML (sanitized) -->
  <p v-t.html="'welcome'"></p>
</template>
```

### Global Properties

The plugin also adds global properties accessible in templates:

```vue
<template>
  <p>{{ $t('greeting', { name: 'Vue' }) }}</p>
  <p>Current locale: {{ $locale }}</p>
</template>
```

## API

### Plugin

- `I18nPlugin` - Vue plugin to install

### Composables

- `useTranslation()` - Returns `{ t, locale, setLocale }`
- `useLocale()` - Returns `{ locale, setLocale, availableLocales }`
- `useI18n()` - Returns the I18n instance

### Directive

- `v-t` - Translate text content
- `v-t.html` - Translate with HTML (sanitized)

### Global Properties

- `$t(key, options?)` - Translate function
- `$i18n` - I18n instance
- `$locale` - Current locale

## Security

The `v-t.html` directive automatically sanitizes HTML content to prevent XSS attacks. Only safe HTML tags and attributes are allowed.

## License

MIT
