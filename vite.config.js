import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve, join } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  root: '.',
  base: './',
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
    {
      name: 'copy-runtime-data-files',
      closeBundle() {
        const outputDir = resolve(__dirname, 'target');
        mkdirSync(outputDir, { recursive: true });

        const runtimeFiles = [
          'communities.json',
          'conferences.json',
          'conferences.ics',
          'conferences.js',
        ];

        runtimeFiles.forEach(fileName => {
          const source = resolve(__dirname, fileName);
          if (!existsSync(source)) {
            return;
          }

          copyFileSync(source, join(outputDir, fileName));
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
});
