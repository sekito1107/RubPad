import { Page } from '@playwright/test';

/**
 * Monacoエディタの内容を全選択して削除します。
 * OS(Windows/Linux/Mac)の差異を自動的に吸収します。
 * Playwrightの標準的なキー名称（Control/Meta）を使用します。
 */
export async function clearEditor(page: Page) {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    // エディタコンテナを取得
    const editor = page.locator('.monaco-editor');
    
    // エディタをクリックして確実にフォーカスを当てる
    await editor.click();
    
    // 全選択 (Ctrl+A or Cmd+A)
    await page.keyboard.press(`${modifier}+a`);
    // 削除
    await page.keyboard.press('Backspace');
}
