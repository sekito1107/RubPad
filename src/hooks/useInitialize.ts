import { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { app } from '../state/app';
import { editor, updateCode } from '../state/editor';
import { setPhase, setVersion } from '../state/yarv';
import { initialize } from '../core/editor';
import { saveCode } from '../core/persistence/editor';
import { execute, initAnalyzer, checkAnalyzerReady } from '../core/ruby';

export const useInitialize = () => {
  useEffect(() => {
    const editorInstance = initEditor();
    initRubyVM();
    initDiagnostics();

    return () => {
      editorInstance.dispose();
    };
  }, []);
};

function initEditor(): monaco.editor.IStandaloneCodeEditor {
  const htmlElement = document.getElementById('monaco-editor')!;
  const instance = initialize(
    htmlElement,
    editor.code,
    app.theme === 'dark' ? 'vs-dark' : 'vs'
  );

  app.status.editorReady = true;

  instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    const code = instance.getValue();
    execute(`Executor.run(${JSON.stringify(code)})`);
  });

  instance.onDidChangeModelContent(() => {
    const newCode = instance.getValue();
    updateCode(newCode);
    saveCode(newCode);
  });

  return instance;
}

function initRubyVM() {
  execute('puts RUBY_VERSION').then((version) => {
    setVersion(version.trim());
    setPhase('ready');
    app.status.wasmReady = true;
  });
}

function initDiagnostics() {
  initAnalyzer();
  const timer = setInterval(async () => {
    const ready = await checkAnalyzerReady();
    if (ready) {
      app.status.rbsReady = true;
      clearInterval(timer);
    }
  }, 1000);
}
