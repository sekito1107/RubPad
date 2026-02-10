import { URLGenerator } from "./url_generator"
import type { IndexSearcher } from "./index_searcher"

/**
 * 指定されたクラスのメソッド一覧を取得し、URL情報を付与する
 */
export class FetchMethodList {
  private searcher: IndexSearcher

  constructor(indexSearcher: IndexSearcher) {
    this.searcher = indexSearcher
  }

  /**
   * クラス名からメソッド一覧（URL情報付き）を取得する
   */
  fetch(className: string): {
    methodName: string
    candidates: string[]
    links: {
      signature: string
      url: string
      className: string
      methodName: string
      separator: string
      displayName: string
    }[]
  }[] {
    const methods = this.searcher.findMethodsByClass(className)
    return methods.map(item => ({
      ...item,
      links: item.candidates.map(cand => ({
        signature: cand,
        ...URLGenerator.generateUrlInfo(cand)
      }))
    }))
  }
}
