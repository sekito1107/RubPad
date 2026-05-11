import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { app } from '../state/app';
import { setTheme } from '../core/editor';
import { loadTheme } from '../core/persistence/app';

export const useTheme = () => {
  const { theme } = useSnapshot(app);

  useEffect(() => {
    // 起動時に保存されたテーマをロードして反映
    const savedTheme = loadTheme();
    if (savedTheme !== app.theme) {
      app.theme = savedTheme;
    }
  }, []);

  useEffect(() => {
    // エディタのテーマは常にダーク（vscode-dark）を維持する設計方針
    // TextMateのシンタックスハイライトを維持するため、明示的に指定
    setTheme('vscode-dark');
  }, [theme]);
};
