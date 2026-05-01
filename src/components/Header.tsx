export default function Header() {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0D1117] flex items-center px-4 shrink-0 transition-colors">
      <div className="flex items-center gap-2">
        <img src="/icon.svg" className="w-8 h-8" alt="Rubox Logo" />
        <span className="text-lg font-logo font-bold text-slate-800 dark:text-gray-100 tracking-tight">
          Rubox
        </span>
      </div>
    </header>
  );
}
