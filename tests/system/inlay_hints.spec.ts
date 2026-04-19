import { test, expect } from '@playwright/test';

test.describe('Inlay Hints', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('値キャプチャの表示と消去', async ({ page }) => {
        const editor = page.locator('.monaco-editor');
        await editor.click();
        
        // 10 * 2 = 20 (入力コードに 20 は含まれない)
        await page.keyboard.insertText('n = 10');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('result = n * 2');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('puts result');
        
        await expect(page.locator('#method-list')).toContainText('Integer');

        await editor.getByText('result').last().hover();
        await page.getByRole('link', { name: '値を確認: result' }).click();

        // ヒントとしての「20」が出現したことを確認
        await expect(page.getByText('20')).toBeVisible();

        // 消去の検証。20 とも重ならない 11 * 2 = 22 を使用
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        
        await page.keyboard.insertText('n = 11');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('result = n * 2');
        await page.keyboard.press('Enter');
        await page.keyboard.insertText('puts result');

        // 前回のインレイヒント（20）が消えていること
        await expect(page.getByText('20')).not.toBeVisible();
        await expect(page.locator('#method-list')).toContainText('Integer');

        // 新しいヒント（22）の取得
        await editor.getByText('result').last().hover();
        await page.getByRole('link', { name: '値を確認: result' }).click();
        await expect(page.getByText('22')).toBeVisible();
    });
});
