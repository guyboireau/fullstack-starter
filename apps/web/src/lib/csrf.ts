import { randomBytes, timingSafeEqual } from 'crypto';
import type { AstroCookies } from 'astro';

const CSRF_COOKIE_NAME = 'astro-csrf-token';
const CSRF_MAX_AGE     = 60 * 60 * 2; // 2 heures

const cookieOptions = {
  path:     '/',
  httpOnly: true,
  sameSite: 'strict',
  secure:   import.meta.env.PROD,
  maxAge:   CSRF_MAX_AGE,
} as const;

/**
 * Génère un token CSRF aléatoire (32 octets, encodés en hexadécimal).
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Récupère le token CSRF depuis les cookies Astro.
 */
export function getCsrfToken(cookies: AstroCookies): string | undefined {
  return cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Garantit qu'un token CSRF est présent et retourne sa valeur, à injecter
 * dans un input hidden `_csrf`.
 *
 * Idempotent au sein d'une même requête et d'une même session : si un token
 * existe déjà, il est conservé et seule sa durée de vie est prolongée.
 *
 * C'est essentiel : `AstroCookies.get()` renvoie en priorité la valeur passée
 * à `set()` plus tôt dans la même requête. Régénérer le token à chaque rendu
 * ferait échouer la validation de tout formulaire soumis, puisqu'on comparerait
 * la valeur envoyée par le navigateur à une valeur fraîchement créée.
 */
export function ensureCsrfToken(cookies: AstroCookies): string {
  const token = cookies.get(CSRF_COOKIE_NAME)?.value ?? generateCsrfToken();
  cookies.set(CSRF_COOKIE_NAME, token, cookieOptions);
  return token;
}

/**
 * Compare deux tokens à durée constante, pour ne pas exposer de canal temporel.
 */
function tokensMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Valide le token soumis dans un FormData contre celui du cookie.
 * Lance une erreur si le token est absent, malformé ou différent.
 *
 * Le cookie est posé par le middleware, avant l'exécution du frontmatter.
 */
export function validateCsrfToken(formData: FormData, cookies: AstroCookies): void {
  const submitted = formData.get('_csrf');
  const expected  = cookies.get(CSRF_COOKIE_NAME)?.value;

  if (typeof submitted !== 'string' || !expected || !tokensMatch(submitted, expected)) {
    throw new Error('Token CSRF invalide ou manquant');
  }
}

/**
 * Invalide le token courant. À appeler à la déconnexion.
 */
export function clearCsrfToken(cookies: AstroCookies): void {
  cookies.delete(CSRF_COOKIE_NAME, { path: '/' });
}
