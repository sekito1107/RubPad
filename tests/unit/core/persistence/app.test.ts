import { describe, it, expect, beforeEach } from 'vitest';
import { saveTheme, loadTheme } from '../../../../src/core/persistence/app';
import { DEFAULT_THEME } from '../../../../src/types/app';

describe('persistence/app', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveTheme でテーマが localStorage に保存されること', () => {
    saveTheme('light');
    expect(localStorage.getItem('rubox_theme')).toBe('light');
  });

  it('loadTheme で保存されたテーマが読み込めること', () => {
    localStorage.setItem('rubox_theme', 'dark');
    expect(loadTheme()).toBe('dark');
  });

  it('localStorage が空の場合はデフォルトテーマを返すこと', () => {
    expect(loadTheme()).toBe(DEFAULT_THEME);
  });

  it('localStorage に不正な値が入っている場合はデフォルトテーマを返すこと', () => {
    localStorage.setItem('rubox_theme', 'invalid');
    expect(loadTheme()).toBe(DEFAULT_THEME);
  });
});
