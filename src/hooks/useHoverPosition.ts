import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useSnapshot } from 'valtio';
import { hoverStatus } from '../components/Hover';

export const useHoverPosition = (
  editorReady: boolean
) => {
  const [pos, setPos] = useState<monaco.IPosition | null>(null);
  const snap = useSnapshot(hoverStatus);

  useEffect(() => {
    if (!editorReady) return;
    const editor = monaco.editor.getEditors()[0];
    const model = editor?.getModel();
    if (!editor || !model) return;

    let timer: ReturnType<typeof setTimeout>;

    const moveListener = editor.onMouseMove((e) => {
      const currentPos = e.target.position;
      const isOnChar = e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT;

      clearTimeout(timer);

      if (!isOnChar || !currentPos) {
        timer = setTimeout(() => {
          if (!snap.visible) {
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
        if (!snap.visible) {
          setPos(null);
        }
      }, 150);
    });

    return () => {
      clearTimeout(timer);
      moveListener.dispose();
      leaveListener.dispose();
    };
  }, [editorReady, snap.visible]);

  return pos;
};
