import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { authService } from './auth';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSession returns user and session', async () => {
    const mockSession = {
      user: { id: '1', email: 'a@b.com' } as User,
      access_token: 'tok',
    } as Session;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const result = await authService.getSession();
    expect(result.user).toEqual(mockSession.user);
    expect(result.session).toEqual(mockSession);
  });

  it('getSession throws on error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: new Error('fail') as unknown as AuthError,
    });
    await expect(authService.getSession()).rejects.toThrow('fail');
  });

  it('signIn returns session', async () => {
    const mockData = {
      user: { id: '1' } as User,
      session: { access_token: 'tok' } as Session,
    };
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: mockData,
      error: null,
    });
    const result = await authService.signIn('a@b.com', 'pass');
    expect(result.session).toEqual(mockData.session);
  });

  it('signIn throws on error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('bad creds') as unknown as AuthError,
    });
    await expect(authService.signIn('a@b.com', 'pass')).rejects.toThrow(
      'bad creds',
    );
  });

  it('signUp calls supabase with full_name', async () => {
    const mockData = {
      user: { id: '1' } as User,
      session: { access_token: 'tok' } as Session,
    };
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: mockData,
      error: null,
    });
    const result = await authService.signUp('a@b.com', 'pass', 'John');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
      options: { data: { full_name: 'John' } },
    });
    expect(result.user).toEqual(mockData.user);
  });

  it('signUp throws on error', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('exists') as unknown as AuthError,
    });
    await expect(authService.signUp('a@b.com', 'pass', 'John')).rejects.toThrow(
      'exists',
    );
  });

  it('signOut calls supabase', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    await authService.signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('onAuthStateChange subscribes and unsubscribes', () => {
    const unsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
    const cb = vi.fn();
    const sub = authService.onAuthStateChange(cb);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    sub.unsubscribe();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
