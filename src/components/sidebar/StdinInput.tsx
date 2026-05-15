import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Keyboard, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { stdinState, setStdin, setActiveSlot } from '../../state/stdin';
import { useStdinSync } from '../../hooks/useStdinSync';
import { useExecution } from '../../hooks/useExecution';
import clsx from 'clsx';

export default function StdinInput() {
  const [isOpen, setIsOpen] = useState(false);
  const snap = useSnapshot(stdinState);
  const { execute } = useExecution();

  // Ruby VM との状態同期を開始
  useStdinSync();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      execute();
    }
  };

  const placeholders = [
    "Enter input for Slot 1...",
    "Enter input for Slot 2...",
    "Enter input for Slot 3..."
  ];

  const hasContent = snap.slots.some(s => s.trim().length > 0);

  return (
    <div className={clsx(
      'flex flex-col transition-all duration-300 ease-in-out font-sans border-t border-zinc-200 dark:border-zinc-800 overflow-hidden',
      isOpen ? 'h-[320px]' : 'h-[37px]'
    )}>
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full py-2.5 px-4 flex items-center justify-between transition-colors outline-none group',
          'bg-zinc-100/80 hover:bg-zinc-200/50',
          'dark:bg-zinc-800/30 dark:hover:bg-zinc-800/60',
          isOpen && 'dark:bg-zinc-800/50'
        )}
      >
        <div className="flex items-center gap-2">
          <Keyboard 
            size={13} 
            className={clsx(
              'transition-colors',
              isOpen || hasContent ? 'text-blue-500' : 'text-zinc-500 dark:text-zinc-400'
            )} 
          />
          <h2 className={clsx(
            'text-[10px] font-bold uppercase tracking-[0.15em] transition-colors',
            isOpen || hasContent ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-300'
          )}>
            Standard Input
          </h2>
          {!isOpen && hasContent && (
            <div className="flex items-center gap-1 ml-2">
              {snap.slots.map((s, i) => (
                <div 
                  key={i}
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    s.trim().length > 0 
                      ? 'bg-blue-500' 
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  )}
                />
              ))}
            </div>
          )}
          {isOpen && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono">
              Slot {snap.activeSlot + 1}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown size={14} className="text-zinc-400" />
        ) : (
          <ChevronRight size={14} className="text-zinc-400" />
        )}
      </button>

      {/* Collapsible Content */}
      <div className={clsx(
        'overflow-hidden transition-all duration-300 ease-in-out flex flex-col',
        isOpen ? 'flex-1 opacity-100' : 'h-0 opacity-0'
      )}>
        {/* Slot Selector Toggles */}
        <div className="px-4 pt-4 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActiveSlot(i)}
              className={clsx(
                'flex-1 py-1 text-[9px] font-bold rounded-md transition-all border',
                snap.activeSlot === i 
                  ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                  : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              {i + 1}
            </button>
          ))}
          <div className="ml-2 p-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50">
            <Layers size={10} className="text-zinc-400" />
          </div>
        </div>

        {/* Textarea Area */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="relative flex-1 min-h-[120px]">
            <textarea
              value={snap.slots[snap.activeSlot]}
              onChange={(e) => setStdin(snap.activeSlot, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[snap.activeSlot]}
              className={clsx(
                'w-full h-full resize-none p-4 text-sm leading-relaxed rounded-lg transition-all border outline-none',
                'bg-white border-zinc-200 text-zinc-900',
                'dark:bg-[#0D1117] dark:border-zinc-800 dark:text-zinc-200',
                'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
                'scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700',
                'focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5'
              )}
            />
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 px-1 flex justify-between">
            <span>Slot: {snap.activeSlot + 1} / 3</span>
            <span className="opacity-60 italic text-[8px]">Available for Ruby $stdin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
