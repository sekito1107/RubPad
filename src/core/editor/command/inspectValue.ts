import * as monaco from 'monaco-editor';
import { addCapturedValue } from '../../../state/captured-values';
import { inspect } from '../../ruby';

export const registerInspectValueCommand = () => {
  return monaco.editor.registerCommand('rubox.inspectValue', async (_accessor, target: any) => {
    if (!target) return;

    const model = monaco.editor.getModels()[0];
    const code = model.getValue();

    const captured = await inspect(code, target.expression, target.line, target.isVariable);

    addCapturedValue({
      line: target.line,
      col: target.col,
      expression: target.expression,
      isVariable: target.isVariable,
      history: captured.history,
      totalCalls: captured.totalCalls,
      lastValue: captured.lastValue
    });

    // 旧実装から引き継いだ強制再描画ロジック: 設定をパタパタさせてキャッシュを無効化する
    const editor = monaco.editor.getEditors().find(e => e.getModel() === model);
    if (editor) {
      editor.updateOptions({ inlayHints: { enabled: 'off' } });
      setTimeout(() => {
        editor.updateOptions({ inlayHints: { enabled: 'on' } });
      }, 50);
    }
  });
};
