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

  it('status の初期値がすべて false であること', () => {
    expect(app.status.editorReady).toBe(false);
    expect(app.status.wasmReady).toBe(false);
    expect(app.status.rbsReady).toBe(false);
  });
});
