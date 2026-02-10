import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FetchMethodList } from '../../../src/reference/fetch_method_list'
import { IndexSearcher } from '../../../src/reference/index_searcher'

describe('FetchMethodList', () => {
  let fetcher: FetchMethodList
  let searcher: IndexSearcher

  beforeEach(() => {
    searcher = new IndexSearcher()
    fetcher = new FetchMethodList(searcher)
  })

  it('クラスに属するメソッド一覧とリンク情報を正しく取得できること', () => {
    vi.spyOn(searcher, 'findMethodsByClass').mockReturnValue([
      { methodName: 'each', candidates: ['Array#each', 'Enumerable#each'] }
    ])

    const results = fetcher.fetch('Array')
    expect(results).toHaveLength(1)
    expect(results[0].methodName).toBe('each')
    expect(results[0].links).toHaveLength(2)
    
    expect(results[0].links[0].signature).toBe('Array#each')
    expect(results[0].links[0].url).toContain('Array/i/each.html')
    
    expect(results[0].links[1].signature).toBe('Enumerable#each')
    expect(results[0].links[1].url).toContain('Enumerable/i/each.html')
  })

  it('メソッドがない場合は空配列を返すこと', () => {
    vi.spyOn(searcher, 'findMethodsByClass').mockReturnValue([])
    const results = fetcher.fetch('NonExistentClass')
    expect(results).toEqual([])
  })
})
