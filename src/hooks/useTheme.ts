import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { app } from '../state/app';
import { setTheme } from '../core/editor';

export const useTheme = () => {
  const { theme } = useSnapshot(app);

  useEffect(() => {
    setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }, [theme]);
};
