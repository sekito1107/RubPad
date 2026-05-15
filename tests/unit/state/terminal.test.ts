import { describe, it, expect } from 'vitest';
import { terminal, updateOutput, clearOutput } from '../../../src/state/terminal';

describe.sequential('state/terminal', () => {
  it('初期出力が空文字であること', () => {
    expect(terminal.output).toBe('');
  });

  it('updateOutput で出力が更新されること', () => {
    updateOutput('Hello World');
    expect(terminal.output).toBe('Hello World');
  });

  it('clearOutput で出力が空文字に戻ること', () => {
    updateOutput('Dirty');
    clearOutput();
    expect(terminal.output).toBe('');
  });
});
