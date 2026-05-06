import { useEffect } from 'react';
import { registerHoverProvider } from '../core/editor/hover';
import { registerCommands } from '../core/editor/command';
import { registerInlayHintsProvider } from '../core/editor/inlay-hints';

export const useEditorProviders = () => {
  useEffect(() => {
    const hoverProvider = registerHoverProvider();
    const commands = registerCommands();
    const inlayHintsProvider = registerInlayHintsProvider();

    return () => {
      hoverProvider.dispose();
      commands.dispose();
      inlayHintsProvider.dispose();
    };
  }, []);
};
