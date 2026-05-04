import { useDiagnostics } from '../hooks/useDiagnostics';

export default function Editor() {
  useDiagnostics();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
