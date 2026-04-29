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
        
        // 環境に依存せず確実にエディタをクリアする
        await clearEditor(page);

        // コードの入力
        await page.keyboard.insertText('n = 10\nresult = n * 2\nputs result\n');

        // サジェストボックスを閉じる
        await page.keyboard.press('Escape');

        // サイドバーに Integer が現れるのを待つ（解析完了の同期ポイント）
        await expect(page.locator('#method-list')).toContainText('Integer');

        // 変数部分をホバー
        await editor.getByText('result').last().hover();

        // 「値を確認」リンクが表示されることを検証
        const link = page.getByRole('link', { name: '値を確認: result' });
        await expect(link).toBeVisible();

        // リンクをクリックして値（インレイヒント）を取得
        // Monaco のレイヤー構造による遮蔽を回避するため force: true を使用
        await link.click({ force: true });

        // ヒントとしての期待値が表示されることを確認
        await expect(page.getByText('# => 20')).toBeVisible();
    });
});
