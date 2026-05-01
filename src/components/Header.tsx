import { Sun, Moon } from 'lucide-react'
import { useSnapshot } from 'valtio'
import { app, toggleTheme } from '../state/app'

function ThemeToggleButton() {
  const { theme } = useSnapshot(app)

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-md transition-colors text-slate-400
        hover:text-slate-600 hover:bg-slate-100
        dark:hover:text-slate-200 dark:hover:bg-white/5
      `}
      title="テーマ切り替え"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default function Header() {
  return (
    <header className={`
      h-14 border-b flex items-center justify-between px-4 shrink-0 transition-colors
      bg-white border-slate-200
      dark:bg-[#0D1117] dark:border-white/5
    `}>
      <div className="flex items-center gap-2">
        <img src="/icon.svg" className="w-8 h-8" alt="Rubox Logo" />
        <span className="text-lg font-logo font-bold text-slate-800 dark:text-gray-100 tracking-tight">
          Rubox
        </span>
      </div>

      <ThemeToggleButton />
    </header>
  )
}
