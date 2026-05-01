import { useSnapshot } from 'valtio'
import clsx from 'clsx'
import { app } from './state/app'
import Header from './components/Header'

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
        <h1 className="text-2xl font-bold text-red-600">Rubox Rebuild</h1>
      </main>
    </div>
  )
}
