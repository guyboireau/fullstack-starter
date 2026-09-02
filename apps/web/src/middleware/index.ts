import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase';

/**
 * Préfixes exigeant une session authentifiée. Tout le reste (landing page,
 * login, register, assets…) est public.
 *
 * On raisonne par liste de routes *protégées* et non par liste de routes
 * publiques : l'inverse rendait la page d'accueil inaccessible aux visiteurs
 * anonymes, qui étaient redirigés vers /login au lieu de voir le site vitrine.
 */
const PROTECTED_PREFIXES = ['/admin'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  if (!isProtected(url.pathname)) return next();

  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  return next();
});
