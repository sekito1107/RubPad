import { test, expect } from '@playwright/test';

test.describe('キーボードショートカット機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('Ctrl+Enter でコードが実行され、出力が表示されること', async ({ page }) => {
        // 1. コードのセットアップ
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText('puts "Shortcut run"');

        // 2. ショートカットキーの押下 (Ctrl + Enter)
        await page.keyboard.press('ControlOrMeta+Enter');

        // 3. 実行結果の検証
        await expect(page.locator('#terminal-output')).toContainText('Shortcut run');
    });
});
