import { test, expect } from '@playwright/test';

test.describe('Vanilla JS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla');
  });

  test('renders translations correctly', async ({ page }) => {
    await expect(page.locator('#greeting')).toHaveText('Hello, World!');
    await expect(page.locator('#items-zero')).toHaveText('No items');
    await expect(page.locator('#items-one')).toHaveText('1 item');
    await expect(page.locator('#items-many')).toHaveText('5 items');
    await expect(page.locator('#current-locale')).toHaveText('Locale: en');
  });

  test('switches locale correctly', async ({ page }) => {
    // Initial state is English
    await expect(page.locator('#greeting')).toHaveText('Hello, World!');

    // Switch to Japanese
    await page.click('#switch-locale');

    await expect(page.locator('#greeting')).toHaveText('こんにちは、Worldさん！');
    await expect(page.locator('#items-zero')).toHaveText('アイテムなし');
    await expect(page.locator('#items-one')).toHaveText('1個のアイテム');
    await expect(page.locator('#items-many')).toHaveText('5個のアイテム');
    await expect(page.locator('#current-locale')).toHaveText('Locale: ja');

    // Switch back to English
    await page.click('#switch-locale');

    await expect(page.locator('#greeting')).toHaveText('Hello, World!');
    await expect(page.locator('#current-locale')).toHaveText('Locale: en');
  });
});
