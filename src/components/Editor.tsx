import { useEditor } from '../hooks/useEditor';
import { useAnalyze } from '../hooks/useAnalyze';

export default function Editor() {
  useEditor();
  useAnalyze();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
