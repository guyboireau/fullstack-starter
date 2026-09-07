import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.');
}

/**
 * Client Supabase lié à la requête courante.
 *
 * Les cookies entrants sont lus sur l'en-tête `Cookie` de la requête, et non
 * sur `AstroCookies` : cette classe n'expose aucune sérialisation de l'existant
 * (`toString()` retomberait sur `Object.prototype.toString`, donnant la chaîne
 * `"[object Object]"`, et la session ne serait jamais retrouvée).
 *
 * Les cookies sortants passent en revanche bien par `AstroCookies.set()`, qui
 * les attache à la réponse.
 */
export function createSupabaseServerClient(cookies: AstroCookies, request: Request) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // parseCookieHeader peut renvoyer une valeur `undefined` ; le contrat
        // GetAllCookies de @supabase/ssr exige une chaîne.
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map(
          ({ name, value }) => ({ name, value: value ?? '' }),
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, options),
        );
      },
    },
  });
}
