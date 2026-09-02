import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // Résolu relativement à ce fichier : un chemin absolu en dur ne
      // fonctionnerait que sur la machine où il a été écrit.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
