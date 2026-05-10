import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { pick, inspect } from '../core/ruby';
import { monacoToPrism } from '../utils/monaco-to-prism';
import { analysis, MethodInfo } from '../state/analysis';
import { getReferenceUrl } from '../core/ruby/reference';
import { convertPrismPosition } from '../utils/prism-to-monaco';

type HoverData = {
  expression: string;
  referenceLabel: string;
  type: string;
  receiver: string;
  value: string;
  reference: string;
  kind: 'method' | 'variable';
  onPin: () => void;
};


const resolveHoverMetaData = (
  methods: MethodInfo[],
  variables: any[],
  literals: any[],
  target: any,
  fallbackLabel: string = ''
): { expression: string; referenceLabel: string; reference: string; type_info: string; kind: 'method' | 'variable' } => {
  // メソッド呼び出しの照合
  if (target.labelLine != null && target.labelCol != null) {
    const methodPos = convertPrismPosition(target.labelLine, target.labelCol);
    const method = methods.find(m => m.line === methodPos.line && m.col === methodPos.column);
    if (method) {
      const { info, name } = method;
      const canonicalName = info.owner ? `${info.owner}${info.is_singleton_call ? '.' : '#'}${name}` : name;
      const reference = getReferenceUrl(method as any) || 'None';
      return {
        expression: target.label,
        referenceLabel: canonicalName,
        reference,
        type_info: `ReturnType: ${info.type_info || 'Unknown'}`,
        kind: 'method'
      };
    }
  }

  // 変数・代入・定数・リテラルの照合
  const generalPos = convertPrismPosition(target.line, target.col);

  const v = variables.find(v => v.line === generalPos.line && v.col === generalPos.column);
  if (v) {
    const reference = 'None';
    return {
      expression: target.label,
      referenceLabel: v.name || target.label,
      reference,
      type_info: `Type: ${v.type_info || 'Unknown'}`,
      kind: 'variable'
    };
  }

  const l = literals.find(l => l.line === generalPos.line && l.col === generalPos.column);
  if (l) {
    return {
      expression: target.label,
      referenceLabel: target.label,
      reference: 'None',
      type_info: `Type: ${l.type_info || 'Unknown'}`,
      kind: 'variable'
    };
  }

  // フォールバック
  return {
    expression: fallbackLabel,
    referenceLabel: fallbackLabel,
    reference: 'None',
    type_info: 'ReturnType: Unknown',
    kind: 'method'
  };
};

export const useHoverAnalysis = (
  domNode: HTMLElement,
  isMouseOverWidget: boolean,
  editorReady: boolean
) => {
  const [data, setData] = useState<HoverData | null>(null);
  const [pos, setPos] = useState<monaco.IPosition | null>(null);

  useEffect(() => {
    if (!editorReady) return;

    const editor = monaco.editor.getEditors()[0];
    const model = editor?.getModel();
    if (!editor || !model) return;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let analysisTimer: ReturnType<typeof setTimeout> | null = null;

    const clearHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const hide = () => {
      clearHideTimer();
      hideTimer = setTimeout(() => {
        if (!isMouseOverWidget) {
          setData(null);
          setPos(null);
          if (analysisTimer) {
            clearTimeout(analysisTimer);
            analysisTimer = null;
          }
          domNode.style.display = 'none';
        }
      }, 150);
    };

    if (isMouseOverWidget) {
      clearHideTimer();
    } else if (domNode.style.display === 'block') {
      hide();
    }

    const moveListener = editor.onMouseMove(async (e) => {
      if (isMouseOverWidget) {
        clearHideTimer();
        return;
      }

      const newPos = e.target.position;
      if (!newPos) return hide();

      if (analysisTimer) {
        clearTimeout(analysisTimer);
        analysisTimer = null;
      }

      if (e.target.type === monaco.editor.MouseTargetType.CONTENT_EMPTY) {
        return hide();
      }

      // 空白チェック：Monaco の getLineContent を使用して該当座標の文字を確認
      const lineContent = model.getLineContent(newPos.lineNumber);
      const char = lineContent[newPos.column - 1];
      if (!char || char.trim().length === 0) {
        return hide();
      }

      analysisTimer = setTimeout(async () => {
        const prismPos = monacoToPrism(newPos);
        const code = model.getValue();
        const target = await pick(code, prismPos.line, prismPos.col);

        if (target.label) {
          clearHideTimer();
          setPos(newPos);
          domNode.style.display = 'block';

          const details = await inspect(
            code,
            target.expression,
            target.line,
            target.kind,
            target.endLine,
            target.preExecutionTarget
          );

          const { expression, referenceLabel, reference, type_info, kind } = resolveHoverMetaData(
            analysis.methods as MethodInfo[],
            Array.from(analysis.variables) as any[],
            Array.from(analysis.literals) as any[],
            target,
            target.label
          );

          setData({
            expression,
            referenceLabel,
            type: type_info,
            receiver: target.receiver || 'None',
            value: details.lastValue || 'None',
            reference,
            kind,
            onPin: () => {
              const editor = monaco.editor.getEditors()[0];
              if (editor) {
                editor.trigger('hover', 'rubox.inspectValue', target);
              }
            }
          });
        } else {
          hide();
        }
      }, 150);
    });

    const leaveListener = editor.onMouseLeave(() => {
      hide();
    });

    return () => {
      clearHideTimer();
      moveListener.dispose();
      leaveListener.dispose();
    };
  }, [editorReady, isMouseOverWidget, domNode]);

  return { data, pos };
};
