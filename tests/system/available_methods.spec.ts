import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('利用可能なメソッドの探索機能（Available Methods）の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('カーソル位置のオブジェクト型に応じたメソッドリストが表示され、展開して確認できること', async ({ page }) => {
        // エディタの内容をクリア
        await clearEditor(page);

        // 配列リテラルを入力
        await page.keyboard.insertText('[]');
        await page.keyboard.press('Escape');

        const availableMethodsList = page.locator('#cursor-doc-list');
        // 方法: 正規表現を使わず、summary要素内のテキストを厳密に指定 (exact: true)
        const arrayHeader = availableMethodsList.locator('summary').getByText('Array', { exact: true });

        await expect(arrayHeader).toBeVisible();
        await arrayHeader.click();
        await expect(availableMethodsList).toContainText('push');
    });
});
