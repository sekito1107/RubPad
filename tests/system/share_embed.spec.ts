import { test, expect } from '@playwright/test';

test.describe('共有機能の整合性と再現性の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('生成された Embed タグをそのままレンダリングして、コードが正常に再現されること', async ({ page }) => {
        const testCode = 'puts "Direct Rendering Test"';
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText(testCode);

        await page.locator('#share-button').click();
        await page.locator('#share-tab-embed').click();
        const embedTag = await page.locator('#share-preview').inputValue();

        await page.setContent(embedTag);

        const frame = page.frameLocator('iframe');
        const embeddedEditor = frame.locator('.monaco-editor');
        await expect(embeddedEditor).toContainText('Direct Rendering Test');
    });
});
