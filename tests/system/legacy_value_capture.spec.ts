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

    await page.locator('.monaco-editor').getByText('target').last().hover();
    await page.getByRole('link', { name: '値を確認: target' }).click({ force: true });
    await expect(page.getByText('# => "apple"')).toBeVisible();
});

test('スコープ: メソッド引数の独立性', async ({ page }) => {
    await clearEditor(page);
    await page.keyboard.insertText(`target = "banana"
def my_count(target)
  target
end
my_count("apple")`);

    await page.locator('.monaco-editor').getByText('target').first().hover();
    await page.getByRole('link', { name: '値を確認: target' }).click({ force: true });
    await expect(page.getByText('# => "banana"')).toBeVisible();
});
