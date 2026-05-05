import { useDiagnostics } from '../hooks/useDiagnostics';
import { useAnalysis } from '../hooks/useAnalysis';

export default function Editor() {
  useDiagnostics();
  useAnalysis();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
