import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

export const useHoverPosition = (
  isMouseOverWidget: boolean,
  editorReady: boolean
) => {
  const [pos, setPos] = useState<monaco.IPosition | null>(null);

  useEffect(() => {
    if (!editorReady) return;
    const editor = monaco.editor.getEditors()[0];
    const model = editor?.getModel();
    if (!editor || !model) return;

    let timer: ReturnType<typeof setTimeout>;

    const moveListener = editor.onMouseMove((e) => {
      const currentPos = e.target.position;
      const isWord = currentPos && model.getWordAtPosition(currentPos);

      clearTimeout(timer);

      if (!isWord) {
        timer = setTimeout(() => {
          if (!isMouseOverWidget) {
            setPos(null);
          }
        }, 150);
        return;
      }

      timer = setTimeout(() => setPos(currentPos), 150);
    });

    const leaveListener = editor.onMouseLeave(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isMouseOverWidget) {
          setPos(null);
        }
      }, 150);
    });

    return () => {
      clearTimeout(timer);
      moveListener.dispose();
      leaveListener.dispose();
    };
  }, [editorReady, isMouseOverWidget]);

  return pos;
};
