import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import clsx from 'clsx'
import { app } from './state/app'
import { setPhase, setVersion } from './state/yarv'
import { execute } from './core/ruby'
import Header from './components/Header'
import Editor from './components/Editor'
import Terminal from './components/Terminal'

export default function App() {
  const { theme } = useSnapshot(app)

  useEffect(() => {
    execute('puts RUBY_VERSION').then((version) => {
      setVersion(version.trim())
      setPhase('ready')
    })
  }, [])

  return (
    <div id="app-container" className={clsx(
      'flex flex-col h-full transition-colors',
      'bg-white text-zinc-900',
      'dark:bg-[#0D1117] dark:text-zinc-100',
      { 'dark': theme === 'dark' }
    )}>
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
        <div className="h-1/3 border-t border-zinc-200 dark:border-zinc-800">
          <Terminal />
        </div>
      </main>
    </div>
  )
}
