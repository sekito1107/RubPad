import * as monaco from 'monaco-editor';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

// monaco-editorのworkerを明示的に指定、workerを正しく指定しないとフォールバックモードでmonacoが起動する
function ensureMonacoEnvironment() {
  if (self.MonacoEnvironment) return;
  self.MonacoEnvironment = {
    getWorker: () => new editorWorker(),
  };
}

export function run(
  htmlElement: HTMLElement,
  value: string,
  theme: string
): monaco.editor.IStandaloneCodeEditor {
  ensureMonacoEnvironment();

  return monaco.editor.create(htmlElement, {
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
}
