import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('LSP Hover機能および値確認の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('変数にホバーして「値を確認」リンクが表示され、クリックすると値（インレイヒント）が表示されること', async ({ page }) => {
        const editor = page.locator('.monaco-editor');

        await clearEditor(page);
        await page.keyboard.insertText('n = 10\nresult = n * 2\nputs result\n');

        await page.keyboard.press('Escape');

        await expect(page.locator('#method-list')).toContainText('Integer');

        await editor.getByText('result').last().hover();

        const link = page.getByRole('link', { name: '値を確認: result' });
        await expect(link).toBeVisible();

        await link.click({ force: true });

        await expect(page.getByText('# => 20')).toBeVisible();
    });
});
