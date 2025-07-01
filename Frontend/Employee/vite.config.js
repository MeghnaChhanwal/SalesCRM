// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react()],

    // ✅ Dev server config
    server: {
      headers: isDev
        ? {
            'Content-Security-Policy':
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *"
          }
        : {},
    },

    // ✅ SPA routing fallback
    build: {
      outDir: 'dist',
    },

    // ✅ Base path for relative imports, works with Vercel too
    base: './',
  };
});
