import { describe, it, expect } from 'vitest';
import { editor, updateCode } from '../../../src/state/editor';

describe.sequential('state/editor', () => {
  it('初期値が空文字であること', () => {
    expect(editor.code).toBe('');
  });

  it('updateCode でコードが更新されること', () => {
    const newCode = 'puts "hello"';
    updateCode(newCode);
    expect(editor.code).toBe(newCode);
  });
});
