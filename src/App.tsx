import { useSnapshot } from 'valtio'
import clsx from 'clsx'
import { app } from './state/app'
import Header from './components/Header'

export default function App() {
  const { theme } = useSnapshot(app)

  return (
    <div className={clsx(
      'flex flex-col h-full transition-colors',
      {
        'dark bg-[#0D1117] text-zinc-100': theme === 'dark',
        'bg-white text-zinc-900': theme === 'light'
      }
    )}>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Rubox Rebuild</h1>
      </main>
    </div>
  )
}
