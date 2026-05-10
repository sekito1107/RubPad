import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { app } from '../state/app';
import { useHoverWidget } from '../hooks/useHoverWidget';
import { useHoverAnalysis } from '../hooks/useHoverAnalysis';

const hoverDomNode = document.createElement('div');

export const Hover = () => {
  const { status } = useSnapshot(app);
  const [isMouseOverWidget, setIsMouseOverWidget] = useState(false);

  // カスタムフックにロジックを委譲
  const { data, pos } = useHoverAnalysis(hoverDomNode, isMouseOverWidget, status.editorReady);
  useHoverWidget(hoverDomNode, pos, status.editorReady);

  if (!data) return null;

  return createPortal(
    <div
      onMouseEnter={() => setIsMouseOverWidget(true)}
      onMouseLeave={() => setIsMouseOverWidget(false)}
      className={clsx(
        'px-3 py-2 rounded shadow-lg text-xs font-mono select-none flex flex-col gap-2 min-w-[200px] border',
        'bg-white/95 border-zinc-200 text-zinc-900',
        'dark:bg-zinc-900/95 dark:border-zinc-700 dark:text-zinc-200'
      )}
    >
        {/* ラベル（種類） */}
        <div className={clsx(
          'font-bold text-sm',
          'text-zinc-800',
          'dark:text-zinc-100'
        )}>{data.label}</div>

        {/* 型 / シグネチャ */}
        <div className={clsx(
          'text-[10px]',
          'text-zinc-500',
          'dark:text-zinc-400'
        )}>{data.type}</div>

        {/* Receiver */}
        <div className={clsx(
          'text-[10px]',
          'text-zinc-500',
          'dark:text-zinc-400'
        )}>Receiver: {data.receiver}</div>

        {/* Reference */}
        <div className={clsx(
          'text-[10px]',
          'text-zinc-500',
          'dark:text-zinc-400'
        )}>
          Reference: {data.reference.startsWith('http') ? (
            <a
              href={data.reference}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline dark:text-blue-400 font-medium"
            >
              {data.label} docs.ruby-lang.org ↗
            </a>
          ) : (
            data.reference
          )}
        </div>

        {/* Value */}
        <div className={clsx(
          'text-[10px]',
          'text-zinc-500',
          'dark:text-zinc-400'
        )}>Value: {data.value}</div>

        {/* アクションボタン */}
        <button
          disabled={data.value === 'None'}
          className={clsx(
            'text-[10px] px-2 py-1.5 rounded font-medium transition-all duration-200',
            data.value === 'None'
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
              : 'bg-zinc-900 text-zinc-50 cursor-pointer shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 active:scale-95'
          )}
        >
          値をエディタに固定
        </button>
      </div>,
    hoverDomNode
  );
};
