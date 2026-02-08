import { ResolutionInteractor } from "./resolution_interactor"

/**
 * コードの解析状態（メソッドリストとその型）を一元管理するコーディネーター
 * UI コントローラーから型解決の責務を切り離し、差分解析と状態通知を担う
 */
export class AnalysisCoordinator {
  constructor(editor, lspInteractor, ruremaInteractor) {
    this.editor = editor
    this.lspInteractor = lspInteractor
    this.rurema = ruremaInteractor
    this.resolution = new ResolutionInteractor(lspInteractor)
    
    // 解析結果の状態
    this.methods = new Map() // { methodName: { name, line, col, status, ... } }
    this.lineMethods = [] // インデックス = 0ベースの行番号, 値 = Array of { name, offset }
    
    this.isAnalyzing = false
    this.dirtyLines = new Set()
    this.needsReanalysis = false
    this.firstScanDone = false // 初回スキャンが完了したか
    this.debounceTimer = null
    this.WAIT_MS = 800
  }

  /**
   * 解析エンジンの初期化とイベントリスナーの登録
   */
  start() {
    // 1. エディタの変更を監視して汚染された行を記録
    this.editor.onDidChangeModelContent((e) => {
      e.changes.forEach(change => {
        const startLine = change.range.startLineNumber - 1
        const endLine = change.range.endLineNumber - 1
        const textLines = (change.text || "").split("\n")
        const newLinesCount = textLines.length
        const lineCountChange = newLinesCount - (endLine - startLine + 1)

        // キャッシュをずらす
        this.shiftLineCache(startLine, endLine, newLinesCount)

        // 変更されたすべての行（新しく増えた行も含む）を汚染マーク
        for (let i = startLine; i < startLine + newLinesCount; i++) {
          this.dirtyLines.add(i)
        }
      })
      this.scheduleAnalysis()
    })

    // 2. 初回スキャンを即時開始 (LSPを待たずに正規表現のみでリストを出す)
    this.scheduleAnalysis()

    // 3. LSPの解析が終わる旅に再スキャン（型解決の確定）
    this.boundHandleLSPFinished = () => {
      // console.log("[AnalysisCoordinator] LSP finished, re-scheduling analysis")
      this.scheduleAnalysis()
    }
    window.addEventListener("rubpad:lsp-analysis-finished", this.boundHandleLSPFinished)
  }

  stop() {
    window.removeEventListener("rubpad:lsp-analysis-finished", this.boundHandleLSPFinished)
  }

