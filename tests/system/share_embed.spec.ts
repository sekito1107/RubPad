import { test, expect } from '@playwright/test';

test.describe('共有機能の整合性と再現性の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Ruby WASM の起動待機 (実測に基づき 30秒)
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('生成された Embed タグをそのままレンダリングして、コードが正常に再現されること', async ({ page }) => {
        // 1. オリジナルのコードを入力
        const testCode = 'puts "Direct Rendering Test"';
        const editor = page.locator('.monaco-editor');
        await editor.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.insertText(testCode);

        // 2. Embed タグを取得 (一切加工せず、そのまま変数に格納)
        await page.locator('#share-button').click();
        await page.locator('#share-tab-embed').click();
        const embedTag = await page.locator('#share-preview').inputValue();

        // 3. 取得したタグをそのまま現在のページにレンダリング
        // データを加工せずに実用できることを仕様として検証
        await page.setContent(embedTag);

        // 4. レンダリングされた iframe 内でコードの再現性を検証
        const frame = page.frameLocator('iframe');
        const embeddedEditor = frame.locator('.monaco-editor');
        await expect(embeddedEditor).toContainText('Direct Rendering Test');
    });
});
