import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor } from '../state/editor';
import { analysis } from '../state/analysis';
import { scan } from '../core/ruby';

export const useAnalysis = () => {
  const { code } = useSnapshot(editor);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!code) {
        analysis.methods = [];
        analysis.variables = [];
        return;
      }

      try {
        const result = await scan(code);
        analysis.methods = result.methods;
        analysis.variables = result.variables;
      } catch {
        // 失敗時は何もしない
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);
};
