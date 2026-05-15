import { Play, Sun, Moon, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useSnapshot } from 'valtio'
import { app, toggleTheme } from '../state/app'
import { editor } from '../state/editor'
import { yarv, setPhase } from '../state/yarv'
import { updateOutput } from '../state/terminal'
import { useExecution } from '../hooks/useExecution'
import { saveTheme } from '../core/persistence/app'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

function RunButton() {
  const { phase } = useSnapshot(yarv)
  const { execute } = useExecution()

  const handleRun = async () => {
    execute()
  }

  return (
    <button
      onClick={handleRun}
      disabled={phase !== 'ready'}
      className={`
        flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        bg-rose-600 text-white hover:bg-rose-700
        dark:bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.2)]
      `}
      id="run-button"
    >
      <Play size={16} fill="currentColor" />
      <span>Run</span>
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  return (
    <>
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

      <div className="flex items-center gap-4">
        {/* Share Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95
            bg-indigo-500 text-white hover:bg-indigo-600
            dark:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.2)]
          `}
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        <div className="hidden md:flex items-center gap-3 select-none">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] italic ml-2">
            Quick Run
          </span>
          <div className="flex items-center gap-1.5">
            <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-amber-500/10 border border-slate-300 dark:border-amber-500/40 shadow-sm dark:shadow-[0_0_10px_rgba(245,158,11,0.2)] text-slate-500 dark:text-amber-400 transition-colors">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <span className="text-[10px] text-slate-300 dark:text-amber-900 font-light">+</span>
            <kbd className="min-w-[22px] h-5 flex items-center justify-center px-1.5 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-amber-500/10 border border-slate-300 dark:border-amber-500/40 shadow-sm dark:shadow-[0_0_10px_rgba(245,158,11,0.2)] text-slate-500 dark:text-amber-400 transition-colors">
              Enter
            </kbd>
          </div>
        </div>
        <RunButton />
        <ThemeToggleButton />
      </div>
    </header>
    {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </>
  )
}
import ShareModal from './share/ShareModal'
