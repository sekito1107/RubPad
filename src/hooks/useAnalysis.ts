import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor } from '../state/editor';
import { analysis } from '../state/analysis';

export const useAnalysis = () => {
  const { code } = useSnapshot(editor);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!code) {
        analysis.methods = [];
        return;
      }
      // TODO
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);
};
