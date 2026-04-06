import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api-inference.huggingface.co',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            '/models/stabilityai/stable-diffusion-xl-base-1.0',
          ),
      },
    },
  },
})
