import clsx from 'clsx'
import MethodList from './sidebar/MethodList'

export default function Sidebar() {
  return (
    <aside className={clsx(
      'w-80 flex flex-col border-l transition-colors',
      'border-zinc-200 bg-zinc-50',
      'dark:border-zinc-800 dark:bg-[#0D1117]'
    )}>
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
    </aside>
  )
}
