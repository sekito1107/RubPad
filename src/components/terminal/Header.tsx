import StatusIndicator from './StatusIndicator';

export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-200 dark:border-zinc-800 bg-[#F1F5F9] dark:bg-zinc-900/50 min-h-[36px]">
      <div className="flex items-center gap-6">
        <h2 className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase select-none">
          Terminal / Output
        </h2>
        <StatusIndicator />
      </div>
    </div>
  );
}
