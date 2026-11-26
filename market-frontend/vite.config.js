import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
        '/itemImages': {
      target: 'http://localhost:8080',
      changeOrigin: true
    },
    '/chatImages': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  },
  },
});