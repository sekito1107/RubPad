import * as monaco from 'monaco-editor';
import { addCapturedValue } from '../../../state/captured-values';

export const registerInspectValueCommand = () => {
  return monaco.editor.registerCommand('rubox.inspectValue', (_accessor, target: any) => {
    if (!target) return;

    addCapturedValue({
      line: target.line,
      col: target.col,
      expression: target.expression,
      value: "..."
    });
  });
};
