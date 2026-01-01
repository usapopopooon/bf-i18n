# @bf-i18n/react

React integration for @bf-i18n/core.

## Installation

```bash
npm install @bf-i18n/react
```

## Features

- React context provider
- Hooks for translations and locale management
- Trans component for JSX-based translations
- HOC for class components
- Reactive locale updates

## Usage

### Setup

```tsx
import { createI18n } from '@bf-i18n/core';
import { I18nProvider } from '@bf-i18n/react';

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

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}
```

### useTranslation Hook

```tsx
import { useTranslation } from '@bf-i18n/react';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <p>{t('greeting', { name: 'React' })}</p>
      <p>{t('items', { count: 5 })}</p>
      <p>Current locale: {locale}</p>
      <button onClick={() => setLocale('ja')}>
        Switch to Japanese
      </button>
    </div>
  );
}
```

### useLocale Hook

```tsx
import { useLocale } from '@bf-i18n/react';

function LocaleSwitcher() {
  const { locale, setLocale, availableLocales } = useLocale();

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      {availableLocales.map((loc) => (
        <option key={loc} value={loc}>{loc}</option>
      ))}
    </select>
  );
}
```

### useI18n Hook

```tsx
import { useI18n } from '@bf-i18n/react';

function DebugComponent() {
  const i18n = useI18n();

  return (
    <pre>{JSON.stringify(i18n.getMissingKeys(), null, 2)}</pre>
  );
}
```

### Trans Component

```tsx
import { Trans } from '@bf-i18n/react';

function Welcome() {
  return (
    <Trans
      i18nKey="greeting"
      values={{ name: 'React' }}
    />
  );
}
```

### withTranslation HOC

```tsx
import { withTranslation, WithTranslationProps } from '@bf-i18n/react';

interface Props extends WithTranslationProps {
  name: string;
}

class Greeting extends React.Component<Props> {
  render() {
    const { t, name } = this.props;
    return <p>{t('greeting', { name })}</p>;
  }
}

export default withTranslation(Greeting);
```

## API

### Components

- `I18nProvider` - Context provider
- `Trans` - Translation component

### Hooks

- `useTranslation()` - Returns `{ t, locale, setLocale }`
- `useLocale()` - Returns `{ locale, setLocale, availableLocales }`
- `useI18n()` - Returns the I18n instance

### HOC

- `withTranslation(Component)` - Injects `t`, `locale`, `setLocale` props

## License

MIT
