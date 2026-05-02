import { subscribe } from 'valtio';
import { app } from '../state/app';
import * as Initializer from './editor/initializer';
import * as monaco from 'monaco-editor';

export const initialize = Initializer.run;

subscribe(app, () => {
  monaco.editor.setTheme(app.theme === 'dark' ? 'vs-dark' : 'vs');
});
