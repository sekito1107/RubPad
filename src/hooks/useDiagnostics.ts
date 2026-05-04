import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import * as monaco from 'monaco-editor';
import { analyze } from '../core/ruby';
import { editor } from '../state/editor';

export const useDiagnostics = () => {
  const { code } = useSnapshot(editor);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const markers = await analyze(code);
      const model = monaco.editor.getModels()[0];
      if (model) {
        monaco.editor.setModelMarkers(model, 'ruby', markers);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);
};
