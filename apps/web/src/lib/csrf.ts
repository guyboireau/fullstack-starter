import { randomBytes, createHash } from 'crypto';

const CSRF_COOKIE_NAME = 'astro-csrf-token';

/**
 * Génère un token CSRF et le stocke dans un cookie signé (en pratique non-signé ici
 * car Astro ne fournit pas de signer automatiquement ; on utilise httpOnly + sameSite).
 *
 * Utilisé pour protéger les formulaires HTML côté Astro contre les attaques CSRF.
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
 * Définit le cookie CSRF avec un nouveau token.
 */
export function setCsrfTokenCookie(cookies: AstroCookies, token: string): void {
  cookies.set(CSRF_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60, // 1 heure
  });
}

/**
 * Valide le token CSRF soumis dans un FormData contre le cookie.
 * Si le token est absent ou invalide, lance une erreur.
 */
export function validateCsrfToken(formData: FormData, cookies: AstroCookies): void {
  const submitted = formData.get('_csrf');
  const expected = cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!submitted || !expected || submitted !== expected) {
    throw new Error('Token CSRF invalide ou manquant');
  }
}

/**
 * Helper : génère un token, le stocke en cookie, et retourne la valeur
 * pour l'injecter dans un input hidden du formulaire.
 */
export function setupCsrf(cookies: AstroCookies): string {
  const token = generateCsrfToken();
  setCsrfTokenCookie(cookies, token);
  return token;
}
