import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
export default defineConfig({
  base: '__BASE_PATH__',
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    },
    dedupe: ['preact', 'preact/hooks', 'react', 'react-dom']
  },
  build: {
    outDir: '__OUT_DIR__',
    emptyOutDir: false
  },
  plugins: [preact()]
});