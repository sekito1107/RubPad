import { test, expect } from '@playwright/test';

test.describe('LSP Hover機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('変数（num）にホバーして型情報と評価リンクが表示されること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();

        // エディタを完全にクリアして状態を安定させる
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');

        // Integer が表示されるようにメソッド呼び出し（* 2）を含むコードを入力
        await page.keyboard.insertText('n = 10');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('result = n * 2');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('puts result');

        // サジェストボックスがホバーを妨害しないように閉じる
        await page.keyboard.press('Escape');

        // サイドバーに Integer が現れるのを待つ（解析完了の同期ポイント）
        await expect(page.locator('#method-list')).toContainText('Integer');

        // result をホバー（inlay_hints.spec.ts と同じロケーター）
        await editor.getByText('result').last().hover();

        // 「値を確認」リンクが表示されることを検証
        await expect(page.getByRole('link', { name: '値を確認: result' })).toBeVisible();
    });
});
