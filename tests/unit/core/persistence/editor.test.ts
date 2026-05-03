import { describe, it, expect, beforeEach } from 'vitest';
import { saveCode, loadCode } from '../../../../src/core/persistence/editor';

describe('persistence/editor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveCode でコードが localStorage に保存されること', () => {
    saveCode('puts "hello"');
    expect(localStorage.getItem('rubox_code')).toBe('puts "hello"');
  });

  it('loadCode で保存されたコードが読み込めること', () => {
    localStorage.setItem('rubox_code', 'puts "world"');
    expect(loadCode()).toBe('puts "world"');
  });

  it('localStorage が空の場合は null を返すこと', () => {
    expect(loadCode()).toBeNull();
  });
});
