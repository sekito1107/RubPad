import { proxy } from 'valtio';

export type ExecutionSnapshot = {
  initial: string;
  result: string;
};

export type CapturedValue = {
  line: number;
  col: number;
  expression: string;
  history: ExecutionSnapshot[];
  totalCalls: number;
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
