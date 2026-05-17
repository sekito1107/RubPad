import { proxy } from 'valtio';

export type LiveEvalStatus = 'ok' | 'timeout' | 'error' | null;

export interface LiveEvalError {
  name: string;
  message: string;
}

export const liveVariablesState = proxy({
  variables: {} as Record<string, string>,
  status: null as LiveEvalStatus,
  error: null as LiveEvalError | null,
});

export const updateLiveVariables = (
  variables: Record<string, string>,
  status: LiveEvalStatus,
  error: LiveEvalError | null = null
) => {
  if (status === 'error') {
    liveVariablesState.status = status;
    if (error) {
      liveVariablesState.error = error;
    }
  } else {
    liveVariablesState.variables = variables;
    liveVariablesState.status = status;
    liveVariablesState.error = null;
  }
};
