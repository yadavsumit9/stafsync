import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-health-dev',
        configureServer(server) {
          server.middlewares.use('/api/health', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
            const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
            if (!supabaseUrl || !supabaseKey) {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  status: 'warning',
                  database: 'unconfigured',
                  provider: 'supabase',
                  message: 'Production database environment variables are not configured.',
                  hint: 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings.',
                })
              );
              return;
            }
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                status: 'ok',
                database: 'connected',
                provider: 'supabase',
              })
            );
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
