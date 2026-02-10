/**
 * エディタの内容をファイルとしてダウンロード（エクスポート）する
 */
export interface EditorLike {
  getValue(): string;
}

export class Exporter {
  private editor: EditorLike;

  constructor(editor: EditorLike) {
    this.editor = editor;
  }

  /**
   * 現在のコンテンツを .rb ファイルとして保存する
   * @param {string} filename 
   */
  export(filename: string = "main.rb"): void {
    const code = this.editor.getValue();
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
