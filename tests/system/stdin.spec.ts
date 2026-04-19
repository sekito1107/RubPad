import { test, expect } from '@playwright/test';

test.describe('Stdin UI 機能の検証', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Ruby WASM の起動を待機 (実測に基づき 30秒に調整)
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('stdin パネルのトグルと入力値の実行反映', async ({ page }) => {
        // 1. コードのセットアップ (UI 操作のみで行う)
        const editor = page.locator('.monaco-editor');
        await editor.click();
        // 既存のコードがあれば全選択して消去
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        // キーボード入力としてコードを注入
        await page.keyboard.insertText('print "Enter something: "; puts gets.chomp');

        // 2. stdin パネルを展開
        const toggleBtn = page.locator('#stdin-toggle');
        const stdinInput = page.locator('#stdin-input');
        
        await toggleBtn.click();
        await expect(stdinInput).toBeVisible();

        // 3. 値を入力
        const testInput = 'Hello from Stdin UI';
        await stdinInput.fill(testInput);

        // 4. 実行
        await page.locator('#run-button').click();

        // 5. 結果の検証
        await expect(page.locator('#terminal-output')).toContainText(`Enter something: ${testInput}`);
    });
});
