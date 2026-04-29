import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.describe('コンソール機能の検証 (Console UI)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 30000 });
        await page.waitForSelector('.monaco-editor');
    });

    test('Runボタンでコードを実行し、出力が表示されること', async ({ page }) => {
        await clearEditor(page);
        await page.keyboard.insertText('puts "Run button execution"');
        await page.locator('#run-button').click();
        await expect(page.locator('#terminal-output')).toContainText('Run button execution');
    });

    test('Ctrl+Enter でコードを実行し、出力が表示されること', async ({ page }) => {
        await clearEditor(page);
        await page.keyboard.insertText('puts "Shortcut run execution"');
        
        await page.keyboard.press('ControlOrMeta+Enter');
        await expect(page.locator('#terminal-output')).toContainText('Shortcut run execution');
    });

    test('Clearボタンで出力がクリアされること', async ({ page }) => {
        await clearEditor(page);
        await page.keyboard.insertText('puts "Output to be cleared"');
        await page.locator('#run-button').click();
        await expect(page.locator('#terminal-output')).toContainText('Output to be cleared');

        await page.locator('#clear-button').click();
        await expect(page.locator('#terminal-output')).not.toContainText('Output to be cleared');
    });

    test('エラーコードを実行した際にエラーメッセージが表示されること', async ({ page }) => {
        await clearEditor(page);
        await page.keyboard.insertText('undefined_method_call');
        await page.locator('#run-button').click();
        await expect(page.locator('#terminal-output')).toContainText('undefined local variable or method');
    });
});
