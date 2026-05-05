import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import clsx from 'clsx'
import { app } from './state/app'
import { useInitialize } from './hooks/useInitialize'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import Editor from './components/Editor'
import Terminal from './components/Terminal'
import Sidebar from './components/Sidebar'

export default function App() {
  const { theme } = useSnapshot(app)

  useInitialize()
  useTheme()

  return (
    <div id="app-container" className={clsx(
      'flex flex-col h-full transition-colors',
      'bg-white text-zinc-900',
      'dark:bg-[#0D1117] dark:text-zinc-100',
      { 'dark': theme === 'dark' }
    )}>
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
          <div className="h-1/3 border-t border-zinc-200 dark:border-zinc-800">
            <Terminal />
          </div>
        </div>

        <Sidebar />
      </main>
    </div>
  )
}
