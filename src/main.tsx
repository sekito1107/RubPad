import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App'
import { app } from './state/app'
import { editor } from './state/editor'
import { loadTheme } from './core/persistence/app'
import { loadCode } from './core/persistence/editor'
import { DEFAULT_CODE } from './types/editor'
import { decompressCode } from './core/share'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker: function (_moduleId: any, _label: string) {
    return new editorWorker();
  },
};

app.theme = loadTheme()

let initialCode = loadCode() || DEFAULT_CODE;
const hash = window.location.hash;
if (hash.startsWith('#code=')) {
  const compressed = hash.substring(6);
  const decompressed = decompressCode(compressed);
  if (decompressed !== null) {
    initialCode = decompressed;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

editor.code = initialCode;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
