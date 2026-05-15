import { useEffect, useState, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import clsx from 'clsx';
import { ExternalLink, ChevronDown, ChevronRight, BookOpen, Search } from 'lucide-react';
import { methodSearch } from '../../state/method-search';
import { analysis } from '../../state/analysis';
import { fetchClassMethods } from '../../core/ruby';
import { getReferenceUrl } from '../../core/ruby/reference';

const STANDARD_CLASSES = ['String', 'Integer', 'Array', 'Hash', 'Symbol', 'TrueClass', 'FalseClass', 'NilClass'];

const cleanClassName = (typeInfo: string | null): string | null => {
  if (!typeInfo || typeInfo === 'Unknown') return null;
  let name = typeInfo.replace(/\?$/, '');
  name = name.split('[')[0];
  name = name.split('|')[0].trim();
  if (/^[A-Z][A-Za-z0-9_]*(::[A-Z][A-Za-z0-9_]*)*$/.test(name)) {
    return name;
  }
  return null;
};

export default function MethodSearchPanel() {
  const searchSnap = useSnapshot(methodSearch);
  const analysisSnap = useSnapshot(analysis);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // analysisから一意なクラスを抽出する（リテラルと変数から）
  const analysisClasses = useMemo(() => {
    const classes = new Set<string>();
    analysisSnap.literals.forEach(l => {
      const name = cleanClassName(l.type_info);
      if (name) classes.add(name);
    });
    analysisSnap.variables.forEach(v => {
      const name = cleanClassName(v.type_info);
      if (name) classes.add(name);
    });
    return Array.from(classes);
  }, [analysisSnap.literals, analysisSnap.variables]);

  // 標準クラスと抽出したクラスを結合する
  const availableClasses = useMemo(() => {
    const combined = new Set<string>();
    
    // 標準クラスを常に先頭に追加する
    STANDARD_CLASSES.forEach(c => combined.add(c));
    
    // 解析したクラスを追加する
    analysisClasses.forEach(c => combined.add(c));
    
    return Array.from(combined);
  }, [analysisClasses]);

  // 初期クラスの選択
  useEffect(() => {
    if (!searchSnap.selectedClass && availableClasses.length > 0) {
      methodSearch.selectedClass = availableClasses[0];
    }
  }, [availableClasses, searchSnap.selectedClass]);

  // 選択したクラスが変更されたらメソッド一覧を取得する
  useEffect(() => {
    if (searchSnap.selectedClass) {
      fetchClassMethods(searchSnap.selectedClass).then(methods => {
        methodSearch.methods = methods;
        setSearchQuery(''); // クラスが切り替わったら検索クエリをリセット
      }).catch(() => {
        methodSearch.methods = [];
      });
    }
  }, [searchSnap.selectedClass]);

  // リファレンスURLが存在するメソッドだけに絞り込む
  const referenceMethods = useMemo(() => {
    return searchSnap.methods.reduce((acc, m) => {
      const mockMethod: any = {
        name: m.name,
        info: {
          owner: m.owner,
          is_singleton_call: false,
          has_instance: true,
          has_singleton: false,
          owner_type: 'class'
        }
      };
      const url = getReferenceUrl(mockMethod);
      if (url) {
        acc.push({ ...m, url });
      }
      return acc;
    }, [] as {name: string, owner: string, url: string}[]);
  }, [searchSnap.methods]);

  // 検索クエリでメソッドを絞り込む
  const filteredMethods = useMemo(() => {
    if (!searchQuery) return referenceMethods;
    const lowerQuery = searchQuery.toLowerCase();
    return referenceMethods.filter(m => m.name.toLowerCase().includes(lowerQuery));
  }, [referenceMethods, searchQuery]);

  return (
    <div className={clsx(
      'flex flex-col border-b transition-colors shrink-0',
      'border-zinc-200 bg-white/50',
      'dark:border-zinc-800 dark:bg-black/20'
    )}>
      {/* パネルヘッダー */}
      <div className={clsx(
        'py-2 px-4 flex items-center justify-between',
        'bg-zinc-100',
        'dark:bg-zinc-800/50'
      )}>
        <h2 className={clsx(
          'text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5',
          'text-zinc-500',
          'dark:text-zinc-400'
        )}>
          <BookOpen size={12} />
          Reference Search
        </h2>
      </div>

      {/* クラス選択プルダウン */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative">
          <select
            value={searchSnap.selectedClass || ''}
            onChange={(e) => {
              methodSearch.selectedClass = e.target.value;
              setIsOpen(true);
            }}
            className={clsx(
              'w-full px-3 py-1.5 text-xs font-mono rounded-md border outline-none appearance-none cursor-pointer',
              'bg-zinc-50 border-zinc-200 text-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              'dark:bg-[#0D1117] dark:border-zinc-700 dark:text-zinc-300 dark:focus:border-blue-400 dark:focus:ring-blue-400'
            )}
          >
            <option value="" disabled>Select a class...</option>
            {availableClasses.map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-zinc-400">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* メソッド一覧のアコーディオンヘッダー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-2 text-xs font-medium transition-colors',
          'hover:bg-zinc-50 text-zinc-600',
          'dark:hover:bg-white/[0.02] dark:text-zinc-400'
        )}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{searchSnap.selectedClass || 'No Class'} Methods</span>
        </div>
        <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
          {referenceMethods.length}
        </span>
      </button>

      {/* メソッド検索と一覧 */}
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-black/10 flex flex-col">
          {/* 検索入力欄 */}
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="relative flex items-center">
              <Search className="absolute left-2 text-zinc-400" size={12} />
              <input
                type="text"
                placeholder="Search methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  'w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded border outline-none',
                  'bg-white border-zinc-200 text-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                  'dark:bg-[#0D1117] dark:border-zinc-700 dark:text-zinc-300 dark:focus:border-blue-400 dark:focus:ring-blue-400'
                )}
              />
            </div>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto">
            {filteredMethods.length === 0 ? (
              <div className="p-4 text-xs italic text-center text-zinc-400">
                メソッドが見つかりません
              </div>
          ) : (
            <div className="p-1 space-y-0.5">
            {filteredMethods.map(m => (
              <a 
                key={m.name} 
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between group px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                title={`${m.name} の公式ドキュメントを開く`}
              >
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                  {m.name}
                  {m.owner !== searchSnap.selectedClass && (
                    <span className="ml-2 text-[10px] text-zinc-400 dark:text-zinc-500 inline-block no-underline">
                      from {m.owner}
                    </span>
                  )}
                </span>
                <span className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 transition-all">
                  <ExternalLink size={12} />
                </span>
              </a>
            ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
