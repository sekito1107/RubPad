import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('カーソルドキュメント（Hover Doc）機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('メソッド名にホバーした際にドキュメントパネルが表示されること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');

        // OS や環境に依存せず確実にエディタをクリア
        await clearEditor(page);

        // コードを入力
        await page.keyboard.insertText('"hello".upcase');

        // サジェストボックスがホバーを妨害しないように閉じる
        await page.keyboard.press('Escape');

        // サイドバーに解析結果（Integer）が現れるのを待つ
        const methodName = page.locator('#method-list [data-role="methodName"]:text-is("upcase")');
        await expect(methodName).toBeVisible();

        const upcaseNode = editor.getByText('upcase').first();
        await upcaseNode.hover();

        const docContainer = page.locator('#cursor-doc-container');
        await expect(docContainer).toContainText('String#upcase');
    });
});
