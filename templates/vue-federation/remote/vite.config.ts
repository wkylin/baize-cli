import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'reports',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: { './RemotePage': './src/RemotePage.vue' },
      shared: { vue: { singleton: true } },
    }),
  ],
  server: {
    port: Number(process.env.PORT || 5174),
    cors: true,
    origin: 'http://localhost:5174',
  },
  build: { target: 'esnext' },
});
