import { test, expect } from '@playwright/test';

test.describe('Inlay Hints', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('値キャプチャの表示', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        const textarea = page.locator('.monaco-editor textarea');

        await editor.click();
        await textarea.fill('');

        await page.keyboard.insertText('n = 10\nresult = n * 2\nputs result\n');

        // サジェストボックスがホバーを妨害しないように閉じる
        await page.keyboard.press('Escape');

        await expect(page.locator('#method-list')).toContainText('Integer');

        await editor.getByText('result').last().hover();

        // Monaco のレイヤー構造による遮蔽を回避するため force: true を使用
        await page.getByRole('link', { name: '値を確認: result' }).click({ force: true });

        // ヒントとしての期待値が表示されることを確認
        await expect(page.getByText('# => 20')).toBeVisible();
    });
});
