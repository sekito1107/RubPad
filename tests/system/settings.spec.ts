import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
    await page.waitForSelector('.monaco-editor');
});

test('エディタ設定・テーマ・コードがリロード後も永続化されていること', async ({ page }) => {
    await page.getByTitle('Editor Settings').click();
    await page.locator('[data-setting="fontSize"]').selectOption('22');
    await page.waitForTimeout(500); 
    await page.getByRole('button', { name: 'Close' }).click();

    const isDarkInitial = await page.locator('html').getAttribute('class').then(c => c?.includes('dark'));
    await page.getByTitle('テーマ切り替え').click();

    await clearEditor(page);
    await page.keyboard.insertText('puts "Persistence Layer Test"');
    await page.waitForTimeout(2000); // localStorageへの保存を待つ

    await page.reload();
    await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });

    await page.getByTitle('Editor Settings').click();
    expect(await page.locator('[data-setting="fontSize"]').inputValue()).toBe('22');
    await page.getByRole('button', { name: 'Close' }).click();

    const isDarkAfter = await page.locator('html').getAttribute('class').then(c => c?.includes('dark'));
    expect(isDarkAfter).toBe(!isDarkInitial);
    
    await expect(page.locator('.view-lines')).toContainText('puts "Persistence Layer Test"');
});
