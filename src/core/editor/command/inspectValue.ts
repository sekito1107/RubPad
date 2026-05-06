import * as monaco from 'monaco-editor';
import { addCapturedValue } from '../../../state/captured-values';
import { inspect } from '../../ruby';

export const registerInspectValueCommand = () => {
  return monaco.editor.registerCommand('rubox.inspectValue', async (_accessor, target: {
    line: number;
    col: number;
    contentLine: number;
    contentCol: number;
    label: string;
    content: string;
    isVariable: boolean;
  }) => {
    if (!target) return;

    const model = monaco.editor.getModels()[0];
    const code = model.getValue();

    const captured = await inspect(code, target.label, target.line, target.isVariable);

    addCapturedValue({
      line: target.line,
      col: target.col,
      contentLine: target.contentLine,
      contentCol: target.contentCol,
      label: target.label,
      content: target.content,
      isVariable: target.isVariable,
      history: captured.history,
      totalCalls: captured.totalCalls,
      lastValue: captured.lastValue
    });
    // キャッシュの影響で再描写されない為、一時的に設定を変更して再描写させる
    const editor = monaco.editor.getEditors().find(e => e.getModel() === model);
    if (editor) {
      editor.updateOptions({ inlayHints: { enabled: 'off' } });
      setTimeout(() => {
        editor.updateOptions({ inlayHints: { enabled: 'on' } });
      }, 50);
    }
  });
};
