import type { APIRoute } from 'astro';
import { createAuthService } from '@/services/auth';
import { validateCsrfToken } from '@/lib/csrf';

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const form = await request.formData();
  try {
    validateCsrfToken(form, cookies);
  } catch {
    return new Response('Token CSRF invalide', { status: 403 });
  }

  const auth = createAuthService(cookies);
  await auth.signOut();
  return redirect('/login', 302);
};
