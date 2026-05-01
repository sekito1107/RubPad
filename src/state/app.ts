import { proxy } from 'valtio';

type Theme = 'dark' | 'light';

const DEFAULT_THEME: Theme = 'dark';

export const app: { theme: Theme } = proxy({
  theme: DEFAULT_THEME,
});

export const toggleTheme = () => {
  app.theme = app.theme === 'dark' ? 'light' : 'dark';
};
