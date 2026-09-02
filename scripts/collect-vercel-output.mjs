#!/usr/bin/env node
/**
 * Remonte la sortie « Build Output API v3 » produite par @astrojs/vercel
 * depuis apps/web/.vercel/output vers <racine du dépôt>/.vercel/output.
 *
 * Pourquoi : l'adapter écrit toujours dans `<racine du projet Astro>/.vercel/output`,
 * soit `apps/web/` dans ce monorepo. Vercel, lui, ne lit la Build Output API
 * qu'à la racine du « Root Directory » du projet (ici la racine du dépôt).
 * Sans ce déplacement, le déploiement ne trouve ni les fonctions serveur ni
 * les fichiers statiques : le site répond 404 / page blanche en production.
 *
 * Alternative possible côté tableau de bord Vercel : régler Root Directory sur
 * `apps/web`. Ce script permet de ne dépendre d'aucun réglage manuel.
 */
import { existsSync, rmSync, mkdirSync, renameSync, cpSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repoRoot, 'apps', 'web', '.vercel', 'output');
const destination = join(repoRoot, '.vercel', 'output');

if (!existsSync(source)) {
  console.error(
    `[collect-vercel-output] Sortie introuvable : ${source}\n` +
      `Lancez d'abord « npm run build -w apps/web ».`,
  );
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(dirname(destination), { recursive: true });

try {
  renameSync(source, destination);
} catch {
  // renameSync échoue si source et destination sont sur des volumes différents.
  cpSync(source, destination, { recursive: true });
  rmSync(source, { recursive: true, force: true });
}

console.log(`[collect-vercel-output] ${source} -> ${destination}`);
