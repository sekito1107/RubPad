import { test, expect } from '@playwright/test';

test.describe('利用可能なメソッドの探索機能（Available Methods）の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!');
        await page.waitForSelector('.monaco-editor');
    });

    test('カーソル位置のオブジェクト型に応じたメソッドリストが表示され、展開して確認できること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        const textarea = page.locator('.monaco-editor textarea');
        
        await editor.click();
        
        // OS非依存のエディタクリア
        await textarea.fill('');
        
        // 配列リテラルを入力
        await page.keyboard.insertText('[]');
        await page.keyboard.press('Escape');

        // Context パネル（利用可能なメソッド一覧）を検証
        const availableMethodsList = page.locator('#cursor-doc-list');
        
        // 1. クラス名 'Array' が表示されるまで待機
        const arrayHeader = availableMethodsList.getByText('Array');
        await expect(arrayHeader).toBeVisible();
        
        // 2. 折りたたまれているので、クリックして展開
        await arrayHeader.click();
        
        // 3. 展開後、具体的なメソッド（例: push）が表示されていることを確認
        await expect(availableMethodsList).toContainText('push');
    });
});
