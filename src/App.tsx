import Header from './components/Header'

export default function App() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0D1117] transition-colors">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Rubox Rebuild</h1>
      </main>
    </div>
  )
}
