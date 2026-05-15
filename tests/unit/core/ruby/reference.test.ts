import { describe, it, expect } from 'vitest';
import { getReferenceUrl } from '../../../../src/core/ruby/reference';

describe('getReferenceUrl（リファレンスURL生成）', () => {
  it('インスタンスメソッドに対して正しいURLを生成すること（/i/）', () => {
    const method = {
      name: 'size',
      info: {
        owner: 'String',
        owner_type: 'class',
        is_singleton_call: false,
        has_instance: true,
        has_singleton: false
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/String/i/size.html');
  });

  it('シングルトンメソッドに対して正しいURLを生成すること（/s/）', () => {
    const method = {
      name: 'new',
      info: {
        owner: 'String',
        owner_type: 'class',
        is_singleton_call: true,
        has_instance: false,
        has_singleton: true
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/String/s/new.html');
  });

  it('モジュール関数に対して正しいURLを生成すること（/m/）', () => {
    const method = {
      name: 'puts',
      info: {
        owner: 'Kernel',
        owner_type: 'module',
        is_singleton_call: false,
        has_instance: true,
        has_singleton: true
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/Kernel/m/puts.html');
  });

  it('モジュールのシングルトン呼び出しに対してもモジュール関数なら /m/ を優先すること', () => {
    const method = {
      name: 'puts',
      info: {
        owner: 'Kernel',
        owner_type: 'module',
        is_singleton_call: true,
        has_instance: true,
        has_singleton: true
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/Kernel/m/puts.html');
  });

  it('モジュール内の純粋なインスタンスメソッドに対して /i/ を生成すること', () => {
    const method = {
      name: 'map',
      info: {
        owner: 'Enumerable',
        owner_type: 'module',
        is_singleton_call: false,
        has_instance: true,
        has_singleton: false
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/Enumerable/i/map.html');
  });

  it('オーナーが不明な（ユーザー定義等の）場合は null を返すこと', () => {
    const method = {
      name: 'my_method',
      info: {
        owner: null,
        owner_type: null,
        is_singleton_call: false,
        has_instance: false,
        has_singleton: false
      }
    } as any;
    expect(getReferenceUrl(method)).toBeNull();
  });

  it('記号を含むメソッド名を正しくエンコードすること', () => {
    const method = {
      name: '[]=',
      info: {
        owner: 'Array',
        owner_type: 'class',
        is_singleton_call: false,
        has_instance: true,
        has_singleton: false
      }
    } as any;
    expect(getReferenceUrl(method)).toBe('https://docs.ruby-lang.org/ja/latest/method/Array/i/=5b=5d=3d.html');
  });
});
