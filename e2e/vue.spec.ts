import { test, expect } from '@playwright/test';

test.describe('Vue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vue');
  });

  test('renders translations correctly', async ({ page }) => {
    await expect(page.locator('#greeting')).toHaveText('Hello, Vue!');
    await expect(page.locator('#items-zero')).toHaveText('No items');
    await expect(page.locator('#items-one')).toHaveText('1 item');
    await expect(page.locator('#items-many')).toHaveText('5 items');
    await expect(page.locator('#current-locale')).toHaveText('Locale: en');
  });

  test('switches locale correctly', async ({ page }) => {
    // Initial state is English
    await expect(page.locator('#greeting')).toHaveText('Hello, Vue!');

    // Switch to Japanese
    await page.click('#switch-locale');

    await expect(page.locator('#greeting')).toHaveText('こんにちは、Vueさん！');
    await expect(page.locator('#items-zero')).toHaveText('アイテムなし');
    await expect(page.locator('#items-one')).toHaveText('1個のアイテム');
    await expect(page.locator('#items-many')).toHaveText('5個のアイテム');
    await expect(page.locator('#current-locale')).toHaveText('Locale: ja');

    // Switch back to English
    await page.click('#switch-locale');

    await expect(page.locator('#greeting')).toHaveText('Hello, Vue!');
    await expect(page.locator('#current-locale')).toHaveText('Locale: en');
  });
});
