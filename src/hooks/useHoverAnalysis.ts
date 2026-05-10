import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { pick, inspect } from '../core/ruby';
import { monacoToPrism } from '../utils/monaco-to-prism';
import { analysis, MethodInfo } from '../state/analysis';
import { getReferenceUrl } from '../core/ruby/reference';
import { convertPrismPosition } from '../utils/prism-to-monaco';

type HoverData = {
  label: string;
  type: string;
  receiver: string;
  value: string;
  reference: string;
  kind: 'method' | 'variable';
};

// モジュールスコープで直前の解析座標を保持（useEffect の再実行を防ぐ）
let globalLastPrismPos = { line: -1, col: -1 };

const resolveHoverMetaData = (
  methods: MethodInfo[],
  variables: any[],
  literals: any[],
  target: any,
  fallbackLabel: string = ''
): { label: string; reference: string; type_info: string; kind: 'method' | 'variable' } => {
  const targetPos = convertPrismPosition(target.line, target.col);
  const matchLine = targetPos.line;
  const matchCol = targetPos.column;

  // 変数・代入・ブロック変数の場合
  if (['variable', 'assignment', 'block_variable'].includes(target.kind)) {
    const v = variables.find(v => v.line === matchLine && v.col === matchCol);
    return {
      label: target.label,
      reference: 'None',
      type_info: v?.type_info || 'Unknown',
      kind: 'variable'
    };
  }

  // リテラルの場合
  if (target.kind === 'expression') {
    const l = literals.find(l => l.line === matchLine && l.col === matchCol);
    return {
      label: target.label,
      reference: 'None',
      type_info: l?.type_info || 'Unknown',
      kind: 'variable'
    };
  }

  // メソッドの場合
  let methodLine = target.labelLine;
  let methodCol = target.labelCol;
  if (methodLine !== undefined && methodCol !== undefined) {
    const pos = convertPrismPosition(methodLine, methodCol);
    methodLine = pos.line;
    methodCol = pos.column;
  }

  const method = methods.find(m => m.line === methodLine && m.col === methodCol);
  if (!method) {
    return { label: fallbackLabel, reference: 'None', type_info: 'Unknown', kind: 'method' };
  }

  const { info, name } = method;
  const label = info.owner ? `${info.owner}${info.is_singleton_call ? '.' : '#'}${name}` : name;
  const reference = getReferenceUrl(method as any) || 'None';

  return { label, reference, type_info: info.type_info || 'Unknown', kind: 'method' };
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
          globalLastPrismPos = { line: -1, col: -1 };
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

      if (e.target.type === monaco.editor.MouseTargetType.CONTENT_EMPTY) {
        return hide();
      }

      // 空白チェック：Monaco の getLineContent を使用して該当座標の文字を確認
      const lineContent = model.getLineContent(newPos.lineNumber);
      const char = lineContent[newPos.column - 1];
      if (!char || !char.trim()) {
        return hide();
      }

      const prismPos = monacoToPrism(newPos);
      if (prismPos.line === globalLastPrismPos.line && prismPos.col === globalLastPrismPos.col) return;

      globalLastPrismPos = prismPos;

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
          target.receiver
        );

        const { label, reference, type_info, kind } = resolveHoverMetaData(
          analysis.methods as MethodInfo[],
          Array.from(analysis.variables) as any[],
          Array.from(analysis.literals) as any[],
          target,
          target.label
        );

        setData({
          label,
          type: type_info,
          receiver: target.receiver || 'None',
          value: details.lastValue || 'None',
          reference,
          kind
        });
      } else {
        hide();
      }
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
