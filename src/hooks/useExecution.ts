import { run } from '../core/ruby';
import { setPhase, yarv } from '../state/yarv';
import { updateOutput } from '../state/terminal';
import { editor } from '../state/editor';

export const useExecution = () => {
  const execute = async () => {
    if (yarv.phase !== 'ready') return;

    setPhase('running');
    const result = await run(editor.code);
    updateOutput(result);
    setPhase('ready');
  };

  return { execute };
};
