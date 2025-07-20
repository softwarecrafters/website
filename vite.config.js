import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'target',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        conferences: resolve(__dirname, 'conferences.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
  publicDir: 'static',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    middlewareMode: false,
  },
});
