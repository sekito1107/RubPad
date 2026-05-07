import { proxy } from 'valtio';

export type ExecutionSnapshot = {
  initial: string;
  result: string;
};

export type CapturedValue = {
  line: number;
  col: number;
  contentLine: number;
  contentCol: number;
  label: string;
  content: string;
  kind: 'variable' | 'assignment' | 'expression';
  history: ExecutionSnapshot[];
  lastValue: string;
};

export const capturedValues = proxy<{
  entries: Record<number, CapturedValue[]>;
}>({
  entries: {},
});

export const addCapturedValue = (cv: CapturedValue) => {
  const lineValues = [...(capturedValues.entries[cv.line] || [])];

  const index = lineValues.findIndex(v => v.col === cv.col);
  if (index >= 0) {
    lineValues[index] = cv;
  } else {
    lineValues.push(cv);
    lineValues.sort((a, b) => a.col - b.col);
  }

  capturedValues.entries[cv.line] = lineValues;
};

export const clearCapturedValues = () => {
  capturedValues.entries = {};
};

export const removeCapturedValue = (line: number, col: number) => {
  const lineValues = [...(capturedValues.entries[line] || [])];
  const newValues = lineValues.filter(v => v.col !== col);

  if (newValues.length === 0) {
    delete capturedValues.entries[line];
  } else {
    capturedValues.entries[line] = newValues;
  }
};
