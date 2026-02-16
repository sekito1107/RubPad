/**
 * LSP クライアントを直接使用し、シンボルや位置に基づいた型解決を行う
 */
export class Resolution {
  private lsp: any

  constructor(lspManager: any) {
    this.lsp = lspManager
  }

  /**
   * 指定された位置の型を特定し、クラス名を返す
   */
  async resolveAtPosition(line: number, col: number): Promise<string | null> {
    // 0. コメント内チェック
    const model = this.lsp.model
    if (model) {
      if (line <= 0 || line > model.getLineCount()) return null
      let lineContent = "";
      try {
        lineContent = model.getLineContent(line)
      } catch (e: any) {
        console.error(`[Resolution/resolveAtPosition] Error getting content for line ${line}:`, e.message);
        return null;
      }
      const commentIdx = lineContent.indexOf('#')
      // '#' が見つかり、かつその直後が '{' (式展開) でない場合のみコメントとみなす
      if (commentIdx !== -1 && lineContent[commentIdx + 1] !== '{' && commentIdx < col - 1) {
        return null
      }

      // 1. 本来の位置で試行
      let type: string | null = await this.lsp.getTypeAtPosition(line, col)
      if (type) return type

      // 2. フォールバック: 前方に遡って意味のあるシンボルを探す
      // ドット直後や単語の末尾で解決に失敗した場合のため、空白やドットを飛ばして文字を探す
      for (let offset = 1; offset <= 5; offset++) {
        const targetCol = col - offset
        if (targetCol <= 0) break
        
        const char = lineContent[targetCol - 1]
        // 空白とドットは飛ばす (names. | のようなケース)
        if (/\s/.test(char) || char === '.') continue

        type = await this.lsp.getTypeAtPosition(line, targetCol)
        if (type) return type
      }

      // 3. 最終手段: ドット直後の解決失敗時、ドットを除去したコードでプローブ試行
      type = await this._probeReceiverType(model, line, col)
      if (type) return type
    }
    
    return null
  }

  /**
   * メソッド名に対応する定義位置での解決を試みる
   * Scanner から渡される col は既に識別子の開始位置であるため、そのまま使用する
   */
  async resolveMethodAt(line: number, col: number): Promise<string | null> {
    return await this.lsp.getTypeAtPosition(line, col)
  }

  /**
   * ドット (".") の直後にカーソルがある場合に備え、ドットを除去した状態でプローブを行う
   */
  private async _probeReceiverType(model: { getLineContent(l: number): string, getLinesContent(): string[], getLineCount(): number }, line: number, col: number): Promise<string | null> {
    if (line <= 0 || line > model.getLineCount()) return null
    let lineContent = "";
    try {
      lineContent = model.getLineContent(line)
    } catch {
      return null;
    }
    
    // カーソル位置(col)の直前が "." かを確認
    // Range (..) の場合もあるため、ドットが連続している場合はそれらも考慮する
    let dotEnd = col - 1
    while (dotEnd > 0 && lineContent[dotEnd - 1] === ' ') dotEnd-- // 空白を飛ばす

    if (lineContent[dotEnd - 1] !== '.') return null

    // ドットの開始位置を見つける (.. や ... に対応)
    let dotStart = dotEnd - 1
    while (dotStart > 0 && lineContent[dotStart - 1] === '.') dotStart--

    // ドット部分を除去した一時的な全行コンテンツを作成
    const lines = model.getLinesContent()
    const targetIdx = line - 1
    
    const newLine = lineContent.substring(0, dotStart) + " ".repeat(dotEnd - dotStart) + lineContent.substring(dotEnd)
    lines[targetIdx] = newLine
    const tempContent = lines.join("\n")

    // ドットを除去した直前の位置でプローブ
    return this.probe(tempContent, line, Math.max(1, dotStart))
  }

  /**
   * 一時的なコンテンツで型解決を試みる
   */
  async probe(content: string, line: number, col: number): Promise<string | null> {
    return await this.lsp.probeTypeWithTemporaryContent(content, line, col)
  }
}
