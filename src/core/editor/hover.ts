import * as monaco from 'monaco-editor';

export const registerHoverProvider = () => {
  return monaco.languages.registerHoverProvider('ruby', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      return {
        contents: [
          { value: `ここに「値を確認: ${word.word}」ボタンを出す予定です` }
        ]
      };
    }
  });
};
