
export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-4">
        <h2 className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
          Terminal / Output
        </h2>
        {/* TODO: Add StatusIndicator here */}
      </div>
    </div>
  );
}
