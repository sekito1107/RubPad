import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { Code } from 'lucide-react';
import { analysis } from '../../state/analysis';
import { getReferenceUrl } from '../../core/ruby/reference';

export default function MethodList() {
  const { methods } = useSnapshot(analysis);

  if (methods.length === 0) {
    return (
      <div className="p-4 text-xs text-zinc-400 italic">
        No methods detected yet.
      </div>
    );
  }

  const uniqueMethods = Array.from(
    new Map(methods.map(m => [`${m.className || ''}#${m.name}`, m])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col">
      {uniqueMethods.map((method, index) => (
        <a
          key={`${method.name}-${index}`}
          href={getReferenceUrl(method.name, method.className)}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "group relative flex items-start justify-between px-4 py-2.5 border-b transition-all",
            "border-zinc-200/5 hover:bg-zinc-100/50",
            "dark:border-white/5 dark:hover:bg-white/[0.04]"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className={clsx(
              "text-[13px] font-semibold tracking-tight transition-colors",
              "text-zinc-800 group-hover:text-blue-600",
              "dark:text-zinc-100 dark:group-hover:text-blue-400"
            )}>
              {method.name}
            </span>
            <span className={clsx(
              "text-[10px] font-mono leading-tight transition-colors",
              "text-blue-600/70",
              "dark:text-blue-400/60"
            )}>
              {method.className ? `${method.className}#${method.name}` : method.name}
            </span>
          </div>
          <Code className={clsx(
            "w-3 h-3 mt-1 transition-all duration-300",
            "text-[#e2ff43] opacity-70 group-hover:opacity-100 group-hover:drop-shadow-[0_0_5px_rgba(226,255,67,0.5)]"
          )} />
        </a>
      ))}
    </div>
  );
}
