import { initialize } from '../core/editor';

export default function Editor() {
  return (
    <div 
      id="monaco-editor" 
      className="w-full h-full" 
      ref={initialize} 
    />
  );
}
