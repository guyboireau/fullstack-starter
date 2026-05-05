import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let authService: { validateToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      validateToken: vi.fn(),
    };
    guard = new SupabaseAuthGuard(authService as any);
  });

  const createContext = (headers: Record<string, string>) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as ExecutionContext;
  };

  it('allows access with valid token', async () => {
    authService.validateToken.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.com',
    });
    const context = createContext({ authorization: 'Bearer valid-token' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
  });

  it('throws UnauthorizedException when token is missing', async () => {
    const context = createContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    authService.validateToken.mockResolvedValue(null);
    const context = createContext({
      authorization: 'Bearer invalid-token',
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('attaches user and token to request', async () => {
    const user = { id: 'user-1', email: 'a@b.com' };
    authService.validateToken.mockResolvedValue(user);
    const request = { headers: { authorization: 'Bearer token' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    await guard.canActivate(context);
    expect(request.user).toEqual(user);
    expect(request.accessToken).toBe('token');
  });
});
