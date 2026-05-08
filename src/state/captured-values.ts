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
  // 表示用データとしての側面を考慮し、ラベルが長すぎる場合は切り詰める
  const processedLabel = cv.label.length > 15
    ? cv.label.substring(0, 12) + '...'
    : cv.label;

  const processedCv = { ...cv, label: processedLabel };
  
  // 1行につきヒントは1つのみ表示する（最新のもので上書き）
  capturedValues.entries[processedCv.line] = [processedCv];
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
