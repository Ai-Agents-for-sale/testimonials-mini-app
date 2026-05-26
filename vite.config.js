import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5174
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2018',
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview.html')
      }
    }
  }
});
