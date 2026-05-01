import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
    await page.waitForSelector('.monaco-editor');
});

test('サンプルコード（FizzBuzz）が正常にロードされること', async ({ page }) => {
    await page.locator('#examples-button').click();
    await page.locator('#examples-menu button[data-key="fizzbuzz"]').click();
    
    // エディタ内に FizzBuzz のコードが含まれていることを検証
    await expect(page.locator('.monaco-editor')).toContainText('1.upto(100) do |i|');
});
