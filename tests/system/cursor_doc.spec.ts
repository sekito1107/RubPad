import { test, expect } from '@playwright/test';

test.describe('カーソルドキュメント（Hover Doc）機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('メソッド名にホバーした際にドキュメントパネルが表示されること', async ({ page }) => {
        // 1. コードのセットアップ (UI 操作のみ)
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        // キーボード入力（分析のトリガーとなるイベントを発火）
        await page.keyboard.insertText('"hello".upcase');

        // 2. 解析 (LSP) の完了を待つ (Auto-waiting により wait不要)
        const methodName = page.locator('#method-list [data-role="methodName"]:text-is("upcase")');
        await expect(methodName).toBeVisible(); 

        // 3. エディタ内の "upcase" 部分を特定してホバー
        const monacoEditor = page.locator('.monaco-editor');
        const upcaseNode = monacoEditor.getByText('upcase').first();
        await upcaseNode.hover();

        // 4. ドキュメントパネルの出現を確認
        const docContainer = page.locator('#cursor-doc-container');
        await expect(docContainer).toBeVisible({ timeout: 10000 });

        // 5. 内容の検証
        await expect(docContainer).toContainText('String#upcase');
    });
});
