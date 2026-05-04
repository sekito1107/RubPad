import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor, updateCode } from '../state/editor';
import { app } from '../state/app';
import { initialize, setTheme } from '../core/editor';
import { saveCode } from '../core/persistence/editor';
import * as monaco from 'monaco-editor';
import { useExecution } from './useExecution';

export const useEditor = () => {
  const { theme } = useSnapshot(app);
  const { execute } = useExecution();

  useEffect(() => {
    const htmlElement = document.getElementById('monaco-editor');
    if (!htmlElement) return;

    const instance = initialize(
      htmlElement,
      editor.code,
      app.theme === 'dark' ? 'vs-dark' : 'vs'
    );

    if (instance) {
      instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        execute();
      });

      instance.onDidChangeModelContent(() => {
        const newCode = instance.getValue();
        updateCode(newCode);
        saveCode(newCode);
      });

      return () => {
        instance.dispose();
      };
    }
  }, []);

  useEffect(() => {
    setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);
};
