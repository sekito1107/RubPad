import { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useSnapshot } from 'valtio';
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
};

// モジュールスコープで直前の解析座標を保持（useEffect の再実行を防ぐ）
let globalLastPrismPos = { line: -1, col: -1 };

const resolveMethodReference = (
  methods: MethodInfo[],
  labelLine?: number,
  labelCol?: number,
  fallbackLabel: string = ''
) => {
  const method = methods.find(m => m.line === labelLine && m.col === labelCol);
  if (!method) {
    return { label: fallbackLabel, reference: 'None' };
  }

  const { info, name } = method;
  const label = info.owner ? `${info.owner}${info.is_singleton_call ? '.' : '#'}${name}` : name;
  const reference = getReferenceUrl(method as any) || 'None';

  return { label, reference };
};

/**
 * マウス移動の監視と Ruby 解析を担当するフック
 */
export const useHoverAnalysis = (
  domNode: HTMLElement,
  isMouseOverWidget: boolean,
  editorReady: boolean
) => {
  const [data, setData] = useState<HoverData | null>(null);
  const [pos, setPos] = useState<monaco.IPosition | null>(null);
  const { methods } = useSnapshot(analysis);

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

      // 空白チェック：Monaco の getLineContent を使用して該当座標の文字を確認
      const lineContent = model.getLineContent(newPos.lineNumber);
      const char = lineContent[newPos.column - 1];
      if (!char || char.trim().length === 0) {
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

        let matchLine = target.labelLine;
        let matchCol = target.labelCol;
        if (matchLine !== undefined && matchCol !== undefined) {
          const pos = convertPrismPosition(matchLine, matchCol);
          matchLine = pos.line;
          matchCol = pos.column;
        }

        const { label, reference } = resolveMethodReference(
          methods as MethodInfo[],
          matchLine,
          matchCol,
          target.label
        );

        setData({
          label,
          type: 'Unknown',
          receiver: target.receiver || 'None',
          value: details.lastValue || 'None',
          reference
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
  }, [editorReady, isMouseOverWidget, domNode, methods]);

  return { data, pos };
};
