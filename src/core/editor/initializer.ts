import * as monaco from 'monaco-editor';

export function run(
  htmlElement: HTMLElement | null,
  value: string,
  theme: string
) {
  if (!htmlElement) return null;

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
  });
}
