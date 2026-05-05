import clsx from 'clsx'

export default function Sidebar() {
  return (
    <aside className={clsx(
      'w-80 flex flex-col border-l transition-colors',
      'border-zinc-200 bg-zinc-50',
      'dark:border-zinc-800 dark:bg-[#0D1117]'
    )}>
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Available Methods
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm text-zinc-400 italic">
          No methods detected yet.
        </div>
      </div>
    </aside>
  )
}
