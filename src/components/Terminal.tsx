import { useSnapshot } from 'valtio';
import { terminal } from '../state/terminal';

import Header from './terminal/Header';

export default function Terminal() {
  const { output } = useSnapshot(terminal);

  return (
    <div id="terminal-panel" className="flex flex-col w-full h-full bg-zinc-50/50 dark:bg-black/20">
      <Header />
      <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed">
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
