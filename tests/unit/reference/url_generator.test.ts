import { describe, it, expect } from 'vitest'
import { URLGenerator } from '../../../src/reference/url_generator'

describe('URLGenerator', () => {
  describe('encodeMethodName', () => {
    it('特殊文字を含まない名前はそのまま返すこと', () => {
      expect(URLGenerator.encodeMethodName('each')).toBe('each')
    })

    it('演算子メソッドを正しくエンコードすること', () => {
      expect(URLGenerator.encodeMethodName('==')).toBe('=3d=3d')
      expect(URLGenerator.encodeMethodName('[]')).toBe('=5b=5d')
      expect(URLGenerator.encodeMethodName('+')).toBe('=2b')
      expect(URLGenerator.encodeMethodName('<<')).toBe('=3c=3c')
    })

    it('述語メソッドを正しくエンコードすること', () => {
      expect(URLGenerator.encodeMethodName('empty?')).toBe('empty=3f')
    })

    it('破壊的メソッドを正しくエンコードすること', () => {
      expect(URLGenerator.encodeMethodName('map!')).toBe('map=21')
    })
  })

  describe('generateUrlInfo', () => {
    it('インスタンスメソッドのURLを生成できること', () => {
      const info = URLGenerator.generateUrlInfo('Array#each')
      expect(info.url).toBe('https://docs.ruby-lang.org/ja/latest/method/Array/i/each.html')
      expect(info.className).toBe('Array')
      expect(info.methodName).toBe('each')
      expect(info.separator).toBe('#')
      expect(info.displayName).toBe('#each')
    })

    it('クラスメソッドのURLを生成できること', () => {
      const info = URLGenerator.generateUrlInfo('File.open')
      expect(info.url).toBe('https://docs.ruby-lang.org/ja/latest/method/File/s/open.html')
      expect(info.className).toBe('File')
      expect(info.methodName).toBe('open')
      expect(info.separator).toBe('.')
      expect(info.displayName).toBe('.open')
    })
  })

  describe('generateSearchUrl', () => {
    it('検索URLを生成できること', () => {
      const url = URLGenerator.generateSearchUrl('String#upcase')
      expect(url).toBe('https://rurema.clear-code.com/query:String%23upcase/')
    })
  })
})
