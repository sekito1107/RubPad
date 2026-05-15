import { proxy } from 'valtio';

export const editor = proxy({
  code: '',
});

export const updateCode = (code: string) => {
  editor.code = code;
};
