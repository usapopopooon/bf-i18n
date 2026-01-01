import type { Directive, DirectiveBinding } from 'vue';
import type { I18n } from '@bf-i18n/core';

interface TDirectiveElement extends HTMLElement {
  __i18nUnsubscribe?: () => void;
  __i18n?: I18n;
}

/**
 * Basic HTML sanitization to prevent XSS attacks.
 * Only allows safe HTML tags and attributes.
 */
function sanitizeHtml(html: string): string {
  // Create a temporary element to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Allowed tags (safe inline formatting)
  const allowedTags = new Set([
    'b',
    'i',
    'u',
    'strong',
    'em',
    'span',
    'br',
    'p',
    'a',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'small',
    'sub',
    'sup',
  ]);

  // Allowed attributes
  const allowedAttributes = new Set(['class', 'id', 'href', 'target', 'rel', 'title']);

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags (but keep their text content)
      if (!allowedTags.has(tagName)) {
        const textContent = element.textContent || '';
        const textNode = document.createTextNode(textContent);
        element.replaceWith(textNode);
        return;
      }

      // Remove disallowed attributes
      const attributesToRemove: string[] = [];
      for (const attr of element.attributes) {
        const attrName = attr.name.toLowerCase();

        // Remove event handlers and dangerous attributes
        if (
          attrName.startsWith('on') ||
          attrName === 'style' ||
          attrName === 'srcset' ||
          attrName === 'src' ||
          !allowedAttributes.has(attrName)
        ) {
          attributesToRemove.push(attr.name);
        }

        // Sanitize href to prevent javascript: URLs
        if (attrName === 'href') {
          const href = attr.value.toLowerCase().trim();
          if (href.startsWith('javascript:') || href.startsWith('data:')) {
            attributesToRemove.push(attr.name);
          }
        }
      }

      for (const attrName of attributesToRemove) {
        element.removeAttribute(attrName);
      }

      // Recursively sanitize child nodes
      for (const child of Array.from(element.childNodes)) {
        sanitizeNode(child);
      }
    }
  }

  for (const child of Array.from(temp.childNodes)) {
    sanitizeNode(child);
  }

  return temp.innerHTML;
}

// Module-level storage for i18n instance (set by plugin)
let globalI18n: I18n | undefined;

/**
 * Set the global i18n instance for directive use.
 * Called by I18nPlugin during installation.
 */
export function setGlobalI18n(i18n: I18n): void {
  globalI18n = i18n;
}

/**
 * v-t directive for Vue.
 * Usage: v-t="'translation.key'" or v-t.html="'translation.key'"
 */
export const vT: Directive<TDirectiveElement, string> = {
  mounted(el, binding) {
    const i18n = globalI18n;
    if (!i18n) {
      console.warn('[bf-i18n] v-t directive requires I18nPlugin to be installed');
      return;
    }

    el.__i18n = i18n;
    updateElement(el, binding, i18n);

    // Subscribe to locale changes
    el.__i18nUnsubscribe = i18n.onChange(() => {
      updateElement(el, binding, i18n);
    });
  },

  updated(el, binding) {
    const i18n = el.__i18n;
    if (!i18n) return;

    updateElement(el, binding, i18n);
  },

  beforeUnmount(el) {
    if (el.__i18nUnsubscribe) {
      el.__i18nUnsubscribe();
      delete el.__i18nUnsubscribe;
    }
    delete el.__i18n;
  },
};

function updateElement(el: HTMLElement, binding: DirectiveBinding<string>, i18n: I18n): void {
  const key = binding.value;
  const translation = i18n.t(key);

  if (binding.modifiers.html) {
    // Sanitize HTML to prevent XSS attacks
    el.innerHTML = sanitizeHtml(translation);
  } else {
    el.textContent = translation;
  }
}
