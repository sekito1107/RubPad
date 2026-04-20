import { test, expect } from '@playwright/test';

test.describe('LSP Hover機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('変数にホバーして型情報と評価リンクが表示されること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        const textarea = page.locator('.monaco-editor textarea');
        
        // エディタをクリックしてフォーカス
        await editor.click();

        // 環境に依存せず確実にデフォルトコードをクリアする
        await textarea.fill('');

        // コードの入力
        await page.keyboard.insertText('n = 10\nresult = n * 2\nputs result\n');

        // サジェストボックスを閉じる
        await page.keyboard.press('Escape');

        // サイドバーに Integer が現れるのを待つ（解析完了の同期ポイント）
        await expect(page.locator('#method-list')).toContainText('Integer');

        // 変数部分をホバー
        await editor.getByText('result').last().hover();

        // 「値を確認」リンクが表示されることを検証
        await expect(page.getByRole('link', { name: '値を確認: result' })).toBeVisible();
    });
});
