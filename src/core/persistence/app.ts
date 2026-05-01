import { Theme, DEFAULT_THEME } from '../../types/app';

const THEME_KEY = 'rubox_theme';

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const loadTheme = (): Theme => {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'dark' || theme === 'light') {
    return theme;
  }
  return DEFAULT_THEME;
};
