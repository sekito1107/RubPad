import * as monaco from 'monaco-editor';
import { pick } from '../ruby';
import { monacoToPrism } from '../../utils/monaco-to-prism';

export const registerHoverProvider = () => {
  return monaco.languages.registerHoverProvider('ruby', {
    provideHover: async (model, position) => {
      const pos = monacoToPrism(position);
      const target = await pick(model.getValue(), pos.line, pos.col);

      if (!target || !target.label) return null;

      return {
        contents: [
          { 
            value: `[🔍 値を確認: ${target.label}](command:rubox.inspectValue?${encodeURIComponent(JSON.stringify(target))})`,
            isTrusted: true
          }
        ]
      };
    }
  });
};
