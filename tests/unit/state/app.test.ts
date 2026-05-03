import { describe, it, expect } from 'vitest';
import { app, toggleTheme } from '../../../src/state/app';
import { DEFAULT_THEME } from '../../../src/types/app';

describe.sequential('state/app', () => {
  it('初期テーマが DEFAULT_THEME であること', () => {
    expect(app.theme).toBe(DEFAULT_THEME);
  });

  it('toggleTheme でテーマが dark から light に、light から dark に切り替わること', () => {
    app.theme = 'dark';
    toggleTheme();
    expect(app.theme).toBe('light');
    
    toggleTheme();
    expect(app.theme).toBe('dark');
  });
});
