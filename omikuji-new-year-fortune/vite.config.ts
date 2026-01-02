import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 这里的 'process.env.API_KEY' 会在构建时被替换为环境变量
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
  }
});