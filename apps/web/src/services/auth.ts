import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthSession {
  user: User | null;
  session: Session | null;
}

export const authService = {
  async getSession(): Promise<AuthSession> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return {
      user: data.session?.user ?? null,
      session: data.session,
    };
  },

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
    };
  },

  async signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(
    callback: (user: User | null, session: Session | null) => void,
  ) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null, session);
    });
    return data.subscription;
  },
};
