import { useDiagnostics } from '../hooks/useDiagnostics';
import { useAnalysis } from '../hooks/useAnalysis';
import { useEditorProviders } from '../hooks/useEditorProviders';

export default function Editor() {
  useDiagnostics();
  useAnalysis();
  useEditorProviders();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
