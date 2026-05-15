import { proxy } from 'valtio';

export type LiveEvalStatus = 'ok' | 'timeout' | 'error' | null;

export const liveVariablesState = proxy({
  variables: {} as Record<string, string>,
  status: null as LiveEvalStatus,
});

export const updateLiveVariables = (variables: Record<string, string>, status: LiveEvalStatus) => {
  liveVariablesState.variables = variables;
  liveVariablesState.status = status;
};
