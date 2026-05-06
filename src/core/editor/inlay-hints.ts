import * as monaco from 'monaco-editor';
import { capturedValues } from '../../state/captured-values';
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
        const lineLength = model.getLineContent(lineNum).length;

        const label = "# => " + values.map(v => {
          const fullChain = [];
          if (v.isVariable && v.history.length > 0) {
            fullChain.push(v.history[0].initial);
          }
          v.history.forEach(h => fullChain.push(h.result));

          let displayValue = fullChain.join(' -> ');
          if (v.totalCalls > v.history.length) {
            displayValue += ` -> ... -> ${v.lastValue}`;
          }

          return `${v.expression}: ${displayValue}`;
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
