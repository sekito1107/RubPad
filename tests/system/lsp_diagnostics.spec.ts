import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('LSP 診断情報（波線）の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('不完全なコードを入力するとエラー波線が表示されること', async ({ page }) => {
        await clearEditor(page);
        await page.keyboard.insertText('1 + ');

        await expect(page.locator('.squiggly-error').first()).toBeVisible();
    });

    test('エラーコードを修正すると波線が消えること', async ({ page }) => {
        await clearEditor(page);

        await page.keyboard.insertText('1 + ');
        await expect(page.locator('.squiggly-error').first()).toBeVisible();

        await clearEditor(page);
        await page.keyboard.insertText('puts "Hello"');

        await expect(page.locator('.squiggly-error')).toHaveCount(0);
    });
});
