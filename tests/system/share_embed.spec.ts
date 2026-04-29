import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('共有機能の整合性と再現性の検証', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('生成された Embed タグをそのままレンダリングして、コードが正常に再現されること', async ({ page }) => {
        const testCode = 'puts "Direct Rendering Test"';
        await clearEditor(page);
        await page.keyboard.insertText(testCode);

        await page.locator('#share-button').click();
        await page.locator('#share-tab-embed').click();
        const embedTag = await page.locator('#share-preview').inputValue();

        await page.setContent(embedTag);

        const frame = page.frameLocator('iframe');
        const embeddedEditor = frame.locator('.monaco-editor');
        await expect(embeddedEditor).toContainText('Direct Rendering Test');
    });

    test('URL ハッシュからコードが正しく再現されること', async ({ page, context }) => {
        const testCode = 'puts "Hash Restore Test"';
        await clearEditor(page);
        await page.keyboard.insertText(testCode);

        await page.locator('#share-button').click();
        await expect(page.locator('#share-modal')).toBeVisible();

        await page.locator('#share-copy-btn').click();

        const urlWithHash = await page.evaluate(() => navigator.clipboard.readText());
        
        const newPage = await context.newPage();
        await newPage.goto(urlWithHash);
        await expect(newPage.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        
        const restoredEditor = newPage.locator('.monaco-editor');
        await expect(restoredEditor).toContainText('Hash Restore Test');
    });
});
