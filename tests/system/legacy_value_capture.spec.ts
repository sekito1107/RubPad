import { test, expect } from '@playwright/test';
import { clearEditor } from './support/editor';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
    await clearEditor(page);
});

test('スコープ: トップレベル vs メソッド', async ({ page }) => {
    await page.keyboard.insertText(`target = "banana"
def my_count
  target = "apple"
  target
end
my_count`);

    await page.locator('.monaco-editor .view-line').getByText('target').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => "apple"')).toBeVisible();
});

test('スコープ: メソッド引数の独立性', async ({ page }) => {
    await page.keyboard.insertText(`target = "banana"
def my_count(target)
  target
end
my_count("apple")`);

    await page.locator('.monaco-editor .view-line').getByText('target').first().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => "banana"')).toBeVisible();
});

test('スコープ: メソッド内のローカル変数', async ({ page }) => {
    await page.keyboard.insertText(`def my_method
  target = 10
  target
end
my_method`);

    await page.locator('.monaco-editor .view-line').getByText('target').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => 10')).toBeVisible();
});
