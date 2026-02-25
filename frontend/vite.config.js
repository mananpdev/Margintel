import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:5000',
        timeout: 180000,
        proxyTimeout: 180000,
      },
      '/health': 'http://localhost:5000',
    }
  },
  build: {
    outDir: '../static/dist',
    emptyOutDir: true,
  }
})
