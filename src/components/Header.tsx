import { Play, Sun, Moon } from 'lucide-react'
import { useSnapshot } from 'valtio'
import { app, toggleTheme } from '../state/app'
import { editor } from '../state/editor'
import { yarv, setPhase } from '../state/yarv'
import { updateOutput } from '../state/terminal'
import { execute } from '../core/ruby'
import { saveTheme } from '../core/persistence/app'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function RunButton() {
  const { phase } = useSnapshot(yarv)
  const modifierKey = isMac ? '⌘' : 'Ctrl'

  const handleRun = async () => {
    if (phase !== 'ready') return
    setPhase('running')
    const result = await execute(editor.code)
    updateOutput(result)
    setPhase('ready')
  }

  return (
    <button
      onClick={handleRun}
      disabled={phase !== 'ready'}
      className={`
        flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        bg-emerald-600 text-white hover:bg-emerald-700
        dark:bg-emerald-600
      `}
      id="run-button"
    >
      <Play size={16} fill="currentColor" />
      <span>Run</span>
      <div className="hidden sm:flex items-center gap-0.5 text-[10px] text-white/80 font-mono ml-1">
        <kbd className="px-1 py-0.5 rounded bg-black/20 border border-black/10 dark:bg-black/30 dark:border-white/10">{modifierKey}</kbd>
        <span>+</span>
        <kbd className="px-1 py-0.5 rounded bg-black/20 border border-black/10 dark:bg-black/30 dark:border-white/10">Enter</kbd>
      </div>
    </button>
  )
}

function ThemeToggleButton() {
  const { theme } = useSnapshot(app)

  const handleToggle = () => {
    toggleTheme()
    saveTheme(app.theme)
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        p-2 rounded-md transition-colors
        text-slate-400 hover:text-slate-600 hover:bg-slate-100
        dark:hover:text-slate-200 dark:hover:bg-white/5
      `}
      title="テーマ切り替え"
      id="theme-toggle-button"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

function RubyVersion() {
  const { phase, version } = useSnapshot(yarv)

  return (
    <div className={`
      text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors select-none
      text-slate-400 bg-slate-100 border-slate-200
      dark:text-slate-500 dark:bg-white/5 dark:border-white/10
    `}>
      {phase === 'loading' ? 'Now loading...' : version}
    </div>
  )
}

export default function Header() {
  return (
    <header className={`
      h-14 border-b flex items-center justify-between px-4 shrink-0 transition-colors
      bg-white border-slate-200
      dark:bg-[#0D1117] dark:border-white/5
    `}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" className="w-8 h-8" alt="Rubox Logo" />
          <span className={`
            text-lg font-logo font-bold tracking-tight
            text-slate-800
            dark:text-gray-100
          `}>
            Rubox
          </span>
        </div>
        <RubyVersion />
      </div>

      <div className="flex items-center gap-2">
        <RunButton />
        <ThemeToggleButton />
      </div>
    </header>
  )
}
