import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase';
import { ensureCsrfToken } from '@/lib/csrf';
import { getSite } from '@/services/content';

/**
 * Préfixes exigeant une session authentifiée. Tout le reste du site est public :
 * c'est la règle par défaut, et elle doit le rester. La vérification de session
 * n'est déclenchée que sur ces préfixes ; les pages publiques ne paient jamais
 * l'aller-retour d'authentification.
 */
const PROTECTED_PREFIXES = ['/admin'];

/** Pages publiques qui exposent malgré tout un formulaire à protéger. */
const PUBLIC_FORM_PATHS = ['/login', '/register'];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies, locals, redirect } = context;

  const protectedRoute = PROTECTED_PREFIXES.some(p => matchesPrefix(url.pathname, p));
  const needsCsrf = protectedRoute || PUBLIC_FORM_PATHS.includes(url.pathname);

  locals.user = null;

  // Le cookie CSRF est posé ici, et nulle part ailleurs : le middleware s'exécute
  // avant que la réponse ne commence à être envoyée. Un `cookies.set()` depuis un
  // layout interviendrait pendant le rendu du corps et lèverait ResponseSentError,
  // ce qui interromprait la page.
  locals.csrfToken = needsCsrf ? ensureCsrfToken(cookies) : '';

  const supabase = createSupabaseServerClient(cookies, request);

  // Le site servi est résolu par nom de domaine : un même déploiement sert
  // plusieurs marques. Toutes les pages en ont besoin, publiques comprises.
  locals.site = await getSite(supabase, url.hostname);

  if (!protectedRoute) return next();

  // getUser() valide le JWT auprès du serveur d'authentification.
  // getSession() se contente de lire le cookie : insuffisant pour une frontière d'accès.
  // En cas d'indisponibilité de Supabase, on échoue côté fermé plutôt que de
  // renvoyer une 500 — ou pire, de laisser passer.
  let user = null;
  try {
    ({ data: { user } } = await supabase.auth.getUser());
  } catch (error) {
    console.error('[auth] vérification de session impossible', error);
  }

  if (!user) {
    const target = `${url.pathname}${url.search}`;
    return redirect(`/login?redirect=${encodeURIComponent(target)}`);
  }

  locals.user = user;
  return next();
});
