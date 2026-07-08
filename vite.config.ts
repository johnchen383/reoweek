import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // When running the plain Vite dev server (`npm run dev`), proxy API calls
    // to a locally running `vercel dev` instance on port 3000 so the frontend
    // and serverless functions can talk during development.
    // If you run `npm run dev:full` (vercel dev), everything is served together
    // and this proxy is unused.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
