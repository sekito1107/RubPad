import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  root: '.', 
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        embed: path.resolve(__dirname, 'embed.html'),
      },
      output: {
        manualChunks: {
          'monaco': ['monaco-editor'],
        }
      }
    },
    chunkSizeWarningLimit: 4000,
  },
  resolve: {
    alias: {
      'state': path.resolve(__dirname, './src/state'),
      'core': path.resolve(__dirname, './src/core'),
      'components': path.resolve(__dirname, './src/components'),
    },
  },
})

