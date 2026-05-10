import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { Code } from 'lucide-react';
import { analysis } from '../../state/analysis';
import { getReferenceUrl } from '../../core/ruby/reference';

const SectionHeader = ({ title }: { title: string }) => (
  <div className={clsx(
    'py-1.5 px-4 border-b transition-colors',
    'bg-zinc-200/30 border-zinc-200/50',
    'dark:bg-white/[0.02] dark:border-white/5'
  )}>
    <h3 className={clsx(
      'text-[9px] font-bold uppercase tracking-wider',
      'text-zinc-400',
      'dark:text-zinc-500'
    )}>
      {title}
    </h3>
  </div>
);

export default function MethodList() {
  const { methods } = useSnapshot(analysis);

  if (methods.length === 0) {
    return (
      <div className={clsx(
        'p-4 text-xs italic',
        'text-zinc-400',
        'dark:text-zinc-500'
      )}>
        No methods detected yet.
      </div>
    );
  }

  const allUnique = methods.reduce((acc, method) => {
    const { info } = method;
    const sep = info.is_singleton_call ? '.' : '#';
    const ownerName = info.owner || 'Unknown';
    const id = `${ownerName}${sep}${method.name}`;
    const displayName = `${ownerName}${sep}${method.name}`;

    if (!acc.find(m => m.id === id)) {
      acc.push({ ...method, id, displayName });
    }
    return acc;
  }, [] as (any & { id: string, displayName: string })[]);

  const officialMethods = allUnique.filter(m => m.info.owner).sort((a, b) => a.displayName.localeCompare(b.displayName));
  const userMethods = allUnique.filter(m => !m.info.owner).sort((a, b) => a.name.localeCompare(b.name));

  const renderMethodItem = (method: any) => {
    const url = getReferenceUrl(method);
    const isLink = !!url;

    const Content = (
      <>
        <div className="flex flex-col gap-0.5">
          <span className={clsx(
            'text-[13px] font-semibold tracking-tight transition-colors',
            'text-zinc-800 group-hover:text-blue-600',
            'dark:text-zinc-100 dark:group-hover:text-blue-400'
          )}>
            {method.name}
          </span>
          {method.info.owner && (
            <span className={clsx(
              'text-[10px] font-mono leading-tight transition-colors',
              'text-blue-600/70',
              'dark:text-blue-400/60'
            )}>
              {method.displayName}
            </span>
          )}
        </div>
        <Code className={clsx(
          'w-3 h-3 mt-1 transition-all duration-300',
          isLink ? 'text-[#e2ff43]' : 'text-[#39ff14]',
          'opacity-70 group-hover:opacity-100 group-hover:drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]'
        )} />
      </>
    );

    const commonClass = clsx(
      'group relative flex items-start justify-between px-4 py-2.5 border-b transition-all',
      'border-zinc-200/5',
      'dark:border-white/5'
    );

    if (isLink) {
      return (
        <a
          key={method.id}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            commonClass,
            'hover:bg-zinc-100/50',
            'dark:hover:bg-white/[0.04]'
          )}
        >
          {Content}
        </a>
      );
    } else {
      return (
        <div key={method.id} className={clsx(
          commonClass,
          'cursor-default',
          ''
        )}>
          {Content}
        </div>
      );
    }
  };

  return (
    <div data-testid="method-list" className="flex flex-col">
      {officialMethods.length > 0 && (
        <div data-testid="official-section" className="flex flex-col">
          <SectionHeader title="Official" />
          {officialMethods.map(renderMethodItem)}
        </div>
      )}
      {userMethods.length > 0 && (
        <div data-testid="user-defined-section" className="flex flex-col">
          <SectionHeader title="User Defined" />
          {userMethods.map(renderMethodItem)}
        </div>
      )}
    </div>
  );
}
