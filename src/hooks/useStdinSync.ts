import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { stdinState } from '../state/stdin';
import { syncStdin } from '../core/ruby';

/**
 * 標準入力の状態を Ruby VM と同期するためのカスタムフックです。
 * スロットの内容やアクティブなスロットが変更されるたびに、
 * 自動的に Ruby 側の $stdin を更新します。
 */
export const useStdinSync = () => {
  const snap = useSnapshot(stdinState);

  useEffect(() => {
    const currentInput = snap.slots[snap.activeSlot];
    syncStdin(currentInput);
  }, [snap.slots, snap.activeSlot]);
};
