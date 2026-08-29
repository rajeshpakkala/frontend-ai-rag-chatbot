import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/chatbot': {
        target: 'https://ai-rag-chatbot-ixdt.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
