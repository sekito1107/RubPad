import { useDiagnostics } from '../hooks/useDiagnostics';
import { useAnalysis } from '../hooks/useAnalysis';
import { useEditorProviders } from '../hooks/useEditorProviders';
import { Hover } from './Hover';

export default function Editor() {
  useDiagnostics();
  useAnalysis();
  useEditorProviders();

  return (
    <>
      <Hover />
      <div
        id="monaco-editor"
        className="w-full h-full"
      />
    </>
  );
}
