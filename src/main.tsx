import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App'
import { app } from './state/app'
import { loadTheme } from './core/persistence/app'

// 初期化：保存されたテーマがあれば反映する
app.theme = loadTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
