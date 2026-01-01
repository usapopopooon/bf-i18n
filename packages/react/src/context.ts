import { createContext } from 'react';
import type { I18n } from '@bf-i18n/core';

/**
 * I18n context for React.
 */
export const I18nContext = createContext<I18n | null>(null);
