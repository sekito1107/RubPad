import * as monaco from 'monaco-editor';
import { addCapturedValue } from '../../../state/captured-values';
import { inspect } from '../../ruby';

export const registerInspectValueCommand = () => {
  return monaco.editor.registerCommand('rubox.inspectValue', async (_accessor, target: {
    line: number;
    col: number;
    contentLine: number;
    contentCol: number;
    endLine: number;
    label: string;
    content: string;
    kind: 'variable' | 'assignment' | 'expression';
    expression: string;
    receiver: string | null;
  }) => {
    if (!target) return;

    const model = monaco.editor.getModels()[0];
    const code = model.getValue();

    const captured = await inspect(code, target.expression, target.line, target.kind, target.endLine, target.receiver);

    addCapturedValue({
      line: target.line,
      col: target.col,
      contentLine: target.contentLine,
      contentCol: target.contentCol,
      label: target.label,
      content: target.content,
      kind: target.kind,
      history: captured.history,
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
