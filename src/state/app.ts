import { proxy } from 'valtio';
import { Theme, DEFAULT_THEME } from '../types/app';

export const app: { theme: Theme } = proxy({
  theme: DEFAULT_THEME,
});

export const toggleTheme = () => {
  app.theme = app.theme === 'dark' ? 'light' : 'dark';
};
