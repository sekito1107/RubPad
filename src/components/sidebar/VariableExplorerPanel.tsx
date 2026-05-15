import { useSnapshot } from 'valtio';
import { liveVariablesState } from '../../state/live-variables';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function VariableExplorerPanel() {
  const { variables, status } = useSnapshot(liveVariablesState);
  const varEntries = Object.entries(variables);

  return (
    <div id="live-variables-panel" className="flex-1 flex flex-col min-h-0 bg-[#D6C5B0] dark:bg-[#0D1117]">
      <div className={clsx(
        'py-2 px-4 border-b transition-colors',
        'bg-[#C4B4A0] border-[#B2A28E]',
        'dark:bg-zinc-800/50 dark:border-zinc-700'
      )}>
        <h2 className={clsx(
          'text-[10px] font-bold uppercase tracking-widest',
          'text-zinc-500',
          'dark:text-white'
        )}>
          Live Variable States
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {status === 'timeout' && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="text-xs">
              無限ループを検出したため中断しました。直前までの状態を表示しています。
            </div>
          </div>
        )}

        {varEntries.length === 0 ? (
          <div className="text-sm text-zinc-400 dark:text-zinc-600 italic">
            No variables defined.
          </div>
        ) : (
          <div className="space-y-3">
            {varEntries.map(([name, value]) => (
              <div key={name} className="group border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">{name}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600">=</span>
                </div>
                <div className="text-sm font-mono break-all text-zinc-700 dark:text-zinc-300">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
