import { useSnapshot } from 'valtio';
import { terminal } from '../state/terminal';

export default function Terminal() {
  const { output } = useSnapshot(terminal);

  return (
    <div id="terminal-panel" className="w-full h-full p-4 overflow-auto bg-black/10">
      <pre className="font-mono text-sm leading-relaxed">{output}</pre>
    </div>
  );
}