  /**
   * 解析をスケジュールする（デバウンス付き）
   */
  scheduleAnalysis(delay = this.WAIT_MS) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => this.performAnalysis(), delay)
  }

  /**
   * 解析の実行コア
   */
  async performAnalysis() {
    if (this.isAnalyzing) {
      this.needsReanalysis = true
      return
    }

    const model = this.editor.getModel()
    if (!model) {
      this.scheduleAnalysis(1000)
      return
    }

    this.isAnalyzing = true
    this.needsReanalysis = false
    
    // 解析開始前に一度だけドキュメントを同期
    if (this.lspInteractor.flushDocumentSync) {
      this.lspInteractor.flushDocumentSync()
    }

    try {
      // 1. 必要に応じて再スキャン
      const shouldFullScan = this.lineMethods.length === 0 || this.lineMethods.length !== model.getLineCount()
      if (shouldFullScan || this.dirtyLines.size > 0) {
        this.rescanLines(model, shouldFullScan)
        this.dirtyLines.clear()
      }

      const allFoundOccurrences = this.lineMethods.flat().filter(Boolean)
      const currentNames = new Set(allFoundOccurrences.map(m => m.name))
      let changed = false

      // 2. 不要になったメソッドの除去
      for (const name of this.methods.keys()) {
        if (!currentNames.has(name)) {
          this.methods.delete(name)
          changed = true
        }
      }

      // 3. メソッドの発見と位置更新
      for (const item of allFoundOccurrences) {
        let state = this.methods.get(item.name)
        
        if (!state) {
          // 新規発見
          state = { ...item, status: 'pending', className: null, url: null, isResolving: false }
          this.methods.set(item.name, state)
          changed = true
          this.resolveMethod(item.name)
        } else {
          // すでに解決済みか解決中の場合は基本スキップ
          // ただし、位置が変わっている場合は最新位置を保持（次の解決リトライ時に使用）
          if (state.line !== item.line || state.col !== item.col) {
            state.line = item.line
            state.col = item.col
          }
          
          if (state.status === 'unknown') {
            this.resolveMethod(item.name)
          }
        }
      }

      // 初回または変更があった場合に通知
      if (changed || !this.firstScanDone) {
        this.firstScanDone = true
        this.notifyUpdate()
      }

    } catch (e) {
      console.error("[AnalysisCoordinator] Analysis loop failed:", e)
    } finally {
      this.isAnalyzing = false
      if (this.needsReanalysis) {
        this.scheduleAnalysis()
      }
    }
  }

  /**
   * メソッドの型とるりま情報を解決する
   */
  async resolveMethod(methodName) {
    const data = this.methods.get(methodName)
    if (!data || data.status === 'resolved' || data.isResolving) return

    data.isResolving = true
    try {
      let className = await this.resolution.resolveMethodAt(data.line, data.col, { 
        methodName: methodName,
        skipSync: true 
      })
      
      // フォールバック: レシーバを解決
      if (!className && data.col > 1) {
        className = await this.resolution.resolveAtPosition(data.line, data.col - 1, { skipSync: true, maxRetries: 1 })
      }

      if (className) {
        const info = this.rurema.resolve(className, methodName)
        if (info) {
          this.methods.set(methodName, {
            ...data,
            status: 'resolved',
            className: info.className,
            url: info.url,
            separator: info.separator
          })
        } else {
          this.methods.set(methodName, { ...data, status: 'unknown' })
        }
      } else {
        this.methods.set(methodName, { ...data, status: 'unknown' })
      }
    } catch (e) {
      this.methods.set(methodName, { ...data, status: 'unknown' })
    } finally {
      data.isResolving = false
      this.notifyUpdate()
    }
  }

  /**
   * 指定された行をスキャンしてメソッド呼び出しを抽出
   */
  rescanLines(model, fullScan) {
    const lineCount = model.getLineCount()
    
    // 全文スキャンの場合は dirtyLines を全行で埋める
    if (fullScan) {
      this.lineMethods = new Array(lineCount)
      for (let i = 0; i < lineCount; i++) this.dirtyLines.add(i)
    }

    const regex = /[a-zA-Z_][a-zA-Z0-9_]*[!?]?/g
    
    this.dirtyLines.forEach(lineIdx => {
      if (lineIdx >= lineCount) return
      
      const lineText = model.getLineContent(lineIdx + 1)
      const foundInLine = []
      
      if (lineText) {
        // コメント落とし (# から末尾までを無視)
        const commentIdx = lineText.indexOf("#")
        const codePart = commentIdx !== -1 ? lineText.substring(0, commentIdx) : lineText

        let match
        regex.lastIndex = 0
        while ((match = regex.exec(codePart)) !== null) {
          const name = match[0]
          const col = match.index
          const textBefore = codePart.substring(0, col)
          
          // ドット、ぼっち演算子(&.)、アンパサンドコロン(&: ) を判定
          const isMethodCall = /[\.&]\s*$/.test(textBefore) || /&:\s*$/.test(textBefore)
          
          if (isMethodCall) {
            foundInLine.push({
              name: name,
              line: lineIdx + 1,
              col: col + 1
            })
          }
        }
      }
      this.lineMethods[lineIdx] = foundInLine
    })
  }

  /**
   * 行の挿入/削除に合わせてキャッシュをシフトする
   */
  shiftLineCache(startLine, endLine, newLinesCount) {
    const deleteCount = endLine - startLine + 1
    const newItems = Array(newLinesCount).fill(null).map(() => [])
    
    // キャッシュ項目を入れ替え（Monacoのモデル変更に合わせる）
    this.lineMethods.splice(startLine, deleteCount, ...newItems)

    // シフト後の全行番号（lineプロパティ）を再調整
    this.lineMethods.forEach((methods, idx) => {
      if (methods) {
        methods.forEach(m => m.line = idx + 1)
      }
    })
  }

  /**
   * 状態が更新されたことを UI コントローラーに通知
   */
  notifyUpdate() {
    const event = new CustomEvent("rubpad:analysis-updated", {
      detail: { 
        methods: Array.from(this.methods.values()),
        firstScanDone: this.firstScanDone
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * 現在の解析結果を取得
   */
  getAnalysis() {
    return {
      methods: Array.from(this.methods.values()),
      firstScanDone: this.firstScanDone
    }
  }
}
