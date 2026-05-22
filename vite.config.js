import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Raise the warning threshold — 600 KB is reasonable for a dashboard app
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — loads on every page
          'react-vendor': ['react', 'react-dom'],
          // Router — separate so it's cached independently
          'router': ['react-router-dom'],
          // Recharts is ~400 KB on its own — always split it out
          'charts': ['recharts'],
          // xlsx is large and only used on export — lazy load candidate
          'xlsx': ['xlsx'],
        },
      },
    },
  },

  preview: {
    port: 4173,
  },
})
