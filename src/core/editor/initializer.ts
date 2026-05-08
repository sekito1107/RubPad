import * as monaco from 'monaco-editor';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { loadWASM as loadOnigurumaEngine, OnigScanner, OnigString } from 'vscode-oniguruma';
import { Registry, parseRawGrammar } from 'vscode-textmate';

function ensureMonacoEnvironment() {
  if (self.MonacoEnvironment) return;
  self.MonacoEnvironment = {
    getWorker: () => new editorWorker(),
  };
}

async function setupTextMate(editorInstance: monaco.editor.IStandaloneCodeEditor) {
  // WASMとテーマファイルを並列で読み込み
  const [onigRes, themeRes] = await Promise.all([
    fetch('/onig.wasm'),
    fetch('/dark_plus.json')
  ]);

  const [buffer, theme] = await Promise.all([
    onigRes.arrayBuffer(),
    themeRes.json()
  ]);

  await loadOnigurumaEngine(buffer);

  // TextMateレジストリの構築
  const registry = new Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (sources) => new OnigScanner(sources),
      createOnigString: (str) => new OnigString(str)
    }),
    loadGrammar: async (scopeName) => {
      if (scopeName === 'source.ruby') {
        const res = await fetch('/ruby.tmLanguage.json');
        const grammar = await res.text();
        return parseRawGrammar(grammar, 'ruby.json');
      }
      return null;
    }
  });

  // Registryにテーマを適用
  registry.setTheme(theme);

  // Monaco側にテーマを定義
  monaco.editor.defineTheme('vscode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: theme.colors
  });
  monaco.editor.setTheme('vscode-dark');

  // 言語ID（ruby）とスコープ名（source.ruby）のマッピング
  const grammars = new Map();
  grammars.set('ruby', 'source.ruby');
}

export function run(
  htmlElement: HTMLElement,
  value: string,
  theme: string
): monaco.editor.IStandaloneCodeEditor {
  ensureMonacoEnvironment();

  const editorInstance = monaco.editor.create(htmlElement, {
    value: value,
    language: 'ruby',
    theme: theme,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    padding: { top: 16, bottom: 16 },
    inlayHints: {
      enabled: 'on'
    }
  });

  // バックグラウンドでTextMateのセットアップを開始
  setupTextMate(editorInstance);

  return editorInstance;
}
