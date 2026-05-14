import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from '@/lib/supabase';

const PUBLIC_PATHS = ['/login', '/register'];

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  if (PUBLIC_PATHS.includes(url.pathname)) return next();

  const supabase = createSupabaseServerClient(cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login');

  return next();
});
