import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    server: {
      headers: isDev
        ? {
            'Content-Security-Policy':
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src *",
          }
        : {},
      // ✅ Add this fallback config
      historyApiFallback: true,
    },
  };
});
