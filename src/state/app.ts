import { proxy } from 'valtio';
import { Theme, DEFAULT_THEME } from '../types/app';

export const app: { 
  theme: Theme, 
  status: {
    editorReady: boolean;
    wasmReady: boolean;
    rbsReady: boolean;
  }
} = proxy({
  theme: DEFAULT_THEME,
  status: {
    editorReady: false,
    wasmReady: false,
    rbsReady: false,
  }
});

export const toggleTheme = () => {
  app.theme = app.theme === 'dark' ? 'light' : 'dark';
};
