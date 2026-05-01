import { test, expect } from '@playwright/test';

test.describe('テーマ切替機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ボタンクリックでテーマ（ダーク/ライト）が切り替わること', async ({ page }) => {
    await expect(page.locator('#app-container.dark')).toBeVisible();

    await page.locator('#theme-toggle-button').click();
    await expect(page.locator('#app-container:not(.dark)')).toBeVisible();

    await page.locator('#theme-toggle-button').click();
    await expect(page.locator('#app-container.dark')).toBeVisible();
  });

  test('切り替えたテーマがリロード後も維持されること', async ({ page }) => {
    await page.locator('#theme-toggle-button').click();
    await expect(page.locator('#app-container:not(.dark)')).toBeVisible();

    await page.reload();

    await expect(page.locator('#app-container:not(.dark)')).toBeVisible();
  });
});
