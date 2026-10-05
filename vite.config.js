import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client talks to the backend only through /api/*.
// In dev, Vite proxies those calls to the Express server (never exposing the API key to the browser).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // recharts is intentionally eager (the dashboard chart is above the fold).
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
