import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('記述したコード内のメソッドリファレンス（Code Reference Links）の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('記述したメソッドが解析され、公式リファレンスへのリンクが表示されること', async ({ page }) => {
        await clearEditor(page);

        await page.keyboard.insertText('puts "reference test"');
        await page.keyboard.press('Escape');

        const referenceLink = page.locator('#method-list a').filter({ hasText: 'Kernel#puts' });
        await expect(referenceLink).toBeVisible();

        const href = await referenceLink.getAttribute('href');
        expect(href).toContain('docs.ruby-lang.org');
    });
});
