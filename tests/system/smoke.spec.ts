import { test, expect } from '@playwright/test';

test.describe('Rubox Smoke Test (UI-based)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('基本機能: 実行、クリア、エラー表示', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');

        await page.keyboard.insertText('puts "Hello Rubox"');
        await page.locator('#run-button').click();
        await expect(page.locator('#terminal-output')).toContainText('Hello Rubox');

        await page.locator('#clear-button').click();
        await expect(page.locator('#terminal-output')).not.toContainText('Hello Rubox');

        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText('undefined_method_call');
        await page.locator('#run-button').click();
        await expect(page.locator('#terminal-output')).toContainText('undefined local variable or method');
    });

    test('LSP: メソッドリストの解決と診断情報（波線）の検証', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        
        await page.keyboard.insertText('1 + ');
        await expect(page.locator('.squiggly-error').first()).toBeVisible();

        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText('[1, 2].size');

        const methodItem = page.locator('#method-list [data-role="methodName"]:text-is("size")');
        await expect(methodItem).toBeVisible();

        await expect(page.locator('.squiggly-error')).toHaveCount(0);
    });
});
