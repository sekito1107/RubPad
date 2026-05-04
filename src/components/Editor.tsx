import { useEditor } from '../hooks/useEditor';
import { useDiagnostics } from '../hooks/useDiagnostics';

export default function Editor() {
  useEditor();
  useDiagnostics();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
