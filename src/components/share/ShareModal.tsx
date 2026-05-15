import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Share2, X, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import { editor } from '../../state/editor';
import { compressCode } from '../../core/share';

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const editorSnap = useSnapshot(editor);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // コードを圧縮して共有用URLを生成
  const compressed = compressCode(editorSnap.code);
  const url = `${window.location.origin}/#code=${compressed}`;
  const iframeCode = `<iframe src="${url}" width="100%" height="400" frameborder="0"></iframe>`;
  const markdownCode = "```ruby\n" + editorSnap.code + "\n```";

  // クリップボードにテキストをコピーし、一時的にチェックマークを表示する
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={clsx(
          "relative w-full max-w-lg rounded-xl shadow-2xl p-6",
          "bg-white dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-share-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
          <Share2 className="text-blue-500" />
          Share Code
        </h2>

        <div className="space-y-6">
          {/* URL Share */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">URL</label>
            <div className="flex gap-2">
              <input 
                id="share-url-input"
                type="text" 
                readOnly 
                value={url}
                className={clsx(
                  "flex-1 px-3 py-2 text-sm rounded-lg outline-none",
                  "bg-zinc-50 border border-zinc-200 text-zinc-700",
                  "dark:bg-black/20 dark:border-zinc-800 dark:text-zinc-300"
                )}
              />
              <button 
                onClick={() => handleCopy(url, 'url')}
                className="flex items-center justify-center w-10 shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {copiedField === 'url' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Iframe Share */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Iframe</label>
            <div className="flex gap-2">
              <input 
                id="share-iframe-input"
                type="text" 
                readOnly 
                value={iframeCode}
                className={clsx(
                  "flex-1 px-3 py-2 text-sm font-mono rounded-lg outline-none",
                  "bg-zinc-50 border border-zinc-200 text-zinc-700",
                  "dark:bg-black/20 dark:border-zinc-800 dark:text-zinc-300"
                )}
              />
              <button 
                onClick={() => handleCopy(iframeCode, 'iframe')}
                className="flex items-center justify-center w-10 shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {copiedField === 'iframe' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Markdown形式での共有（GitHubやSlackなどに貼り付け） */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Markdown</label>
            <div className="flex gap-2 items-start">
              <textarea 
                id="share-markdown-textarea"
                readOnly 
                value={markdownCode}
                rows={4}
                className={clsx(
                  "flex-1 px-3 py-2 text-sm font-mono rounded-lg outline-none resize-none",
                  "bg-zinc-50 border border-zinc-200 text-zinc-700",
                  "dark:bg-black/20 dark:border-zinc-800 dark:text-zinc-300"
                )}
              />
              <button 
                onClick={() => handleCopy(markdownCode, 'markdown')}
                className="flex items-center justify-center w-10 shrink-0 h-[38px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Markdownをコピー"
              >
                {copiedField === 'markdown' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
