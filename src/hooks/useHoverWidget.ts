import { useEffect } from 'react';
import * as monaco from 'monaco-editor';

/**
 * Monaco ウィジェットの登録と表示位置の同期を担当するフック
 */
export const useHoverWidget = (
  domNode: HTMLElement,
  pos: monaco.IPosition | null,
  editorReady: boolean
) => {
  useEffect(() => {
    if (!editorReady) return;
    const editor = monaco.editor.getEditors()[0];
    if (!editor) return;

    const widget: monaco.editor.IContentWidget = {
      getId: () => 'rubox.hover',
      getDomNode: () => domNode,
      getPosition: () => pos ? {
        position: pos,
        preference: [
          monaco.editor.ContentWidgetPositionPreference.BELOW,
          monaco.editor.ContentWidgetPositionPreference.ABOVE
        ]
      } : null
    };

    editor.addContentWidget(widget);
    editor.layoutContentWidget(widget);

    return () => editor.removeContentWidget(widget);
  }, [editorReady, pos, domNode]);
};
