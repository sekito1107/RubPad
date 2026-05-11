import { useEffect } from 'react';
import { app } from '../state/app';
import { loadTheme } from '../core/persistence/app';

export const useTheme = () => {

  useEffect(() => {
    // 起動時に保存されたテーマをロードして反映
    const savedTheme = loadTheme();
    if (savedTheme !== app.theme) {
      app.theme = savedTheme;
    }
  }, []);
};
