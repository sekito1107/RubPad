import { useSnapshot } from 'valtio';
import { app } from '../../state/app';

export default function StatusIndicator() {
  const { status } = useSnapshot(app);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        icon="⌨️" 
        label="Editor" 
        ready={status.editorReady} 
        activeColor="bg-blue-500" 
        shadowColor="shadow-blue-500/50"
        tooltip="Monaco Editor is ready"
      />
      <Badge 
        icon="💎" 
        label="Runtime" 
        ready={status.wasmReady} 
        activeColor="bg-emerald-500" 
        shadowColor="shadow-emerald-500/50"
        tooltip="Ruby WASM Runtime is ready"
      />
      <Badge 
        icon="🔍" 
        label="Analyzer" 
        ready={status.rbsReady} 
        activeColor="bg-purple-500" 
        shadowColor="shadow-purple-500/50"
        tooltip="RBS Analyzer is ready"
      />
    </div>
  );
}

interface BadgeProps {
  icon: string;
  label: string;
  ready: boolean;
  activeColor: string;
  shadowColor: string;
  tooltip: string;
}

function Badge({ icon, label, ready, activeColor, shadowColor, tooltip }: BadgeProps) {
  return (
    <div 
      title={tooltip}
      className={`
        flex items-center gap-2 px-2 py-1 rounded-md 
        bg-white/50 dark:bg-zinc-800/50 
        border border-zinc-200 dark:border-zinc-700 
        transition-all duration-300 cursor-help
        hover:border-zinc-300 dark:hover:border-zinc-600
        hover:bg-white dark:hover:bg-zinc-800
      `}
    >
      <span className="text-[12px] leading-none grayscale-[0.5] contrast-[0.8]">{icon}</span>
      <div className="relative">
        <div className={`
          w-1.5 h-1.5 rounded-full transition-all duration-700
          ${ready ? `${activeColor} ${shadowColor} shadow-[0_0_8px]` : 'bg-zinc-300 dark:bg-zinc-600'}
        `} />
      </div>
      <span className="text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase select-none">
        {label}
      </span>
    </div>
  );
}
