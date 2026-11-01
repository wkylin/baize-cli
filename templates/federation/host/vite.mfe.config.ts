import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const remoteEntry = process.env.BAIZE_REMOTE_URL || 'http://localhost:5174/remoteEntry.js';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      dts: false,
      remotes: { reports: { name: 'reports', entry: remoteEntry, type: 'module' } },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
  server: { port: Number(process.env.PORT || 5173) },
  build: { target: 'esnext' },
});
