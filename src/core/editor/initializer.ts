import * as monaco from 'monaco-editor';
import { editor, updateCode } from '../../state/editor';
import { app } from '../../state/app';

export function run(htmlElement: HTMLElement | null) {
  if (!htmlElement) return;

  const instance = monaco.editor.create(htmlElement, {
    value: editor.code,
    language: 'ruby',
    theme: app.theme === 'dark' ? 'vs-dark' : 'vs',
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    padding: { top: 16, bottom: 16 },
  });

  instance.onDidChangeModelContent(() => {
    updateCode(instance.getValue());
  });

  return () => instance.dispose();
}
