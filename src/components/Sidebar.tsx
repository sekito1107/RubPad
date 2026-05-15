import clsx from 'clsx'
import { useState } from 'react'
import MethodList from './sidebar/MethodList'
import StdinInput from './sidebar/StdinInput'
import MethodSearchPanel from './sidebar/MethodSearchPanel'
import VariableExplorerPanel from './sidebar/VariableExplorerPanel'

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'methods' | 'variables'>('methods')

  return (
    <aside className={clsx(
      'w-80 flex flex-col border-l transition-colors',
      'border-[#B2A28E] bg-[#C4B4A0]',
      'dark:border-zinc-800 dark:bg-[#0D1117]'
    )}>
      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('methods')}
          className={clsx(
            'flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'methods' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          )}
        >
          Methods
        </button>
        <button
          onClick={() => setActiveTab('variables')}
          className={clsx(
            'flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all',
            activeTab === 'variables' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          )}
        >
          Variables
        </button>
      </div>

      {activeTab === 'methods' ? (
        <>
          <MethodSearchPanel />
          <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-200 dark:border-zinc-800">
            <div className={clsx(
              'py-2 px-4 border-b transition-colors',
              'bg-zinc-100 border-zinc-200',
              'dark:bg-zinc-800/50 dark:border-zinc-700'
            )}>
              <h2 className={clsx(
                'text-[10px] font-bold uppercase tracking-widest',
                'text-zinc-500',
                'dark:text-white'
              )}>
                Methods In Use
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MethodList />
            </div>
          </div>
        </>
      ) : (
        <VariableExplorerPanel />
      )}

      {/* Stdin Section (Visual Only) */}
      <div className="shrink-0 flex flex-col">
        <StdinInput />
      </div>
    </aside>
  )
}
