import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'reports',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: { './RemotePage': './src/RemotePage.tsx' },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
  server: {
    port: Number(process.env.PORT || 5174),
    cors: true,
    origin: 'http://localhost:5174',
  },
  build: { target: 'esnext' },
});
