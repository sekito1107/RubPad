import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor } from '../state/editor';
import { app } from '../state/app';
import { updateLiveVariables } from '../state/live-variables';
import { fetchLiveVariables } from '../core/ruby';

export const useLiveVariables = () => {
  const { code } = useSnapshot(editor);
  const { status } = useSnapshot(app);

  useEffect(() => {
    if (!status.wasmReady) return;

    const timer = setTimeout(async () => {
      if (!code) {
        updateLiveVariables({}, null);
        return;
      }

      try {
        const result = await fetchLiveVariables(code);
        updateLiveVariables(result.variables, result.status);
      } catch (e) {
        console.error('Failed to fetch live variables:', e);
        updateLiveVariables({}, 'error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code, status.wasmReady]);
};
