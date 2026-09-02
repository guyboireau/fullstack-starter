// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Charge les fichiers .env dans process.env pour que le serveur de dev lise ses
// variables exactement comme le fera la fonction serverless en production.
// Ce chargement n'a lieu que dans le processus de build/dev : rien n'est inliné
// dans le bundle, contrairement à `import.meta.env.MA_VARIABLE`.
//
// Ordre de priorité (le premier défini gagne) :
//   1. l'environnement réel (Vercel, CI, shell)
//   2. apps/web/.env          — surcharge propre au front
//   3. .env à la racine       — source commune avec l'API NestJS,
//                               celle que le README demande de créer
const mode = process.env.NODE_ENV ?? 'development';
const webDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

for (const dir of [webDir, repoRoot]) {
  for (const [key, value] of Object.entries(loadEnv(mode, dir, ''))) {
    process.env[key] ??= value;
  }
}

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': '/src' },
    },
  },
});
