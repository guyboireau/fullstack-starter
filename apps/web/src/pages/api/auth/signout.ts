import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase';
import { validateCsrfToken } from '@/lib/csrf';

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const form = await request.formData();
  try {
    validateCsrfToken(form, cookies);
  } catch {
    return new Response('Token CSRF invalide', { status: 403 });
  }

  const supabase = createSupabaseServerClient(cookies);
  await supabase.auth.signOut();
  return redirect('/login', 302);
};
