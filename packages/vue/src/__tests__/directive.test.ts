import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from '@bf-i18n/core';
import { I18nPlugin } from '../plugin.js';
import { defineComponent } from 'vue';

describe('vT directive', () => {
  it('translates element text content with string binding', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: { hello: 'Hello' },
      },
    });

    const TestComponent = defineComponent({
      template: '<div v-t="\'hello\'"></div>',
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    expect(wrapper.text()).toBe('Hello');
  });

  it('supports dynamic key binding', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: { greeting: 'Hello!' },
      },
    });

    const TestComponent = defineComponent({
      template: '<div v-t="key"></div>',
      data() {
        return { key: 'greeting' };
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    expect(wrapper.text()).toBe('Hello!');
  });

  it('sets innerHTML when using html modifier', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: { message: '<strong>Bold</strong> text' },
      },
    });

    const TestComponent = defineComponent({
      template: '<div v-t.html="\'message\'"></div>',
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    expect(wrapper.html()).toContain('<strong>Bold</strong>');
  });

  it('updates translation on locale change', async () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: { hello: 'Hello' },
        ja: { hello: 'こんにちは' },
      },
    });

    const TestComponent = defineComponent({
      template: '<div v-t="\'hello\'"></div>',
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    expect(wrapper.text()).toBe('Hello');

    i18n.locale = 'ja';
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toBe('こんにちは');
  });

  it('sanitizes HTML to prevent XSS attacks', () => {
    const i18n = createI18n({
      defaultLocale: 'en',
      translations: {
        en: {
          xss: '<script>alert("xss")</script><strong>Safe</strong>',
          onEvent: '<div onclick="alert(1)">Click</div>',
          jsHref: '<a href="javascript:alert(1)">Link</a>',
        },
      },
    });

    const TestScript = defineComponent({
      template: '<div v-t.html="\'xss\'"></div>',
    });

    const wrapper1 = mount(TestScript, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    // Script tags should be removed (text content kept)
    expect(wrapper1.html()).not.toContain('<script>');
    expect(wrapper1.html()).toContain('<strong>Safe</strong>');

    const TestEvent = defineComponent({
      template: '<div v-t.html="\'onEvent\'"></div>',
    });

    const wrapper2 = mount(TestEvent, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    // Event handlers should be removed
    expect(wrapper2.html()).not.toContain('onclick');

    const TestHref = defineComponent({
      template: '<div v-t.html="\'jsHref\'"></div>',
    });

    const wrapper3 = mount(TestHref, {
      global: {
        plugins: [[I18nPlugin, { i18n }]],
      },
    });

    // javascript: URLs should be removed
    expect(wrapper3.html()).not.toContain('javascript:');
  });
});
