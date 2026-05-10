import { useEffect } from 'react';
import { registerCommands } from '../core/editor/command';
import { registerInlayHintsProvider } from '../core/editor/inlay-hints';

export const useEditorProviders = () => {
  useEffect(() => {
    const commands = registerCommands();
    const inlayHintsProvider = registerInlayHintsProvider();

    return () => {
      commands.dispose();
      inlayHintsProvider.dispose();
    };
  }, []);
};
