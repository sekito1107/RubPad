import { Page } from '@playwright/test';


export async function clearEditor(page: Page) {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    const editor = page.locator('.monaco-editor');

    await editor.click();
    await page.keyboard.press(`${modifier}+a`);
    await page.keyboard.press('Backspace');
}
