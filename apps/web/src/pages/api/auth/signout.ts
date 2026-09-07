import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase';
import { clearCsrfToken, validateCsrfToken } from '@/lib/csrf';

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const form = await request.formData();
  try {
    validateCsrfToken(form, cookies);
  } catch {
    return new Response('Token CSRF invalide', { status: 403 });
  }

  const supabase = createSupabaseServerClient(cookies, request);
  await supabase.auth.signOut();
  clearCsrfToken(cookies);
  return redirect('/login', 302);
};
