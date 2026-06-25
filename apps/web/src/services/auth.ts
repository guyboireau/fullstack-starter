import type { AstroCookies } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase';

export function createAuthService(cookies: AstroCookies) {
  const supabase = createSupabaseServerClient(cookies);
  return {
    getUser: () => supabase.auth.getUser(),
    getSession: () => supabase.auth.getSession(),
    signInWithPassword: (credentials: { email: string; password: string }) =>
      supabase.auth.signInWithPassword(credentials),
    signUp: (params: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) => supabase.auth.signUp(params),
    signOut: () => supabase.auth.signOut(),
  };
}
