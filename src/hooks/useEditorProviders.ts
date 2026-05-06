import { useEffect } from 'react';
import { registerHoverProvider } from '../core/editor/hover';

export const useEditorProviders = () => {
  useEffect(() => {
    // ホバー機能を登録
    const hoverProvider = registerHoverProvider();

    // コンポーネントのアンマウント時に登録を解除
    return () => {
      hoverProvider.dispose();
    };
  }, []);
};
