import * as monaco from 'monaco-editor';
// @ts-expect-error: worker import
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { loadWASM as loadOnigurumaEngine, OnigScanner, OnigString } from 'vscode-oniguruma';
import { INITIAL, Registry, parseRawGrammar } from 'vscode-textmate';

function ensureMonacoEnvironment() {
  if (self.MonacoEnvironment) return;
  self.MonacoEnvironment = {
    getWorker: () => new editorWorker(),
  };
}

async function setupTextMate() {
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

  // TextMateのテーマをMonacoのルール形式に変換
  const monacoRules: monaco.editor.ITokenThemeRule[] = [];
  if (theme.settings) {
    theme.settings.forEach((setting: any) => {
      if (!setting.scope) return;
      const scopes = Array.isArray(setting.scope) ? setting.scope : [setting.scope];
      scopes.forEach((scope) => {
        monacoRules.push({
          token: scope,
          foreground: setting.settings.foreground,
          fontStyle: setting.settings.fontStyle
        });
      });
    });
  }

  // Monaco側にネイティブなテーマとして定義
  monaco.editor.defineTheme('vscode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: monacoRules,
    colors: theme.colors
  });
  monaco.editor.setTheme('vscode-dark');

  // 文法のロード
  const grammar = await registry.loadGrammar('source.ruby');
  if (!grammar) return;

  // Monacoのトークナイザーを上書き
  monaco.languages.setTokensProvider('ruby', {
    getInitialState: () => INITIAL,
    tokenize: (line, state) => {
      const res = grammar.tokenizeLine(line, state as any);
      return {
        tokens: res.tokens.map(t => ({
          startIndex: t.startIndex,
          scopes: t.scopes[t.scopes.length - 1]
        })),
        endState: res.ruleStack
      };
    }
  });
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
    bracketPairColorization: {
      enabled: true
    },
    inlayHints: {
      enabled: 'on'
    },
    tabSize: 2,
    insertSpaces: true
  });

  // バックグラウンドでTextMateのセットアップを開始
  setupTextMate();

  return editorInstance;
}
