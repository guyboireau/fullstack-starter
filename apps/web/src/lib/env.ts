/**
 * Lecture des variables d'environnement côté serveur.
 *
 * ⚠️ Ne JAMAIS écrire `import.meta.env.MA_VARIABLE` directement pour un secret
 * serveur. Vite/Astro remplacent statiquement ces expressions **au moment du
 * build** : une variable absente de l'environnement de build est figée à
 * `undefined` dans le bundle, même si la plateforme la fournit correctement à
 * l'exécution. C'est exactement ce qui rendait le starter inutilisable en
 * production (le client Supabase levait « Missing SUPABASE_URL » à chaque
 * requête, quelle que soit la configuration Vercel).
 *
 * `process.env` est lu à l'exécution : c'est la seule source fiable pour les
 * variables non préfixées `PUBLIC_`.
 */

/**
 * Retourne la variable d'environnement `name`, ou `undefined` si absente/vide.
 *
 * Source unique : `process.env`, résolu à l'exécution. En développement,
 * `astro.config.mjs` y recopie le contenu du fichier `.env` au démarrage, si
 * bien que dev et production lisent exactement au même endroit.
 */
export function getEnv(name: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  return process.env[name] || undefined;
}

/**
 * Comme {@link getEnv}, mais lève une erreur explicite si la variable manque.
 * À n'appeler qu'à l'intérieur d'une fonction (jamais au niveau module), afin
 * que l'erreur survienne à la requête concernée et non au chargement du bundle.
 */
export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. ` +
        `Définissez-la dans apps/web/.env en local, ou dans les variables ` +
        `d'environnement de votre hébergeur en production.`,
    );
  }
  return value;
}
