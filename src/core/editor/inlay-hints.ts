import * as monaco from 'monaco-editor';
import { capturedValues, removeCapturedValue } from '../../state/captured-values';
import { subscribe } from 'valtio';

export const registerInlayHintsProvider = () => {
  const onDidChangeInlayHints = new monaco.Emitter<void>();

  subscribe(capturedValues, () => {
    onDidChangeInlayHints.fire();
  });

  return monaco.languages.registerInlayHintsProvider('ruby', {
    onDidChangeInlayHints: onDidChangeInlayHints.event,
    provideInlayHints: (model) => {
      const hints: monaco.languages.InlayHint[] = [];

      Object.entries(capturedValues.entries).forEach(([line, values]) => {
        if (values.length === 0) return;

        const lineNum = Number(line);
        if (lineNum < 1 || lineNum > model.getLineCount()) return;

        const validValues = values.filter(v => {
          const lines = v.content.split('\n');
          const endLineNumber = v.contentLine + lines.length - 1;
          const endColumn = lines.length === 1
            ? v.contentCol + lines[0].length + 1
            : lines[lines.length - 1].length + 1;

          if (endLineNumber > model.getLineCount()) {
            setTimeout(() => removeCapturedValue(lineNum, v.col), 0);
            return false;
          }

          const currentText = model.getValueInRange({
            startLineNumber: v.contentLine,
            startColumn: v.contentCol + 1,
            endLineNumber: endLineNumber,
            endColumn: endColumn
          });

          if (currentText !== v.content) {
            setTimeout(() => removeCapturedValue(lineNum, v.col), 0);
            return false;
          }
          return true;
        });

        if (validValues.length === 0) return;

        const lineLength = model.getLineContent(lineNum).length;

        const label = validValues.map(v => {
          const fullChain: string[] = [];

          if (v.kind === 'variable' || v.kind === 'block_variable') {
            // 変数参照の場合は、その式が評価される直前の値を表示する
            v.history.forEach(h => {
              fullChain.push(h.initial ?? 'nil');
            });
          } else {
            // 代入やメソッド呼び出しの場合は、実行前後の変化を表示する
            if (v.history.length > 0 && (v.history[0].initial !== null || v.kind === 'assignment')) {
              fullChain.push(v.history[0].initial ?? 'nil');
            }
            v.history.forEach(h => {
              fullChain.push(h.result);
            });
          }

          let displayValue = fullChain.join(' -> ');
          if (v.history.length === 10 && v.lastValue !== v.history[v.history.length - 1].result) {
            displayValue += ` -> ... -> ${v.lastValue}`;
          }

          return `${v.label}: ${displayValue}`;
        }).join(', ');

        hints.push({
          position: { lineNumber: lineNum, column: lineLength + 1 },
          label: label,
          kind: monaco.languages.InlayHintKind.Parameter,
          paddingLeft: true
        });
      });

      return { hints, dispose: () => { } };
    }
  });
};
