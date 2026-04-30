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

test('スコープ: メソッド定義部の引数ではヒントが表示されない', async ({ page }) => {
    await page.keyboard.insertText(`def my_method(target_arg)
  target_arg = 1
end
my_method(10)`);

    await page.locator('.monaco-editor .view-line').getByText('target_arg').first().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target_arg' });
    await expect(link).toBeHidden();
});

test('ループ: 単純なインクリメント', async ({ page }) => {
    await page.keyboard.insertText(`target = 0
3.times do |i|
  target += 1
end`);

    await page.locator('.monaco-editor .view-line').getByText('target').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => 1, 2, 3')).toBeVisible();
});

test('ループ: ブロック内での破壊的変更', async ({ page }) => {
    await page.keyboard.insertText(`target = []
3.times do |i|
  target << [1].map { |n| n }
end`);

    await page.locator('.monaco-editor .view-line').getByText('target').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => [[1]], [[1], [1]], [[1], [1], [1]]')).toBeVisible();
});

test('ループ: 1行ループ', async ({ page }) => {
    await page.keyboard.insertText(`target = []; 3.times { target << [1] }`);

    await page.locator('.monaco-editor .view-line').getByText('target').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => [[1]], [[1], [1]], [[1], [1], [1]]')).toBeVisible();
});

test('ループ: コレクションの各要素', async ({ page }) => {
    await page.keyboard.insertText(`items = ["a", "b"]
items.each do |target_item|
  target_item
end`);

    await page.locator('.monaco-editor .view-line').getByText('target_item').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target_item' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => "a", "b"')).toBeVisible();
});

test('再帰: 条件チェック部で全呼び出しの値をキャプチャ', async ({ page }) => {
    await page.keyboard.insertText(`def fact(target_num)
  return 1 if target_num <= 0
  target_num * fact(target_num - 1)
end
target = fact(3)`);

    await page.locator('.monaco-editor .view-line').getByText('target_num').nth(1).hover();
    
    const link = page.getByRole('link', { name: '値を確認: target_num' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => 3, 2, 1, 0')).toBeVisible();
});

test.fixme('再帰: 再帰呼び出し部で到達した呼び出しの値をキャプチャ', async ({ page }) => {
    await page.keyboard.insertText(`def fact(target_num)
  return 1 if target_num <= 0
  target_num * fact(target_num - 1)
end
target = fact(3)`);

    await page.locator('.monaco-editor .view-line').getByText('target_num').nth(2).hover();
    
    const link = page.getByRole('link', { name: '値を確認: target_num' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => 3, 2, 1')).toBeVisible();
});

test('ループ: 配列アクセス式のキャプチャ', async ({ page }) => {
    await page.keyboard.insertText(`n = 4
strings = "baab".chars
count = 0
(0...n).each do |i|
  ((i + 1)...n).each do |j|
    count += 1 if strings[i] == strings[j]
  end
end`);

    await page.locator('.monaco-editor .view-line').getByText('strings').last().hover();
    
    const link = page.getByRole('link', { name: '値を確認: strings[j]' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => "a", "a", "b", "a", "b", "b"')).toBeVisible();
});

test('タイミング: 未来の値のキャプチャ防止', async ({ page }) => {
    await page.keyboard.insertText(`target_str = "R"
5.times { target_str << "!" }
target_str = "reset"`);

    await page.locator('.monaco-editor .view-line').getByText('target_str').first().hover();
    
    const link = page.getByRole('link', { name: '値を確認: target_str' });
    await expect(link).toBeVisible();
    await link.click({ force: true });
    
    await expect(page.getByText('# => "R"')).toBeVisible();
});
