import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';

const remoteEntry =
  process.env.BAIZE_REMOTE_URL || 'http://localhost:5174/remoteEntry.js';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'shell',
      dts: false,
      remotes: {
        reports: { name: 'reports', entry: remoteEntry, type: 'module' },
      },
      shared: { vue: { singleton: true } },
    }),
  ],
  server: { port: Number(process.env.PORT || 5173) },
  build: { target: 'esnext' },
});
