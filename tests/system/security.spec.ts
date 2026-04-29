import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('セキュリティ機能検証', () => {
    test('CSP設定の確認', async ({ page }) => {
        await page.goto('/');
        const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
        await expect(cspMeta).toHaveCount(1);
        const content = await cspMeta.getAttribute('content');

        expect(content).toContain("default-src 'self'");
        expect(content).toContain("script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'");
        expect(content).toContain("connect-src 'self'");
        expect(content).toContain("worker-src 'self'");
    });

    test('共有リンク警告の表示', async ({ page, context }) => {
        await page.goto('/');
        await page.waitForSelector('.monaco-editor');
        await clearEditor(page);
        await page.keyboard.insertText('puts "Security Test"');

        await page.getByRole('button', { name: 'Share' }).click();
        await expect(page.locator('#share-modal')).toBeVisible();

        const sharedUrl = await page.inputValue('#share-preview');
        expect(sharedUrl).toContain('#code=');

        const newPage = await context.newPage();
        await newPage.goto(sharedUrl);

        const toastMessage = newPage.locator('[data-toast="message"]');

        await expect(toastMessage).toBeVisible();
        await expect(toastMessage).toContainText('共有されたコードです');
        await expect(toastMessage).toContainText('確認してください');

        const warningIcon = newPage.locator('[data-toast="icon"] svg[data-type="warning"]');
        await expect(warningIcon).toBeVisible();

        await newPage.close();
    });
});
