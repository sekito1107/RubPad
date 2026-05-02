import { useEditor } from '../hooks/useEditor';

export default function Editor() {
  useEditor();

  return (
    <div
      id="monaco-editor"
      className="w-full h-full"
    />
  );
}
