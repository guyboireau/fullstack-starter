/**
 * Normalise une cible de redirection fournie par l'utilisateur (paramètre
 * `?redirect=`) en chemin interne sûr.
 *
 * Rejette tout ce qui pourrait sortir du site — URL absolue, URL protocol-relative
 * (`//evil.tld`), antislash interprété comme séparateur par certains navigateurs —
 * afin d'écarter toute redirection ouverte.
 *
 * @returns le chemin s'il est interne, sinon `fallback`.
 */
export function safeRedirectPath(value: string | null, fallback = '/admin'): string {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
