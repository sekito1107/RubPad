import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('エディタ機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.monaco-editor');
  });

  test('エディタ設定（フォントサイズ等）がリロード後も維持されること', async ({ page }) => {
    await page.getByTitle('Editor Settings').click();
    await page.locator('[data-setting="fontSize"]').selectOption('22');
    
    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('TODO_UNDEFINED_SETTINGS_KEY'));
    }).toBe('22');

    await page.getByRole('button', { name: 'Close' }).click();

    await page.reload();
    await page.waitForSelector('.monaco-editor');

    await page.getByTitle('Editor Settings').click();
    expect(await page.locator('[data-setting="fontSize"]').inputValue()).toBe('22');
  });

  test('コードの内容がリロード後も維持されること', async ({ page }) => {
    const testCode = 'puts "Persistence Layer Test"';
    
    await clearEditor(page);
    await page.keyboard.insertText(testCode);

    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('TODO_UNDEFINED_CODE_KEY'));
    }).toBe(testCode);

    await page.reload();
    await page.waitForSelector('.monaco-editor');

    await expect(page.locator('.view-lines')).toContainText(testCode);
  });
});
