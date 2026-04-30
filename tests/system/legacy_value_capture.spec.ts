import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
});

test('スコープ: トップレベル vs メソッド', async ({ page }) => {
    await clearEditor(page);
    await page.keyboard.insertText(`target = "banana"
def my_count
  target = "apple"
  target
end
my_count`);

    // 変数「target」にホバー
    await page.locator('.monaco-editor').getByText('target').last().hover();

    // ホバー内の「値を確認」リンクをクリック
    await page.getByRole('link', { name: '値を確認: target' }).click({ force: true });

    // インレイヒントが表示されることを確認
    await expect(page.getByText('# => "apple"')).toBeVisible();
});
