import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App'
import { app } from './state/app'
import { editor } from './state/editor'
import { loadTheme } from './core/persistence/app'
import { loadCode } from './core/persistence/editor'
import { DEFAULT_CODE } from './types/editor'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker: function (_moduleId: any, _label: string) {
    return new editorWorker();
  },
};

app.theme = loadTheme()
editor.code = loadCode() || DEFAULT_CODE

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
