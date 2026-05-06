import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor } from '../state/editor';
import { analysis } from '../state/analysis';
import { app } from '../state/app';
import { scan } from '../core/ruby';

export const useAnalysis = () => {
  const { code } = useSnapshot(editor);
  const { status } = useSnapshot(app);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!code || !status.rbsReady) {
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
  }, [code, status.rbsReady]);
};
