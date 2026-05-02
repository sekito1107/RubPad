import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor, updateCode } from '../state/editor';
import { app } from '../state/app';
import { initialize, setTheme } from '../core/editor';
import { saveCode } from '../core/persistence/editor';

export const useEditor = () => {
  const { theme } = useSnapshot(app);

  useEffect(() => {
    const htmlElement = document.getElementById('monaco-editor');
    if (!htmlElement) return;

    const instance = initialize(
      htmlElement,
      editor.code,
      app.theme === 'dark' ? 'vs-dark' : 'vs'
    );

    if (instance) {
      instance.onDidChangeModelContent(() => {
        const newCode = instance.getValue();
        updateCode(newCode);
        saveCode(newCode);
      });
    }
  }, []);

  useEffect(() => {
    setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);
};
