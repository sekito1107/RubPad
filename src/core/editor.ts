import * as monaco from 'monaco-editor';
import { run } from './editor/initializer';

export const initialize = run;

export const setTheme = (theme: string) => {
  monaco.editor.setTheme(theme);
};
