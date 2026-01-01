import React, { useMemo } from 'react';
import type { TranslateOptions } from '@bf-i18n/core';
import { useI18n } from './hooks.js';

export interface TransProps {
  /**
   * Translation key.
   */
  i18nKey: string;

  /**
   * Component mapping for tags in translation.
   * Example: { bold: <strong /> }
   */
  components?: Record<string, React.ReactElement>;

  /**
   * Interpolation values.
   */
  values?: Record<string, unknown>;

  /**
   * Additional translation options.
   */
  options?: TranslateOptions;

  /**
   * Fallback content if translation is not found.
   */
  children?: React.ReactNode;
}

/**
 * Parse translation string and replace tags with React components.
 * Supports format: <tag>content</tag>
 */
function parseTranslation(
  text: string,
  components: Record<string, React.ReactElement>
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const tagPattern = /<(\w+)>(.*?)<\/\1>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(text)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const [, tagName, content] = match;
    const component = components[tagName];

    if (component) {
      // Clone the component with the content
      result.push(
        React.cloneElement(
          component,
          { key: match.index },
          content
        )
      );
    } else {
      // If no component mapping, keep the original text
      result.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * Trans component for rendering translations with embedded React components.
 */
export function Trans({
  i18nKey,
  components = {},
  values = {},
  options = {},
  children,
}: TransProps): React.ReactElement {
  const i18n = useI18n();

  const content = useMemo(() => {
    const translation = i18n.t(i18nKey, { ...options, ...values });

    // Check if translation was found (not just the key returned)
    if (translation === i18nKey && children) {
      return children;
    }

    // If no components to replace, return plain text
    if (Object.keys(components).length === 0) {
      return translation;
    }

    // Parse and replace tags
    return parseTranslation(translation, components);
  }, [i18n, i18nKey, components, values, options, children]);

  return <>{content}</>;
}
