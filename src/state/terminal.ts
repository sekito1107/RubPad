import { proxy } from 'valtio';

export const terminal = proxy({
  output: '',
});

export const updateOutput = (output: string) => {
  terminal.output = output;
};

export const clearOutput = () => {
  terminal.output = '';
};
