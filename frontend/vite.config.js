import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Required for Vercel
  },
  server: {
    port: 5173, // locally, doesn't matter in prod
  },
});
