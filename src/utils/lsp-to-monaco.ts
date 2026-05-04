import * as monaco from 'monaco-editor';

/**
 * LSP (Language Server Protocol) の重大度定義
 * @see https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnosticSeverity
 */
const LspSeverity = {
  Error: 1,
  Warning: 2,
  Information: 3,
  Hint: 4,
} as const;

/**
 * LSP 形式の診断情報を Monaco Editor 用のマーカー形式に変換する。
 * 
 * この関数は「解析エンジン（LSP規格）」と「エディタ（Monaco規格）」の間の
 * インターフェースの差異を吸収するための専用の変換器（アダプター）です。
 */
export const lspToMonaco = (lspItems: any[]): monaco.editor.IMarkerData[] => {
  return lspItems.map(item => ({
    // LSP 規格の Error を Monaco 側の Error 定数に、それ以外を Warning にマッピングする
    severity: item.severity === LspSeverity.Error 
      ? monaco.MarkerSeverity.Error 
      : monaco.MarkerSeverity.Warning,

    message: item.message,

    // 座標系の補正：
    // LSP は 0始まり（0行目、0文字目）で位置を保持するが、
    // Monaco は 1始まり（1行目、1文字目）を期待するため、すべて +1 して変換する。
    startLineNumber: item.range.start.line + 1,
    startColumn: item.range.start.character + 1,
    endLineNumber: item.range.end.line + 1,
    endColumn: item.range.end.character + 1,
  }));
};
