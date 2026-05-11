import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useSnapshot } from 'valtio';
import { pick, inspect } from '../core/ruby';
import { analysis, MethodInfo } from '../state/analysis';
import { getReferenceUrl } from '../core/ruby/reference';
import { convertPrismPosition } from '../utils/prism-to-monaco';
import { monacoToPrism } from '../utils/monaco-to-prism';

export type HoverData = {
  expression: string;
  referenceLabel: string;
  type: string;
  receiver: string;
  value: string;
  reference: string;
  kind: 'method' | 'variable' | 'block_variable';
  onPin: () => void;
};

export const useHoverData = (pos: monaco.IPosition | null) => {
  const snap = useSnapshot(analysis);
  const [hoverInfo, setHoverInfo] = useState<HoverData | null>(null);

  useEffect(() => {
    // 初期化の見直し：副作用の開始時にまずクリアする
    setHoverInfo(null);
    if (!pos) return;

    const fetchData = async () => {
      const editor = monaco.editor.getEditors()[0];
      const model = editor?.getModel();
      if (!editor || !model) return;

      const code = model.getValue();
      const { line, col } = monacoToPrism(pos);
      const target = await pick(code, line, col);

      if (target.label) {
        const details = await inspect(
          code,
          target.expression,
          target.line,
          target.kind,
          target.endLine,
          target.preExecutionTarget
        );

        // --- メタデータ解決ロジック ---
        let expression = target.label;
        let referenceLabel = target.label;
        let reference = 'None';
        let type_info = 'ReturnType: Unknown';
        
        let kind: 'method' | 'variable' | 'block_variable' | 'assignment';
        switch (target.kind) {
          case 'block_variable':
            kind = 'block_variable';
            break;
          case 'assignment':
            kind = 'assignment';
            break;
          case 'variable':
            kind = 'variable';
            break;
          default:
            kind = 'method';
        }

        if (target.labelLine != null && target.labelCol != null) {
          const methodPos = convertPrismPosition(target.labelLine, target.labelCol);
          const method = (snap.methods as MethodInfo[]).find(m => m.line === methodPos.line && m.col === methodPos.column);
          if (method) {
            const { info, name } = method;
            referenceLabel = info.owner ? `${info.owner}${info.is_singleton_call ? '.' : '#'}${name}` : name;
            reference = getReferenceUrl(method as any) || 'None';
            type_info = `ReturnType: ${info.type_info || 'Unknown'}`;
            kind = 'method';
          }
        } else {
          const generalPos = convertPrismPosition(target.line, target.col);
          const v = (Array.from(snap.variables) as any[]).find(v => v.line === generalPos.line && v.col === generalPos.column);
          if (v) {
            referenceLabel = v.name || target.label;
            type_info = `Type: ${v.type_info || 'Unknown'}`;
          } else {
            const l = (Array.from(snap.literals) as any[]).find(l => l.line === generalPos.line && l.col === generalPos.column);
            if (l) {
              type_info = `Type: ${l.type_info || 'Unknown'}`;
              kind = 'variable';
            }
          }
        }

        // 実行履歴の整形
        const joinedValues = details.history.map((h: any) => h.result).join(', ');
        const displayValue = joinedValues.length > 20
          ? joinedValues.substring(0, 17) + '...'
          : (joinedValues || details.lastValue || 'None');

        setHoverInfo({
          expression,
          referenceLabel,
          type: type_info,
          receiver: target.receiver || 'None',
          value: displayValue,
          reference,
          kind,
          onPin: () => {
            editor.trigger('hover', 'rubox.inspectValue', target);
          }
        });
      }
    };

    fetchData();
  }, [pos, snap]);

  return hoverInfo;
};
