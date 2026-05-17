import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { editor } from '../state/editor';
import { app } from '../state/app';
import { liveVariablesState, updateLiveVariables } from '../state/live-variables';
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
        const result = await fetchLiveVariables(code) as any;
        if (result.status === 'error') {
          const hasNewVars = Object.keys(result.variables || {}).length > 0;
          updateLiveVariables(
            hasNewVars ? result.variables : liveVariablesState.variables,
            'error',
            result.error_class ? { name: result.error_class, message: result.error_message } : null
          );
        } else {
          updateLiveVariables(result.variables, result.status);
        }
      } catch (e) {
        console.error('Failed to fetch live variables:', e);
        updateLiveVariables(liveVariablesState.variables, 'error', { name: 'WorkerError', message: String(e) });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code, status.wasmReady]);
};
