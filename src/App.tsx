import { useSnapshot } from 'valtio'
import clsx from 'clsx'
import { app } from './state/app'
import Header from './components/Header'
import Editor from './components/Editor'

export default function App() {
  const { theme } = useSnapshot(app)

  return (
    <div id="app-container" className={clsx(
      'flex flex-col h-full transition-colors',
      'bg-white text-zinc-900',
      'dark:bg-[#0D1117] dark:text-zinc-100',
      { 'dark': theme === 'dark' }
    )}>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Editor />
      </main>
    </div>
  )
}
