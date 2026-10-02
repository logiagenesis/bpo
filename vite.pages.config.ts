import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: '/bpo/',
  define: { 'import.meta.env.VITE_GITHUB_PAGES': 'true' },
  resolve: { alias: [
    { find: '@/lib/ai.functions', replacement: fileURLToPath(new URL('./src/lib/ai.pages.ts', import.meta.url)) },
    { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
  ] },
  plugins: [tailwindcss(), react()],
  build: { outDir: 'dist/pages' },
});
