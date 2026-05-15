import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { app } from '../../state/app';

export default function StatusIndicator() {
  const { status } = useSnapshot(app);

  const isRubyReady = status.rbsReady;
  const isRubyInitializing = status.wasmReady && !status.rbsReady;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        testId="status-editor"
        icon="⌨️" 
        label="Editor" 
        ready={status.editorReady} 
        activeColor="bg-blue-500" 
        shadowColor="shadow-blue-500/50"
        tooltip="Monaco Editor is ready"
      />
      <Badge 
        testId="status-ruby"
        icon="💎" 
        label="Ruby" 
        ready={isRubyReady} 
        initializing={isRubyInitializing}
        activeColor="bg-emerald-500" 
        shadowColor="shadow-emerald-500/50"
        tooltip={isRubyReady ? "Ruby is ready" : isRubyInitializing ? "Initializing..." : "Starting..."}
      />
      <span className={clsx(
        'text-[9px] italic ml-1 select-none whitespace-nowrap',
        'text-zinc-500',
        'dark:text-zinc-300'
      )}>
        — GLOW INDICATES SYSTEM IS READY TO USE
      </span>
    </div>
  );
}

interface BadgeProps {
  testId: string;
  icon: string;
  label: string;
  ready: boolean;
  initializing?: boolean;
  activeColor: string;
  shadowColor: string;
  tooltip: string;
}

function Badge({ testId, icon, label, ready, initializing, activeColor, shadowColor, tooltip }: BadgeProps) {
  return (
    <div 
      title={tooltip}
      data-testid={testId}
      data-ready={ready}
      className={clsx(
        'flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300 cursor-help',
        'bg-white/50 border border-zinc-200 hover:border-zinc-300 hover:bg-white',
        'dark:bg-zinc-800/50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
      )}
    >
      <span className="text-[12px] leading-none grayscale-[0.5] contrast-[0.8]">{icon}</span>
      <div className="relative">
        <div className={clsx(
          'w-1.5 h-1.5 rounded-full transition-all duration-700',
          ready ? `${activeColor} ${shadowColor} shadow-[0_0_8px]` : initializing ? 'bg-yellow-500 shadow-yellow-500/50 shadow-[0_0_8px] animate-pulse' : 'bg-zinc-300',
          ready || initializing ? '' : 'dark:bg-zinc-600'
        )} />
      </div>
      <span className={clsx(
        'text-[9px] font-black tracking-widest uppercase select-none',
        'text-zinc-400',
        'dark:text-zinc-500'
      )}>
        {label}
      </span>
    </div>
  );
}
