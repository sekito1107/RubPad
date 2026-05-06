import { proxy } from 'valtio';

export type CapturedValue = {
  line: number;
  expression: string;
  value: string;
};

export const inspection = proxy<{
  capturedValues: Record<number, CapturedValue>;
}>({
  capturedValues: {},
});

export const setCapturedValue = (line: number, expression: string, value: string) => {
  inspection.capturedValues[line] = {
    line,
    expression,
    value,
  };
};

export const removeCapturedValue = (line: number) => {
  delete inspection.capturedValues[line];
};

export const clearCapturedValues = () => {
  inspection.capturedValues = {};
};
