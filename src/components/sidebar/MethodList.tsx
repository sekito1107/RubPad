import { useSnapshot } from 'valtio';
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

  const uniqueMethods = Array.from(new Set(methods.map(m => m.name))).sort();

  return (
    <ul className="py-1">
      {uniqueMethods.map(name => (
        <li key={name}>
          <a
            href={getReferenceUrl(name)}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
          >
            <span className="font-mono">{name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
