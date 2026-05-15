import { useDiagnostics } from '../hooks/useDiagnostics';
import { useAnalysis } from '../hooks/useAnalysis';
import { useLiveVariables } from '../hooks/useLiveVariables';
import { useEditorProviders } from '../hooks/useEditorProviders';
import { Hover } from './Hover';

export default function Editor() {
  useDiagnostics();
  useAnalysis();
  useLiveVariables();
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
