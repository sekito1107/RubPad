import { test, expect } from '@playwright/test';

test.describe('Stdin UI 機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('stdin パネルのトグルと入力値の実行反映', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText('print "Enter something: "; puts gets.chomp');

        const toggleBtn = page.locator('#stdin-toggle');
        const stdinInput = page.locator('#stdin-input');
        
        await toggleBtn.click();
        await expect(stdinInput).toBeVisible();

        const testInput = 'Hello from Stdin UI';
        await stdinInput.fill(testInput);

        await page.locator('#run-button').click();

        await expect(page.locator('#terminal-output')).toContainText(`Enter something: ${testInput}`);
    });
});
