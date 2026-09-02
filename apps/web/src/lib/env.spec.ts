import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv, requireEnv } from '@/lib/env';

describe('getEnv', () => {
  const KEY = 'FULLSTACK_STARTER_TEST_VAR';
  let original: string | undefined;

  beforeEach(() => {
    original = process.env[KEY];
    delete process.env[KEY];
  });

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('retourne la valeur présente dans process.env', () => {
    process.env[KEY] = 'https://example.supabase.co';
    expect(getEnv(KEY)).toBe('https://example.supabase.co');
  });

  it('retourne undefined si la variable est absente', () => {
    expect(getEnv(KEY)).toBeUndefined();
  });

  it('traite une chaîne vide comme une variable absente', () => {
    process.env[KEY] = '';
    expect(getEnv(KEY)).toBeUndefined();
  });

  it('lit process.env à chaque appel, sans figer la première valeur', () => {
    process.env[KEY] = 'premiere';
    expect(getEnv(KEY)).toBe('premiere');
    process.env[KEY] = 'seconde';
    expect(getEnv(KEY)).toBe('seconde');
  });
});

describe('requireEnv', () => {
  const KEY = 'FULLSTACK_STARTER_REQUIRED_VAR';

  afterEach(() => {
    delete process.env[KEY];
  });

  it('retourne la valeur quand elle est définie', () => {
    process.env[KEY] = 'valeur';
    expect(requireEnv(KEY)).toBe('valeur');
  });

  it('lève une erreur nommant la variable manquante', () => {
    delete process.env[KEY];
    expect(() => requireEnv(KEY)).toThrowError(new RegExp(KEY));
  });
});

/**
 * Garde-fou contre la régression qui rendait le starter inutilisable en
 * production : `import.meta.env.MA_VARIABLE` est substitué au moment du build.
 * Une variable serveur absente de l'environnement de build est alors figée à
 * `undefined` dans le bundle déployé.
 *
 * Seules les clés intégrées à Vite/Astro (PROD, DEV, MODE, SITE, BASE_URL…) et
 * les variables publiques préfixées PUBLIC_ peuvent être lues ainsi.
 */
describe('lecture des variables d’environnement dans les sources', () => {
  const SRC = fileURLToPath(new URL('..', import.meta.url));
  const ALLOWED = new Set([
    'PROD',
    'DEV',
    'MODE',
    'SSR',
    'SITE',
    'BASE_URL',
    'ASSETS_PREFIX',
  ]);

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      return ['.ts', '.tsx', '.astro'].includes(extname(entry.name)) ? [full] : [];
    });
  }

  /** Retire commentaires de bloc et de ligne : seul le code exécuté compte. */
  function stripComments(source: string): string {
    return source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
  }

  it('n’accède à import.meta.env que via des clés intégrées ou PUBLIC_*', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(SRC)) {
      if (file.endsWith('env.spec.ts')) continue;
      const contents = stripComments(readFileSync(file, 'utf8'));
      for (const match of contents.matchAll(/import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
        const key = match[1]!;
        if (ALLOWED.has(key) || key.startsWith('PUBLIC_')) continue;
        offenders.push(`${file.slice(SRC.length)} → import.meta.env.${key}`);
      }
    }

    expect(
      offenders,
      `Ces variables seraient figées à undefined dans le bundle de production. ` +
        `Utilisez getEnv()/requireEnv() de src/lib/env.ts :\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
