import { test, expect } from '@playwright/test';

test.describe('カーソルドキュメント（Hover Doc）機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('メソッド名にホバーした際にドキュメントパネルが表示されること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText('"hello".upcase');

        const methodName = page.locator('#method-list [data-role="methodName"]:text-is("upcase")');
        await expect(methodName).toBeVisible(); 

        const monacoEditor = page.locator('.monaco-editor');
        const upcaseNode = monacoEditor.getByText('upcase').first();
        await upcaseNode.hover();

        const docContainer = page.locator('#cursor-doc-container');
        await expect(docContainer).toContainText('String#upcase');
    });
});
